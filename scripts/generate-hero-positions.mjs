import esbuild from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';

const result = await esbuild.build({
  entryPoints: ['./src/entities/hero/bi/heroes.ts'],
  bundle: true,
  write: false,
  format: 'esm',
});
const code = result.outputFiles[0].text;
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));

const ROLE_MAP = {
  'Carry': 1,
  'Mid': 2,
  'Offlane': 3,
  'Soft Support': 4,
  'Hard Support': 5,
};

const generated = {};
for (const hero of mod.HEROES_DATA) {
  const positions = [];
  for (const role of hero.roles) {
    const pos = ROLE_MAP[role];
    if (pos && !positions.includes(pos)) {
      positions.push(pos);
    }
    if (positions.length === 2) break;
  }
  generated[hero.id] = positions;
}

mkdirSync('./src/entities/hero/data', { recursive: true });

const output = `// Auto-generated top 2 positions per hero for current Patch.
// Generated from hero role matrix and patch meta.
// Overrides in heroPositions.overrides.ts take precedence over these values.

import type { PositionNumber } from '../bi/types';

export const GENERATED_HERO_POSITIONS: Record<string, PositionNumber[]> = ${JSON.stringify(generated, null, 2)};
`;

writeFileSync('./src/entities/hero/data/heroPositions.generated.ts', output, 'utf-8');
console.log('Successfully generated src/entities/hero/data/heroPositions.generated.ts');
