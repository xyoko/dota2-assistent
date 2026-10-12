import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

const carouselOne = `        {/* Top Carousel - Left Aligned */}
        <div style={{ width: '100%', height: '300px', position: 'relative', marginBottom: '2rem' }}>
          <FlexCarousel 
            items={HEROES_DATA.slice(0, 15).map(hero => {
              const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
              return {
                src: candidates[1] || candidates[0],
                alt: hero.name,
                title: hero.name,
                subtitle: hero.attribute.toUpperCase(),
                id: hero.id
              };
            })}
            preset="liquid"
            intro="rise"
            cardHeight={0.6}
            gap={12}
            squeeze={0.2}
            focusOnClick
            captions={false}
            onSelect={(_index, item) => {
              const hero = HEROES_DATA.find(h => h.id === item.id);
              if (hero) {
                SoundEngine.playPick();
                setMainHero(hero);
              }
            }}
          />
        </div>

        {/* Bottom Carousel - Reversed (using scaleX to flip WebGL mesh direction) */}
        <div style={{ width: '100%', height: '300px', position: 'relative', transform: 'scaleX(-1)' }}>
          <FlexCarousel 
            items={HEROES_DATA.slice(15, 30).map(hero => {
              const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
              return {
                src: candidates[1] || candidates[0],
                alt: hero.name,
                title: hero.name,
                subtitle: hero.attribute.toUpperCase(),
                id: hero.id
              };
            })}
            preset="liquid"
            intro="rise"
            cardHeight={0.6}
            gap={12}
            squeeze={0.2}
            focusOnClick
            captions={false}
            onSelect={(_index, item) => {
              const hero = HEROES_DATA.find(h => h.id === item.id);
              if (hero) {
                SoundEngine.playPick();
                setMainHero(hero);
              }
            }}
          />
        </div>`;

content = content.replace(/<div style=\{\{ width: '100%', height: '560px', position: 'relative' \}\}>[\s\S]*?<\/div>/, carouselOne);

fs.writeFileSync('src/components/Home.tsx', content);
