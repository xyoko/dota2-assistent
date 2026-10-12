import fs from 'fs';
let content = fs.readFileSync('src/components/react-bits/FlexCarousel.tsx', 'utf8');

const regex = /const FlexCarousel = \(\{([\s\S]*?)\}\) => \{/;
const replacement = `const FlexCarousel = ({
$1
}: any) => {`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/react-bits/FlexCarousel.tsx', content);
