import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData, RoleType } from '../../../entities/hero/bi/types';
import { getHeroTags } from '../../../entities/hero/bi/heroMatchupData';

// ==========================================
// TYPES & INTERFACES FOR PREDICTIVE DRAFT
// ==========================================

export type PositionNumber = 1 | 2 | 3 | 4 | 5;
export type DedicatedSlots = [string | null, string | null, string | null, string | null, string | null];

export interface DraftSlot {
  pos: PositionNumber;
  name: string; // e.g., "Pos 1 Carry"
  lane: 'Safe Lane' | 'Mid Lane' | 'Offlane';
  role: RoleType;
  hero: HeroData | null;
}

export interface BanIntentTelegraph {
  hero: HeroData;
  confidence: number; // 0-100%
  reason: string;
  counterRecommendation: string;
}

export interface DetectedStrategy {
  name: string;
  description: string;
  triggerBans: string[];
  confidence: number;
}

export interface BanIntentPrediction {
  telegraphedHeroes: BanIntentTelegraph[];
  detectedStrategy: DetectedStrategy | null;
}

export interface PredictedCandidate {
  hero: HeroData;
  predictedPos: PositionNumber;
  roleName: string;
  confidence: number; // 0-100%
  strategicFitReason: string;
  laneMatchupNote: string;
}

export interface LineupPrediction {
  vacantRoles: {
    pos: PositionNumber;
    roleName: string;
    lane: string;
  }[];
  predictedHeroes: PredictedCandidate[];
  detectedArchetype: {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  };
}

export interface BanSuggestion {
  hero: HeroData;
  priority: 'CRITICAL' | 'HIGH' | 'TACTICAL';
  category: 'Protects Our Core' | 'Disrupts Enemy Combo' | 'Anticipates Banned Intent' | 'High-Threat Meta';
  reason: string;
  targetHeroName?: string;
  impactScore: number; // 0-100
}

export interface PickSuggestion {
  hero: HeroData;
  pos: PositionNumber;
  roleName: string;
  score: number; // 0-100
  reasons: string[];
  countersEnemies: { heroName: string; note: string }[];
  synergizesWith: { heroName: string; note: string }[];
  powerSpikes: { early: string; mid: string; late: string };
  winRate: number;
}

export interface LaneMatchupForecast {
  laneName: string;
  laneType: 'Radiant Safe vs Dire Off' | 'Mid vs Mid' | 'Radiant Off vs Dire Safe';
  radiantHeroes: HeroData[];
  direHeroes: HeroData[];
  advantage: 'Radiant Favored' | 'Dire Favored' | 'Even';
  confidence: number;
  tacticalTip: string;
}

export interface Predictive5v5Analysis {
  radiantPicks: HeroData[];
  direPicks: HeroData[];
  radiantBans: HeroData[];
  direBans: HeroData[];
  allBans: HeroData[];

  // 1. Ban-Based Predictive Analysis
  banPredictions: BanIntentPrediction;
  suggestedBans: BanSuggestion[];

  // 2. Pick-Based Predictive Lineup & Picks
  lineupPrediction: LineupPrediction;
  suggestedPicks: PickSuggestion[];

  // 3. Draft Advantage & Tactical Breakdown
  draftAdvantage: {
    radiantScore: number;
    direScore: number;
    earlyAdvantage: 'Radiant' | 'Dire' | 'Even';
    midAdvantage: 'Radiant' | 'Dire' | 'Even';
    lateAdvantage: 'Radiant' | 'Dire' | 'Even';
  };
  laneForecasts: LaneMatchupForecast[];
  teamfightScores: {
    radiant: { cc: number; burst: number; push: number; sustain: number; scaling: number };
    dire: { cc: number; burst: number; push: number; sustain: number; scaling: number };
  };
  winConditions: {
    radiant: string[];
    dire: string[];
  };
}

// ==========================================
// PREDEFINED HEURISTIC MAPPINGS
// ==========================================

export const POSITION_DEFINITIONS: Record<PositionNumber, { name: string; lane: 'Safe Lane' | 'Mid Lane' | 'Offlane'; role: RoleType }> = {
  1: { name: 'Pos 1 Carry', lane: 'Safe Lane', role: 'Carry' },
  2: { name: 'Pos 2 Mid', lane: 'Mid Lane', role: 'Mid' },
  3: { name: 'Pos 3 Offlane', lane: 'Offlane', role: 'Offlane' },
  4: { name: 'Pos 4 Soft Support', lane: 'Offlane', role: 'Soft Support' },
  5: { name: 'Pos 5 Hard Support', lane: 'Safe Lane', role: 'Hard Support' },
};

// Patterns mapping specific banned heroes to what the opponent is planning to pick
interface BanPattern {
  bannedKeywords: string[]; // hero IDs that trigger this
  telegraphedHeroIds: string[];
  strategyName: string;
  strategyDescription: string;
  reason: string;
  counterRecommendation: string;
}

