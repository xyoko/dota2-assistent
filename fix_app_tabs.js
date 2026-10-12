import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/validTabs: ActiveTab\[\] = \['heroes', /g, "validTabs: ActiveTab[] = ['home', 'heroes', ");
content = content.replace(/return 'heroes';/g, "return 'home';");

const homeImport = "import { Home } from './components/Home';\n";
content = content.replace("import { HeroBuildView }", homeImport + "import { HeroBuildView }");

const homeRoute = `
        {/* VIEW 0: HOME / COMMAND CENTER */}
        {activeTab === 'home' && (
          <Home onNavigateTab={setActiveTab} />
        )}
`;
content = content.replace("{/* VIEW 1: HERO BUILDS & GUIDE */}", homeRoute + "\n        {/* VIEW 1: HERO BUILDS & GUIDE */}");

content = content.replace(/<SaaSHeroSection[\s\S]*?\/>/g, "");

fs.writeFileSync('src/App.tsx', content);
