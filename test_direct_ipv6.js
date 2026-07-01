import pg from 'pg';
const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const host = '2600:1f14:2c31:7602:b20f:1e9e:b9fb:2327';
const user = 'postgres';
const database = 'postgres';

async function test() {
  console.log(`Connecting directly to IPv6: [${host}]...`);
  const client = new Client({
    host,
    port: 5432,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log("SUCCESS! Connected directly via IPv6!");
    const res = await client.query("SELECT version()");
    console.log("DB Version:", res.rows[0].version);
    await client.end();
  } catch (err) {
    console.log(`Direct IPv6 failed: ${err.message}`);
  }
}

test();
