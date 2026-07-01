import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\jesus\\.gemini\\antigravity-ide\\brain\\7d16e65d-e60c-40e1-b195-982d044f9782\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('capture_browser_console_logs') && line.includes('"status":"DONE"') && line.includes('"content":')) {
      const parsed = JSON.parse(line);
      console.log(`\n=================== STEP ${parsed.step_index} CONTENT ===================`);
      console.log(parsed.content);
    }
  }
}

run().catch(console.error);
