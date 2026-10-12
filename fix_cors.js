import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

// Replace corsproxy.io with wsrv.nl
content = content.replace(/'https:\/\/corsproxy\.io\/\?' \+ encodeURIComponent\(candidates\[1\] \|\| candidates\[0\]\)/g, "'https://wsrv.nl/?url=' + (candidates[1] || candidates[0]).replace('https://', '')");

fs.writeFileSync('src/components/Home.tsx', content);
