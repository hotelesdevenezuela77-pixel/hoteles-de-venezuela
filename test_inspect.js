import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== DISTINCT EVENT TYPES ===");
  const { data: types, error: err1 } = await supabase
    .from('analytics_events')
    .select('event_type')
    .then(res => {
      if (res.error) return res;
      const set = new Set(res.data.map(x => x.event_type));
      return { data: Array.from(set) };
    });
  
  if (err1) console.error("Error 1:", err1);
  else console.log(types);

  console.log("\n=== EVENTS WITH EXTRA DATA ===");
  const { data: extras, error: err2 } = await supabase
    .from('analytics_events')
    .select('id, event_type, extra_data')
    .not('extra_data', 'is', null)
    .limit(10);

  if (err2) console.error("Error 2:", err2);
  else console.log(JSON.stringify(extras, null, 2));
}

run();
