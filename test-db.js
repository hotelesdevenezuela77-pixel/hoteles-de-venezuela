import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghgetcznlrilgocwigmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Querying destinations...");
  const dests = await supabase.from("destinations").select("id, name, slug");
  console.log("Destinations response:", JSON.stringify(dests, null, 2));
}

test().catch(console.error);
