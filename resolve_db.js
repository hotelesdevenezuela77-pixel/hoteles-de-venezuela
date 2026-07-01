import dns from 'dns/promises';

const host = 'db.ghgetcznlrilgocwigmj.supabase.co.v4.ipv6proxy.net';

async function test() {
  console.log(`Resolving ${host} using dns.lookup...`);
  try {
    const address = await dns.lookup(host);
    console.log("OS Address Lookup:", address);
  } catch (err) {
    console.log("dns.lookup failed:", err.message);
  }
}

test();
