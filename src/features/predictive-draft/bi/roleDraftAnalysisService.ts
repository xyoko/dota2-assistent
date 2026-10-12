import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { PositionNumber, POSITION_DEFINITIONS, DedicatedSlots } from './predictiveDraftEngine';

export interface RolePickSuggestion {
  hero: HeroData;
  pos: PositionNumber;
  roleName: string;
  score: number; // 0 - 100
  isFirstPick: boolean;
  isFavorite: boolean;
  matchupTarget?: {
    hero: HeroData;
    relation: 'counters_opponent' | 'counters_direct_lane';
    note: string;
  };
  reasons: string[];
  strengths: string[];
  weaknesses: string[];
  winRate: number;
}

export interface RoleBanSuggestion {
  hero: HeroData;
  pos: PositionNumber;
  roleName: string;
  impactScore: number; // 0 - 100
  priority: 'CRITICAL' | 'HIGH' | 'TACTICAL';
  category: 'Protects Our Pick' | 'Denies Opponent Combo' | 'High-Threat Meta';
  isFavorite: boolean;
  targetAllyHero?: HeroData;
  targetOpponentHero?: HeroData;
  reason: string;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Extracts comprehensive, verified strengths and weaknesses for any hero.
 * Dynamically tailored if an opponent hero is present.
 */
export function getHeroStrengthsAndWeaknesses(
  hero: HeroData,
  vsHero?: HeroData | null
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // 1. Situational analysis vs specific opponent hero
  if (vsHero) {
    const directCounter = hero.strongAgainst?.find((s) => s.heroId === vsHero.id);
    if (directCounter) {
      strengths.push(`Direct advantage vs ${vsHero.name}: ${directCounter.reason}`);
    }

    const directWeakness = hero.weakAgainst?.find((w) => w.heroId === vsHero.id);
    if (directWeakness) {
      weaknesses.push(`Direct vulnerability to ${vsHero.name}: ${directWeakness.reason}`);
    }
  }

  // 2. Core strengths derived from hero kit, roles & power spikes
  if (hero.attackType === 'Ranged') {
    strengths.push('Ranged attack zoning & safe highground siege leverage');
  } else {
    strengths.push('High base armor scaling & aggressive melee frontline presence');
  }

  if (hero.complexity === 1) {
    strengths.push('Reliable, low-execution error kit with consistent execution');
  } else if (hero.complexity === 3) {
    strengths.push('Extremely high skill-ceiling with flexible multi-spell adaptation');
  }

  if (hero.powerSpikes?.mid) {
    strengths.push(`Dominant mid-game timing: ${hero.powerSpikes.mid}`);
  } else if (hero.powerSpikes?.early) {
    strengths.push(`Strong early-game presence: ${hero.powerSpikes.early}`);
  }

  // 3. Core weaknesses derived from counter strategy & vulnerability summary
  if (hero.counterStrategy?.weaknessSummary && hero.counterStrategy.weaknessSummary.length > 0) {
    hero.counterStrategy.weaknessSummary.slice(0, 2).forEach((w) => weaknesses.push(w));
  } else {
    if (hero.attribute === 'int' || hero.attribute === 'all') {
      weaknesses.push('Susceptible to high physical burst and gap-closing silences');
    } else if (hero.attribute === 'agi') {
      weaknesses.push('Relies heavily on BKB timing to avoid magic lockdown chains');
    } else {
      weaknesses.push('Vulnerable to percent-based damage and kiting mobility spells');
    }
  }

  // Fallback defaults to guarantee at least 2 strengths and 2 weaknesses
  if (strengths.length < 2) {
    strengths.push(`Strong ${hero.winRate}% patch win rate baseline with proven meta performance`);
  }
  if (weaknesses.length < 2) {
    const mainWeak = hero.weakAgainst?.[0];
    if (mainWeak) {
      weaknesses.push(`Can be punished by ${mainWeak.heroName} (${mainWeak.reason.split('.')[0]})`);
    } else {
      weaknesses.push('Cooldown dependent during 5v5 teamfight skirmishes');
    }
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3)
  };
}

/**
 * Calculates optimal pick suggestions separated by position role.
 * - If opponent has NOT chosen a hero: provides optimal blind / first picks for that role.
 * - If opponent HAS chosen a hero: provides tailored counter-picks against the opponent's chosen hero(es).
 * - Excludes all heroes in the ban roster.
 * - Strongly favors favorite heroes with score bonus and badges.
 */
