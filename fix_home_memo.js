import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

// Insert useMemo import if missing
if (!content.includes('useMemo')) {
  content = content.replace(/import React, \{ useEffect, useState \} from 'react';/, "import React, { useEffect, useState, useMemo } from 'react';");
}

// Add memoized dome images
const memoInjection = `const domeImages = useMemo(() => {
    return HEROES_DATA.map(hero => {
      const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
      return {
        src: 'https://wsrv.nl/?url=' + (candidates[1] || candidates[0]).replace('https://', ''),
        alt: hero.name,
        hero: hero
      };
    });
  }, []);`;

content = content.replace(/const \[mainHero, setMainHero\] = useState<HeroData>\(HEROES_DATA\[0\]\);/, `const [mainHero, setMainHero] = useState<HeroData>(HEROES_DATA[0]);\n\n  ${memoInjection}`);

content = content.replace(/images=\{HEROES_DATA\.map\([\s\S]*?\}\)\}/, 'images={domeImages}');

fs.writeFileSync('src/components/Home.tsx', content);
