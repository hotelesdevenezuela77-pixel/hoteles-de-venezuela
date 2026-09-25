import fs from 'fs';
import pg from 'pg';
import dns from 'dns/promises';

const transcriptPath = '/Users/macmini/.gemini/antigravity-ide/brain/d69705b9-13a4-4a03-a99b-d9d286207862/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

const rawReports = [];

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    const content = data.content || '';
    if (typeof content === 'string') {
      const repMatches = [...content.matchAll(/# REPORTE #(\d+):[^\n]+/g)];
      if (repMatches.length > 0) {
        for (let i = 0; i < repMatches.length; i++) {
          const match = repMatches[i];
          const repNum = parseInt(match[1], 10);
          const startIndex = match.index;
          let endIndex = content.length;
          if (i + 1 < repMatches.length) {
            endIndex = repMatches[i + 1].index;
          }
          const repText = content.substring(startIndex, endIndex);
          rawReports.push({ num: repNum, text: repText });
        }
      }
    }
  } catch (e) {}
}

const reportMap = new Map();
for (const r of rawReports) {
  if (!reportMap.has(r.num) || r.text.length > reportMap.get(r.num).length) {
    reportMap.set(r.num, r.text);
  }
}

console.log(`Found ${reportMap.size} unique reports in transcript.`);

// Destination image fallbacks if none or local file specified
const defaultImages = {
  1: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  3: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80",
  4: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  5: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80",
  6: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  7: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  8: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
  9: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  10: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  11: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1200&q=80",
  12: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80",
  13: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
  14: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  15: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  16: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80",
  17: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  18: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
  19: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  20: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  21: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  22: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  23: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  24: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  25: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  26: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  27: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80",
  28: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
  29: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  30: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1200&q=80",
  31: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80",
  32: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  33: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
  34: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  35: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  36: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  37: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  38: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  39: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  40: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80"
};

const parsedPosts = [];

for (let i = 1; i <= 40; i++) {
  const text = reportMap.get(i);
  if (!text) {
    console.error(`ERROR: Missing report #${i}`);
    continue;
  }

  // 1. Slug
  const slugMatch = text.match(/-\s*(?:Slug \/ URL amigable|Slug):\s*([^\r\n]+)/i);
  const slug = slugMatch ? slugMatch[1].trim() : `guia-destino-venezuela-${i}`;

  // 2. Title
  let title = '';
  const titleH1Match = text.match(/-\s*(?:Título H1|Título):\s*([^\r\n]+)/i);
  if (titleH1Match && titleH1Match[1].trim() && !titleH1Match[1].includes('MISSING')) {
    title = titleH1Match[1].trim();
  } else {
    const sec4Title = text.match(/\[SECCIÓN 4: CONTENIDO COMPLETO\][\s\S]*?\n#\s+([^\r\n]+)/i);
    if (sec4Title && sec4Title[1].trim()) {
      title = sec4Title[1].trim();
    } else {
      const metaTitleMatch = text.match(/-\s*Meta Title:\s*([^\r\n]+)/i);
      title = metaTitleMatch ? metaTitleMatch[1].trim() : `Guía Turística de Venezuela #${i}`;
    }
  }

  // 3. Excerpt (Meta Description)
  const descMatch = text.match(/-\s*Meta Description:\s*([^\r\n]+)/i);
  const excerpt = descMatch ? descMatch[1].trim() : `Guía de viaje, posadas exclusivas y reservas directas en Hoteles de Venezuela.`;

  // 4. Reading time
  const readMatch = text.match(/-\s*(?:Tiempo estimado de lectura|Tiempo de Lectura Estimado):\s*(\d+)/i);
  const reading_time = readMatch ? parseInt(readMatch[1], 10) : 15;

  // 5. Featured Image
  const featured_image = defaultImages[i] || defaultImages[1];

  // 6. Content: Extract Section 4 (or Section 4 through 7)
  let content = '';
  const sec4Idx = text.indexOf('[SECCIÓN 4: CONTENIDO COMPLETO]');
  if (sec4Idx !== -1) {
    let cleanContent = text.substring(sec4Idx + '[SECCIÓN 4: CONTENIDO COMPLETO]'.length).trim();
    // Strip trailing markdown backticks if any
    cleanContent = cleanContent.replace(/```markdown/g, '').replace(/```$/g, '').trim();
    content = cleanContent;
  } else {
    content = text;
  }

  parsedPosts.push({
    num: i,
    title,
    slug,
    excerpt,
    content,
    featured_image,
    reading_time,
    author_name: 'Equipo Editorial Hoteles de Venezuela',
    status: 'published'
  });
}

console.log(`Parsed ${parsedPosts.length} destination posts.`);

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
  console.log(`Resolved host -> ${ips[0]}`);

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

  for (let i = 0; i < parsedPosts.length; i++) {
    const post = parsedPosts[i];
    const wordCount = post.content.trim().split(/\s+/).length;
    console.log(`[${i+1}/40] Seeding: ${post.slug} | ${wordCount} words | ${post.title.substring(0, 40)}...`);
    
    await client.query(upsertQuery, [
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.featured_image,
      post.author_name,
      post.reading_time,
      post.status
    ]);
  }

  console.log('\n--- VERIFYING SEEDED DESTINATION ARTICLES IN DB ---');
  const allSlugs = parsedPosts.map(p => p.slug);
  const checkRes = await client.query(
    `SELECT id, slug, title, length(content) as chars, status, published_at 
     FROM blog_posts 
     WHERE slug = ANY($1::text[]) 
     ORDER BY id ASC;`,
    [allSlugs]
  );

  console.log(`Successfully verified ${checkRes.rows.length} / 40 destination articles in Supabase:`);
  checkRes.rows.forEach((r, idx) => {
    console.log(`${idx+1}. [ID: ${r.id}] ${r.slug} (${r.chars} chars)`);
  });

  const totalCountRes = await client.query(`SELECT count(*) as total FROM blog_posts;`);
  console.log(`\n🎉 GRAND TOTAL OF BLOG POSTS IN SUPABASE DATABASE: ${totalCountRes.rows[0].total}`);

  await client.end();
}

run().catch(err => {
  console.error('Error seeding destinations:', err);
  process.exit(1);
});
