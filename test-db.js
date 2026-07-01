import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghgetcznlrilgocwigmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR'; // Actually wait, in .env it was 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR' or similar
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Querying categories...");
  const cats = await supabase.from("categories").select("*");
  console.log("Categories response:", JSON.stringify(cats, null, 2));

  console.log("\nQuerying destinations...");
  const dests = await supabase.from("destinations").select("*");
  console.log("Destinations response:", JSON.stringify(dests, null, 2));
  
  console.log("\nQuerying establishmets schema / columns...");
  const ests = await supabase.from("establishments").select("*").limit(1);
  console.log("Establishments response:", JSON.stringify(ests, null, 2));
}

test().catch(console.error);
