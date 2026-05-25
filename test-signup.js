const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://pjzfqqxkeivrxfnwqswl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqemZxcXhrZWl2cnhmbndxc3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTY4NjcsImV4cCI6MjA5NDg5Mjg2N30.XvKZkfEpXUsifL_R0YK9EUoLqHwTfLH2LVzOe5OJyFc"
);

async function testSignup() {
  const email = "abovesuporte25+teste" + Date.now() + "@gmail.com";
  console.log("A tentar registar a conta com o email:", email);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: "PasswordSuperForte123!",
    options: {
      data: {
        full_name: "Teste de SMTP"
      }
    }
  });

  if (error) {
    console.error("ERRO:", error.message);
  } else {
    console.log("SUCESSO! Conta criada e e-mail enviado para:", data.user?.email);
  }
}

testSignup();
