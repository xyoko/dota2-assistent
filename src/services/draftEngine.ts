import { HEROES_DATA, HERO_MAP } from '../data/heroes';
import { DraftAnalysisResult } from '../types/counter';

export function analyzeDraft(enemyHeroIds: string[]): DraftAnalysisResult {
  const enemyHeroes = enemyHeroIds
    .map((id) => HERO_MAP.get(id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h));

  if (enemyHeroes.length === 0) {
    return {
      enemyHeroIds: [],
      threatScores: {
        magicDamage: 0,
        physicalDamage: 0,
        pureDamage: 0,
        crowdControl: 0,
        mobility: 0,
        healingSustain: 0,
        pushTower: 0,
        illusionSummons: 0
      },
      keyWeaknesses: [],
      mustHaveItems: [],
      recommendedHeroes: []
    };
  }

  // 1. Calculate Threat Scores
  let magicCount = 0;
  let physCount = 0;
  let ccCount = 0;
  let mobilityCount = 0;
  let healCount = 0;
  let pushCount = 0;
  let illusionCount = 0;

  enemyHeroes.forEach((hero) => {
    if (hero.attribute === 'int' || hero.id === 'invoker' || hero.id === 'zeus' || hero.id === 'lina') magicCount += 25;
    if (hero.roles.includes('Carry') || hero.id === 'phantom_assassin' || hero.id === 'sven' || hero.id === 'drow_ranger') physCount += 25;
    if (hero.id === 'lion' || hero.id === 'axe' || hero.id === 'faceless_void' || hero.id === 'witch_doctor' || hero.id === 'legion_commander') ccCount += 25;
    if (hero.id === 'storm_spirit' || hero.id === 'anti_mage' || hero.id === 'windranger' || hero.id === 'faceless_void') mobilityCount += 25;
    if (hero.id === 'witch_doctor' || hero.id === 'juggernaut' || hero.id === 'bristleback' || hero.id === 'necrophos' || hero.id === 'huskar') healCount += 25;
    if (hero.id === 'drow_ranger' || hero.id === 'sven' || hero.id === 'juggernaut' || hero.id === 'invoker') pushCount += 20;
    if (hero.id === 'phantom_lancer' || hero.id === 'chaos_knight' || hero.id === 'terrorblade') illusionCount += 35;
  });

  const threatScores = {
    magicDamage: Math.min(100, magicCount + 10),
    physicalDamage: Math.min(100, physCount + 15),
    pureDamage: enemyHeroes.some((h) => ['axe', 'witch_doctor', 'invoker', 'pudge'].includes(h.id)) ? 75 : 20,
    crowdControl: Math.min(100, ccCount + 10),
    mobility: Math.min(100, mobilityCount + 10),
    healingSustain: Math.min(100, healCount + 5),
    pushTower: Math.min(100, pushCount + 15),
    illusionSummons: Math.min(100, illusionCount)
  };

  // 2. Identify Must-Have Counter Items
  const mustHaveItems: DraftAnalysisResult['mustHaveItems'] = [];

  // Check for Evasion (PA / Windranger)
  const evasionEnemies = enemyHeroes.filter((h) => ['phantom_assassin', 'windranger'].includes(h.id));
  if (evasionEnemies.length > 0) {
    mustHaveItems.push({
      item: 'Monkey King Bar (MKB) / Bloodthorn',
      cost: 4975,
      targets: evasionEnemies.map((e) => e.name),
      priority: 'CRITICAL',
      reason: 'Bypasses Blur & Windrun 50-100% physical evasion with True Strike.'
    });
  }

  // Check for Passives (Bristleback / PA / Spectre)
  const passiveEnemies = enemyHeroes.filter((h) => ['bristleback', 'phantom_assassin', 'spectre', 'huskar', 'viper'].includes(h.id));
  if (passiveEnemies.length > 0) {
    mustHaveItems.push({
      item: 'Silver Edge (Break)',
      cost: 5450,
      targets: passiveEnemies.map((e) => e.name),
      priority: 'CRITICAL',
      reason: 'Applies BREAK on attack to turn off Bristleback back-armor, PA crits/evasion, and passive passives.'
    });
  }

  // Check for High Regen / Healing
  const regenEnemies = enemyHeroes.filter((h) => ['bristleback', 'pudge', 'witch_doctor', 'juggernaut', 'necrophos', 'huskar', 'slark', 'morphling'].includes(h.id));
  if (regenEnemies.length > 0) {
    mustHaveItems.push({
      item: 'Spirit Vessel / Eye of Skadi',
      cost: 2980,
      targets: regenEnemies.map((e) => e.name),
      priority: 'HIGH',
      reason: 'Reduces healing, lifesteal, and HP regen by 40-45% while dealing percentage current HP burn.'
    });
  }

  // Check for Heavy Magic / CC
  if (threatScores.magicDamage >= 50 || threatScores.crowdControl >= 50) {
    mustHaveItems.push({
      item: 'Black King Bar (BKB)',
      cost: 4050,
      targets: enemyHeroes.map((e) => e.name),
      priority: 'CRITICAL',
      reason: 'Grants Debuff Immunity and 50% magic resist against enemy magical burst and disables.'
    });
  }

  // Check for Single-Target BKB Piercing Ultimates (Duel / Dismember)
  const pointTargetEnemies = enemyHeroes.filter((h) => ['legion_commander', 'pudge', 'lion', 'bane', 'doom'].includes(h.id));
  if (pointTargetEnemies.length > 0) {
    mustHaveItems.push({
      item: "Lotus Orb / Linken's Sphere",
      cost: 3850,
      targets: pointTargetEnemies.map((e) => e.name),
      priority: 'HIGH',
      reason: 'Blocks or reflects BKB-piercing targeted spells (Duel, Dismember, Finger of Death, Hex).'
    });
  }

  // Check for Physical Dive Carries
  const physicalDive = enemyHeroes.filter((h) => ['phantom_assassin', 'sven', 'juggernaut', 'ursa', 'drow_ranger'].includes(h.id));
  if (physicalDive.length > 0) {
    mustHaveItems.push({
      item: "Heaven's Halberd / Ghost Scepter",
      cost: 3550,
      targets: physicalDive.map((e) => e.name),
      priority: 'HIGH',
      reason: 'Disarms right-click physical carries for 3-5 seconds and grants physical damage immunity.'
    });
  }

  // Check for Slippery Mobile Casters
  const slipperyEnemies = enemyHeroes.filter((h) => ['storm_spirit', 'anti_mage', 'windranger', 'puck', 'weaver'].includes(h.id));
  if (slipperyEnemies.length > 0) {
    mustHaveItems.push({
      item: 'Scythe of Vyse / Orchid / Gleipnir',
      cost: 5675,
      targets: slipperyEnemies.map((e) => e.name),
      priority: 'HIGH',
      reason: 'Instant 0-cast point Hex or root to delete mobile heroes before they can blink/zip away.'
    });
  }

  // 3. Identify Team Weaknesses
  const keyWeaknesses: string[] = [];
  if (threatScores.crowdControl < 40) {
    keyWeaknesses.push('Low Hard Crowd Control: Weak to elusive split-pushers (Anti-Mage, Storm Spirit, Puck).');
  }
  if (threatScores.physicalDamage < 40) {
    keyWeaknesses.push('Pure / Heavy Magic Dependent: Enemy team will be hard-countered once your team buys BKBs and Pipe.');
  }
  if (threatScores.magicDamage < 40) {
    keyWeaknesses.push('Heavy Physical Focus: Stacking armor (Assault Cuirass, Shiva’s) and Halberd will neutralize them.');
  }
  if (!enemyHeroes.some((h) => h.roles.includes('Hard Support') || h.roles.includes('Soft Support'))) {
    keyWeaknesses.push('Greedy Lineup: Highly vulnerable to early aggression, fast deathballs, and tower pushes.');
  }
  if (enemyHeroes.some((h) => ['phantom_assassin', 'bristleback'].includes(h.id))) {
    keyWeaknesses.push('Passive Dependent: Rushing Silver Edge removes their core survivability and DPS.');
  }
  if (enemyHeroes.some((h) => ['phantom_assassin', 'windranger'].includes(h.id))) {
    keyWeaknesses.push('Evasion Reliant: Purchasing Monkey King Bar (MKB) eliminates their main defense.');
  }
  if (keyWeaknesses.length === 0) {
    keyWeaknesses.push('Balanced enemy draft: Focus on winning lane timings and itemizing against key carry power spikes.');
  }

  // 4. Calculate Hero Counter Scores
  const heroScores: { heroId: string; role: string; score: number; reasons: string[] }[] = [];

  HEROES_DATA.forEach((candidate) => {
    if (enemyHeroIds.includes(candidate.id)) return; // Don't pick enemy hero

    let score = 50;
    const reasons: string[] = [];

    // Check if candidate is directly listed as strongAgainst any enemy
    candidate.strongAgainst.forEach((m) => {
      if (enemyHeroIds.includes(m.heroId)) {
        score += 25;
        reasons.push(`Strong against ${m.heroName}: ${m.reason}`);
      }
    });

    // Check if any enemy is weakAgainst candidate
    enemyHeroes.forEach((enemy) => {
      const match = enemy.weakAgainst.find((w) => w.heroId === candidate.id);
      if (match) {
        score += 25;
        if (!reasons.some((r) => r.includes(enemy.name))) {
          reasons.push(`Hard counters ${enemy.name}: ${match.reason}`);
        }
      }
    });

    // Penalize if candidate is weak against enemy heroes
    candidate.weakAgainst.forEach((w) => {
      if (enemyHeroIds.includes(w.heroId)) {
        score -= 20;
      }
    });

    // Bonus for specific draft counters
    if (threatScores.magicDamage >= 60 && candidate.id === 'anti_mage') {
      score += 20;
      reasons.push('Counterspell and Mana Void devastate this magic-heavy enemy lineup.');
    }
    if (threatScores.physicalDamage >= 60 && candidate.id === 'axe') {
      score += 20;
      reasons.push('High armor and Counter Helix punish enemy right-click heavy team.');
    }
    if (threatScores.mobility >= 50 && candidate.id === 'lion') {
      score += 15;
      reasons.push('Instant zero-cast point Hex locks down enemy elusive heroes.');
    }
    if (enemyHeroes.some((h) => h.id === 'drow_ranger' || h.id === 'sniper') && candidate.id === 'phantom_assassin') {
      score += 15;
      reasons.push('Phantom Strike closes the gap on squishy backline snipers.');
    }

    if (score > 55 || reasons.length > 0) {
      heroScores.push({
        heroId: candidate.id,
        role: candidate.roles[0] || 'Core',
        score: Math.min(99, Math.max(20, score)),
        reasons: reasons.slice(0, 3)
      });
    }
  });

  heroScores.sort((a, b) => b.score - a.score);

  return {
    enemyHeroIds,
    threatScores,
    keyWeaknesses,
    mustHaveItems,
    recommendedHeroes: heroScores.slice(0, 10)
  };
}
