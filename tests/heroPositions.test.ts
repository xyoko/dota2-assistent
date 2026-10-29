import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getHeroPositions,
  resolveHeroPosition,
  POSITION_NAMES,
  DEFAULT_POSITION,
} from '../src/entities/hero/bi/heroPositions.ts';

describe('Hero Position Resolver', () => {
  it('returns up to 2 popular positions for a known hero', () => {
    // shadow_fiend plays Pos 2 (Mid) and Pos 1 (Carry)
    const positions = getHeroPositions('shadow_fiend');
    assert(Array.isArray(positions), 'Expected positions array');
    assert(positions.length >= 1 && positions.length <= 2, 'Hero should have 1 or 2 popular positions');
    assert.deepEqual(positions, [2, 1]);
  });

  it('prioritizes overrides over generated data', () => {
    // An override hero configured in heroPositions.overrides.ts
    const positions = getHeroPositions('override_test_hero');
    assert.deepEqual(positions, [3, 4]);
  });

  it('returns an empty array for an unmapped hero or invalid heroId', () => {
    assert.deepEqual(getHeroPositions('non_existent_hero_xyz'), []);
    // @ts-expect-error testing undefined input
    assert.deepEqual(getHeroPositions(undefined), []);
    // @ts-expect-error testing null input
    assert.deepEqual(getHeroPositions(null), []);
    assert.deepEqual(getHeroPositions(''), []);
  });

  it('resolves to the requested draft slot position if it matches one of the top 2 popular positions', () => {
    // shadow_fiend: popular positions are [2, 1]
    const resolvedPos2 = resolveHeroPosition('shadow_fiend', 2);
    assert.equal(resolvedPos2, 2);

    const resolvedPos1 = resolveHeroPosition('shadow_fiend', 1);
    assert.equal(resolvedPos1, 1);
  });

  it('resolves to DEFAULT_POSITION if requested position is NOT one of the hero popular positions', () => {
    // shadow_fiend: does not play Pos 5 (Hard Support) or Pos 3 (Offlane)
    const resolvedPos5 = resolveHeroPosition('shadow_fiend', 5);
    assert.equal(resolvedPos5, DEFAULT_POSITION);

    const resolvedPos3 = resolveHeroPosition('shadow_fiend', 3);
    assert.equal(resolvedPos3, DEFAULT_POSITION);
  });

  it('resolves to hero primary popular position if no requested position is provided', () => {
    const resolved = resolveHeroPosition('shadow_fiend');
    // First popular position is Pos 2 (Mid)
    assert.equal(resolved, 2);
  });

  it('resolves to DEFAULT_POSITION if hero has no position mapping even if a position is requested', () => {
    const resolved = resolveHeroPosition('non_existent_hero_xyz', 1);
    assert.equal(resolved, DEFAULT_POSITION);

    const resolvedNoPos = resolveHeroPosition('non_existent_hero_xyz');
    assert.equal(resolvedNoPos, DEFAULT_POSITION);
  });

  it('safely handles null/undefined inputs and returns DEFAULT_POSITION', () => {
    // @ts-expect-error testing undefined input
    assert.equal(resolveHeroPosition(undefined, 1), DEFAULT_POSITION);
    // @ts-expect-error testing null input
    assert.equal(resolveHeroPosition(null, null), DEFAULT_POSITION);
  });

  it('exposes correct POSITION_NAMES mapping 1-5 to canonical roles', () => {
    assert.equal(POSITION_NAMES[1], 'Carry');
    assert.equal(POSITION_NAMES[2], 'Mid');
    assert.equal(POSITION_NAMES[3], 'Offlane');
    assert.equal(POSITION_NAMES[4], 'Soft Support');
    assert.equal(POSITION_NAMES[5], 'Hard Support');
    assert.equal(DEFAULT_POSITION, 'default');
  });
});
