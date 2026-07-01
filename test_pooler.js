import pg from 'pg';
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

async function testConnection() {
  for (const r of regions) {
    const hosts = [
      `aws-0-${r}.pooler.supabase.com`,
      `aws-${r}.pooler.supabase.com`
    ];

    for (const host of hosts) {
      console.log(`Trying host: ${host} (port 6543)...`);
      const client = new Client({
        host,
        port: 6543,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });

      try {
        await client.connect();
        console.log(`SUCCESS! Connected to ${host}`);
        const res = await client.query("SELECT version()");
        console.log("DB Version:", res.rows[0].version);
        await client.end();
        return host;
      } catch (err) {
        // If the address itself doesn't exist, we don't need to log tenant error
        if (err.message.includes('ENOTFOUND')) {
          // ignore DNS not found
        } else {
          console.log(`Failed for ${host}: ${err.message}`);
        }
      }
    }
  }
  console.log("Could not connect to any pooler.");
  return null;
}

testConnection();
