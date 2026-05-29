import { Resend } from "resend";

if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_dummy")) {
  console.warn("[Email] AVISO: RESEND_API_KEY não configurada. Emails não serão enviados.");
}

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_to_prevent_crash");
const SENDER_EMAIL = "ABOVE <suporte@bizlink.topconsultores.pt>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f5f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f6;padding:40px 20px;">
    <tr><td>
      <table width="600" cellpadding="0" cellspacing="0" align="center" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#111111;padding:28px 40px;text-align:center;">
          <span style="font-size:28px;font-weight:900;color:#FF4500;letter-spacing:-1px;font-style:italic;">ABOVE</span>
        </td></tr>
        <tr><td style="padding:40px;">
          ${content}
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} ABOVE · Angola's #1 Digital Learning Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendPaymentConfirmation(userEmail, product) {
  try {
    const html = baseTemplate(`
      <h2 style="color:#111;font-size:24px;margin:0 0 8px;">Obrigado pela tua compra! 🎉</h2>
      <p style="color:#555;margin:0 0 24px;">O teu pagamento para <strong>${product.title}</strong> foi confirmado.</p>
      <div style="background:#fff8f5;border:1px solid #ffd0bc;border-radius:12px;padding:24px;margin-bottom:28px;">
        <p style="margin:0;color:#333;"><strong>Produto:</strong> ${product.title}</p>
        <p style="margin:8px 0 0;color:#333;"><strong>Acesso:</strong> Imediato — área de membros já disponível</p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="${APP_URL}/library" style="background:#FF4500;color:#fff;padding:16px 36px;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;display:inline-block;">
          Aceder ao Conteúdo →
        </a>
      </div>
      <p style="color:#999;font-size:13px;margin:24px 0 0;">Se tiveres dúvidas, responde a este e-mail.</p>
    `);
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: userEmail,
      subject: `✅ Compra Confirmada: ${product.title}`,
      html
    });
    console.log("[Email] sendPaymentConfirmation → OK", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] sendPaymentConfirmation → ERRO:", error);
    return { success: false, error: error.message };
  }
}

export async function sendCreatorSaleNotification(creatorEmail, productTitle, buyerName, amountStr) {
  try {
    const html = baseTemplate(`
      <h2 style="color:#FF4500;font-size:24px;margin:0 0 8px;">Ca-ching! Nova Venda! 💰</h2>
      <p style="color:#555;margin:0 0 24px;">Parabéns! Acabaste de fazer uma venda na plataforma ABOVE.</p>
      <div style="background:#f9f9f9;border-radius:12px;padding:24px;margin-bottom:28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color:#888;font-size:13px;padding:6px 0;border-bottom:1px solid #eee;">Produto</td><td style="font-weight:700;color:#111;text-align:right;padding:6px 0;border-bottom:1px solid #eee;">${productTitle}</td></tr>
          <tr><td style="color:#888;font-size:13px;padding:6px 0;border-bottom:1px solid #eee;">Cliente</td><td style="font-weight:700;color:#111;text-align:right;padding:6px 0;border-bottom:1px solid #eee;">${buyerName || "Cliente ABOVE"}</td></tr>
          <tr><td style="color:#888;font-size:13px;padding:6px 0;">Valor</td><td style="font-weight:900;color:#00A859;font-size:20px;text-align:right;padding:6px 0;">${amountStr}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${APP_URL}/creator" style="background:#111;color:#fff;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:700;display:inline-block;">
          Ver Painel de Criador →
        </a>
      </div>
    `);
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: creatorEmail,
      subject: `💰 Nova Venda: ${productTitle}`,
      html
    });
    console.log("[Email] sendCreatorSaleNotification → OK", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] sendCreatorSaleNotification → ERRO:", error);
    return { success: false, error: error.message };
  }
}

export async function sendAdminSaleAlert(adminEmail, { productTitle, buyerName, buyerEmail, amountStr, purchaseId }) {
  try {
    const html = baseTemplate(`
      <h2 style="color:#111;font-size:22px;margin:0 0 8px;">🔔 Nova Compra Aprovada</h2>
      <p style="color:#555;margin:0 0 24px;">Uma compra foi aprovada manualmente na plataforma.</p>
      <div style="background:#f0f9ff;border:1px solid #bae0fd;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color:#555;padding:5px 0;font-size:13px;">Purchase ID</td><td style="font-weight:700;color:#111;text-align:right;font-size:12px;font-family:monospace;">${purchaseId}</td></tr>
          <tr><td style="color:#555;padding:5px 0;font-size:13px;">Produto</td><td style="font-weight:700;color:#111;text-align:right;">${productTitle}</td></tr>
          <tr><td style="color:#555;padding:5px 0;font-size:13px;">Comprador</td><td style="font-weight:700;color:#111;text-align:right;">${buyerName || "—"}</td></tr>
          <tr><td style="color:#555;padding:5px 0;font-size:13px;">Email</td><td style="font-weight:700;color:#111;text-align:right;">${buyerEmail || "—"}</td></tr>
          <tr><td style="color:#555;padding:5px 0;font-size:13px;">Valor</td><td style="font-weight:900;color:#00A859;font-size:18px;text-align:right;">${amountStr}</td></tr>
        </table>
      </div>
      <div style="text-align:center;">
        <a href="${APP_URL}/admin" style="background:#FF4500;color:#fff;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:700;display:inline-block;">
          Ver Painel Admin →
        </a>
      </div>
    `);
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: adminEmail,
      subject: `🔔 [ABOVE Admin] Venda Aprovada: ${productTitle} — ${amountStr}`,
      html
    });
    console.log("[Email] sendAdminSaleAlert → OK", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] sendAdminSaleAlert → ERRO:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMarketingBroadcast(emails, subject, htmlBody) {
  try {
    const BATCH_SIZE = 100;
    const results = [];
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const chunk = emails.slice(i, i + BATCH_SIZE);
      const batchData = chunk.map(email => ({
        from: SENDER_EMAIL,
        to: email,
        subject,
        html: baseTemplate(`<div style="color:#1a1a1a;line-height:1.7;">${htmlBody}</div>`)
      }));
      const { data, error } = await resend.batch.send(batchData);
      if (error) throw error;
      results.push(data);
    }
    return { success: true, results };
  } catch (error) {
    console.error("[Email] sendMarketingBroadcast → ERRO:", error);
    return { success: false, error: error.message };
  }
}

export async function sendRoleApprovalNotification(userEmail, roleTitle) {
  try {
    const html = baseTemplate(`
      <h2 style="color:#111;font-size:24px;margin:0 0 8px;">Boas notícias! 🎉</h2>
      <p style="color:#555;margin:0 0 24px;">A tua candidatura para <strong>${roleTitle}</strong> foi aprovada pela nossa equipa.</p>
      <p style="color:#555;margin:0 0 28px;">Já podes aceder a todas as ferramentas premium e começar a faturar.</p>
      <div style="text-align:center;">
        <a href="${APP_URL}" style="background:#FF4500;color:#fff;padding:16px 36px;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;display:inline-block;">
          Aceder à Plataforma →
        </a>
      </div>
    `);
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: userEmail,
      subject: `🚀 Candidatura Aprovada: ${roleTitle}`,
      html
    });
    console.log("[Email] sendRoleApprovalNotification → OK", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] sendRoleApprovalNotification → ERRO:", error);
    return { success: false, error: error.message };
  }
}
