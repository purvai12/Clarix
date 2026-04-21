const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function purge() {
  console.log('Fetching profiles...');
  const { data: profiles, error } = await supabase.from('profiles').select('id, wallet_address');
  if (error) return console.error('DB Error:', error);

  const invalidIds = [];
  console.log(`Checking ${profiles.length} addresses...`);
  
  for (const p of profiles) {
    if (!p.wallet_address) continue;
    
    // Skip checking if it's already a known placeholder or clearly invalid length
    if (p.wallet_address.startsWith('pending_')) {
        invalidIds.push(p.id);
        continue;
    }

    try {
      const res = await fetch('https://horizon-testnet.stellar.org/accounts/' + p.wallet_address);
      if (!res.ok) {
        console.log('INVALID: ' + p.wallet_address + ' (id: ' + p.id + ')');
        invalidIds.push(p.id);
      } else {
        console.log('VALID: ' + p.wallet_address);
      }
    } catch (e) {
      console.log('Error checking ' + p.wallet_address);
    }
  }

  if (invalidIds.length > 0) {
    console.log(`Deleting ${invalidIds.length} invalid records...`);
    const { error: delError } = await supabase.from('profiles').delete().in('id', invalidIds);
    if (delError) console.error('Delete Error:', delError);
    else console.log('Successfully purged invalid records.');
  } else {
    console.log('No invalid records found.');
  }
}

purge();