const BAN_PATTERNS: BanPattern[] = [
  {
    bannedKeywords: ['anti_mage', 'nyx_assassin', 'lion'],
    telegraphedHeroIds: ['medusa', 'storm_spirit', 'leshrac', 'wraith_king'],
    strategyName: 'Mana Shield / Heavy Mana Dependent Core',
    strategyDescription: 'Enemy eliminated primary mana-burners and mana-drain disables, preparing the runway for an unkillable mana-pool tank or mobile storm.',
    reason: 'Eliminating Anti-Mage and Nyx removes Mana Void burst and Spiked Carapace counters.',
    counterRecommendation: 'Pre-emptively pick Slark (Diffusal Blade) or Invoker (EMP), or counter-ban Medusa.'
  },
  {
    bannedKeywords: ['ancient_apparition', 'drow_ranger', 'spirit_vessel'],
    telegraphedHeroIds: ['morphling', 'huskar', 'slark', 'necrophos', 'alchemist'],
    strategyName: 'High-Regen / Lifesteal Sustain Deathball',
    strategyDescription: 'Banning Ice Blast and heal-reduction mechanics guarantees unpunished HP shift, Armlet toggling, and chemical rage regeneration.',
    reason: 'Ancient Apparition’s 100% healing freeze is the single hardest blocker to high-sustain carries.',
    counterRecommendation: 'Draft early Spirit Vessel carriers (Pudge, Witch Doctor) or prioritize high pure burst.'
  },
  {
    bannedKeywords: ['axe', 'legion_commander', 'earthshaker', 'sven', 'sand_king'],
    telegraphedHeroIds: ['phantom_lancer', 'chaos_knight', 'naga_siren', 'meepo'],
    strategyName: 'Illusion Swarm & Multi-Unit Overwhelm',
    strategyDescription: 'Targeting Call, Cleave, and Echo Slam clears the board of instant illusion-clearing threats.',
    reason: 'Axe and Sven punish grouped illusion swarms with pure Counter Helix and Great Cleave.',
    counterRecommendation: 'Draft high AoE magic or pure waveclear like Leshrac, Underlord, or Lion with Aghanim’s.'
  },
  {
    bannedKeywords: ['bloodseeker', 'disruptor', 'doom', 'night_stalker', 'silencer'],
    telegraphedHeroIds: ['slark', 'weaver', 'puck', 'storm_spirit', 'faceless_void'],
    strategyName: 'Elusive Mobile Skirmishers',
    strategyDescription: 'Denying Rupture, Static Storm, and Doom removes long-duration silences and tether disables.',
    reason: 'High-mobility cores rely on zero-frame escape abilities to survive teamfights.',
    counterRecommendation: 'Pick instant point-target hex or disable heroes like Lion, Shadow Shaman, or Orchid rushers.'
  },
  {
    bannedKeywords: ['silencer', 'rubick', 'enigma'],
    telegraphedHeroIds: ['tidehunter', 'faceless_void', 'magnus', 'witch_doctor'],
    strategyName: '5-Man Teamfight Blackhole / Chrono Wipe',
    strategyDescription: 'Global Silence and Spell Steal completely ruin channeled and large-radius initiation ultimates.',
    reason: 'Silencer can interrupt Ravage, Black Hole, and Chronosphere follow-ups from across the entire map.',
    counterRecommendation: 'Pick disjoint / repositioning saves (Pudge Hook, Vengeful Swap) and buy early Aeon Disks.'
  },
  {
    bannedKeywords: ['slardar', 'templar_assassin', 'razor'],
    telegraphedHeroIds: ['phantom_assassin', 'terrorblade', 'sven', 'spectre'],
    strategyName: 'Agility Hypercarry / High-Armor Physical Escalation',
    strategyDescription: 'Removing Corrosive Haze and Static Link preserves armor superiority and right-click dominance.',
    reason: 'Slardar and Razor bypass physical armor and drain primary damage attributes.',
    counterRecommendation: 'Draft heavy magic nukers (Lion, Witch Doctor Maledict) and build early Ghost Scepters / Halberd.'
  },
  {
    bannedKeywords: ['witch_doctor', 'lion', 'shadow_shaman'],
    telegraphedHeroIds: ['sven', 'phantom_assassin', 'anti_mage'],
    strategyName: 'Fast-Tempo Brawling Cores',
    strategyDescription: 'Banning high-impact early stunners prevents lane shutouts and empowers aggressive physical carries.',
    reason: 'Witch Doctor Maledict + Paralyzing Cask punishes aggressive melee carries in early laning.',
    counterRecommendation: 'Pick defensive lane-stabilizers or heavy disengagers.'
  }
];

// Combos that indicate specific synergy intent when one hero is picked
const KNOWN_COMBOS: Record<string, { partnerIds: string[]; comboName: string; reason: string }[]> = {
  faceless_void: [
    { partnerIds: ['witch_doctor'], comboName: 'Chrono + Death Ward', reason: 'Death Ward channels freely while enemies are frozen inside Chronosphere.' },
    { partnerIds: ['invoker', 'cataclysm'], comboName: 'Chrono + Cataclysm', reason: 'Instant multi-hero Sunstrike deletion during 5-second disable.' },
    { partnerIds: ['snapfire', 'jakiro'], comboName: 'Chrono + Mortimer Kisses', reason: 'AoE siege artillery on stationary victims.' }
  ],
  magnus: [
    { partnerIds: ['sven', 'phantom_assassin'], comboName: 'Empower Cleave & Reverse Polarity', reason: 'Empower doubles farming speed and Reverse Polarity groups 5 heroes for instant cleave wipe.' }
  ],
  axe: [
    { partnerIds: ['dazzle', 'omniknight'], comboName: 'Berserker Call + Shadow Wave / Heal Bomb', reason: 'Call forces 3+ units around Axe, amplifying physical heal bombs.' }
  ],
  drow_ranger: [
    { partnerIds: ['windranger', 'mirana', 'sniper'], comboName: 'Precision Aura Artillery Line', reason: 'Bonus agility and ranged attack speed melts towers and enemy frontliners from highground.' }
  ],
  sven: [
    { partnerIds: ['storm_spirit', 'lion'], comboName: 'Storm Hammer Chain-CC & God’s Strength', reason: 'Reliable follow-up stun allows Sven to 2-shot targets before BKB can be activated.' }
  ],
  witch_doctor: [
    { partnerIds: ['faceless_void', 'legion_commander'], comboName: 'Duel / Chrono + Maledict Burst', reason: 'Stationary lockdown amplifies Maledict ticks to guarantee lethal damage.' }
  ]
};

// ==========================================
// CORE ENGINE METHODS
// ==========================================

/**
 * 1. Predicts enemy strategy and telegraphed heroes based on what heroes are banned.
 */
