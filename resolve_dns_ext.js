import dns from 'dns/promises';

const host = 'db.ghgetcznlrilgocwigmj.supabase.co';

async function resolve() {
  console.log(`Resolving AAAA and CNAME records for ${host}...`);

  // Set the resolver to Cloudflare/Google DNS to bypass local DNS lookup failures
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  try {
    const aaaa = await resolver.resolve6(host);
    console.log("AAAA records:", aaaa);
  } catch (err) {
    console.log("AAAA resolve failed:", err.message);
  }

  try {
    const cname = await resolver.resolveCname(host);
    console.log("CNAME records:", cname);
  } catch (err) {
    console.log("CNAME resolve failed:", err.message);
  }

  try {
    const txt = await resolver.resolveTxt(host);
    console.log("TXT records:", txt);
  } catch (err) {
    console.log("TXT resolve failed:", err.message);
  }

  // Also query the API host
  const apiHost = 'ghgetcznlrilgocwigmj.supabase.co';
  try {
    const aaaa = await resolver.resolve6(apiHost);
    console.log("API AAAA records:", aaaa);
  } catch (err) {
    console.log("API AAAA resolve failed:", err.message);
  }
}

resolve();
