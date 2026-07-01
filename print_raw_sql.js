import fs from 'fs';

const dumpPath = 'legacy_db_export/d1_dump.sql';
const sql = fs.readFileSync(dumpPath, 'utf8');
const lines = sql.split('\n');

const blogInserts = lines.filter(line => line.includes('INSERT INTO "blog_posts"'));
console.log("Raw insert line 1:\n", blogInserts[0]);