export function predictEnemyIntentFromBans(
  radiantBans: HeroData[],
  direBans: HeroData[]
): BanIntentPrediction {
  const allBanned = [...radiantBans, ...direBans];
  const direBannedIds = direBans.map((h) => h.id);
  const allBannedIds = allBanned.map((h) => h.id);

  // If no bans have been registered yet, provide active scouting telemetry
  if (direBans.length === 0) {
    const metaCandidates = HEROES_DATA
      .filter((h) => !allBannedIds.includes(h.id))
      .sort((a, b) => (b.winRate * b.pickRate) - (a.winRate * a.pickRate))
      .slice(0, 4);

    const fallbackTelegraphs: BanIntentTelegraph[] = metaCandidates.map((hero) => ({
      hero,
      confidence: Math.round(hero.winRate * 1.3),
      reason: `Patch 7.37d high-priority draft threat (${hero.winRate}% WR, ${hero.pickRate}% pick rate). Frequently enabled when early counter-bans are omitted.`,
      counterRecommendation: hero.weakAgainst?.[0]
        ? `Draft ${hero.weakAgainst[0].heroName} (${hero.weakAgainst[0].reason}) or ban in second phase.`
        : 'Prepare instant point-target disable or heavy burst.'
    }));

    return {
      telegraphedHeroes: fallbackTelegraphs,
      detectedStrategy: {
        name: 'Patch 7.37d Scouting: High-Priority Threat Watchlist',
        description: 'Opponents have not registered bans yet. Monitor whether Opponents deny illusion-clearers, heal freezes, or instant silences in the opening phase to confirm incoming core picks.',
        triggerBans: ['Draft Scouting Phase'],
        confidence: 72
      }
    };
  }

  const telegraphedMap = new Map<string, BanIntentTelegraph>();
  let detectedStrategy: DetectedStrategy | null = null;
  let highestPatternScore = 0;

  // 1. Evaluate matching Ban Patterns
  for (const pattern of BAN_PATTERNS) {
    const direMatches = pattern.bannedKeywords.filter((k) => direBannedIds.includes(k));
    const allMatches = pattern.bannedKeywords.filter((k) => allBannedIds.includes(k));

    if (allMatches.length > 0) {
      const matchScore = (direMatches.length * 35) + (allMatches.length * 20);
      const confidence = Math.min(95, 55 + matchScore);

      if (matchScore > highestPatternScore) {
        highestPatternScore = matchScore;
        detectedStrategy = {
          name: pattern.strategyName,
          description: pattern.strategyDescription,
          triggerBans: allMatches.map((id) => HERO_MAP.get(id)?.name || id),
          confidence
        };
      }

      for (const targetId of pattern.telegraphedHeroIds) {
        if (allBannedIds.includes(targetId)) continue;
        const hero = HERO_MAP.get(targetId);
        if (!hero) continue;

        const existing = telegraphedMap.get(targetId);
        if (!existing || existing.confidence < confidence) {
          telegraphedMap.set(targetId, {
            hero,
            confidence,
            reason: `${pattern.reason} (Triggered by ${allMatches.map((id) => HERO_MAP.get(id)?.name || id).join(', ')} ban)`,
            counterRecommendation: pattern.counterRecommendation
          });
        }
      }
    }
  }

  // 2. Dynamic evaluation: Check victims of Dire's banned heroes
  for (const banned of direBans) {
    if (banned.strongAgainst && banned.strongAgainst.length > 0) {
      for (const victim of banned.strongAgainst) {
        if (allBannedIds.includes(victim.heroId)) continue;
        const targetHero = HERO_MAP.get(victim.heroId);
        if (!targetHero) continue;

        const current = telegraphedMap.get(victim.heroId);
        const dynamicConfidence = current ? Math.min(96, current.confidence + 15) : 76;

        telegraphedMap.set(victim.heroId, {
          hero: targetHero,
          confidence: dynamicConfidence,
          reason: `Dire removed ${banned.name}, which was a primary counter to ${targetHero.name} (${victim.reason})`,
          counterRecommendation: `Prepare a secondary counter to ${targetHero.name} or ban during the next phase.`
        });
      }
    }

    // Also check any hero whose weakAgainst list contains this banned hero
    HEROES_DATA.forEach((candidate) => {
      if (allBannedIds.includes(candidate.id)) return;
      const wasWeak = candidate.weakAgainst?.find((w) => w.heroId === banned.id);
      if (wasWeak && !telegraphedMap.has(candidate.id)) {
        telegraphedMap.set(candidate.id, {
          hero: candidate,
          confidence: 75,
          reason: `Dire eliminated ${banned.name}, which was a primary blocker to ${candidate.name} (${wasWeak.reason})`,
          counterRecommendation: `Draft secondary counter against ${candidate.name} before Opponents secure it.`
        });
      }
    });
  }

  // 3. Dynamic Archetype Detection if no BAN_PATTERNS triggered
  if (!detectedStrategy && direBans.length > 0) {
    const bannedTags = direBans.flatMap((h) => getHeroTags(h.id, h.attribute, h.roles));
    const tagCounts = new Map<string, number>();
    bannedTags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));

    let stratName = 'Targeted Counter Denial';
    let stratDesc = `Dire has banned ${direBans.map((h) => h.name).join(', ')} to remove direct obstacles to their upcoming core draft.`;

    if ((tagCounts.get('cleave_aoe') || 0) > 0) {
      stratName = 'Illusion & Multi-Unit Swarm Runway';
      stratDesc = 'Dire removed AoE cleave and waveclear, clearing the path for an unpunished Phantom Lancer, Naga Siren, or Chaos Knight pick.';
    } else if ((tagCounts.get('anti_heal') || 0) > 0) {
      stratName = 'High-Sustain & Regeneration Deathball';
      stratDesc = 'Dire banned heal reduction, enabling high-sustain brawlers like Morphling, Huskar, Alchemist, or Slark.';
    } else if ((tagCounts.get('mana_burn') || 0) > 0) {
      stratName = 'Mana Shield & High Mana Dependency';
      stratDesc = 'Dire removed mana burn tools, paving the runway for Medusa, Storm Spirit, or Leshrac.';
    } else if ((tagCounts.get('point_lockdown') || 0) > 0) {
      stratName = 'Elusive Skirmisher Empowerment';
      stratDesc = 'Dire eliminated point-target lockdown, telegraphing high-mobility skirmishers like Puck, Slark, or Void Spirit.';
    }

    detectedStrategy = {
      name: stratName,
      description: stratDesc,
      triggerBans: direBans.map((h) => h.name),
      confidence: Math.min(92, 60 + direBans.length * 15)
    };
  }

  // Sort by confidence descending
  const telegraphedHeroes = Array.from(telegraphedMap.values()).sort(
    (a, b) => b.confidence - a.confidence
  ).slice(0, 5);

  return {
    telegraphedHeroes,
    detectedStrategy
  };
}

/**
 * 2. Suggests bans based on our picks, enemy picks, and telegraphed intent.
 */
