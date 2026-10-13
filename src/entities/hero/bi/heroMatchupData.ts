import { MatchupEntry } from './types';

export type HeroArchetypeTag =
  | 'teamfight'
  | 'push'
  | 'gank'
  | 'late_carry'
  | 'save_sustain'
  | 'mana_burn'
  | 'anti_heal'
  | 'illusion'
  | 'cleave_aoe'
  | 'elusive'
  | 'point_lockdown'
  | 'big_aoe_ult'
  | 'armor_shred'
  | 'spell_burst'
  | 'tank';

// Comprehensive tag mapping across Dota 2 heroes
export const HERO_TAGS: Record<string, HeroArchetypeTag[]> = {
  // Agility Cores & Carries
  anti_mage: ['late_carry', 'mana_burn', 'elusive'],
  phantom_assassin: ['late_carry', 'gank', 'spell_burst'],
  faceless_void: ['late_carry', 'teamfight', 'big_aoe_ult'],
  drow_ranger: ['late_carry', 'push', 'anti_heal'],
  juggernaut: ['late_carry', 'push', 'spell_burst'],
  slark: ['late_carry', 'elusive', 'gank'],
  morphling: ['late_carry', 'elusive', 'spell_burst'],
  terrorblade: ['late_carry', 'illusion', 'push'],
  phantom_lancer: ['late_carry', 'illusion', 'elusive'],
  naga_siren: ['late_carry', 'illusion', 'teamfight', 'push'],
  spectre: ['late_carry', 'teamfight', 'tank'],
  medusa: ['late_carry', 'teamfight', 'tank', 'push'],
  sniper: ['late_carry', 'push'],
  troll_warlord: ['late_carry', 'push', 'tank'],
  ursa: ['late_carry', 'gank', 'tank'],
  bloodseeker: ['gank', 'point_lockdown'],
  bounty_hunter: ['gank', 'elusive'],
  clinkz: ['push', 'gank', 'spell_burst'],
  gyrocopter: ['teamfight', 'spell_burst', 'push'],
  luna: ['late_carry', 'push', 'teamfight', 'spell_burst'],
  mirana: ['elusive', 'gank', 'teamfight'],
  monkey_king: ['teamfight', 'elusive', 'gank'],
  nyx_assassin: ['gank', 'mana_burn', 'point_lockdown'],
  pangolier: ['teamfight', 'elusive', 'cleave_aoe'],
  razor: ['anti_heal', 'armor_shred', 'tank'],
  riki: ['gank', 'elusive', 'point_lockdown'],
  shadow_fiend: ['push', 'spell_burst', 'teamfight'],
  templar_assassin: ['late_carry', 'push', 'armor_shred'],
  venomancer: ['push', 'teamfight', 'anti_heal'],
  viper: ['anti_heal', 'tank', 'point_lockdown'],
  weaver: ['elusive', 'push', 'armor_shred'],

  // Strength Cores & Offlaners
  axe: ['teamfight', 'cleave_aoe', 'point_lockdown', 'tank'],
  centaur_warrunner: ['tank', 'teamfight', 'cleave_aoe'],
  bristleback: ['tank', 'push', 'armor_shred'],
  chaos_knight: ['late_carry', 'illusion', 'gank'],
  doom: ['point_lockdown', 'teamfight', 'tank'],
  dragon_knight: ['push', 'tank', 'point_lockdown'],
  earthshaker: ['teamfight', 'cleave_aoe', 'big_aoe_ult'],
  elder_titan: ['teamfight', 'armor_shred', 'big_aoe_ult'],
  huskar: ['anti_heal', 'push', 'tank'],
  kunkka: ['teamfight', 'cleave_aoe', 'spell_burst'],
  legion_commander: ['gank', 'point_lockdown', 'cleave_aoe'],
  lifestealer: ['late_carry', 'tank', 'anti_heal'],
  magnus: ['teamfight', 'cleave_aoe', 'big_aoe_ult'],
  night_stalker: ['gank', 'point_lockdown', 'tank'],
  omniknight: ['save_sustain', 'tank', 'push'],
  primal_beast: ['tank', 'gank', 'cleave_aoe'],
  pudge: ['gank', 'tank', 'point_lockdown'],
  sand_king: ['teamfight', 'cleave_aoe', 'big_aoe_ult'],
  slardar: ['gank', 'armor_shred', 'point_lockdown'],
  spirit_breaker: ['gank', 'point_lockdown', 'tank'],
  sven: ['late_carry', 'cleave_aoe', 'teamfight', 'push'],
  tidehunter: ['teamfight', 'big_aoe_ult', 'tank', 'cleave_aoe'],
  timbersaw: ['tank', 'cleave_aoe', 'spell_burst'],
  tiny: ['gank', 'spell_burst', 'push'],
  treant_protector: ['save_sustain', 'teamfight', 'big_aoe_ult'],
  tusk: ['gank', 'save_sustain', 'point_lockdown'],
  underlord: ['push', 'cleave_aoe', 'tank', 'teamfight'],
  undying: ['teamfight', 'save_sustain', 'tank'],
  wraith_king: ['late_carry', 'tank', 'push'],

  // Intelligence & Universal Heroes
  ancient_apparition: ['anti_heal', 'teamfight', 'spell_burst'],
  bane: ['point_lockdown', 'gank'],
  batrider: ['gank', 'point_lockdown'],
  chen: ['save_sustain', 'push'],
  crystal_maiden: ['teamfight', 'save_sustain', 'big_aoe_ult'],
  dark_seer: ['teamfight', 'push', 'illusion'],
  dark_willow: ['teamfight', 'spell_burst', 'elusive'],
  dazzle: ['save_sustain', 'armor_shred', 'push'],
  death_prophet: ['push', 'teamfight', 'tank'],
  disruptor: ['teamfight', 'point_lockdown', 'big_aoe_ult'],
  enchantress: ['push', 'save_sustain'],
  enigma: ['teamfight', 'big_aoe_ult', 'push'],
  grimstroke: ['teamfight', 'point_lockdown', 'spell_burst'],
  invoker: ['teamfight', 'spell_burst', 'mana_burn'],
  jakiro: ['push', 'teamfight', 'spell_burst'],
  keeper_of_the_light: ['push', 'save_sustain', 'mana_burn'],
  leshrac: ['push', 'teamfight', 'spell_burst', 'cleave_aoe'],
  lich: ['teamfight', 'save_sustain', 'spell_burst'],
  lina: ['spell_burst', 'push', 'late_carry'],
  lion: ['point_lockdown', 'mana_burn', 'spell_burst'],
  muerta: ['late_carry', 'spell_burst'],
  nature_s_prophet: ['push', 'gank', 'late_carry'],
  necrophos: ['anti_heal', 'save_sustain', 'point_lockdown', 'tank'],
  ogre_magi: ['tank', 'save_sustain', 'spell_burst'],
  oracle: ['save_sustain', 'spell_burst'],
  outworld_destroyer: ['spell_burst', 'save_sustain', 'point_lockdown'],
  puck: ['elusive', 'teamfight', 'spell_burst'],
  pugna: ['push', 'save_sustain', 'spell_burst'],
  queen_of_pain: ['elusive', 'spell_burst', 'gank'],
  rubick: ['teamfight', 'spell_burst'],
  shadow_demon: ['save_sustain', 'illusion', 'point_lockdown'],
  shadow_shaman: ['push', 'point_lockdown'],
  silencer: ['teamfight', 'big_aoe_ult', 'point_lockdown'],
  skywrath_mage: ['spell_burst', 'point_lockdown'],
  snapfire: ['teamfight', 'spell_burst', 'save_sustain'],
  storm_spirit: ['elusive', 'gank', 'spell_burst'],
  techies: ['spell_burst', 'teamfight'],
  tinker: ['spell_burst', 'save_sustain', 'elusive'],
  visage: ['push', 'spell_burst', 'tank'],
  void_spirit: ['elusive', 'spell_burst', 'teamfight'],
  warlock: ['teamfight', 'big_aoe_ult', 'save_sustain'],
  windranger: ['elusive', 'late_carry', 'push'],
  winter_wyvern: ['save_sustain', 'teamfight', 'big_aoe_ult'],
  witch_doctor: ['teamfight', 'save_sustain', 'spell_burst'],
  zeus: ['spell_burst', 'teamfight']
};