export function getRolePickSuggestions(
  pos: PositionNumber,
  allySlots: DedicatedSlots,
  opponentSlots: DedicatedSlots,
  banIds: string[],
  favorites: string[] = []
): {
  suggestions: RolePickSuggestion[];
  opponentHero: HeroData | null;
  hasOpponentPickedRole: boolean;
  isFirstPickSituation: boolean;
} {
  const roleDef = POSITION_DEFINITIONS[pos];
  const targetRole = roleDef.role;

  // Compile active ban roster & already picked heroes
  const bannedSet = new Set(banIds);
  const allyPickedIds = new Set(allySlots.filter((id): id is string => Boolean(id)));
  const opponentPickedIds = new Set(opponentSlots.filter((id): id is string => Boolean(id)));
  const unavailableIds = new Set([...bannedSet, ...allyPickedIds, ...opponentPickedIds]);

  // Check if opponent picked for this specific role slot
  const opponentSlotHeroId = opponentSlots[pos - 1];
  const opponentHero = opponentSlotHeroId ? HERO_MAP.get(opponentSlotHeroId) || null : null;
  const hasOpponentPickedRole = Boolean(opponentHero);

  // Check if opponent has picked ANY heroes across the board
  const allOpponentHeroes = opponentSlots
    .filter((id): id is string => Boolean(id))
    .map((id) => HERO_MAP.get(id))
    .filter((h): h is HeroData => Boolean(h));

  const allAllyHeroes = allySlots
    .filter((id): id is string => Boolean(id))
    .map((id) => HERO_MAP.get(id))
    .filter((h): h is HeroData => Boolean(h));

  const isFirstPickSituation = !opponentHero;

  // Filter hero roster to ONLY heroes matching this role
  const roleCandidates = HEROES_DATA.filter((candidate) => {
    if (unavailableIds.has(candidate.id)) return false;
    return candidate.roles.includes(targetRole);
  });

  const suggestions: RolePickSuggestion[] = [];

  roleCandidates.forEach((candidate) => {
    const isFavorite = favorites.includes(candidate.id);
    let score = 50;
    const reasons: string[] = [];
    let matchupTarget: RolePickSuggestion['matchupTarget'];

    // 1. Favor Favorite Heroes (+25 score boost)
    if (isFavorite) {
      score += 25;
      reasons.push('★ Marked as a Favorite Hero in your personal repertoire');
    }

    if (opponentHero) {
      // SCENARIO A: Opponent has picked their hero for this specific role -> Evaluate targeted counter-picks
      const counterMatch = candidate.strongAgainst?.find((s) => s.heroId === opponentHero.id);
      if (counterMatch) {
        score += 28;
        matchupTarget = {
          hero: opponentHero,
          relation: 'counters_direct_lane',
          note: counterMatch.reason
        };
        reasons.push(`Directly counters Opponent ${opponentHero.name} (${counterMatch.reason})`);
      }

      const weakMatch = candidate.weakAgainst?.find((w) => w.heroId === opponentHero.id);
      if (weakMatch) {
        score -= 22;
        reasons.push(`Vulnerable to Opponent ${opponentHero.name} (${weakMatch.reason})`);
      }
    } else {
      // SCENARIO B: Opponent has NOT chosen a hero for this role (e.g. Allied team has first pick or drafting role blind)
      // Per specification: do not counter non-existent role picks; show optimal first picks
      score += 15; // Base first pick stability
      reasons.push(`Optimal blind first-pick for ${roleDef.name} with resilient lane independence`);

      // Safe blind-pick bonus: Low complexity or flexible toolkit
      if (candidate.complexity === 1 || candidate.complexity === 2) {
        score += 8;
        reasons.push('Versatile hero with hard-to-exploit baseline toolkit');
      }
    }

    // Synergy with already picked allies
    allAllyHeroes.forEach((ally) => {
      const syn = candidate.synergies?.find((s) => s.heroId === ally.id);
      if (syn) {
        score += 15;
        reasons.push(`Synergizes with ally ${ally.name} (${syn.reason})`);
      }
    });

    // Win rate normalization
    score += Math.round((candidate.winRate - 50) * 1.8);

    const finalScore = Math.min(99, Math.max(35, score));
    const { strengths, weaknesses } = getHeroStrengthsAndWeaknesses(
      candidate,
      opponentHero || allOpponentHeroes[0] || null
    );

    if (reasons.length === 0) {
      reasons.push(`Strong baseline ${candidate.winRate}% win rate with stable role impact.`);
    }

    suggestions.push({
      hero: candidate,
      pos,
      roleName: roleDef.name,
      score: finalScore,
      isFirstPick: isFirstPickSituation,
      isFavorite,
      matchupTarget,
      reasons: reasons.slice(0, 3),
      strengths,
      weaknesses,
      winRate: candidate.winRate
    });
  });

  // Sort by score descending (favorites and high counters at top)
  const sorted = suggestions.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.score - a.score;
  });

  return {
    suggestions: sorted.slice(0, 8),
    opponentHero,
    hasOpponentPickedRole,
    isFirstPickSituation
  };
}

/**
 * Calculates targeted ban suggestions strictly separated by position role.
 * - Protects our allies' picked heroes from counter-picks.
 * - Denies high-synergy opponent combos if opponent has picked.
 * - Recommends high-threat meta bans for that role if unpicked.
 * - Completely respects the ban roster (cannot suggest already banned heroes).
 */
