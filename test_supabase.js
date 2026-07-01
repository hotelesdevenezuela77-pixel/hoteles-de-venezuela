import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('establishments')
    .select('id, name, slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Most recently updated establishments:");
    console.log(JSON.stringify(data, null, 2));
  }
}
run();
