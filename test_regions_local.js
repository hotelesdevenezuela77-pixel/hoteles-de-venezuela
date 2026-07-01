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
    const host = `aws-0-${r}.pooler.supabase.com`;
    console.log(`Resolving IP for ${host}...`);
    let ips = [];
    try {
      ips = await resolver.resolve4(host);
    } catch (e) {
      continue;
    }

    for (const ip of ips) {
      console.log(`Testing ${host} via ${ip}...`);
      const client = new Client({
        host: ip,
        port: 6543,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000
      });
      client.connectionParameters.servername = host;

      try {
        await client.connect();
        console.log(`SUCCESS connected to pooler in region ${r}!`);
        const res = await client.query("SELECT version()");
        console.log("Version:", res.rows[0].version);
        await client.end();
        return;
      } catch (err) {
        console.log(`Failed for ${r}: ${err.message}`);
      }
    }
  }
  console.log("All regions scanned.");
}

run().catch(console.error);
