import fs from 'fs';

// 1. Memoize GhostFibers
let fibers = fs.readFileSync('src/components/react-bits/GhostFibers.tsx', 'utf8');
fibers = fibers.replace("export const GhostFibers: React.FC<GhostFibersProps> = ({", "export const GhostFibers: React.FC<GhostFibersProps> = React.memo(({");
// The function ends at: 
//   return (
//     ...
//   );
// };
fibers = fibers.replace("  );\n};\n\nexport default GhostFibers;", "  );\n}));\n\nexport default GhostFibers;");
fs.writeFileSync('src/components/react-bits/GhostFibers.tsx', fibers);

// 2. Memoize DomeGallery
let dome = fs.readFileSync('src/components/react-bits/DomeGallery.tsx', 'utf8');
dome = dome.replace("export default function DomeGallery({", "import React from 'react';\n\nconst DomeGallery = React.memo(function DomeGallery({");
dome = dome.replace("  );\n}\n", "  );\n});\n\nexport default DomeGallery;\n");
fs.writeFileSync('src/components/react-bits/DomeGallery.tsx', dome);

