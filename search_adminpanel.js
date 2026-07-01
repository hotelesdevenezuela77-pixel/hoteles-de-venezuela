import fs from 'fs';
import path from 'path';

const filePath = 'legacy_db_export/code/src/react-app/pages/AdminPanel.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('updateHomepagePriority') || line.includes('homepagePriorities') || line.includes('homepage_priority')) {
    if (idx < 2500) {
      console.log(`${idx + 1}: ${line}`);
    }
  }
});
