function parseSqlInsert(stmt) {
  const match = stmt.match(/INSERT\s+INTO\s+"([^"]+)"\s*\(([^)]+)\)\s*VALUES\s*\(([\s\S]+)\)(?:\s+ON\s+CONFLICT)?/i);
  if (!match) return null;
  
  const tableName = match[1];
  const cols = match[2].split(',').map(c => c.trim().replace(/"/g, ''));
  const valsStr = match[3].trim();
  
  const vals = [];
  let currentVal = '';
  let inString = false;
  let escape = false;
  
  for (let i = 0; i < valsStr.length; i++) {
    const char = valsStr[i];
    if (escape) {
      currentVal += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      currentVal += char;
      continue;
    }
    if (char === "'") {
      inString = !inString;
      currentVal += char;
      continue;
    }
    if (char === ',' && !inString) {
      vals.push(parseVal(currentVal));
      currentVal = '';
      continue;
    }
    currentVal += char;
  }
  if (currentVal) {
    vals.push(parseVal(currentVal));
  }
  
  const row = {};
  for (let i = 0; i < cols.length; i++) {
    row[cols[i]] = vals[i];
  }
  
  return { tableName, row };
}

function parseVal(valStr) {
  const str = valStr.trim();
  if (str.toUpperCase() === 'NULL') return null;
  if (str.toUpperCase() === 'TRUE') return true;
  if (str.toUpperCase() === 'FALSE') return false;
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.slice(1, -1).replace(/''/g, "'");
  }
  const num = Number(str);
  if (!isNaN(num) && str !== '') return num;
  return str;
}

const sample = `INSERT INTO "establishment_images" ("id","establishment_id","image_url","is_primary","sort_order","created_at","updated_at") VALUES(420, 28, '/api/files/establishments/1772661969929-gsmn5k.jpg', false, 0, '2026-03-14 02:32:53', '2026-03-14 02:32:53') ON CONFLICT DO NOTHING;`;
console.log("Parsed sample:", JSON.stringify(parseSqlInsert(sample), null, 2));

const sample2 = `INSERT INTO "destinations" ("id","slug","name","description","is_featured") VALUES(1, 'los-roques', 'Los Roques', 'Beautiful arch, and places', true);`;
console.log("Parsed sample2:", JSON.stringify(parseSqlInsert(sample2), null, 2));
