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
    const res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    console.log("All tables in public schema:");
    console.table(res.rows);
  } catch (err) {
    console.error("Failed to list tables:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
