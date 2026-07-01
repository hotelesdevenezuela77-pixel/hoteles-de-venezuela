import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const dbConfig = {
  host: 'db.ghgetcznlrilgocwigmj.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '+Q5Wpz.TXK6@w_2',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const BASE_DIR = "c:\\Users\\jesus\\Documents\\HotelesDeVenezuela_Proyecto\\legacy_db_export";

async function run() {
  const client = new Client(dbConfig);
  console.log("Connecting to PostgreSQL database...");
  await client.connect();
  console.log("Connected successfully!");

  try {
    for (let part = 1; part <= 4; part++) {
      const filePath = path.join(BASE_DIR, `postgres_migration_part${part}.sql`);
      console.log(`\n----------------------------------------`);
      console.log(`Processing part ${part}: ${filePath}`);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const rawLines = content.split('\n');

      const statements = [];
      let currentStatementLines = [];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        currentStatementLines.push(line);

        const trimmed = line.trim();
        if (trimmed.endsWith(';') && !trimmed.startsWith('--')) {
          statements.push(currentStatementLines.join('\n'));
          currentStatementLines = [];
        }
      }

      if (currentStatementLines.length > 0) {
        const remaining = currentStatementLines.join('\n').trim();
        if (remaining) {
          statements.push(remaining);
        }
      }

      console.log(`Total statements parsed: ${statements.length}`);

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;

        try {
          await client.query(stmt);
          successCount++;
          if (successCount % 100 === 0) {
            console.log(`Progress: Executed ${successCount} statements...`);
          }
        } catch (err) {
          failCount++;
          // For seed conflicts, we might get duplicate keys, but ON CONFLICT DO NOTHING handles it.
          // Let's log other unexpected errors.
          console.error(`Error in statement ${i + 1}:`, err.message);
          // Let's print the statement that failed (first 100 chars)
          console.error(`Failed Statement: ${stmt.substring(0, 150)}...`);
        }
      }

      console.log(`Part ${part} completed: ${successCount} succeeded, ${failCount} failed.`);
    }

    console.log("\nAll parts executed! Verifying counts...");
    const estCountRes = await client.query('SELECT count(*) FROM establishments');
    const destCountRes = await client.query('SELECT count(*) FROM destinations');
    const catCountRes = await client.query('SELECT count(*) FROM categories');
    
    console.log(`Establishments: ${estCountRes.rows[0].count}`);
    console.log(`Destinations: ${destCountRes.rows[0].count}`);
    console.log(`Categories: ${catCountRes.rows[0].count}`);

  } catch (err) {
    console.error("Migration fatal error:", err);
  } finally {
    await client.end();
    console.log("Disconnected.");
  }
}

run().catch(console.error);
