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

  const client = new Client({
    host: ip,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  console.log("Connecting...");
  await client.connect();

  try {
    console.log("Adding services_data column to ai_agents...");
    await client.query(`
      ALTER TABLE public.ai_agents 
      ADD COLUMN IF NOT EXISTS services_data JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("services_data column successfully added!");
  } catch (err) {
    console.error("Query failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
