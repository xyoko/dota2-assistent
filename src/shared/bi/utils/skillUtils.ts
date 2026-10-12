import { Ability } from '../../../entities/hero/bi/types';

export interface ParsedSkillInfo {
  priorityIndex: number; // 1, 2, 3, 4 (order of maxing)
  skillNumber: number;   // 1, 2, 3, 4 (slot on skill bar / hotkey)
  key: string;           // Q, W, E, D, F, R
  name: string;          // Ability name
  isUlt: boolean;
  formatted: string;     // e.g. "Skill 2: Blink (W)"
}

/**
 * Maps a key or ability index to a standard Dota skill slot number (1, 2, 3, 4, etc.)
 */
export function getSkillNumberFromKey(key: string, index?: number): number {
  const upper = key.trim().toUpperCase();
  if (upper === 'Q') return 1;
  if (upper === 'W') return 2;
  if (upper === 'E') return 3;
  if (upper === 'D') return 4;
  if (upper === 'F') return 5;
  if (upper === 'R') return 4;
  if (typeof index === 'number') return index + 1;
  return 1;
}

/**
 * Parses any skill string from maxPriority or levelGuide and identifies its skill number (1-4), hotkey, and name.
 */
export function parseSkillInfo(
  skillStr: string,
  heroAbilities?: Ability[],
  priorityIndex: number = 0
): ParsedSkillInfo {
  const trimmed = skillStr.trim();

  // 1. Try to extract key from parentheses, e.g. "Blink (W)" -> "W"
  const keyMatch = trimmed.match(/\(([QWEDFR])\)/i);
  let key = keyMatch ? keyMatch[1].toUpperCase() : '';

  // 2. If skillStr is just "Q", "W", "E", "R", "D", "F"
  if (!key && /^[QWEDFR]$/i.test(trimmed)) {
    key = trimmed.toUpperCase();
  }

  // 3. Find matching ability from hero abilities list
  let matchingAbility: Ability | undefined;
  let abilityIndex = -1;

  if (heroAbilities && heroAbilities.length > 0) {
    if (key) {
      abilityIndex = heroAbilities.findIndex((a) => a.key.toUpperCase() === key);
      if (abilityIndex !== -1) {
        matchingAbility = heroAbilities[abilityIndex];
      }
    }

    if (!matchingAbility) {
      // Match by name
      const cleanName = trimmed.replace(/\s*\([QWEDFR]\)/i, '').toLowerCase();
      abilityIndex = heroAbilities.findIndex(
        (a) => a.name.toLowerCase() === cleanName || cleanName.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(cleanName)
      );
      if (abilityIndex !== -1) {
        matchingAbility = heroAbilities[abilityIndex];
        if (!key) key = matchingAbility.key.toUpperCase();
      }
    }
  }

  // 4. Fallback defaults based on priority index if no key matched
  if (!key) {
    const defaultKeys = ['Q', 'W', 'E', 'R'];
    key = defaultKeys[priorityIndex % defaultKeys.length] || 'Q';
  }

  // 5. Determine skill number (1-4)
  let skillNumber: number;
  if (abilityIndex !== -1) {
    skillNumber = abilityIndex + 1;
  } else {
    skillNumber = getSkillNumberFromKey(key, priorityIndex);
  }

  // 6. Name extraction
  let name = matchingAbility?.name || trimmed.replace(/\s*\([QWEDFR]\)/i, '');
  if (!name || name === key) {
    name = `Skill ${skillNumber}`;
  }

  const isUlt = key === 'R' || !!matchingAbility?.isUltimate || /ultimate|culling|chronosphere|ravage|duel|finger|doom/i.test(name);

  return {
    priorityIndex: priorityIndex + 1,
    skillNumber,
    key,
    name,
    isUlt,
    formatted: `Skill ${skillNumber}: ${name} (${key})`
  };
}

/**
 * Takes maxPriority array and returns all skills identified with numbers
 */
export function getNumberedSkillPriority(
  maxPriority: string[],
  heroAbilities?: Ability[]
): ParsedSkillInfo[] {
  return maxPriority.map((str, idx) => parseSkillInfo(str, heroAbilities, idx));
}
