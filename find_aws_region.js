import fs from 'fs';
import dns from 'dns/promises';

// We'll read the AWS ranges using fetch
async function run() {
  const ip = '2600:1f14:2c31:7602:b20f:1e9e:b9fb:2327';
  console.log(`Searching AWS region for ${ip}...`);

  try {
    const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    const data = await res.json();
    console.log(`Loaded ${data.ipv6_prefixes.length} IPv6 prefixes from AWS.`);

    // To check if ip belongs to a prefix, we can convert IPv6 addresses to bigints or parse them
    // But since the prefixes are in CIDR format, we can do a simpler comparison or use a library
    // Let's write a basic IPv6 prefix matcher
    const matches = [];

    // Let's convert our target IP to a binary string
    const targetBin = ipv6ToBinary(ip);

    for (const prefix of data.ipv6_prefixes) {
      const [ipPart, cidrStr] = prefix.ipv6_prefix.split('/');
      const cidr = parseInt(cidrStr, 10);
      const prefixBin = ipv6ToBinary(ipPart);

      if (targetBin.substring(0, cidr) === prefixBin.substring(0, cidr)) {
        matches.push(prefix);
      }
    }

    console.log("Matches found:", matches);
  } catch (err) {
    console.error("Error:", err);
  }
}

function ipv6ToBinary(ip) {
  // Normalize IPv6
  let parts = ip.split(':');
  if (ip.includes('::')) {
    const missing = 8 - parts.filter(p => p !== '').length;
    const expand = Array(missing).fill('0000');
    const idx = parts.indexOf('');
    parts.splice(idx, 1, ...expand);
  }
  // Convert each part to 16 bits binary
  return parts.map(p => {
    const val = parseInt(p || '0', 16);
    return val.toString(2).padStart(16, '0');
  }).join('');
}

run();
