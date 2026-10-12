import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("onOpenPip={(h) => handleOpenPip(h)}", "onOpenPip={handleOpenPip}");

fs.writeFileSync('src/App.tsx', content);
