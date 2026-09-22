import pg from 'pg';
import dns from 'dns/promises';
import { articles1to5 } from './articles_1_to_5.js';
import { articles6to10 } from './articles_6_to_10.js';
import { articles11to15 } from './articles_11_to_15.js';
import { articles16to20 } from './articles_16_to_20.js';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-1-us-west-2.pooler.supabase.com';

const allReports = [
  ...articles1to5,
  ...articles6to10,
  ...articles11to15,
  ...articles16to20
];

console.log(`Prepared ${allReports.length} reports for database upsert.`);

async function run() {
  const ips = await dns.resolve4(host);
  console.log(`Resolved ${host} -> ${ips[0]}`);

  const client = new Client({
    host: ips[0],
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });

  client.connectionParameters.servername = host;

  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const upsertQuery = `
    INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_name, reading_time, status, published_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      content = EXCLUDED.content,
      featured_image = EXCLUDED.featured_image,
      author_name = EXCLUDED.author_name,
      reading_time = EXCLUDED.reading_time,
      status = EXCLUDED.status,
      updated_at = NOW();
  `;

  for (let i = 0; i < allReports.length; i++) {
    const report = allReports[i];
    const words = report.content.trim().split(/\s+/).length;
    console.log(`[${i+1}/${allReports.length}] Upserting: ${report.slug} (${report.content.length} chars, ${words} words)...`);
    
    await client.query(upsertQuery, [
      report.title,
      report.slug,
      report.excerpt,
      report.content,
      report.featured_image,
      report.author_name || 'Equipo Editorial Hoteles de Venezuela',
      report.reading_time || 20,
      report.status || 'published'
    ]);
  }

  console.log('\n--- VERIFYING DATABASE ENTRIES ---');
  const slugs = allReports.map(r => r.slug);
  const verifyRes = await client.query(
    `SELECT id, slug, title, length(content) as char_count, status, updated_at 
     FROM blog_posts 
     WHERE slug = ANY($1::text[]) 
     ORDER BY id ASC;`,
    [slugs]
  );

  console.log(`Found ${verifyRes.rows.length} rows in database:`);
  let totalChars = 0;
  verifyRes.rows.forEach((row, idx) => {
    totalChars += parseInt(row.char_count, 10);
    console.log(`${idx+1}. [${row.slug}] -> chars: ${row.char_count}, status: ${row.status}, updated_at: ${row.updated_at}`);
  });

  console.log(`\nAverage chars per article: ${Math.round(totalChars / verifyRes.rows.length)}`);
  console.log('Database upsert completed successfully!');

  await client.end();
}

run().catch(err => {
  console.error('Error during upsert:', err);
  process.exit(1);
});
