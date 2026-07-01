import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghgetcznlrilgocwigmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Running AdminEstablecimientos fetch query...");
  const { data, error } = await supabase
    .from("establishments")
    .select(`
      id, name, slug, status, is_featured, has_hdv_seal, 
      has_reservations_enabled, is_ads_enabled, membership_tier, 
      city, state, phone, whatsapp, owner_user_id, rating_avg, 
      review_count, created_at,
      categories (name),
      destinations (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Query failed:", error);
  } else {
    console.log("Query succeeded! Count:", data.length);
    console.log("First item:", JSON.stringify(data[0], null, 2));
  }
}

test().catch(console.error);
