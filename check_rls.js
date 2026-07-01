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

  const ips = await resolver.resolve4(host);
  const ip = ips[0];

  const client = new Client({
    host: ip,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  await client.connect();

  try {
    console.log("Checking Row-Level Security (RLS) on tables...");
    const rlsQuery = `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('establishments', 'destinations', 'categories', 'user_profiles', 'establishment_images');
    `;
    const rlsRes = await client.query(rlsQuery);
    console.log("RLS Status:");
    console.table(rlsRes.rows);

    console.log("\nChecking database policies...");
    const policiesQuery = `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('establishments', 'destinations', 'categories', 'user_profiles', 'establishment_images');
    `;
    const polRes = await client.query(policiesQuery);
    console.log("Policies:");
    console.log(JSON.stringify(polRes.rows, null, 2));

  } catch (err) {
    console.error("Failed to query catalog:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
