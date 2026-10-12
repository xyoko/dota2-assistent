import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("    setIsPipOpen(true);\n  };\n\n  const handleClosePip", "    setIsPipOpen(true);\n  }, [selectedHero]);\n\n  const handleClosePip");

fs.writeFileSync('src/App.tsx', content);
