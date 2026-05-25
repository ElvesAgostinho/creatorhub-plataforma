import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER_EMAIL = "ABOVE <abovesuporte25@gmail.com>";

export async function sendPaymentConfirmation(userEmail, product) {
  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: userEmail,
      subject: `[ABOVE] Confirmação de Compra: ${product.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #FF4500; margin: 0;">ABOVE</h1>
          </div>
          <h2>Obrigado pela tua compra! 🎉</h2>
          <p>O teu pagamento para o produto <strong>${product.title}</strong> foi confirmado com sucesso.</p>
          <p>Já podes aceder ao teu conteúdo premium diretamente na plataforma. O teu passe VIP está ativo.</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #FF4500; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Aceder ao Conteúdo
            </a>
          </div>
          <hr style="border-color: #eaeaea; margin: 32px 0;" />
          <p style="color: #666; font-size: 14px;">Se tiveres alguma dúvida ou precisares de suporte, basta responderes a este e-mail.</p>
        </div>
      `
    });
    return { success: true, data };
  } catch (error) {
    console.error("[sendPaymentConfirmation] Error:", error);
    return { success: false, error };
  }
}

export async function sendMarketingBroadcast(emails, subject, htmlBody) {
  try {
    // Resend batch API supports up to 100 emails per request
    const BATCH_SIZE = 100;
    const results = [];
    
    // We wrap the raw HTML with our standard premium template layout
    const formattedHtml = (body) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #FF4500; margin: 0; font-size: 28px; letter-spacing: -1px;">ABOVE</h1>
        </div>
        <div style="color: #1a1a1a; line-height: 1.6;">
          ${body}
        </div>
        <hr style="border-color: #f5f5f5; margin: 32px 0;" />
        <div style="text-align: center; color: #888; font-size: 12px;">
          <p>Recebeste este e-mail porque fazes parte da comunidade ABOVE.</p>
          <p>© ${new Date().getFullYear()} ABOVE. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const chunk = emails.slice(i, i + BATCH_SIZE);
      const batchData = chunk.map(email => ({
        from: SENDER_EMAIL,
        to: email,
        subject: subject,
        html: formattedHtml(htmlBody)
      }));
      
      const { data, error } = await resend.batch.send(batchData);
      if (error) throw error;
      results.push(data);
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("[sendMarketingBroadcast] Error:", error);
    return { success: false, error };
  }
}
