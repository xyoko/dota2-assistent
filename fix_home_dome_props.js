import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

const regex = /<DomeGallery onSelectHero=\{setMainHero\} \/>/;
const replacement = `<DomeGallery 
            images={HEROES_DATA.map(hero => {
              const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
              return {
                src: 'https://wsrv.nl/?url=' + (candidates[1] || candidates[0]).replace('https://', ''),
                alt: hero.name,
                hero: hero
              };
            })}
            onSelectHero={setMainHero} 
          />`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/Home.tsx', content);
