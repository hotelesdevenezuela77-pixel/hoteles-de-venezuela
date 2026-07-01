import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;
const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = `aws-0-us-east-1.pooler.supabase.com`;

async function run() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);
  const ips = await resolver.resolve4(host);
  const ip = ips[0];
  console.log(`Connecting to ${ip} (${host})...`);
  const client = new Client({
    host: ip,
    port: 6543,
    user: 'postgres.ghgetcznlrilgocwigmj',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  await client.connect();
  console.log("Connected!");

  // Get columns of 'expenses' table
  const colRes = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'expenses'
  `);
  console.log("Columns of 'expenses' table:");
  console.log(colRes.rows);

  await client.end();
}
run().catch(console.error);
