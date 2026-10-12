import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

const carouselImport = "import FlexCarousel from './react-bits/FlexCarousel';";
content = content.replace("import { FlexCarousel } from './react-bits/FlexCarousel';", carouselImport);

const replacement = `        <div style={{ width: '100%', height: '560px', position: 'relative' }}>
          <FlexCarousel 
            items={HEROES_DATA.slice(0, 15).map(hero => {
              const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
              return {
                src: candidates[0],
                alt: hero.name,
                title: hero.name,
                subtitle: hero.attribute.toUpperCase(),
                id: hero.id
              };
            })}
            preset="liquid"
            intro="rise"
            cardHeight={0.5}
            gap={12}
            squeeze={0.2}
            focusOnClick
            captions
            onSelect={(index, item) => {
              const hero = HEROES_DATA.find(h => h.id === item.id);
              if (hero) {
                SoundEngine.playPick();
                setMainHero(hero);
              }
            }}
          />
        </div>`;

const oldCarouselRegex = /<FlexCarousel[\s\S]*?\/>/;
content = content.replace(oldCarouselRegex, replacement);

fs.writeFileSync('src/components/Home.tsx', content);