export function suggestBans(
  radiantPicks: HeroData[],
  direPicks: HeroData[],
  radiantBans: HeroData[],
  direBans: HeroData[]
): BanSuggestion[] {
  const suggestions: BanSuggestion[] = [];
  const bannedAndPickedIds = new Set([
    ...radiantPicks.map((h) => h.id),
    ...direPicks.map((h) => h.id),
    ...radiantBans.map((h) => h.id),
    ...direBans.map((h) => h.id)
  ]);

  const banIntent = predictEnemyIntentFromBans(radiantBans, direBans);

  // 1. Priority: Protect our already drafted cores from hard counters
  radiantPicks.forEach((myHero) => {
    if (myHero.weakAgainst) {
      myHero.weakAgainst.forEach((weakness) => {
        if (!bannedAndPickedIds.has(weakness.heroId)) {
          const counterHero = HERO_MAP.get(weakness.heroId);
          if (counterHero) {
            suggestions.push({
              hero: counterHero,
              priority: 'CRITICAL',
              category: 'Protects Our Core',
              reason: `Direct hard counter to our ${myHero.name} (${weakness.reason})`,
              targetHeroName: myHero.name,
              impactScore: 92
            });
            bannedAndPickedIds.add(weakness.heroId);
          }
        }
      });
    }
  });

  // 2. Priority: Disrupt Dire's drafted combos / synergy partners
  direPicks.forEach((enemyHero) => {
    const combos = KNOWN_COMBOS[enemyHero.id];
    if (combos) {
      combos.forEach((combo) => {
        combo.partnerIds.forEach((partnerId) => {
          if (!bannedAndPickedIds.has(partnerId)) {
            const partnerHero = HERO_MAP.get(partnerId);
            if (partnerHero) {
              suggestions.push({
                hero: partnerHero,
                priority: 'CRITICAL',
                category: 'Disrupts Enemy Combo',
                reason: `Denies Dire's lethal combo: ${combo.comboName} (${combo.reason})`,
                targetHeroName: enemyHero.name,
                impactScore: 89
              });
              bannedAndPickedIds.add(partnerId);
            }
          }
        });
      });
    }

    // Also look at enemy synergies in their hero data
    if (enemyHero.synergies) {
      enemyHero.synergies.forEach((syn) => {
        if (!bannedAndPickedIds.has(syn.heroId)) {
          const synHero = HERO_MAP.get(syn.heroId);
          if (synHero) {
            suggestions.push({
              hero: synHero,
              priority: 'HIGH',
              category: 'Disrupts Enemy Combo',
              reason: `Prevents Dire pairing ${synHero.name} with ${enemyHero.name} (${syn.reason})`,
              targetHeroName: enemyHero.name,
              impactScore: 82
            });
            bannedAndPickedIds.add(syn.heroId);
          }
        }
      });
    }
  });

  // 3. Priority: Anticipate and deny telegraphed incoming picks
  banIntent.telegraphedHeroes.forEach((telegraph) => {
    if (!bannedAndPickedIds.has(telegraph.hero.id)) {
      suggestions.push({
        hero: telegraph.hero,
        priority: telegraph.confidence >= 85 ? 'CRITICAL' : 'HIGH',
        category: 'Anticipates Banned Intent',
        reason: `Dire's bans heavily telegraph this pick (${telegraph.reason})`,
        impactScore: telegraph.confidence
      });
      bannedAndPickedIds.add(telegraph.hero.id);
    }
  });

  // 4. Fallback: High-threat meta bans (top winrate / pickrate in current patch)
  const metaThreats = HEROES_DATA
    .filter((h) => !bannedAndPickedIds.has(h.id))
    .sort((a, b) => (b.winRate * b.pickRate) - (a.winRate * a.pickRate))
    .slice(0, 3);

  metaThreats.forEach((metaHero) => {
    suggestions.push({
      hero: metaHero,
      priority: 'TACTICAL',
      category: 'High-Threat Meta',
      reason: `Current Patch 7.37d high performer with ${metaHero.winRate}% win rate and ${metaHero.pickRate}% pick rate.`,
      impactScore: Math.round(metaHero.winRate * 1.4)
    });
  });

  return suggestions.sort((a, b) => b.impactScore - a.impactScore).slice(0, 6);
}

/**
 * 3. Predicts missing lineup positions and candidate heroes for the opponent (Dire).
 */
