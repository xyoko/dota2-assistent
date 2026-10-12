import fs from 'fs';
let ghostContent = fs.readFileSync('src/components/react-bits/GhostFibers.tsx', 'utf8');
ghostContent = ghostContent.replace(
  `        layer: (i % layers) + 1\n      }));`,
  `        layer: (i % layers) + 1\n      });`
);
fs.writeFileSync('src/components/react-bits/GhostFibers.tsx', ghostContent);
