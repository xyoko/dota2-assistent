import fs from 'fs';
let content = fs.readFileSync('src/components/HeroCard.tsx', 'utf8');

content = content.replace(
  `    setTilt(prev => ({\n      ...prev,\n      rotateX: 0,\n      rotateY: 0\n    });`,
  `    setTilt(prev => ({\n      ...prev,\n      rotateX: 0,\n      rotateY: 0\n    }));`
);

fs.writeFileSync('src/components/HeroCard.tsx', content);

let ghostContent = fs.readFileSync('src/components/react-bits/GhostFibers.tsx', 'utf8');
ghostContent = ghostContent.replace(
  `        layer: (i % layers) + 1\n      });`,
  `        layer: (i % layers) + 1\n      }));`
);
fs.writeFileSync('src/components/react-bits/GhostFibers.tsx', ghostContent);
