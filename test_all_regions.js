import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'sa-east-1', 'ap-southeast-1', 'ap-southeast-2',
  'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'ca-central-1'
];

async function run() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  for (const r of regions) {
    const hosts = [
      `aws-0-${r}.pooler.supabase.com`,
      `aws-${r}.pooler.supabase.com`
    ];

    for (const host of hosts) {
      console.log(`\n--------------------------------------`);
      console.log(`Resolving IP for ${host}...`);
      let ips = [];
      try {
        ips = await resolver.resolve4(host);
        console.log(`Resolved IPv4:`, ips);
      } catch (err) {
        console.log(`No IPv4 found for ${host}: ${err.message}`);
        continue;
      }

      for (const ip of ips) {
        for (const port of [5432, 6543]) {
          console.log(`Connecting to IP ${ip} (host: ${host}) on port ${port}...`);
          const client = new Client({
            host: ip,
            port,
            user,
            password,
            database,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 4000
          });

          // Set servername for TLS SNI
          client.connectionParameters.servername = host;

          try {
            await client.connect();
            console.log(`SUCCESS! Connected to ${host} via IP ${ip} on port ${port}!`);
            const res = await client.query("SELECT version()");
            console.log("DB Version:", res.rows[0].version);
            await client.end();
            return;
          } catch (err) {
            console.log(`Failed (IP: ${ip}, port: ${port}): ${err.message}`);
          }
        }
      }
    }
  }
}

run().catch(console.error);
