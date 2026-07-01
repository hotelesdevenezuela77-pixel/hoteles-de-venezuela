import fs from 'fs';

const filePath = 'legacy_db_export/code/src/react-app/pages/AdminPanel.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Let's print out lines around line 2280-2330
for (let i = 2270; i < 2330; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
