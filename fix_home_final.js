import fs from 'fs';
let content = fs.readFileSync('src/components/Home.tsx', 'utf8');

// Proxy URLs for CORS so WebGL can render them
content = content.replace(/src: candidates\[1\] \|\| candidates\[0\],/g, "src: 'https://corsproxy.io/?' + encodeURIComponent(candidates[1] || candidates[0]),");

// Fix scroll capture and flip
content = content.replace(/focusOnClick/g, "focusOnClick\n            captureWheel={false}");
content = content.replace(/transform: 'scaleX\(-1\)'/g, "transform: 'rotateY(180deg)'");

fs.writeFileSync('src/components/Home.tsx', content);
