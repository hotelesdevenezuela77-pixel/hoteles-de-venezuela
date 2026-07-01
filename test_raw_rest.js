

const url = 'https://ghgetcznlrilgocwigmj.supabase.co/rest/v1/categories';
const key = 'sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR';

async function test() {
  console.log("Fetching categories directly...");
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log("Status Text:", res.statusText);
    const text = await res.text();
    console.log("Body:", text);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
