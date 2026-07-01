import pg from 'pg';
const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-0-us-west-2.pooler.supabase.com';

async function test() {
  const ports = [5432, 6543];
  for (const port of ports) {
    console.log(`Trying host: ${host} on port ${port}...`);
    const client = new Client({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected on port ${port}`);
      const res = await client.query("SELECT version()");
      console.log("DB Version:", res.rows[0].version);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed on port ${port}: ${err.message}`);
    }
  }
}

test();
