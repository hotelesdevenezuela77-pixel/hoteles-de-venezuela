import pg from 'pg';
import dns from 'dns/promises';
import fs from 'fs';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-1-us-west-2.pooler.supabase.com';

const BASE_URL = 'https://hotelesdevenezuela.com';

function formatDate(dateVal) {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  try {
    return new Date(dateVal).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

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
    const urls = [];

    // 1. Static/Core pages
    const today = new Date().toISOString().split('T')[0];
    const staticPages = [
      { path: '/', priority: '1.0', freq: 'daily' },
      { path: '/establecimientos', priority: '0.8', freq: 'daily' },
      { path: '/destinos', priority: '0.8', freq: 'weekly' },
      { path: '/mapa', priority: '0.7', freq: 'weekly' },
      { path: '/parques', priority: '0.7', freq: 'weekly' },
      { path: '/servicios-b2b', priority: '0.6', freq: 'weekly' },
      { path: '/comparar', priority: '0.5', freq: 'monthly' },
      { path: '/paquetes', priority: '0.7', freq: 'weekly' },
      { path: '/links', priority: '0.5', freq: 'monthly' },
      { path: '/membresias', priority: '0.6', freq: 'monthly' },
      { path: '/prestigio-2026', priority: '0.8', freq: 'weekly' },
    ];

    staticPages.forEach(p => {
      urls.push(`  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
    });

    // 2. Establishments (Approved)
    const estRes = await client.query("SELECT slug, updated_at FROM establishments WHERE status = 'approved'");
    estRes.rows.forEach(row => {
      urls.push(`  <url>
    <loc>${BASE_URL}/establecimiento/${row.slug}</loc>
    <lastmod>${formatDate(row.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
    console.log(`Added ${estRes.rows.length} approved establishments`);

    // 3. Destinations
    const destRes = await client.query("SELECT slug, created_at FROM destinations");
    destRes.rows.forEach(row => {
      urls.push(`  <url>
    <loc>${BASE_URL}/destinos/${row.slug}</loc>
    <lastmod>${formatDate(row.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
    console.log(`Added ${destRes.rows.length} destinations`);

    // 4. National Parks
    const parkRes = await client.query("SELECT slug, created_at FROM national_parks");
    parkRes.rows.forEach(row => {
      urls.push(`  <url>
    <loc>${BASE_URL}/parque/${row.slug}</loc>
    <lastmod>${formatDate(row.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
    console.log(`Added ${parkRes.rows.length} national parks`);

    // 5. Blog Posts (Published)
    const blogRes = await client.query("SELECT slug, updated_at FROM blog_posts WHERE status = 'published'");
    blogRes.rows.forEach(row => {
      urls.push(`  <url>
    <loc>${BASE_URL}/blog/${row.slug}</loc>
    <lastmod>${formatDate(row.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
    console.log(`Added ${blogRes.rows.length} published blog posts`);

    // 6. Tourist Sites (Approved)
    const siteRes = await client.query("SELECT slug, updated_at FROM tourist_sites WHERE status = 'approved'");
    siteRes.rows.forEach(row => {
      urls.push(`  <url>
    <loc>${BASE_URL}/sitio/${row.slug}</loc>
    <lastmod>${formatDate(row.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
    console.log(`Added ${siteRes.rows.length} approved tourist sites`);

    // 7. Custom Pages (Published)
    const pageRes = await client.query("SELECT slug, updated_at FROM custom_pages WHERE is_published = true");
    pageRes.rows.forEach(row => {
      // Avoid duplicating standard routes if they are in custom_pages
      const reserved = ['establecimientos', 'destinos', 'mapa', 'parques', 'servicios-b2b', 'comparar', 'paquetes', 'links', 'membresias'];
      if (!reserved.includes(row.slug)) {
        urls.push(`  <url>
    <loc>${BASE_URL}/${row.slug}</loc>
    <lastmod>${formatDate(row.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
      }
    });
    console.log(`Added ${pageRes.rows.length} published custom pages`);

    // Build sitemap XML content
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

    // Write file
    fs.writeFileSync('public/sitemap.xml', sitemapContent, 'utf8');
    console.log("sitemap.xml successfully written to public/sitemap.xml!");

  } catch (err) {
    console.error("Failed to generate sitemap:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
