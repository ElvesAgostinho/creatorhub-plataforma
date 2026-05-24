const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
supabase.from('products').select('id, title, created_by').limit(5).then(r => console.log(r)).catch(console.error);
