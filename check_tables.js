const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjzfqqxkeivrxfnwqswl.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqemZxcXhrZWl2cnhmbndxc3dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMxNjg2NywiZXhwIjoyMDk0ODkyODY3fQ.ozf42oypTMNXcRGCROwNyoYOsTdaIkexNQSgDpVd-5A'
);

async function check() {
  // Check tables
  const { error: err1 } = await s.from('affiliate_earnings').select('id').limit(1);
  console.log('affiliate_earnings:', err1 ? err1.message : 'EXISTS');
  
  // Check purchases columns
  const { data: purchases, error: err2 } = await s.from('purchases').select('affiliate_id').limit(1);
  console.log('purchases.affiliate_id:', err2 ? err2.message : 'EXISTS');

  // Check products columns
  const { data: products, error: err3 } = await s.from('products').select('affiliate_commission_pct').limit(1);
  console.log('products.affiliate_commission_pct:', err3 ? err3.message : 'EXISTS');
}
check();
