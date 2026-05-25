const nodemailer = require("nodemailer");

async function testSMTP() {
  let transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "resend",
      pass: "re_En1UB3hM_5mE269eEeCt3zX9c7TSAMmmb",
    },
  });

  try {
    let info = await transporter.sendMail({
      from: "ABOVE <suporte@bizlink.topconsultores.pt>",
      to: "abovesuporte25@gmail.com",
      subject: "Teste SMTP",
      text: "Este é um teste SMTP.",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("ERRO SMTP:", error);
  }
}

testSMTP();
