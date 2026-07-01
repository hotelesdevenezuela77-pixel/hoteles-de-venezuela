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
    if (line.includes('"step_index":696,')) {
      // Look at the console logs of this step or nearby steps
      console.log("Found step 696 logs");
    }
    // Print lines containing console log data in the subagent output
    if (line.includes('capture_browser_console_logs') && line.includes('"status":"DONE"')) {
      const parsed = JSON.parse(line);
      console.log(`\n--- Console logs from step ${parsed.step_index} ---`);
      console.log(parsed.content);
    }
  }
}

run().catch(console.error);
