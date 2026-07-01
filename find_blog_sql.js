import fs from 'fs';

const dumpPath = 'legacy_db_export/d1_dump.sql';
const sql = fs.readFileSync(dumpPath, 'utf8');

console.log("SQL dump size:", sql.length);

// Search for table creations to find table names
const createTables = sql.match(/CREATE TABLE [^\s(]+/gi);
console.log("Create table statements:", createTables);

// Search for INSERT INTO matching blog/post
const inserts = sql.split('\n').filter(line => line.includes('INSERT INTO') && (line.toLowerCase().includes('post') || line.toLowerCase().includes('blog')));
console.log(`Found ${inserts.length} INSERT lines related to post/blog:`);
inserts.slice(0, 15).forEach((ins, idx) => {
  console.log(`${idx + 1}: ${ins.slice(0, 150)}...`);
});
