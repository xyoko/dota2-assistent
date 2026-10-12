import fs from 'fs';
let tsx = fs.readFileSync('src/components/react-bits/DomeGallery.tsx', 'utf8');

// The current structure is:
// <div className="stage">
//   <div className="sphere-center" ...>
//     <div className="sphere-auto-rotate" id="dome-auto-rotate">
//       <div ref={sphereRef} className="sphere">

// We want to remove sphere-center and swap sphere-auto-rotate and sphereRef.
// Wait, sphereRef is used to apply drag transform. Let's rename classes to make it clear.
// The wrapper should be:
// <div className="stage">
//   <div ref={sphereRef} className="sphere-drag" style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
//     <div className="sphere-auto-rotate" id="dome-auto-rotate" style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', transformStyle: 'preserve-3d' }}>
//       <div className="sphere">
//         {items...}

const regex = /<div className="stage">[\s\S]*?<div ref=\{sphereRef\} className="sphere">/;
const replacement = `<div className="stage">
          <div ref={sphereRef} className="sphere-drag" style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <div className="sphere-auto-rotate" id="dome-auto-rotate">
              <div className="sphere">`;

tsx = tsx.replace(regex, replacement);

// We need to fix the closing tags.
// Currently it's:
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="overlay" />

const closeRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="overlay" \/>/;
const closeReplacement = `              </div>
            </div>
          </div>
        </div>

        <div className="overlay" />`;
tsx = tsx.replace(closeRegex, closeReplacement);

fs.writeFileSync('src/components/react-bits/DomeGallery.tsx', tsx);
console.log("Replaced");
