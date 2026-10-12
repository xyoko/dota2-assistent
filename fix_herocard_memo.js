import fs from 'fs';
let content = fs.readFileSync('src/components/HeroCard.tsx', 'utf8');

// Replace export const HeroCard: React.FC<HeroCardProps> = ({ with memo
content = content.replace("export const HeroCard: React.FC<HeroCardProps> = ({", "export const HeroCard: React.FC<HeroCardProps> = React.memo(({");

// Add closing parentheses to the end of the component
content = content.replace("  );\n};\n", "  );\n}));\n");

fs.writeFileSync('src/components/HeroCard.tsx', content);
