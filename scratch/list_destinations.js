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

  console.log(`Resolving IP...`);
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
  console.log("Connected!");

  try {
    const res = await client.query("SELECT id, name, slug, state FROM destinations ORDER BY name");
    console.log("DESTINATIONS:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Query failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
