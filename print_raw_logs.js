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
    if (line.includes('white_screen_check') || line.includes('save_redirect_screen')) {
      console.log(`\nLine step index:`, JSON.parse(line).step_index);
    }
    if (line.toLowerCase().includes('console') && (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail') || line.toLowerCase().includes('unhandled'))) {
      const parsed = JSON.parse(line);
      if (parsed.content && parsed.content.length < 1000) {
        console.log(`\nStep ${parsed.step_index} (${parsed.type}):`, parsed.content);
      }
    }
  }
}

run().catch(console.error);
