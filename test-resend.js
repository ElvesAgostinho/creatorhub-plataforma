const { Resend } = require("resend");

const resend = new Resend("re_En1UB3hM_5mE269eEeCt3zX9c7TSAMmmb");

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: "ABOVE <suporte@bizlink.topconsultores.pt>",
      to: "abovesuporte25@gmail.com",
      subject: "Testando o disparo de E-mail (ABOVE)",
      html: "<h2>Sucesso!</h2><p>O teu domínio verificado está a funcionar perfeitamente com a API do Resend.</p>"
    });
    console.log("Result:", { data, error });
  } catch (e) {
    console.error("Crash:", e.message);
  }
}

test();