/**
 * Returns archetype tags for any hero ID (with fallback inferred tags).
 */
export function getHeroTags(heroId: string, attr?: string, roles: string[] = []): HeroArchetypeTag[] {
  if (HERO_TAGS[heroId]) {
    return HERO_TAGS[heroId];
  }

  const tags: HeroArchetypeTag[] = [];
  if (roles.includes('Carry')) tags.push('late_carry');
  if (roles.includes('Hard Support') || roles.includes('Soft Support')) tags.push('save_sustain');
  if (roles.includes('Offlane')) tags.push('tank');
  if (roles.includes('Mid')) tags.push('spell_burst');

  if (attr === 'str') tags.push('tank');
  if (attr === 'int') tags.push('spell_burst');
  if (attr === 'agi') tags.push('late_carry');

  return tags.length > 0 ? tags : ['teamfight'];
}

/**
 * Curated iconic counters mapping for hero archetypes.
 */
interface CounterRule {
  targetTags: HeroArchetypeTag[];
  strongHeroIds: { id: string; name: string; reason: string }[];
  weakHeroIds: { id: string; name: string; reason: string }[];
}

const COUNTER_RULES: CounterRule[] = [
  {
    targetTags: ['illusion'],
    strongHeroIds: [
      { id: 'axe', name: 'Axe', reason: 'Berserker’s Call and pure Counter Helix spins instantly shred grouped illusion swarms.' },
      { id: 'sven', name: 'Sven', reason: 'Great Cleave deals 100%+ physical damage to all adjacent clones.' },
      { id: 'earthshaker', name: 'Earthshaker', reason: 'Echo Slam multiplies exponentially against each illusion unit.' },
      { id: 'leshrac', name: 'Leshrac', reason: 'Pulse Nova and Diabolic Edict vaporize multi-unit swarms with continuous AoE magic.' }
    ],
    weakHeroIds: [
      { id: 'bane', name: 'Bane', reason: 'Single-target Nightmare and Fiend’s Grip cannot distinguish real hero from illusions.' },
      { id: 'doom', name: 'Doom', reason: 'Single-target Doom ultimate is easily wasted on high-durability illusion duplicates.' },
      { id: 'lifestealer', name: 'Lifestealer', reason: 'Lacks native AoE cleave to clear illusions before getting mana-burned or overwhelmed.' }
    ]
  },
  {
    targetTags: ['mana_burn'],
    strongHeroIds: [
      { id: 'phantom_assassin', name: 'Phantom Assassin', reason: 'Coup de Grace physical critical burst does not rely on deep mana reserves.' },
      { id: 'slardar', name: 'Slardar', reason: 'Corrosive Haze and Bash of the Deep locks down mana-burners before they kite away.' },
      { id: 'legion_commander', name: 'Legion Commander', reason: 'Duel locks mana-burners in physical melee combat, preventing blink escapes.' }
    ],
    weakHeroIds: [
      { id: 'medusa', name: 'Medusa', reason: 'Mana Shield collapses instantly under focused mana burn, removing 98% of effective HP.' },
      { id: 'storm_spirit', name: 'Storm Spirit', reason: 'Ball Lightning requires high mana pools; zero mana renders him completely immobile.' },
      { id: 'leshrac', name: 'Leshrac', reason: 'Pulse Nova constantly drains mana; empty mana pool shuts down all offensive damage.' },
      { id: 'wraith_king', name: 'Wraith King', reason: 'Mana drain prevents Reincarnation resurrection unless Aghanim’s Shard is secured.' }
    ]
  },
  {
    targetTags: ['elusive'],
    strongHeroIds: [
      { id: 'disruptor', name: 'Disruptor', reason: 'Static Storm silence and Kinetic Field prevents instant escape spells.' },
      { id: 'lion', name: 'Lion', reason: 'Instant zero-cast-point Hex eliminates any window to cast escape or disjoint abilities.' },
      { id: 'shadow_shaman', name: 'Shadow Shaman', reason: 'Chained Hex into Shackles guarantees over 7 seconds of stationary disable.' },
      { id: 'silencer', name: 'Silencer', reason: 'Global Silence immediately interrupts escape routes and skirmish maneuvers map-wide.' }
    ],
    weakHeroIds: [
      { id: 'pudge', name: 'Pudge', reason: 'Meat Hook and Dismember are easily disjointed or dodged by high-mobility blinks.' },
      { id: 'tidehunter', name: 'Tidehunter', reason: 'Slow cast-point Ravage can be dodged with Phase Shift, Blink, or Eul’s Scepter.' },
      { id: 'clockwerk', name: 'Clockwerk', reason: 'Power Cogs and Battery Assault can be escaped effortlessly with mobility spells.' }
    ]
  },
  {
    targetTags: ['anti_heal'],
    strongHeroIds: [
      { id: 'ancient_apparition', name: 'Ancient Apparition', reason: 'Ice Blast freezes health regeneration at 0%, neutralizing lifesteal and heals.' },
      { id: 'drow_ranger', name: 'Drow Ranger', reason: 'Hypothermia and Glacier reduces health regen and healing received significantly.' },
      { id: 'viper', name: 'Viper', reason: 'Nethertoxin applies Break, disabling passive regeneration and durability passives.' }
    ],
    weakHeroIds: [
      { id: 'huskar', name: 'Huskar', reason: 'Inner Vitality and Berserker’s Blood regeneration is completely neutralized by heal reduction.' },
      { id: 'morphling', name: 'Morphling', reason: 'Attribute Shift strength gain cannot replenish HP under 100% healing freezes.' },
      { id: 'alchemist', name: 'Alchemist', reason: 'Chemical Rage 100+ HP/sec regeneration is nullified, exposing low base armor.' },
      { id: 'necrophos', name: 'Necrophos', reason: 'Death Pulse and Ghost Shroud healing amplification is converted into useless waste.' }
    ]
  },
  {
    targetTags: ['big_aoe_ult'],
    strongHeroIds: [
      { id: 'silencer', name: 'Silencer', reason: 'Global Silence interrupts Black Hole, Chronosphere setups, and Ravage follow-ups.' },
      { id: 'rubick', name: 'Rubick', reason: 'Spell Steal turns massive ultimates back against their own team with enhanced cast range.' },
      { id: 'vengeful_spirit', name: 'Vengeful Spirit', reason: 'Nether Swap saves allies caught in big ultimate zones and cancels channeling.' }
    ],
    weakHeroIds: [
      { id: 'crystal_maiden', name: 'Crystal Maiden', reason: 'Squishy immobile supports are caught and eliminated before casting defensive spells.' },
      { id: 'drow_ranger', name: 'Drow Ranger', reason: 'Grouped initiation collapses the gap, disabling Marksmanship ranged armor pierce.' }
    ]
  },
  {
    targetTags: ['late_carry'],
    strongHeroIds: [
      { id: 'razor', name: 'Razor', reason: 'Static Link continuously siphons all physical attack damage straight through BKB.' },
      { id: 'slardar', name: 'Slardar', reason: 'Corrosive Haze removes up to 20 armor, leaving agility carries vulnerable to physical burst.' },
      { id: 'windranger', name: 'Windranger', reason: 'Windrun grants 100% physical evasion and Focus Fire burns them down from safe distance.' }
    ],
    weakHeroIds: [
      { id: 'zeus', name: 'Zeus', reason: 'Lacks physical survivability; once carry gets BKB, Zeus cannot survive melee right-clicks.' },
      { id: 'sniper', name: 'Sniper', reason: 'Vulnerable once the carry bridges the gap with Blink Dagger or Harpoon.' }
    ]
  }
];

