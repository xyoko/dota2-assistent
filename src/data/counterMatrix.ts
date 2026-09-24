import { ThreatCategory } from '../types/counter';

export const COUNTER_MATRIX: ThreatCategory[] = [
  {
    id: 'invis',
    title: 'Invisibility & Shadow Blade',
    icon: 'EyeOff',
    description: 'Enemies who roam, initiate, or escape using natural invisibility or Shadow Blade / Silver Edge.',
    heroExamples: ['Riki', 'Clinkz', 'Bounty Hunter', 'Nyx Assassin', 'Weaver', 'Sand King', 'Treant Protector', 'Invoker (Ghost Walk)'],
    counterItems: [
      { name: 'Dust of Appearance', cost: 80, why: '1050 AoE reveal that also slows invisible units by 20%.' },
      { name: 'Sentry Ward', cost: 50, why: '1000 radius static true sight for vision control and lane de-warding.' },
      { name: 'Gem of True Sight', cost: 900, why: 'Permanent 900 true sight aura on carrier. Drops on death.' },
      { name: 'Gleipnir', cost: 5650, why: 'AOE root explicitly reveals invisible targets inside the radius.' }
    ],
    tacticalAdvice: [
      'Always have at least 1 hero carrying Dust into mid-game teamfights.',
      'Place defensive Sentries behind your carry while they farm lane or hitting towers.',
      'Group up early; invisible gankers thrive on solo isolated targets.',
      'Watch for enemy hero inventory upgrades (Shadow Blade timing at 13-16 mins).'
    ]
  },
  {
    id: 'passives',
    title: 'Strong Passive Abilities (Damage / Tank)',
    icon: 'ShieldAlert',
    description: 'Heroes whose survivability or damage is driven entirely by overpowered passive spells.',
    heroExamples: ['Bristleback (Bristleback + Warpath)', 'Spectre (Dispersion)', 'Phantom Assassin (Blur + Coup de Grace)', 'Huskar (Berserker Blood)', 'Viper (Corrosive Skin)', 'Tidehunter (Kraken Shell)', 'Centaur (Retaliate)'],
    counterItems: [
      { name: 'Silver Edge', cost: 5450, why: 'Attacking from Shadow Walk applies BREAK for 5.0 seconds, removing all passives.' },
      { name: 'Spirit Vessel', cost: 2980, why: 'Counters passive HP regen and lifesteal by 45%.' },
      { name: 'Eye of Skadi', cost: 5300, why: 'Cold Attack cuts passive regeneration and lifesteal by 40%.' }
    ],
    tacticalAdvice: [
      'Coordinate with your team: assign your carry or offlaner to rush Silver Edge as early as possible.',
      'Heroes like Viper (Nethertoxin), Hoodwink (Sharpshooter), and Doom (Aghs) have built-in Break mechanics.',
      'Do not chase Bristleback from behind; wait until Break is applied to focus him.'
    ]
  },
  {
    id: 'evasion',
    title: 'Evasion & Miss Chance',
    icon: 'Crosshair',
    description: 'Enemies who dodge physical attacks (natural evasion, Butterfly, or blinding abilities).',
    heroExamples: ['Phantom Assassin (Blur 50% evasion)', 'Windranger (100% physical evasion in Windrun)', 'Troll Warlord (Whirling Axes blind)', 'Brewmaster (Drunken Brawler)', 'Butterfly Carriers (Terrorblade, Naga, AM)'],
    counterItems: [
      { name: 'Monkey King Bar (MKB)', cost: 4975, why: 'Grants 80% True Strike to ignore evasion completely + 70 bonus magic/pure damage.' },
      { name: 'Bloodthorn', cost: 6800, why: 'Soul Rend guarantees 100% True Strike for all attackers hitting the silenced target.' },
      { name: 'Nullifier', cost: 4375, why: 'Continuously dispels Windranger’s Windrun.' },
      { name: 'Scythe of Vyse', cost: 5675, why: 'Hex disables all evasion passively during the 2.8s duration.' }
    ],
    tacticalAdvice: [
      'Physical right-clickers must adapt their item build order to buy MKB right after their first major mobility/farming item.',
      'Spellcasters deal full magical/pure damage ignoring evasion entirely (Lina, Zeus, Lion).'
    ]
  },
  {
    id: 'high_regen',
    title: 'Extreme Healing, Lifesteal & High HP',
    icon: 'HeartPulse',
    description: 'Heroes with rapid health regeneration, burst heals, or extreme lifesteal that make them nearly unkillable.',
    heroExamples: ['Huskar (Inner Fire/Berserker)', 'Necrophos (Heartstopper/Sadist)', 'Morphling (Attribute Shift)', 'Alchemist (Chemical Rage)', 'Slark (Shadow Dance)', 'Abaddon (Borrowed Time)', 'Pudge (Flesh Heap)'],
    counterItems: [
      { name: 'Spirit Vessel', cost: 2980, why: 'Soul Release cuts healing by 45% and burns 4% current HP per second.' },
      { name: 'Eye of Skadi', cost: 5300, why: 'Reduces healing/lifesteal by 40% on attack and pierces BKB.' },
      { name: 'Shiva’s Guard', cost: 5175, why: 'Freezing Aura reduces enemy healing and lifesteal in AoE by 25%.' },
      { name: 'Ancient Apparition (Hero Counter)', cost: 0, why: 'Ice Blast completely freezes health: 100% healing reduction + shatter threshold.' }
    ],
    tacticalAdvice: [
      'Buy Urn of Shadows by minute 5-7 to build into Spirit Vessel quickly.',
      'Draft Ancient Apparition or heroes with natural heal reduction.',
      'Focus burst damage quickly while healing reduction debuff is active.'
    ]
  },
  {
    id: 'heavy_magic',
    title: 'Heavy Magic Burst & Spell Spam',
    icon: 'Zap',
    description: 'Lineups that can instantly vaporize heroes from 100 to 0 HP using magical burst or continuous spell spam.',
    heroExamples: ['Zeus', 'Lina', 'Lion', 'Skywrath Mage', 'Leshrac', 'Queen of Pain', 'Pugna', 'Tinker'],
    counterItems: [
      { name: 'Black King Bar (BKB)', cost: 4050, why: 'Debuff Immunity and 50% Magic Resistance protects you during combat.' },
      { name: 'Pipe of Insight', cost: 3725, why: 'AoE barrier absorbing 450 magic damage for entire team + magic resist aura.' },
      { name: 'Glimmer Cape', cost: 2150, why: 'Support active giving 300 magic damage absorb shield + invisibility.' },
      { name: 'Mage Slayer', cost: 2625, why: 'Attacks reduce target’s spell damage by 35% for 6s + gives 25% magic resistance.' },
      { name: 'Eternal Shroud', cost: 3600, why: 'Gives up to 40%+ magic resistance and converts spell damage into mana.' }
    ],
    tacticalAdvice: [
      'Offlaner should prioritize Mage Slayer or Pipe of Insight to nullify enemy magical power spikes.',
      'Do not delay BKB on your core hero if the enemy mid or supports are snowballing with magic damage.'
    ]
  },
  {
    id: 'point_disables',
    title: 'BKB-Piercing & Point-Target Ultimates',
    icon: 'Target',
    description: 'Game-ending targeted spells that lock down your core through BKB (Duel, Doom, Fiend’s Grip, Primal Roar).',
    heroExamples: ['Legion Commander (Duel)', 'Doom (Doom)', 'Bane (Fiend’s Grip)', 'Batrider (Flaming Lasso)', 'Beastmaster (Primal Roar)', 'Pudge (Dismember)', 'Spirit Breaker (Charge/Nether Strike)'],
    counterItems: [
      { name: 'Linken’s Sphere', cost: 4800, why: 'Passively blocks the targeted spell or can be cast on a key core ally.' },
      { name: 'Lotus Orb', cost: 3850, why: 'Reflects the spell back (Duel/Doom caster also gets affected) and dispels other debuffs.' },
      { name: 'Wind Waker', cost: 6825, why: 'Can target the ally being Dueled or Fiend’s Gripped to save them in mid-air.' },
      { name: 'Aeon Disk', cost: 3000, why: 'Automatically dispels and gives 2.5s 100% damage immunity once HP drops below 70%.' }
    ],
    tacticalAdvice: [
      'Supports should position in fog and hold save abilities/items (Lotus/Wind Waker/Force Staff).',
      'If playing vs LC or Doom, Linken’s Sphere or Lotus Orb must be planned before the 25-minute mark.'
    ]
  },
  {
    id: 'slippery_heroes',
    title: 'Elusive & Slippery Heroes (Blink / Dash)',
    icon: 'Wind',
    description: 'High-mobility heroes who weave in and out of fights and escape whenever you try to target them.',
    heroExamples: ['Storm Spirit', 'Ember Spirit', 'Void Spirit', 'Puck', 'Anti-Mage', 'Queen of Pain', 'Weaver', 'Slark'],
    counterItems: [
      { name: 'Orchid Malevolence / Bloodthorn', cost: 3475, why: 'Silences for 5.0 seconds preventing all escape spells.' },
      { name: 'Scythe of Vyse', cost: 5675, why: 'Instant 0-cast point Hex disable leaving zero reaction time.' },
      { name: 'Rod of Atos / Gleipnir', cost: 2250, why: '2.0s root prevents blinking and movement spells.' },
      { name: 'Diffusal Blade', cost: 2500, why: 'Burns mana pool so Storm/AM/Puck cannot cast escape abilities.' }
    ],
    tacticalAdvice: [
      'Chain your crowd control: do not overlap stuns, chain silences and roots right before previous disable expires.',
      'Instant-cast stuns (Lion Hex, Shadow Shaman Hex) counter Puck and Storm before they can shift/zip.'
    ]
  },
  {
    id: 'illusion_swarm',
    title: 'Illusion Spam & Summons',
    icon: 'Users',
    description: 'Heroes that flood the battlefield with clones and illusions to confuse, burn mana, and overwhelm.',
    heroExamples: ['Phantom Lancer', 'Chaos Knight', 'Terrorblade', 'Naga Siren', 'Nature’s Prophet', 'Lycan', 'Broodmother'],
    counterItems: [
      { name: 'Maelstrom / Mjollnir', cost: 2700, why: 'Chain lightning procs clear illusions rapidly and Static Charge shocks attackers.' },
      { name: 'Battle Fury', cost: 4100, why: '70% Cleave damage destroys clusters of illusions.' },
      { name: 'Shiva’s Guard', cost: 5175, why: 'AoE arctic blast + attack speed slow cripples illusion swarm DPS.' },
      { name: 'Crimson Guard', cost: 3725, why: 'Gives entire team a physical damage block shield that neutralizes low-damage illusion hits.' }
    ],
    tacticalAdvice: [
      'Crimson Guard completely invalidates PL and Broodmother summons for 12 seconds.',
      'Pick heroes with strong AoE damage (Sven, Leshrac, Sand King, Underlord, Earthshaker).'
    ]
  }
];
