import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeroPositionSelector } from '../src/features/hero-build/ui/HeroPositionSelector.tsx';
import { resolveHeroPosition, DEFAULT_POSITION } from '../src/entities/hero/bi/heroPositions.ts';
import type { PositionNumber } from '../src/entities/hero/bi/types.ts';

describe('Hero Position Selector & Flow Integration', () => {
  it('renders default and up to 2 popular position options for a 2-role hero (Shadow Fiend)', () => {
    const html = renderToStaticMarkup(
      React.createElement(HeroPositionSelector, {
        heroId: 'shadow_fiend',
        selectedPosition: 2,
        onChange: () => {},
      })
    );

    assert(html.includes('<select'), 'Must render a select element');
    assert(html.includes('aria-label="Select hero position"'), 'Must have accessible label');
    assert(html.includes('Default (Generic)'), 'Must include Default option');
    assert(html.includes('Pos 2 (Mid)'), 'Must include Pos 2 (Mid)');
    assert(html.includes('Pos 1 (Carry)'), 'Must include Pos 1 (Carry)');
  });

  it('renders default and only 1 popular position for a single-role hero (Anti-Mage)', () => {
    const html = renderToStaticMarkup(
      React.createElement(HeroPositionSelector, {
        heroId: 'anti_mage',
        selectedPosition: 1,
        onChange: () => {},
      })
    );

    assert(html.includes('Default (Generic)'), 'Must include Default option');
    assert(html.includes('Pos 1 (Carry)'), 'Must include Pos 1 (Carry)');
    // Anti-Mage should not have Pos 2, 3, 4, or 5
    assert(!html.includes('Pos 2'), 'Should not have Pos 2');
    assert(!html.includes('Pos 5'), 'Should not have Pos 5');
  });

  it('renders only Default option for an unmapped hero', () => {
    const html = renderToStaticMarkup(
      React.createElement(HeroPositionSelector, {
        heroId: 'unmapped_hero_123',
        selectedPosition: 'default',
        onChange: () => {},
      })
    );

    assert(html.includes('Default (Generic)'), 'Must include Default option');
    assert(!html.includes('Pos 1'), 'Should not have Pos 1');
    assert(!html.includes('Pos 2'), 'Should not have Pos 2');
  });

  it('meets 44px minimum tap target constraint', () => {
    const html = renderToStaticMarkup(
      React.createElement(HeroPositionSelector, {
        heroId: 'shadow_fiend',
        selectedPosition: 2,
        onChange: () => {},
      })
    );

    // Ensure min-h-[44px] is applied for touch target accessibility
    assert(html.includes('min-h-[44px]'), 'Must have min-h-[44px] class on interactive element or wrapper');
  });

  describe('Draft to Hero Navigation Flow', () => {
    it('selects the draft slot position when opening hero after a draft if position is popular for hero', () => {
      // Slot 2 (Mid) drafted Shadow Fiend
      const slotPos: PositionNumber = 2;
      const initialPos = resolveHeroPosition('shadow_fiend', slotPos);
      assert.equal(initialPos, 2);

      // Slot 1 (Carry) drafted Shadow Fiend
      const slotPos1: PositionNumber = 1;
      const initialPos1 = resolveHeroPosition('shadow_fiend', slotPos1);
      assert.equal(initialPos1, 1);
    });

    it('falls back to default if draft slot position is not one of hero popular positions', () => {
      // Slot 5 (Hard Support) drafted Shadow Fiend (off-meta/illegal draft slot)
      const slotPos5: PositionNumber = 5;
      const initialPos = resolveHeroPosition('shadow_fiend', slotPos5);
      assert.equal(initialPos, DEFAULT_POSITION);
    });

    it('falls back to default if draft slot hero has no position mapping', () => {
      const slotPos: PositionNumber = 1;
      const initialPos = resolveHeroPosition('unknown_unmapped_hero', slotPos);
      assert.equal(initialPos, DEFAULT_POSITION);
    });

    it('resets selection when navigating between different heroes', () => {
      // Hero A: Shadow Fiend opened at Pos 2
      let activeHero = 'shadow_fiend';
      let activePos = resolveHeroPosition(activeHero, 2);
      assert.equal(activePos, 2);

      // User navigates to Hero B: Crystal Maiden (with no draft slot position requested)
      activeHero = 'crystal_maiden';
      activePos = resolveHeroPosition(activeHero); // resets to Crystal Maiden primary position
      assert.equal(activePos, 5);

      // User navigates to Hero C: Anti-Mage (with draft slot pos 3 requested - invalid for AM)
      activeHero = 'anti_mage';
      activePos = resolveHeroPosition(activeHero, 3);
      assert.equal(activePos, DEFAULT_POSITION);
    });
  });
});
