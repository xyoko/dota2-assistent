import fs from 'fs';

// Update DomeGallery.tsx
let domeContent = fs.readFileSync('src/components/react-bits/DomeGallery.tsx', 'utf8');

const interfaceInjection = `import { HeroData } from '../../types/hero';

interface DomeGalleryProps {
  onSelectHero?: (hero: HeroData) => void;
}

export const DomeGallery: React.FC<DomeGalleryProps> = ({ onSelectHero }) => {`;

domeContent = domeContent.replace(/export const DomeGallery: React\.FC = \(\) => \{/, interfaceInjection);

const clickInjection = `onClick={() => {
                SoundEngine.playPick();
                if (onSelectHero) onSelectHero(hero);
                window.location.hash = 'heroes'; // Navigate to heroes tab
              }}`;
domeContent = domeContent.replace(/onClick=\{\(\) => \{[\s\S]*?\}\}/, clickInjection);

fs.writeFileSync('src/components/react-bits/DomeGallery.tsx', domeContent);

// Update Home.tsx
let homeContent = fs.readFileSync('src/components/Home.tsx', 'utf8');
homeContent = homeContent.replace(/<DomeGallery \/>/, `<DomeGallery onSelectHero={setMainHero} />`);
fs.writeFileSync('src/components/Home.tsx', homeContent);

