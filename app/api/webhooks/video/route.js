import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Inicializa o Supabase (usa Service Role se existir para contornar RLS, senão a anon key normal)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Executa em plano de fundo (Background Worker)
async function processVideo(lessonId, videoUrl) {
  let tmpDir = null;
  try {
    console.log(`[HLS-Worker] A iniciar conversão para a aula ${lessonId}`);
    
    // 1. Criar pasta temporária única para esta conversão
    tmpDir = path.join('/tmp', `hls_${lessonId}_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    const inputPath = path.join(tmpDir, 'input.mp4');
    const outputPath = path.join(tmpDir, 'master.m3u8');
    
    // 2. Extrair URL verdadeiro se for ficheiro do Storage
    let finalVideoUrl = videoUrl;
    if (videoUrl.startsWith('storage:lessons/')) {
      const { data } = supabase.storage.from('lessons').getPublicUrl(videoUrl.replace('storage:lessons/', ''));
      finalVideoUrl = data.publicUrl;
    }

    // 3. Fazer download do ficheiro MP4
    console.log(`[HLS-Worker] A fazer download do MP4...`);
    await execAsync(`curl -s -L -o "${inputPath}" "${finalVideoUrl}"`);
    
    // 4. Executar FFmpeg para partir o vídeo em HLS (10s chunks, 720p rápido)
    console.log(`[HLS-Worker] A converter para HLS com FFmpeg...`);
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -profile:v baseline -level 3.0 -s 1280x720 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputPath}"`;
    await execAsync(ffmpegCmd);
    
    // 5. Enviar pedaços (.ts) e manifesto (.m3u8) para o Supabase
    console.log(`[HLS-Worker] A enviar HLS para a cloud...`);
    const files = fs.readdirSync(tmpDir);
    const uploadPromises = [];
    
    for (const file of files) {
      if (file.endsWith('.m3u8') || file.endsWith('.ts')) {
        const filePath = path.join(tmpDir, file);
        const fileContent = fs.readFileSync(filePath);
        const contentType = file.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T';
        
        // Pasta destino: hls/[id_da_aula]/ficheiro.ts
        const storagePath = `hls/${lessonId}/${file}`;
        uploadPromises.push(
          supabase.storage.from('lessons').upload(storagePath, fileContent, {
            contentType,
            cacheControl: '31536000', // Cache máximo (1 ano) na origem
            upsert: true
          })
        );
      }
    }
    
    const uploadResults = await Promise.all(uploadPromises);
    
    // Verificar se houve erros de upload (ex: Falta de permissões / RLS)
    for (const res of uploadResults) {
      if (res.error) {
        throw new Error(`Erro ao fazer upload para o Storage: ${res.error.message}`);
      }
    }
    
    // 6. Atualizar a base de dados com o novo link
    console.log(`[HLS-Worker] A atualizar a Base de Dados...`);
    const newVideoUrl = `storage:lessons/hls/${lessonId}/master.m3u8`;
    const { error: dbError } = await supabase.from('lessons').update({ video_url: newVideoUrl }).eq('id', lessonId);
    
    if (dbError) {
      throw new Error(`Erro ao atualizar Base de Dados: ${dbError.message}`);
    }
    
    console.log(`[HLS-Worker] ✅ Aula ${lessonId} convertida e atualizada com sucesso!`);
  } catch (err) {
    console.error(`[HLS-Worker] ❌ Erro na aula ${lessonId}:`, err);
  } finally {
    // 7. Limpar o lixo do disco para não encher a VPS
    if (tmpDir && fs.existsSync(tmpDir)) {
      console.log(`[HLS-Worker] Limpeza de ficheiros temporários...`);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const record = body.record;
    
    // Verifica se veio do Supabase e tem URL
    if (!record || !record.id || !record.video_url) {
      return NextResponse.json({ message: 'Ignorado: Sem vídeo' }, { status: 200 });
    }
    
    // Se o vídeo já foi convertido, ignorar para evitar ciclos infinitos!
    if (record.video_url.endsWith('.m3u8') || record.video_url.includes('/hls/')) {
      return NextResponse.json({ message: 'Ignorado: Já é HLS' }, { status: 200 });
    }
    
    // Se for MP4, começamos o trabalho!
    if (record.video_url.includes('.mp4')) {
      // Chamamos a função MAS NÃO ESPERAMOS (Sem await). 
      // Assim o Supabase recebe resposta rápida e a VPS trabalha calmamente em background.
      processVideo(record.id, record.video_url);
      return NextResponse.json({ message: 'Conversão iniciada em background!' }, { status: 202 });
    }
    
    return NextResponse.json({ message: 'Ignorado: Formato não suportado' }, { status: 200 });

  } catch (err) {
    console.error('Erro no Webhook:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
