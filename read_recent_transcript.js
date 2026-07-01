import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\jesus\\.gemini\\antigravity-ide\\brain\\7d16e65d-e60c-40e1-b195-982d044f9782\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }

  console.log(`Total lines: ${lines.length}`);
  const last50 = lines.slice(-50);
  for (let i = 0; i < last50.length; i++) {
    const l = last50[i];
    if (l.includes('capture_browser_console_logs') || l.includes('console.log') || l.includes('console.error')) {
      console.log(`Line ${lines.length - 50 + i}: ${l.substring(0, 300)}...`);
      try {
        const parsed = JSON.parse(l);
        if (parsed.output) {
          console.log(`   Output: ${JSON.stringify(parsed.output).substring(0, 500)}`);
        }
      } catch (err) {}
    }
  }
}

run().catch(console.error);
