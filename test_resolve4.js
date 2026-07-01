import dns from 'dns/promises';

async function run() {
  const host = 'db.ghgetcznlrilgocwigmj.supabase.co';
  console.log(`Resolving A (IPv4) records for ${host}...`);
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['1.1.1.1', '8.8.8.8']);
    const ips = await resolver.resolve4(host);
    console.log("Resolved IPv4 IPs:", ips);
  } catch (err) {
    console.log("Failed to resolve A records:", err.message);
  }
}

run();
