import fs from 'fs';

let css = fs.readFileSync('src/components/react-bits/DomeGallery.css', 'utf8');
if (!css.includes('@keyframes autoRotateDome')) {
  css += `

@keyframes autoRotateDome {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(-360deg); }
}

.sphere-auto-rotate {
  transform-style: preserve-3d;
  animation: autoRotateDome 120s linear infinite;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.sphere-auto-rotate.paused {
  animation-play-state: paused;
}
`;
  fs.writeFileSync('src/components/react-bits/DomeGallery.css', css);
}

let tsx = fs.readFileSync('src/components/react-bits/DomeGallery.tsx', 'utf8');

// Replace JS autoRotate
tsx = tsx.replace(/\/\/ RAM optimization logic: Start continuous idle animation when mounted[\s\S]*?cancelAnimationFrame\(autoRotateRAF\);\n    };\n/g, '');

// Inject parent class logic
const wrapRegex = /<div className="stage">\s*<div ref=\{sphereRef\} className="sphere">/;
const replacementWrap = `<div className="stage">
          <div className="sphere-auto-rotate" id="dome-auto-rotate">
          <div ref={sphereRef} className="sphere">`;
tsx = tsx.replace(wrapRegex, replacementWrap);

// Close the tag
const closeRegex = /<\/div>\s*<\/div>\s*<div className="overlay" \/>/;
const closeReplace = `</div>
          </div>
        </div>

        <div className="overlay" />`;
tsx = tsx.replace(closeRegex, closeReplace);

// Handle pausing/resuming animation
tsx = tsx.replace(/const evt = event;\n\s*draggingRef\.current = true;/g, `const evt = event;
        draggingRef.current = true;
        document.getElementById('dome-auto-rotate')?.classList.add('paused');`);

tsx = tsx.replace(/draggingRef\.current = false;\n\s*let \[vMagX/g, `draggingRef.current = false;
          document.getElementById('dome-auto-rotate')?.classList.remove('paused');
          let [vMagX`);

tsx = tsx.replace(/openingRef\.current = true;/g, `openingRef.current = true;
      document.getElementById('dome-auto-rotate')?.classList.add('paused');`);

tsx = tsx.replace(/openingRef\.current = false;\n\s*unlockScroll\(\);/g, `openingRef.current = false;
        document.getElementById('dome-auto-rotate')?.classList.remove('paused');
        unlockScroll();`);

tsx = tsx.replace(/openingRef\.current = false;\n\s*if \(!draggingRef/g, `openingRef.current = false;
                document.getElementById('dome-auto-rotate')?.classList.remove('paused');
                if (!draggingRef`);

fs.writeFileSync('src/components/react-bits/DomeGallery.tsx', tsx);
