import type { PositionNumber, HeroPositionSelection, RoleType } from './types';
import { GENERATED_HERO_POSITIONS } from '../data/heroPositions.generated';
import { HERO_POSITION_OVERRIDES } from '../data/heroPositions.overrides';

export const DEFAULT_POSITION: HeroPositionSelection = 'default';

export const POSITION_NAMES: Record<PositionNumber, RoleType> = {
  1: 'Carry',
  2: 'Mid',
  3: 'Offlane',
  4: 'Soft Support',
  5: 'Hard Support',
};

/**
 * Returns up to 2 popular positions for a hero.
 * Overrides take precedence over generated data.
 * Heroes with no mapping safely return an empty array.
 */
export function getHeroPositions(heroId?: string | null): PositionNumber[] {
  if (!heroId || typeof heroId !== 'string') {
    return [];
  }

  // 1. Check manual overrides first (highest precedence)
  const override = HERO_POSITION_OVERRIDES[heroId];
  if (override && Array.isArray(override) && override.length > 0) {
    return override.slice(0, 2);
  }

  // 2. Check generated positions
  const generated = GENERATED_HERO_POSITIONS[heroId];
  if (generated && Array.isArray(generated) && generated.length > 0) {
    return generated.slice(0, 2);
  }

  return [];
}

/**
 * Resolves the active position for a hero:
 * - If a requestedPos (e.g. from a draft slot) is provided:
 *   - If it matches one of the hero's popular positions, returns that position.
 *   - Otherwise returns 'default'.
 * - If no requestedPos is provided:
 *   - Returns the hero's primary popular position (if mapped), or 'default'.
 * - Unmapped heroes always resolve to 'default'.
 */
export function resolveHeroPosition(
  heroId?: string | null,
  requestedPos?: PositionNumber | null
): HeroPositionSelection {
  if (!heroId || typeof heroId !== 'string') {
    return DEFAULT_POSITION;
  }

  const positions = getHeroPositions(heroId);

  if (requestedPos !== undefined && requestedPos !== null) {
    if (positions.includes(requestedPos)) {
      return requestedPos;
    }
    return DEFAULT_POSITION;
  }

  if (positions.length > 0) {
    return positions[0];
  }

  return DEFAULT_POSITION;
}
