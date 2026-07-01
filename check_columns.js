import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('establishments').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Establishment columns:", Object.keys(data[0]));
    console.log("Sample values:", data[0]);
  } else {
    console.log("No establishments found.");
  }
}
run();