export function predictMissingLineup(
  direPicks: HeroData[],
  radiantPicks: HeroData[],
  direBans: HeroData[]
): LineupPrediction {
  const bannedAndPickedIds = new Set([
    ...direPicks.map((h) => h.id),
    ...radiantPicks.map((h) => h.id),
    ...direBans.map((h) => h.id)
  ]);

  // Identify which roles Dire already has filled
  const filledRoles = new Set<PositionNumber>();
  const rolePool: PositionNumber[] = [1, 2, 3, 4, 5];

  // Best heuristic mapping for Dire's drafted heroes to positions
  direPicks.forEach((hero) => {
    if (hero.roles.includes('Carry') && !filledRoles.has(1)) {
      filledRoles.add(1);
    } else if (hero.roles.includes('Mid') && !filledRoles.has(2)) {
      filledRoles.add(2);
    } else if (hero.roles.includes('Offlane') && !filledRoles.has(3)) {
      filledRoles.add(3);
    } else if (hero.roles.includes('Soft Support') && !filledRoles.has(4)) {
      filledRoles.add(4);
    } else if (hero.roles.includes('Hard Support') && !filledRoles.has(5)) {
      filledRoles.add(5);
    } else {
      // Find first available role that the hero can play
      for (const pos of rolePool) {
        if (!filledRoles.has(pos)) {
          filledRoles.add(pos);
          break;
        }
      }
    }
  });

  // Calculate Vacant Roles
  const vacantRoles = rolePool
    .filter((pos) => !filledRoles.has(pos))
    .map((pos) => ({
      pos,
      roleName: POSITION_DEFINITIONS[pos].name,
      lane: POSITION_DEFINITIONS[pos].lane
    }));

  // Detect Dire Archetype
  let teamfightCount = 0;
  let pushCount = 0;
  let gankCount = 0;
  let lateCarryCount = 0;

  direPicks.forEach((hero) => {
    const tags = getHeroTags(hero.id, hero.attribute, hero.roles);
    if (tags.includes('teamfight') || tags.includes('big_aoe_ult')) teamfightCount++;
    if (tags.includes('push')) pushCount++;
    if (tags.includes('gank') || tags.includes('point_lockdown')) gankCount++;
    if (tags.includes('late_carry') || tags.includes('illusion')) lateCarryCount++;
  });

  let detectedArchetype = {
    name: 'Balanced Dynamic Composition',
    description: 'A versatile composition seeking power spikes across mid-game teamfights and late-game scaling.',
    strengths: ['Flexible laning transitions', 'Balanced physical and magic damage'],
    weaknesses: ['Susceptible to focused early snowball timing']
  };

  if (teamfightCount >= 2) {
    detectedArchetype = {
      name: 'Teamfight Deathball & Area Control',
      description: 'Dire stacks massive AoE ultimates to force 5-man brawls around Roshan and highground towers.',
      strengths: ['Devastating 5-man fight potential', 'High comeback potential in defensive base fights'],
      weaknesses: ['Heavily cooldown reliant; vulnerable when big ultimates are down']
    };
  } else if (pushCount >= 2) {
    detectedArchetype = {
      name: 'Early Objective Siege & Fast Push',
      description: 'Dire aims to take tier 1 and tier 2 towers early, choking Radiant map control before late-game.',
      strengths: ['High building damage and tower siege', 'Rapid gold accretion through early towers'],
      weaknesses: ['Falls off in late-game 50+ min attrition']
    };
  } else if (gankCount >= 2) {
    detectedArchetype = {
      name: 'High-Tempo Pickoff & Map Choke',
      description: 'Dire drafts high mobility and catch to isolate Radiant cores outside base and secure early map dominance.',
      strengths: ['Rapid solo pickoffs', 'Suffocates farming territory and wards'],
      weaknesses: ['Struggles against grouped 5-man push and defensive saves']
    };
  } else if (lateCarryCount >= 1 && direPicks.length >= 2) {
    detectedArchetype = {
      name: '4-Protect-1 Late Game Scaling',
      description: 'Dire channels gold and defensive resources into an ultra-hard carry to reach unstoppable 35+ minute spikes.',
      strengths: ['Superior ultra-late game win rate', 'High buyback defensive defense'],
      weaknesses: ['Passive early game; can be overrun before core gets 2-3 items']
    };
  }

  // Predict Missing Heroes for each vacant role
  const predictedHeroes: PredictedCandidate[] = [];

  vacantRoles.forEach((vacant) => {
    const roleDef = POSITION_DEFINITIONS[vacant.pos];
    const candidateHeroes = HEROES_DATA.filter((h) => {
      if (bannedAndPickedIds.has(h.id)) return false;
      return h.roles.includes(roleDef.role);
    });

    // Score candidates
    const scoredCandidates = candidateHeroes.map((candidate) => {
      let score = 50;

      // Synergy with Dire's existing heroes
      direPicks.forEach((dp) => {
        if (candidate.synergies && candidate.synergies.some((s) => s.heroId === dp.id)) {
          score += 20;
        }
        if (dp.synergies && dp.synergies.some((s) => s.heroId === candidate.id)) {
          score += 20;
        }
      });

      // Counter against Radiant's picks
      radiantPicks.forEach((rp) => {
        if (candidate.strongAgainst && candidate.strongAgainst.some((s) => s.heroId === rp.id)) {
          score += 15;
        }
        if (candidate.weakAgainst && candidate.weakAgainst.some((w) => w.heroId === rp.id)) {
          score -= 20;
        }
      });

      // Win rate boost
      score += Math.round((candidate.winRate - 50) * 2);

      const confidence = Math.min(94, Math.max(45, score));
      return {
        hero: candidate,
        confidence
      };
    });

    scoredCandidates.sort((a, b) => b.confidence - a.confidence);

    // Pick top 2 for each vacant role
    scoredCandidates.slice(0, 2).forEach((cand) => {
      predictedHeroes.push({
        hero: cand.hero,
        predictedPos: vacant.pos,
        roleName: vacant.roleName,
        confidence: cand.confidence,
        strategicFitReason: `Fills vacant ${vacant.roleName} role with high synergy for Dire's ${detectedArchetype.name}.`,
        laneMatchupNote: `Assigned to ${vacant.lane} to contest Radiant's core timings.`
      });
    });
  });

  return {
    vacantRoles,
    predictedHeroes,
    detectedArchetype
  };
}

/**
 * 4. Suggests picks for Radiant (your team) to counter enemy picks and predicted lineup.
 */
