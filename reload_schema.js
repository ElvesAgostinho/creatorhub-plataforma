const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://pjzfqqxkeivrxfnwqswl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqemZxcXhrZWl2cnhmbndxc3dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMxNjg2NywiZXhwIjoyMDk0ODkyODY3fQ.ozf42oypTMNXcRGCROwNyoYOsTdaIkexNQSgDpVd-5A');

// Sometimes rpc('exec_sql') doesn't exist, we can just fetch some data but PostgREST schema cache needs a reload via API if we don't have SQL access.
// If exec_sql doesn't exist, we just hope it works, or we will just remove `published` from the Next.js query to avoid any hassle.
s.rpc('exec_sql', { sql: 'NOTIFY pgrst, "reload schema";' })
  .then(console.log)
  .catch(console.error);
