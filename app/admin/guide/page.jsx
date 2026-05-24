export const dynamic = "force-dynamic"

export default function CreatorGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900">Guia do Criador</h1>
        <p className="text-sm text-neutral-500 mt-1">Tudo o que precisas de saber para gerir os teus cursos e maximizar a qualidade para os alunos.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-8">
        
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎥</span>
            <h2 className="text-xl font-bold text-neutral-900">Como alojar as tuas Aulas de Vídeo</h2>
          </div>
          
          <div className="prose prose-sm text-neutral-600 max-w-none">
            <p>
              Na nossa plataforma, oferecemos uma experiência de visualização cinematográfica nativa para todos os teus alunos. 
              Para garantir que as tuas aulas carregam de forma <strong>imediata e sem interrupções</strong>, dividimos as regras de upload consoante o tamanho da aula:
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              <div className="border border-neutral-200 p-5 rounded-xl bg-neutral-50">
                <h3 className="font-bold text-neutral-900 text-base mb-2">Aulas Curtas (Até 100MB)</h3>
                <p className="text-sm">
                  Podes fazer o <strong>Upload Direto</strong> do ficheiro MP4 na plataforma. Perfeito para pequenos tutoriais, aulas de boas-vindas ou dicas rápidas.
                </p>
                <ul className="mt-3 text-sm list-disc pl-5 space-y-1 text-neutral-500">
                  <li>O ficheiro fica alojado na nossa nuvem.</li>
                  <li>Carregamento rápido.</li>
                  <li>Fácil de gerir.</li>
                </ul>
              </div>

              <div className="border border-[#FF4500]/20 p-5 rounded-xl bg-[#FFF0EB]">
                <h3 className="font-bold text-[#FF4500] text-base mb-2">Aulas Longas (+ de 100MB) ⭐ Recomendado</h3>
                <p className="text-sm">
                  Para vídeos longos (15 min, 1 hora, etc.), deves usar o <strong>YouTube (Não Listado)</strong> ou o <strong>Vimeo</strong>.
                </p>
                <ul className="mt-3 text-sm list-disc pl-5 space-y-1 text-neutral-700">
                  <li><strong>Streaming Inteligente:</strong> O YouTube ajusta a qualidade à internet do aluno, evitando que o vídeo trave.</li>
                  <li><strong>Sem Marca d'Água Agressiva:</strong> O nosso Player limpa a interface e dá uma experiência de cinema.</li>
                  <li><strong>Proteção:</strong> Ao meteres como "Não Listado", ninguém encontra o teu vídeo na pesquisa do YouTube.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-neutral-100" />

        <section>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Opção 1: Usar o YouTube (Não Listado)</h3>
          <div className="space-y-4 text-sm text-neutral-600 mb-8">
            <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-neutral-100 font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <p className="font-bold text-neutral-900">Fazer Upload no YouTube</p>
                <p className="mt-1">Vai ao YouTube Studio e carrega o teu vídeo. Preenche o título normalmente.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-neutral-100 font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <p className="font-bold text-neutral-900">Mudar Visibilidade para Não Listado (Unlisted)</p>
                <p className="mt-1">No último passo do upload (Visibilidade), escolhe "Não Listado" em vez de "Público". Isto garante que o vídeo é secreto.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl bg-[#F4FDF8] border-green-100">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <p className="font-bold text-green-800">Copiar Link e Colar na Plataforma</p>
                <p className="mt-1 text-green-700">Copia o link do vídeo (ex: <code>https://youtu.be/abc123xyz</code>) e cola no campo "Ou URL externo" na edição da tua aula na plataforma.</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-neutral-900 mb-4">Opção 2: Usar o Vimeo</h3>
          <div className="space-y-4 text-sm text-neutral-600">
            <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-neutral-100 font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <p className="font-bold text-neutral-900">Fazer Upload no Vimeo</p>
                <p className="mt-1">Carrega o vídeo no teu painel do Vimeo.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-neutral-100 font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <p className="font-bold text-neutral-900">Configurar Privacidade</p>
                <p className="mt-1">Nas definições de Privacidade do vídeo, escolhe "Ocultar no Vimeo" (Hide from Vimeo) e garante que a opção de incorporar (Embed) está permitida em qualquer lado.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl bg-[#F4FDF8] border-green-100">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <p className="font-bold text-green-800">Copiar Link e Colar na Plataforma</p>
                <p className="mt-1 text-green-700">Copia o link do vídeo (ex: <code>https://vimeo.com/123456789</code>) e cola no campo "Ou URL externo" na plataforma.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