export function suggestPicks(
  radiantPicks: HeroData[],
  direPicks: HeroData[],
  allBans: HeroData[],
  targetPos?: PositionNumber | 'all'
): PickSuggestion[] {
  const bannedAndPickedIds = new Set([
    ...radiantPicks.map((h) => h.id),
    ...direPicks.map((h) => h.id),
    ...allBans.map((h) => h.id)
  ]);

  const predictions = predictMissingLineup(direPicks, radiantPicks, allBans);
  const banIntent = predictEnemyIntentFromBans([], allBans);

  // Determine which position Radiant needs next
  const filledRadiantRoles = new Set<PositionNumber>();
  radiantPicks.forEach((_, idx) => {
    // If fewer than 5, slot them
    filledRadiantRoles.add(((idx + 1) as PositionNumber));
  });

  const suggestions: PickSuggestion[] = [];

  HEROES_DATA.forEach((candidate) => {
    if (bannedAndPickedIds.has(candidate.id)) return;

    // Filter by target position if requested
    if (targetPos && targetPos !== 'all') {
      const targetRole = POSITION_DEFINITIONS[targetPos].role;
      if (!candidate.roles.includes(targetRole)) return;
    }

    let score = 50;
    const reasons: string[] = [];
    const countersEnemies: { heroName: string; note: string }[] = [];
    const synergizesWith: { heroName: string; note: string }[] = [];

    // 1. Counter Dire drafted heroes
    direPicks.forEach((dp) => {
      const match = candidate.strongAgainst?.find((sa) => sa.heroId === dp.id);
      if (match) {
        score += 25;
        countersEnemies.push({ heroName: dp.name, note: match.reason });
        reasons.push(`Counters Dire's ${dp.name}`);
      }

      const counterRisk = candidate.weakAgainst?.find((wa) => wa.heroId === dp.id);
      if (counterRisk) {
        score -= 25;
        reasons.push(`Vulnerable to Dire's ${dp.name} (${counterRisk.reason})`);
      }
    });

    // 2. Pre-emptive Counter against Dire's predicted lineup & telegraphed bans
    predictions.predictedHeroes.forEach((pred) => {
      const match = candidate.strongAgainst?.find((sa) => sa.heroId === pred.hero.id);
      if (match) {
        score += 12;
        countersEnemies.push({ heroName: `${pred.hero.name} (Predicted)`, note: `Pre-empts Dire's predicted ${pred.roleName}` });
        reasons.push(`Anticipates Dire's predicted ${pred.hero.name}`);
      }
    });

    banIntent.telegraphedHeroes.forEach((tele) => {
      const match = candidate.strongAgainst?.find((sa) => sa.heroId === tele.hero.id);
      if (match) {
        score += 15;
        countersEnemies.push({ heroName: `${tele.hero.name} (Bans Telegraph)`, note: tele.counterRecommendation });
        reasons.push(`Punishes enemy ban telegraph towards ${tele.hero.name}`);
      }
    });

    // 3. Synergy with Radiant allies
    radiantPicks.forEach((rp) => {
      const syn = candidate.synergies?.find((s) => s.heroId === rp.id);
      if (syn) {
        score += 20;
        synergizesWith.push({ heroName: rp.name, note: syn.reason });
        reasons.push(`Synergizes with ${rp.name} (${syn.reason})`);
      }
    });

    // 4. Composition Balance Needs
    // Check if Radiant has stuns/CC
    const radiantHasStuns = radiantPicks.some((h) => ['axe', 'lion', 'witch_doctor', 'faceless_void', 'sven', 'legion_commander'].includes(h.id));
    if (!radiantHasStuns && ['lion', 'witch_doctor', 'axe', 'sven'].includes(candidate.id)) {
      score += 15;
      reasons.push('Provides critical crowd control stuns missing from Radiant lineup');
    }

    // Check if Radiant has push
    const radiantHasPush = radiantPicks.some((h) => ['drow_ranger', 'sven', 'windranger'].includes(h.id));
    if (!radiantHasPush && ['drow_ranger', 'sven', 'windranger'].includes(candidate.id)) {
      score += 10;
      reasons.push('Supplies tower siege damage for mid-game push');
    }

    // Win rate normalization
    score += Math.round((candidate.winRate - 50) * 1.5);

    // Assign appropriate position
    let candidatePos: PositionNumber = 1;
    if (candidate.roles.includes('Carry')) candidatePos = 1;
    else if (candidate.roles.includes('Mid')) candidatePos = 2;
    else if (candidate.roles.includes('Offlane')) candidatePos = 3;
    else if (candidate.roles.includes('Soft Support')) candidatePos = 4;
    else candidatePos = 5;

    if (targetPos && targetPos !== 'all') {
      candidatePos = targetPos;
    }

    const finalScore = Math.min(99, Math.max(30, score));

    if (reasons.length === 0) {
      reasons.push(`Solid ${candidate.winRate}% win rate baseline with reliable lane presence.`);
    }

    suggestions.push({
      hero: candidate,
      pos: candidatePos,
      roleName: POSITION_DEFINITIONS[candidatePos].name,
      score: finalScore,
      reasons: reasons.slice(0, 3),
      countersEnemies: countersEnemies.slice(0, 3),
      synergizesWith: synergizesWith.slice(0, 3),
      powerSpikes: candidate.powerSpikes,
      winRate: candidate.winRate
    });
  });

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 10);
}

