const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(url, key);

async function makePublic() {
  const { data, error } = await supabase.storage.updateBucket('lessons', {
    public: true,
    fileSizeLimit: 5368709120, // keep existing limit
    allowedMimeTypes: null
  });
  
  if (error) {
    console.error('Error updating bucket:', error);
  } else {
    console.log('SUCCESS! Bucket is now public:', data);
  }
}

makePublic();
