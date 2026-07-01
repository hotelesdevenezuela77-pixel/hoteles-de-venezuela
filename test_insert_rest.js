import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghgetcznlrilgocwigmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing insert via REST...");
  const sampleCategory = {
    id: 9999,
    slug: 'test-category-xyz',
    name: 'Test Category XYZ',
    icon: 'hotel'
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([sampleCategory])
    .select();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded!", data);
    
    // Clean up
    console.log("Cleaning up...");
    const { error: delError } = await supabase
      .from('categories')
      .delete()
      .eq('id', 9999);
    
    if (delError) {
      console.error("Clean up failed:", delError);
    } else {
      console.log("Clean up succeeded!");
    }
  }
}

test();
