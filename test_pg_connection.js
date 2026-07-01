import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';

// Let's resolve aws-0-us-west-2.pooler.supabase.com and aws-0-us-east-1.pooler.supabase.com
const hosts = [
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-us-west-2.pooler.supabase.com`
];

async function run() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  for (const host of hosts) {
    console.log(`Resolving A records for ${host}...`);
    try {
      const ips = await resolver.resolve4(host);
      console.log(`IPs for ${host}:`, ips);
      for (const ip of ips) {
        for (const port of [6543, 5432]) {
          console.log(`Connecting to ${ip}:${port} for host ${host}...`);
          const client = new Client({
            host: ip,
            port,
            user,
            password,
            database,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
          });
          
          // Configure servername for SNI / TLS
          client.connectionParameters.servername = host;

          try {
            await client.connect();
            console.log(`Connected successfully to ${host} via IP ${ip} on port ${port}!`);
            const res = await client.query("SELECT count(*) FROM establishments");
            console.log(`Number of establishments: ${res.rows[0].count}`);
            await client.end();
            return;
          } catch (e) {
            console.log(`Failed to connect to ${ip}:${port} -> ${e.message}`);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to resolve ${host}:`, err.message);
    }
  }
}

run().catch(console.error);
