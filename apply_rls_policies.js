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
    console.log("Applying RLS policies to all tables...");

    const sqlScript = `
      -- 1. For all tables, set up public SELECT and admin ALL policies by default.
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public' 
                AND tablename NOT IN ('user_profiles')
          ) LOOP
              -- Drop existing policies to prevent conflicts
              EXECUTE format('DROP POLICY IF EXISTS "Allow public select" ON public.%I', r.tablename);
              EXECUTE format('DROP POLICY IF EXISTS "Allow admin all" ON public.%I', r.tablename);
              
              -- Create public SELECT policy
              EXECUTE format('CREATE POLICY "Allow public select" ON public.%I FOR SELECT USING (true)', r.tablename);
              
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
      DROP POLICY IF EXISTS "Allow public select on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow individual insert on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow individual update on user_profiles" ON public.user_profiles;
      DROP POLICY IF EXISTS "Allow admin all on user_profiles" ON public.user_profiles;

      CREATE POLICY "Allow public select on user_profiles" ON public.user_profiles 
          FOR SELECT USING (true);

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
    console.log("RLS policies successfully applied!");

  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
