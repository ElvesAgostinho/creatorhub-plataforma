const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(url, key);

async function makePrivate() {
  // Tornar lessons privado
  const { data: dataLessons, error: errLessons } = await supabase.storage.updateBucket('lessons', {
    public: false,
    fileSizeLimit: 5368709120, // 5GB
    allowedMimeTypes: null
  });
  
  if (errLessons) console.error('Error updating lessons bucket:', errLessons);
  else console.log('SUCCESS! lessons bucket is now private');

  // Tornar books privado
  const { data: dataBooks, error: errBooks } = await supabase.storage.updateBucket('books', {
    public: false,
    fileSizeLimit: 524288000, // 500MB
    allowedMimeTypes: null
  });
  
  if (errBooks) console.error('Error updating books bucket:', errBooks);
  else console.log('SUCCESS! books bucket is now private');
}

makePrivate();
