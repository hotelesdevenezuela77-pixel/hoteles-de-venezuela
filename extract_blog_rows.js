import fs from 'fs';

const dumpPath = 'legacy_db_export/d1_dump.sql';
const sql = fs.readFileSync(dumpPath, 'utf8');
const lines = sql.split('\n');

const blogInserts = lines.filter(line => line.includes('INSERT INTO "blog_posts"'));

console.log(`Found ${blogInserts.length} blog posts insert lines.`);

const posts = [];

blogInserts.forEach((line, lineIdx) => {
  const match = line.match(/VALUES\s*\((.*)\)/i);
  if (!match) return;
  const valuesStr = match[1];

  // Tokenize using parentheses and quotes tracking
  const values = [];
  let currentVal = '';
  let inString = false;
  let parenCount = 0;
  let i = 0;

  while (i < valuesStr.length) {
    const char = valuesStr[i];
    if (char === "'") {
      if (valuesStr[i + 1] === "'") {
        currentVal += "'";
        i += 2;
        continue;
      }
      inString = !inString;
      currentVal += "'";
      i++;
    } else if (char === '(') {
      parenCount++;
      currentVal += '(';
      i++;
    } else if (char === ')') {
      parenCount--;
      currentVal += ')';
      i++;
    } else if (char === ',' && !inString && parenCount === 0) {
      values.push(currentVal.trim());
      currentVal = '';
      i++;
    } else {
      currentVal += char;
      i++;
    }
  }
  if (currentVal) {
    values.push(currentVal.trim());
  }

  // Column names
  const colsMatch = line.match(/INSERT INTO "blog_posts"\s*\((.*?)\)/i);
  if (!colsMatch) return;
  const cols = colsMatch[1].split(',').map(c => c.replace(/"/g, '').trim());

  const post = {};
  cols.forEach((col, idx) => {
    let val = values[idx];
    if (!val || val === 'NULL' || val === 'null') {
      post[col] = null;
    } else {
      // If it is a replace function, extract the content
      if (val.startsWith('replace(') || val.startsWith('REPLACE(')) {
        // extract the first parameter of replace
        const firstParamMatch = val.match(/replace\s*\(\s*'(.*?)'\s*,\s*'(.*?)'\s*,\s*(.*?)\)/is);
        if (firstParamMatch) {
          let innerStr = firstParamMatch[1];
          // unescape single quotes '' -> '
          innerStr = innerStr.replace(/''/g, "'");
          // unescape newlines
          innerStr = innerStr.replace(/\\n/g, "\n");
          post[col] = innerStr;
        } else {
          // fallback: strip replace(...) wrapper
          post[col] = val;
        }
      } else {
        // Remove surrounding quotes if they exist and unescape
        if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        // unescape quotes
        val = val.replace(/''/g, "'");
        // unescape newlines
        val = val.replace(/\\n/g, "\n");
        post[col] = val;
      }
    }
  });
  posts.push(post);
});

console.log(`Parsed ${posts.length} blog posts successfully:`);
posts.forEach(p => {
  console.log(`- ID ${p.id}: "${p.title}" by "${p.author_name}" (Reading: ${p.reading_time})`);
});

// Save to a json file
fs.writeFileSync('extracted_blog_posts.json', JSON.stringify(posts, null, 2));
console.log("Saved all parsed posts to extracted_blog_posts.json");
