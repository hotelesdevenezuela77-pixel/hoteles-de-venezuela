import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-1-us-west-2.pooler.supabase.com';

async function run() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  console.log(`Resolving IP for ${host}...`);
  const ips = await resolver.resolve4(host);
  const ip = ips[0];
  console.log(`Resolved IP: ${ip}`);

  const client = new Client({
    host: ip,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  console.log("Connecting to PostgreSQL...");
  await client.connect();
  console.log("Connected successfully!");

  try {
    console.log("Applying RLS policies and enabling RLS on all tables...");

    const sqlScript = `
      -- 1. For all tables, enable RLS and set up policies.
      DO $$
      DECLARE
          r RECORD;
          sensitive_tables text[] := ARRAY[
              'users', 'staff_members', 'abandoned_bookings', 'booking_requests', 
              'quotes', 'reservations', 'tour_package_bookings', 'whatsapp_leads', 
              'establishment_whatsapp_leads', 'whatsapp_messages', 'b2b_messages', 
              'b2b_transactions', 'andromeda_points', 'andromeda_withdrawals', 
              'ai_conversations', 'ai_messages', 'analytics_events', 'commercial_prospects', 
              'expenses', 'membership_payments', 'tasks'
          ];
      BEGIN
          FOR r IN (
              SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public' 
                AND tablename NOT IN ('user_profiles')
          ) LOOP
              -- Enable Row Level Security on the table
              EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);

              -- Drop existing policies to prevent conflicts
              EXECUTE format('DROP POLICY IF EXISTS "Allow public select" ON public.%I', r.tablename);
              EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated select" ON public.%I', r.tablename);
              EXECUTE format('DROP POLICY IF EXISTS "Allow admin all" ON public.%I', r.tablename);
              
              -- Create SELECT policy based on sensitivity
              IF r.tablename = 'users' THEN
                  -- Highly private legacy table: no public select policy (only postgres/service_role can read)
                  NULL;
              ELSIF r.tablename = ANY(sensitive_tables) THEN
                  -- Sensitive customer data: restrict read access to authenticated users only
                  EXECUTE format('CREATE POLICY "Allow authenticated select" ON public.%I FOR SELECT TO authenticated USING (true)', r.tablename);
              ELSE
                  -- Safe public data: allow anyone to select
                  EXECUTE format('CREATE POLICY "Allow public select" ON public.%I FOR SELECT USING (true)', r.tablename);
              END IF;
              
              -- Create admin ALL policy (restrict to official admin accounts or users with admin role in user_profiles)
              EXECUTE format('
                  CREATE POLICY "Allow admin all" ON public.%I FOR ALL USING (
                      auth.jwt() ->> ''email'' IN (''hotelesdevenezuela77@gmail.com'', ''webmasterpro177@gmail.com'', ''admin-test@hotelesdevenezuela.com'') OR
                      EXISTS (
                          SELECT 1 FROM public.user_profiles 
                          WHERE user_profiles.user_id = auth.uid()::text 
                            AND user_profiles.role = ''admin''
                      )
                  )
              ', r.tablename);
          END LOOP;
      END $$;

      -- 2. Specific policies for user_profiles (allowing registration, upserts, and admin operations)
      -- Enable RLS on user_profiles
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public select on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow individual select on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow individual insert on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow individual update on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow admin all on user_profiles" ON public.user_profiles;

      -- Restrict profile reading to the individual user or official admin email
      CREATE POLICY "Allow individual select on user_profiles" ON public.user_profiles 
          FOR SELECT USING (auth.uid()::text = user_id OR auth.jwt() ->> 'email' IN ('hotelesdevenezuela77@gmail.com', 'webmasterpro177@gmail.com', 'admin-test@hotelesdevenezuela.com'));

      CREATE POLICY "Allow individual insert on user_profiles" ON public.user_profiles 
          FOR INSERT WITH CHECK (auth.uid()::text = user_id);

      CREATE POLICY "Allow individual update on user_profiles" ON public.user_profiles 
          FOR UPDATE USING (auth.uid()::text = user_id);

      CREATE POLICY "Allow admin all on user_profiles" ON public.user_profiles 
          FOR ALL USING (auth.jwt() ->> 'email' IN ('hotelesdevenezuela77@gmail.com', 'webmasterpro177@gmail.com', 'admin-test@hotelesdevenezuela.com'));

      -- 3. For transactional and user-submitted data tables, allow public INSERT, UPDATE, and DELETE
      -- to avoid breaking key user-facing workflows (like reviews, booking requests, favorites)
      DO $$
      DECLARE
          t text;
          interactive_tables text[] := ARRAY[
              'reviews', 'reservations', 'booking_requests', 'quotes', 
              'abandoned_bookings', 'analytics_events', 'b2b_messages', 
              'b2b_transactions', 'establishment_whatsapp_leads', 'whatsapp_leads', 
              'whatsapp_messages', 'user_favorites', 'user_trips'
          ];
      BEGIN
          FOREACH t IN ARRAY interactive_tables LOOP
              EXECUTE format('DROP POLICY IF EXISTS "Allow public insert" ON public.%I', t);
              EXECUTE format('CREATE POLICY "Allow public insert" ON public.%I FOR INSERT WITH CHECK (true)', t);
              
              EXECUTE format('DROP POLICY IF EXISTS "Allow public update" ON public.%I', t);
              EXECUTE format('CREATE POLICY "Allow public update" ON public.%I FOR UPDATE USING (true)', t);
              
              EXECUTE format('DROP POLICY IF EXISTS "Allow public delete" ON public.%I', t);
              EXECUTE format('CREATE POLICY "Allow public delete" ON public.%I FOR DELETE USING (true)', t);
          END LOOP;
      END $$;
    `;

    await client.query(sqlScript);
    console.log("RLS policies and tables successfully secured and updated!");

  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
