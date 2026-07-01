import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\jesus\\.gemini\\antigravity-ide\\brain\\7d16e65d-e60c-40e1-b195-982d044f9782\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching logs for errors...");
  for await (const line of rl) {
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception') || line.toLowerCase().includes('typeerror')) {
      // Print first 300 chars of matching line to avoid huge output
      console.log(line.substring(0, 300));
    }
  }
  console.log("Search finished.");
}

run().catch(console.error);