export function getRoleBanSuggestions(
  pos: PositionNumber,
  allySlots: DedicatedSlots,
  opponentSlots: DedicatedSlots,
  banIds: string[],
  favorites: string[] = []
): {
  suggestions: RoleBanSuggestion[];
  allyRoleHero: HeroData | null;
  opponentRoleHero: HeroData | null;
} {
  const roleDef = POSITION_DEFINITIONS[pos];
  const targetRole = roleDef.role;

  // Active ban roster & picked heroes
  const bannedSet = new Set(banIds);
  const allyPickedIds = new Set(allySlots.filter((id): id is string => Boolean(id)));
  const opponentPickedIds = new Set(opponentSlots.filter((id): id is string => Boolean(id)));
  const unavailableIds = new Set([...bannedSet, ...allyPickedIds, ...opponentPickedIds]);

  const allyRoleHeroId = allySlots[pos - 1];
  const allyRoleHero = allyRoleHeroId ? HERO_MAP.get(allyRoleHeroId) || null : null;

  const opponentRoleHeroId = opponentSlots[pos - 1];
  const opponentRoleHero = opponentRoleHeroId ? HERO_MAP.get(opponentRoleHeroId) || null : null;

  const allAllyHeroes = allySlots
    .filter((id): id is string => Boolean(id))
    .map((id) => HERO_MAP.get(id))
    .filter((h): h is HeroData => Boolean(h));


  // Role candidate heroes that can be banned
  const roleCandidates = HEROES_DATA.filter((candidate) => {
    if (unavailableIds.has(candidate.id)) return false;
    return candidate.roles.includes(targetRole);
  });

  const suggestions: RoleBanSuggestion[] = [];

  roleCandidates.forEach((candidate) => {
    const isFavorite = favorites.includes(candidate.id);
    let impactScore = 50;
    let priority: RoleBanSuggestion['priority'] = 'TACTICAL';
    let category: RoleBanSuggestion['category'] = 'High-Threat Meta';
    let reason = `Current high-impact ${candidate.winRate}% win rate core in Patch 7.37d.`;
    let targetAllyHero: HeroData | undefined;
    let targetOpponentHero: HeroData | undefined;

    // 1. Protect Our Ally: Check if candidate counters our ally picked heroes
    let isAllyThreat = false;
    if (allyRoleHero) {
      const countersAllyRole = candidate.strongAgainst?.find((s) => s.heroId === allyRoleHero.id);
      if (countersAllyRole) {
        impactScore += 38;
        priority = 'CRITICAL';
        category = 'Protects Our Pick';
        reason = `Direct hard counter to our ${allyRoleHero.name} (${countersAllyRole.reason})`;
        targetAllyHero = allyRoleHero;
        isAllyThreat = true;
      }
    }

    if (!isAllyThreat) {
      for (const ally of allAllyHeroes) {
        const countersAlly = candidate.strongAgainst?.find((s) => s.heroId === ally.id);
        if (countersAlly) {
          impactScore += 26;
          priority = 'HIGH';
          category = 'Protects Our Pick';
          reason = `Counters our ${ally.name} (${countersAlly.reason})`;
          targetAllyHero = ally;
          isAllyThreat = true;
          break;
        }
      }
    }

    // 2. Disrupt Opponent Combo: Check if candidate combos with opponent's role hero
    if (!isAllyThreat && opponentRoleHero) {
      const combosWithOppRole = candidate.synergies?.find((s) => s.heroId === opponentRoleHero.id);
      if (combosWithOppRole) {
        impactScore += 32;
        priority = 'HIGH';
        category = 'Denies Opponent Combo';
        reason = `Prevents Opponent pairing with ${opponentRoleHero.name} (${combosWithOppRole.reason})`;
        targetOpponentHero = opponentRoleHero;
      }
    }

    // 3. High-Threat Meta Baseline
    if (category === 'High-Threat Meta') {
      impactScore += Math.round((candidate.winRate - 50) * 1.6);
      if (candidate.winRate >= 53) {
        priority = 'HIGH';
      }
    }

    // Favor Favorite Heroes note: if it's user's favorite, alert them
    if (isFavorite) {
      impactScore += 10;
    }

    const finalImpact = Math.min(99, Math.max(30, impactScore));
    const { strengths, weaknesses } = getHeroStrengthsAndWeaknesses(
      candidate,
      allyRoleHero || allAllyHeroes[0] || null
    );

    suggestions.push({
      hero: candidate,
      pos,
      roleName: roleDef.name,
      impactScore: finalImpact,
      priority,
      category,
      isFavorite,
      targetAllyHero,
      targetOpponentHero,
      reason,
      strengths,
      weaknesses
    });
  });

  const sorted = suggestions.sort((a, b) => b.impactScore - a.impactScore);

  return {
    suggestions: sorted.slice(0, 6),
    allyRoleHero,
    opponentRoleHero
  };
}
