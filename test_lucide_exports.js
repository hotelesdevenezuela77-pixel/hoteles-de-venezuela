import * as lucide from 'lucide-react';
console.log("Lucide exports size:", Object.keys(lucide).length);
console.log("Matches for Inst:", Object.keys(lucide).filter(k => k.toLowerCase().includes('inst')));
console.log("Matches for Face:", Object.keys(lucide).filter(k => k.toLowerCase().includes('face')));
console.log("Matches for Youtube:", Object.keys(lucide).filter(k => k.toLowerCase().includes('yout')));
console.log("Matches for Twitter:", Object.keys(lucide).filter(k => k.toLowerCase().includes('twit')));
console.log("Some exports starting with I:", Object.keys(lucide).filter(k => k.startsWith('I')).slice(0, 10));