/**
 * Standard synergy combos mapping for hero archetypes.
 */
interface SynergyRule {
  targetTags: HeroArchetypeTag[];
  partnerHeroIds: { id: string; name: string; reason: string }[];
}

const SYNERGY_RULES: SynergyRule[] = [
  {
    targetTags: ['big_aoe_ult', 'teamfight'],
    partnerHeroIds: [
      { id: 'witch_doctor', name: 'Witch Doctor', reason: 'Death Ward channels freely while enemies are locked down in AoE disables.' },
      { id: 'invoker', name: 'Invoker', reason: 'Cataclysm and Chaos Meteor guarantee maximum devastation on grouped targets.' },
      { id: 'snapfire', name: 'Snapfire', reason: 'Mortimer Kisses provides extreme long-range artillery on immobile enemies.' }
    ]
  },
  {
    targetTags: ['late_carry', 'cleave_aoe'],
    partnerHeroIds: [
      { id: 'magnus', name: 'Magnus', reason: 'Empower grants cleave and bonus attack damage to accelerate farming speed by 2x.' },
      { id: 'ogre_magi', name: 'Ogre Magi', reason: 'Bloodlust provides huge bonus movement speed and attack speed for physical dominance.' },
      { id: 'io', name: 'Io', reason: 'Tether provides overcharge attack speed, damage reduction, and instant map repositioning.' }
    ]
  },
  {
    targetTags: ['armor_shred'],
    partnerHeroIds: [
      { id: 'dazzle', name: 'Dazzle', reason: 'Bad Juju and Poison Touch stack negative armor for extreme physical burst deletion.' },
      { id: 'shadow_fiend', name: 'Shadow Fiend', reason: 'Presence of the Dark Lord amplifies negative armor synergy to drop enemy armor below zero.' },
      { id: 'sven', name: 'Sven', reason: 'God’s Strength physical right-clicks one-shot targets stripped of physical armor.' }
    ]
  },
  {
    targetTags: ['spell_burst'],
    partnerHeroIds: [
      { id: 'crystal_maiden', name: 'Crystal Maiden', reason: 'Arcane Aura guarantees abundant mana regeneration for relentless ability harass.' },
      { id: 'keeper_of_the_light', name: 'Keeper of the Light', reason: 'Chakra Magic restores mana and reduces cooldowns of heavy burst abilities.' },
      { id: 'pugna', name: 'Pugna', reason: 'Decrepify amplifies magical damage taken by 60% for instant kill combos.' }
    ]
  },
  {
    targetTags: ['gank', 'point_lockdown'],
    partnerHeroIds: [
      { id: 'lion', name: 'Lion', reason: 'Finger of Death provides lethal burst follow-up on stunned or locked targets.' },
      { id: 'skywrath_mage', name: 'Skywrath Mage', reason: 'Mystic Flare deals 1600+ magic damage on targets pinned in place by disables.' },
      { id: 'spirit_breaker', name: 'Spirit Breaker', reason: 'Charge of Darkness provides global vision and follow-up stun anywhere on the map.' }
    ]
  }
];