function evaluateLaneMatchup(
  laneName: string,
  laneType: 'Radiant Safe vs Dire Off' | 'Mid vs Mid' | 'Radiant Off vs Dire Safe',
  radiantHeroes: HeroData[],
  direHeroes: HeroData[]
): LaneMatchupForecast {
  if (radiantHeroes.length === 0 && direHeroes.length === 0) {
    return {
      laneName,
      laneType,
      radiantHeroes,
      direHeroes,
      advantage: 'Even',
      confidence: 50,
      tacticalTip: 'Draft heroes into these dedicated lane positions to simulate early trade dynamics, creep equilibrium, and kill thresholds.'
    };
  }

  if (radiantHeroes.length === 0) {
    return {
      laneName,
      laneType,
      radiantHeroes,
      direHeroes,
      advantage: 'Dire Favored',
      confidence: 72,
      tacticalTip: `Opponents have drafted ${direHeroes.map((h) => h.name).join(' & ')} here. Allies currently lack lane presence; Opponents claim uncontested wave control.`
    };
  }

  if (direHeroes.length === 0) {
    return {
      laneName,
      laneType,
      radiantHeroes,
      direHeroes,
      advantage: 'Radiant Favored',
      confidence: 72,
      tacticalTip: `Allies have drafted ${radiantHeroes.map((h) => h.name).join(' & ')}. Opponents have not picked their lane counter yet; Allies enjoy free-farm lane priority.`
    };
  }

  // Both sides have heroes! Calculate dynamic lane advantage:
  let radAdvantageScore = 0;
  let direAdvantageScore = 0;

  // 1. Direct counters between heroes in this exact lane
  radiantHeroes.forEach((rh) => {
    direHeroes.forEach((dh) => {
      if (rh.strongAgainst?.some((s) => s.heroId === dh.id)) radAdvantageScore += 22;
      if (dh.strongAgainst?.some((s) => s.heroId === rh.id)) direAdvantageScore += 22;
    });
  });

  // 2. Attack Range & Harass Advantage
  const radRangedCount = radiantHeroes.filter((h) => h.attackType === 'Ranged').length;
  const direRangedCount = direHeroes.filter((h) => h.attackType === 'Ranged').length;
  radAdvantageScore += radRangedCount * 8;
  direAdvantageScore += direRangedCount * 8;

  // 3. Early kill potential / disable pressure
  radiantHeroes.forEach((rh) => {
    const tags = getHeroTags(rh.id, rh.attribute, rh.roles);
    if (tags.includes('point_lockdown')) radAdvantageScore += 10;
    if (tags.includes('spell_burst')) radAdvantageScore += 8;
    if (tags.includes('save_sustain')) radAdvantageScore += 7;
  });

  direHeroes.forEach((dh) => {
    const tags = getHeroTags(dh.id, dh.attribute, dh.roles);
    if (tags.includes('point_lockdown')) direAdvantageScore += 10;
    if (tags.includes('spell_burst')) direAdvantageScore += 8;
    if (tags.includes('save_sustain')) direAdvantageScore += 7;
  });

  // 4. Win rate base weighting
  const radAvgWr = radiantHeroes.reduce((acc, h) => acc + h.winRate, 0) / radiantHeroes.length;
  const direAvgWr = direHeroes.reduce((acc, h) => acc + h.winRate, 0) / direHeroes.length;
  radAdvantageScore += (radAvgWr - 50) * 1.5;
  direAdvantageScore += (direAvgWr - 50) * 1.5;

  const netScore = radAdvantageScore - direAdvantageScore;
  let advantage: 'Radiant Favored' | 'Dire Favored' | 'Even' = 'Even';
  let confidence = 65;

  if (netScore >= 12) {
    advantage = 'Radiant Favored';
    confidence = Math.min(95, 70 + Math.round(netScore * 0.7));
  } else if (netScore <= -12) {
    advantage = 'Dire Favored';
    confidence = Math.min(95, 70 + Math.round(Math.abs(netScore) * 0.7));
  } else {
    advantage = 'Even';
    confidence = 62;
  }

  // Dynamic contextual tactical tips
  let tacticalTip = '';
  const radNames = radiantHeroes.map((h) => h.name).join(' & ');
  const direNames = direHeroes.map((h) => h.name).join(' & ');

  if (laneType === 'Mid vs Mid') {
    const rh = radiantHeroes[0];
    const dh = direHeroes[0];
    if (advantage === 'Radiant Favored') {
      tacticalTip = `${rh.name} holds clear matchup advantage over ${dh.name}. Harass aggressively during wave resets, shove the mid wave at min 5:40, and secure power rune control.`;
    } else if (advantage === 'Dire Favored') {
      tacticalTip = `${dh.name} exerts superior wave pressure on ${rh.name}. Pull creep aggro to own highground, stack medium jungle camps, and request early support rotation for 6-min power rune.`;
    } else {
      tacticalTip = `${rh.name} vs ${dh.name} is a balanced, skill-intensive contest. Prioritize highground creep block and secure water runes at 2:00 and 4:00 to sustain bottle charges.`;
    }
  } else if (laneType === 'Radiant Safe vs Dire Off') {
    if (advantage === 'Radiant Favored') {
      tacticalTip = `Allies (${radNames}) control kill pressure against Dire (${direNames}). Maintain creep equilibrium near Radiant tower and punish aggressive offlane overextensions.`;
    } else if (advantage === 'Dire Favored') {
      tacticalTip = `Dire Offlane (${direNames}) pressures ${radiantHeroes[0]?.name || 'Radiant Carry'}. Pos 5 must unblock small pull camp, contest lotus pool at 3:00, and ferry additional healing supplies.`;
    } else {
      tacticalTip = `Even safe lane duel (${radNames} vs ${direNames}). Pull lane creeps at :15/:45 seconds to keep equilibrium outside tower range and trade carefully around creep aggro.`;
    }
  } else {
    if (advantage === 'Radiant Favored') {
      tacticalTip = `Radiant Offlane (${radNames}) pressures Dire carry (${direHeroes[0]?.name || 'Dire Carry'}). Harass last hits, block Dire small pull camp, and force their support to drain healing consumables.`;
    } else if (advantage === 'Dire Favored') {
      tacticalTip = `Dire Safe Lane (${direNames}) holds trade superiority. Radiant offlane should drag creep waves between tier 1 and tier 2 towers to disrupt enemy creep freeze.`;
    } else {
      tacticalTip = `Balanced offlane contest (${radNames} vs ${direNames}). Contest lotus pool at minute 3:00 and execute coordinated trades when enemy support steps away to pull.`;
    }
  }

  return {
    laneName,
    laneType,
    radiantHeroes,
    direHeroes,
    advantage,
    confidence,
    tacticalTip
  };
}

/**
 * 5. Computes Draft Advantage %, Power Spike timeline, and lane forecasts.
 */
