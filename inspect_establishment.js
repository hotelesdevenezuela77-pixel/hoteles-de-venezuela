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

  try {
    const res = await client.query(`
      SELECT id, name, slug, status FROM establishments 
      WHERE name ILIKE '%perla negra%' OR slug ILIKE '%perla-negra%';
    `);
    console.log("Establishment matching 'perla negra':");
    console.table(res.rows);

    if (res.rows.length > 0) {
      const estId = res.rows[0].id;
      const imgRes = await client.query(`
        SELECT id, establishment_id, is_primary, sort_order, substring(image_url from 1 for 40) as url_preview 
        FROM establishment_images 
        WHERE establishment_id = $1;
      `, [estId]);
      console.log(`Images for establishment ID ${estId}:`);
      console.table(imgRes.rows);
    }
  } catch (err) {
    console.error("Error inspecting:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
