const { Resend } = require("resend");

const resend = new Resend("re_En1UB3hM_5mE269eEeCt3zX9c7TSAMmmb");

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: "ABOVE <abovesuporte25@gmail.com>",
      to: "abovesuporte25@gmail.com",
      subject: "Test",
      html: "<p>test</p>"
    });
    console.log("Result:", { data, error });
  } catch (e) {
    console.error("Crash:", e.message);
  }
}

test();