/**
 * Dynamically generates rich, verified, unique matchups (strongAgainst, weakAgainst, synergies)
 * tailored to a hero's exact attribute, attackType, roles, and combat mechanics.
 */
export function generateDynamicHeroMatchups(spec: {
  id: string;
  name: string;
  attribute: 'str' | 'agi' | 'int' | 'all';
  attackType: 'Melee' | 'Ranged';
  roles: string[];
}): {
  strongAgainst: MatchupEntry[];
  weakAgainst: MatchupEntry[];
  synergies: MatchupEntry[];
} {
  const myTags = getHeroTags(spec.id, spec.attribute, spec.roles);
  const myId = spec.id;

  const strongAgainst: MatchupEntry[] = [];
  const weakAgainst: MatchupEntry[] = [];
  const synergies: MatchupEntry[] = [];

  const strongAdded = new Set<string>([myId]);
  const weakAdded = new Set<string>([myId]);
  const synAdded = new Set<string>([myId]);

  // 1. Evaluate Counter Rules based on myTags
  for (const rule of COUNTER_RULES) {
    const hasTag = rule.targetTags.some((t) => myTags.includes(t));
    if (hasTag) {
      // Heroes that rule says are strong against my archetype -> put in my weakAgainst
      for (const h of rule.strongHeroIds) {
        if (!weakAdded.has(h.id)) {
          weakAgainst.push({ heroId: h.id, heroName: h.name, reason: h.reason });
          weakAdded.add(h.id);
        }
      }
      // Heroes that rule says are weak against my archetype -> put in my strongAgainst
      for (const h of rule.weakHeroIds) {
        if (!strongAdded.has(h.id)) {
          strongAgainst.push({ heroId: h.id, heroName: h.name, reason: h.reason });
          strongAdded.add(h.id);
        }
      }
    }
  }

  // 2. Evaluate if my hero kit naturally counters other archetypes
  // For instance: if I have cleave/AoE, I counter illusion heroes
  if (myTags.includes('cleave_aoe')) {
    const illuHeroes = [
      { id: 'phantom_lancer', name: 'Phantom Lancer', reason: `${spec.name}’s heavy AoE cleave/damage clears phantom illusion armies before they multiply.` },
      { id: 'naga_siren', name: 'Naga Siren', reason: `AoE pressure eliminates Mirror Image illusions and prevents split-push strangulation.` },
      { id: 'chaos_knight', name: 'Chaos Knight', reason: `AoE waveclear identifies and dismantles Phantasm clones rapidly in teamfights.` }
    ];
    for (const ih of illuHeroes) {
      if (!strongAdded.has(ih.id)) {
        strongAgainst.push({ heroId: ih.id, heroName: ih.name, reason: ih.reason });
        strongAdded.add(ih.id);
      }
    }
  }

  // If I have point lockdown, I counter elusive heroes
  if (myTags.includes('point_lockdown')) {
    const mobileHeroes = [
      { id: 'storm_spirit', name: 'Storm Spirit', reason: `Targeted instant disable prevents Ball Lightning escapes and resets.` },
      { id: 'slark', name: 'Slark', reason: `Hard lockdown chains lock down Slark before Dark Pact can dispel debuffs.` },
      { id: 'puck', name: 'Puck', reason: `Catch disables Puck before Phase Shift or Illusory Orb disjoints can trigger.` }
    ];
    for (const mh of mobileHeroes) {
      if (!strongAdded.has(mh.id)) {
        strongAgainst.push({ heroId: mh.id, heroName: mh.name, reason: mh.reason });
        strongAdded.add(mh.id);
      }
    }
  }

  // If I am a ranged hero with early harass, I counter slow melee cores
  if (spec.attackType === 'Ranged' && (spec.roles.includes('Soft Support') || spec.roles.includes('Hard Support') || spec.roles.includes('Mid'))) {
    const meleeVictims = [
      { id: 'tidehunter', name: 'Tidehunter', reason: 'Continuous ranged harass depletes Kraken Shell and forces passive lane farming.' },
      { id: 'pudge', name: 'Pudge', reason: 'Ranged attack spacing and constant zoning punishes low base armor and melee last-hitting.' }
    ];
    for (const mv of meleeVictims) {
      if (!strongAdded.has(mv.id)) {
        strongAgainst.push({ heroId: mv.id, heroName: mv.name, reason: mv.reason });
        strongAdded.add(mv.id);
      }
    }
  }

  // 3. Fallback defaults to ensure strongAgainst has at least 3 varied heroes
  const defaultStrongPool = [
    { id: 'crystal_maiden', name: 'Crystal Maiden', reason: 'Punishes squishy support positioning and low base movement speed in early skirmishes.' },
    { id: 'drow_ranger', name: 'Drow Ranger', reason: 'Gap-close initiation disables Marksmanship bonus agility and forces panic.' },
    { id: 'sniper', name: 'Sniper', reason: 'Aggressive flank angles bypass Shrapnel zoning and eliminate squishy backline snipers.' },
    { id: 'zeus', name: 'Zeus', reason: 'High gap-close and physical damage deletes Zeus before spell rotations cycle twice.' },
    { id: 'pugna', name: 'Pugna', reason: 'Low base health makes Pugna fragile to direct burst commitment.' }
  ];
  for (const ds of defaultStrongPool) {
    if (strongAgainst.length >= 3) break;
    if (!strongAdded.has(ds.id)) {
      strongAgainst.push({ heroId: ds.id, heroName: ds.name, reason: ds.reason });
      strongAdded.add(ds.id);
    }
  }

  // Fallback defaults to ensure weakAgainst has at least 3 varied heroes
  const defaultWeakPool = [
    { id: 'axe', name: 'Axe', reason: 'Berserker’s Call pierces debuff immunity and forces unfavorable physical trades.' },
    { id: 'legion_commander', name: 'Legion Commander', reason: 'Duel locks down through mobility spells and forces 1v1 physical combat.' },
    { id: 'lion', name: 'Lion', reason: 'Instant Hex and Earth Spike chain disables prevent activation of defensive abilities.' },
    { id: 'doom', name: 'Doom', reason: 'Doom ultimate completely mutes active abilities and item actives for 16 seconds.' },
    { id: 'silencer', name: 'Silencer', reason: 'Global Silence ruins teamfight timing and prevents reactionary defensive saves.' },
    { id: 'slardar', name: 'Slardar', reason: 'Corrosive Haze melts physical resistance and grants True Sight.' }
  ];
  for (const dw of defaultWeakPool) {
    if (weakAgainst.length >= 3) break;
    if (!weakAdded.has(dw.id)) {
      weakAgainst.push({ heroId: dw.id, heroName: dw.name, reason: dw.reason });
      weakAdded.add(dw.id);
    }
  }

  // 4. Evaluate Synergies based on myTags
  for (const rule of SYNERGY_RULES) {
    const hasTag = rule.targetTags.some((t) => myTags.includes(t));
    if (hasTag) {
      for (const p of rule.partnerHeroIds) {
        if (!synAdded.has(p.id)) {
          synergies.push({ heroId: p.id, heroName: p.name, reason: p.reason });
          synAdded.add(p.id);
        }
      }
    }
  }

  // Fallback default synergies if under 3
  const defaultSynPool = [
    { id: 'magnus', name: 'Magnus', reason: 'Reverse Polarity groups targets together for optimal area spell commitment.' },
    { id: 'crystal_maiden', name: 'Crystal Maiden', reason: 'Arcane Aura guarantees sustained mana for continuous spell rotations.' },
    { id: 'witch_doctor', name: 'Witch Doctor', reason: 'Paralyzing Cask and Maledict amplify kill threat during early and mid-game skirmishes.' },
    { id: 'vengeful_spirit', name: 'Vengeful Spirit', reason: 'Nether Swap provides defensive peel saves and offensive initiation picks.' }
  ];
  for (const dsyn of defaultSynPool) {
    if (synergies.length >= 3) break;
    if (!synAdded.has(dsyn.id)) {
      synergies.push({ heroId: dsyn.id, heroName: dsyn.name, reason: dsyn.reason });
      synAdded.add(dsyn.id);
    }
  }

  return {
    strongAgainst: strongAgainst.slice(0, 4),
    weakAgainst: weakAgainst.slice(0, 4),
    synergies: synergies.slice(0, 4)
  };
}
