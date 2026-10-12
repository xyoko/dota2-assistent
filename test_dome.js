import fs from 'fs';
const css = fs.readFileSync('src/components/react-bits/DomeGallery.css', 'utf8');
console.log(css.match(/\.sphere\s*\{[^}]*\}/g));
console.log(css.match(/\.sphere-auto-rotate\s*\{[^}]*\}/g));
console.log(css.match(/\.item\s*\{[^}]*\}/g));