export function calculateAdvantageAndWinConditions(
  radiantPicks: HeroData[],
  direPicks: HeroData[],
  radiantSlots?: (string | null)[],
  direSlots?: (string | null)[]
): {
  radiantScore: number;
  direScore: number;
  earlyAdvantage: 'Radiant' | 'Dire' | 'Even';
  midAdvantage: 'Radiant' | 'Dire' | 'Even';
  lateAdvantage: 'Radiant' | 'Dire' | 'Even';
  laneForecasts: LaneMatchupForecast[];
  teamfightScores: {
    radiant: { cc: number; burst: number; push: number; sustain: number; scaling: number };
    dire: { cc: number; burst: number; push: number; sustain: number; scaling: number };
  };
  winConditions: { radiant: string[]; dire: string[] };
} {
  const getTeamStats = (heroes: HeroData[]) => {
    let cc = 0;
    let burst = 0;
    let push = 0;
    let sustain = 0;
    let scaling = 0;

    heroes.forEach((h) => {
      const tags = getHeroTags(h.id, h.attribute, h.roles);
      if (tags.includes('point_lockdown') || tags.includes('big_aoe_ult') || tags.includes('teamfight')) cc += 20;
      if (tags.includes('spell_burst') || tags.includes('gank')) burst += 20;
      if (tags.includes('push')) push += 20;
      if (tags.includes('save_sustain')) sustain += 20;
      if (tags.includes('late_carry') || tags.includes('illusion')) scaling += 22;
    });

    return {
      cc: Math.min(100, cc + 15),
      burst: Math.min(100, burst + 20),
      push: Math.min(100, push + 15),
      sustain: Math.min(100, sustain + 10),
      scaling: Math.min(100, scaling + 25)
    };
  };

  const radiantStats = getTeamStats(radiantPicks);
  const direStats = getTeamStats(direPicks);

  // Counter matrix scoring
  let radiantAdvantagePoints = 0;
  let direAdvantagePoints = 0;

  radiantPicks.forEach((rp) => {
    direPicks.forEach((dp) => {
      if (rp.strongAgainst?.some((s) => s.heroId === dp.id)) radiantAdvantagePoints += 15;
      if (dp.strongAgainst?.some((s) => s.heroId === rp.id)) direAdvantagePoints += 15;
    });
  });

  const baseRad = 50 + (radiantAdvantagePoints - direAdvantagePoints) + (radiantPicks.length - direPicks.length) * 2;
  const clampedRad = Math.min(85, Math.max(15, baseRad));
  const radiantScore = clampedRad;
  const direScore = 100 - clampedRad;

  // Power Spike Timelines
  const earlyAdvantage = (radiantStats.burst + radiantStats.cc > direStats.burst + direStats.cc + 10)
    ? 'Radiant'
    : (direStats.burst + direStats.cc > radiantStats.burst + radiantStats.cc + 10 ? 'Dire' : 'Even');

  const midAdvantage = (radiantStats.push + radiantStats.burst > direStats.push + direStats.burst + 10)
    ? 'Radiant'
    : (direStats.push + direStats.burst > radiantStats.push + radiantStats.burst + 10 ? 'Dire' : 'Even');

  const lateAdvantage = (radiantStats.scaling > direStats.scaling + 8)
    ? 'Radiant'
    : (direStats.scaling > radiantStats.scaling + 8 ? 'Dire' : 'Even');

  // Lane Forecasts (dedicated positions: Safe = Pos 1 & 5, Mid = Pos 2, Offlane = Pos 3 & 4)
  const radSafeHeroes = radiantSlots
    ? [radiantSlots[0], radiantSlots[4]].map((id) => (id ? HERO_MAP.get(id) : null)).filter((h): h is HeroData => Boolean(h))
    : radiantPicks.slice(0, 2);
  const direOffHeroes = direSlots
    ? [direSlots[2], direSlots[3]].map((id) => (id ? HERO_MAP.get(id) : null)).filter((h): h is HeroData => Boolean(h))
    : direPicks.slice(2, 4);

  const radMidHero = radiantSlots && radiantSlots[1] ? HERO_MAP.get(radiantSlots[1]) : (radiantPicks[1] || null);
  const direMidHero = direSlots && direSlots[1] ? HERO_MAP.get(direSlots[1]) : (direPicks[1] || null);

  const radOffHeroes = radiantSlots
    ? [radiantSlots[2], radiantSlots[3]].map((id) => (id ? HERO_MAP.get(id) : null)).filter((h): h is HeroData => Boolean(h))
    : radiantPicks.slice(2, 4);
  const direSafeHeroes = direSlots
    ? [direSlots[0], direSlots[4]].map((id) => (id ? HERO_MAP.get(id) : null)).filter((h): h is HeroData => Boolean(h))
    : direPicks.slice(0, 2);

  const laneForecasts: LaneMatchupForecast[] = [
    evaluateLaneMatchup(
      'Radiant Safe Lane (Bottom) vs Dire Offlane (Top)',
      'Radiant Safe vs Dire Off',
      radSafeHeroes,
      direOffHeroes
    ),
    evaluateLaneMatchup(
      'Mid Lane Contest (Pos 2 vs Pos 2)',
      'Mid vs Mid',
      radMidHero ? [radMidHero] : [],
      direMidHero ? [direMidHero] : []
    ),
    evaluateLaneMatchup(
      'Radiant Offlane (Top) vs Dire Safe Lane (Bottom)',
      'Radiant Off vs Dire Safe',
      radOffHeroes,
      direSafeHeroes
    )
  ];

  // Win Conditions
  const winConditions = {
    radiant: [
      radiantStats.push > 50
        ? 'Utilize early tower pressure to constrict Dire jungle farm before min 20.'
        : 'Stack ancient camps and secure 15-minute core item timings.',
      radiantStats.cc > 50
        ? 'Chain crowd control disables on Dire’s highest damage carry before they trigger BKB.'
        : 'Bait Dire initiation with durable frontline and counter-engage.',
      'Control Tormentor at minute 20 and secure Aegis of the Immortal before highground breach.'
    ],
    dire: [
      direStats.scaling > 50
        ? 'Stall match past 35 minutes; Dire’s late-game scaling favors prolonged teamfights.'
        : 'Force 5-man deathball brawls around Roshan pit with big cooldowns.',
      'Target Radiant squishy backline supports (Lion / Witch Doctor) before they cast defensive saves.',
      'Punish Radiant overextensions with instant smoke rotations and pickoffs.'
    ]
  };

  return {
    radiantScore,
    direScore,
    earlyAdvantage,
    midAdvantage,
    lateAdvantage,
    laneForecasts,
    teamfightScores: {
      radiant: radiantStats,
      dire: direStats
    },
    winConditions
  };
}

/**
 * 6. Master function combining all predictive draft components into a single coherent state.
 */
export function runPredictive5v5Analysis(
  radiantHeroIds: (string | null)[],
  direHeroIds: (string | null)[],
  radiantBanIds: string[],
  direBanIds: string[]
): Predictive5v5Analysis {
  const radiantPicks = radiantHeroIds.map((id) => id ? HERO_MAP.get(id) : null).filter((h): h is HeroData => Boolean(h));
  const direPicks = direHeroIds.map((id) => id ? HERO_MAP.get(id) : null).filter((h): h is HeroData => Boolean(h));
  const radiantBans = radiantBanIds.map((id) => HERO_MAP.get(id)).filter((h): h is HeroData => Boolean(h));
  const direBans = direBanIds.map((id) => HERO_MAP.get(id)).filter((h): h is HeroData => Boolean(h));
  const allBans = [...radiantBans, ...direBans];

  const banPredictions = predictEnemyIntentFromBans(radiantBans, direBans);
  const suggestedBans = suggestBans(radiantPicks, direPicks, radiantBans, direBans);
  const lineupPrediction = predictMissingLineup(direPicks, radiantPicks, direBans);
  const suggestedPicks = suggestPicks(radiantPicks, direPicks, allBans, 'all');

  const advantageData = calculateAdvantageAndWinConditions(radiantPicks, direPicks, radiantHeroIds, direHeroIds);

  return {
    radiantPicks,
    direPicks,
    radiantBans,
    direBans,
    allBans,
    banPredictions,
    suggestedBans,
    lineupPrediction,
    suggestedPicks,
    draftAdvantage: {
      radiantScore: advantageData.radiantScore,
      direScore: advantageData.direScore,
      earlyAdvantage: advantageData.earlyAdvantage,
      midAdvantage: advantageData.midAdvantage,
      lateAdvantage: advantageData.lateAdvantage
    },
    laneForecasts: advantageData.laneForecasts,
    teamfightScores: advantageData.teamfightScores,
    winConditions: advantageData.winConditions
  };
}
