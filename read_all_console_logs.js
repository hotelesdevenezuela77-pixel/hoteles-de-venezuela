import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\jesus\\.gemini\\antigravity-ide\\brain\\7d16e65d-e60c-40e1-b195-982d044f9782\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const logs = [];
  for await (const line of rl) {
    if (line.includes('capture_browser_console_logs') && line.includes('"status":"DONE"')) {
      logs.push(line);
    }
  }

  // print the last 2 console logs captured
  const lastLogs = logs.slice(-3);
  for (const logLine of lastLogs) {
    const parsed = JSON.parse(logLine);
    console.log(`\n==========================================`);
    console.log(`Console logs from step ${parsed.step_index}:`);
    console.log(parsed.content);
    if (parsed.tool_calls) {
      console.log("Tool Calls:", JSON.stringify(parsed.tool_calls, null, 2));
    }
  }
}

run().catch(console.error);
