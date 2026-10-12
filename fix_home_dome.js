import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

// Replace FlexCarousel import with DomeGallery
content = content.replace("import FlexCarousel from './react-bits/FlexCarousel';", "import DomeGallery from './react-bits/DomeGallery';");

// Use Regex to delete the top and bottom carousels
const regex = /\{\/\* Top Carousel - Left Aligned \*\/\}[\s\S]*?\{\/\* Bottom Carousel - Reversed[^\}]*\}[^\<]*<div style=\{\{ width: '100%', height: '300px', position: 'relative', transform: 'rotateY\(180deg\)' \}\}>[\s\S]*?<\/div>/;

const newDome = `<div style={{ width: '100%', height: '600px', position: 'relative', marginTop: '2rem' }}>
          <DomeGallery />
        </div>`;

content = content.replace(regex, newDome);

fs.writeFileSync('src/components/Home.tsx', content);
