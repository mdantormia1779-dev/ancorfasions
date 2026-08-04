import { createClient } from '../lib/supabase/server'; 

async function run() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('campaigns').select('*').limit(1);
  console.log(JSON.stringify({data, error}, null, 2));
}

run().catch(console.error);
