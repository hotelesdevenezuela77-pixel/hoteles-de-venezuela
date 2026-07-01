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

  console.log("Connecting...");
  await client.connect();
  console.log("Connected successfully!");

  try {
    const est = await client.query("SELECT count(*) FROM establishments");
    console.log("Establishments count:", est.rows[0].count);

    const dest = await client.query("SELECT count(*) FROM destinations");
    console.log("Destinations count:", dest.rows[0].count);

    const cat = await client.query("SELECT count(*) FROM categories");
    console.log("Categories count:", cat.rows[0].count);

    // Let's also check if user_profiles exists and its count
    try {
      const up = await client.query("SELECT count(*) FROM user_profiles");
      console.log("User profiles count:", up.rows[0].count);
    } catch (e) {
      console.log("user_profiles table query failed:", e.message);
    }
    
  } catch (err) {
    console.error("Query failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
