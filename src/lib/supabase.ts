import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ghgetcznlrilgocwigmj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
