// Manual override file for hero popular positions.
// Overrides in this file take precedence over GENERATED_HERO_POSITIONS.
// Entries specify up to 2 popular PositionNumbers per hero.

import type { PositionNumber } from '../bi/types';

export const HERO_POSITION_OVERRIDES: Record<string, PositionNumber[]> = {
  // Test fixture for override precedence testing
  override_test_hero: [3, 4],

  // Specific patch meta corrections
  sven: [1, 5], // Popular Pos 1 Carry and Pos 5 Hard Support
  lina: [2, 1], // Premier Pos 2 Mid and Pos 1 Carry
  windranger: [2, 1], // Mid and Carry
};
