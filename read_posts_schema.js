const url = "https://ghgetcznlrilgocwigmj.supabase.co/rest/v1/";
const apiKey = "sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR";

async function run() {
  const res = await fetch(url, {
    headers: {
      "apikey": apiKey,
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/openapi+json"
    }
  });
  if (res.status === 200) {
    const data = await res.json();
    console.log("Got OpenAPI schema!");
    const postsDef = data.definitions.posts;
    console.log("Posts Table Columns:", Object.keys(postsDef.properties));
    console.log("Properties details:", postsDef.properties);
  } else {
    console.error("Failed to fetch schema:", res.status, res.statusText);
  }
}
run().catch(console.error);
