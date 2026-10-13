import { HeroData, Ability, TalentOption } from './types';
import { generateDynamicHeroMatchups } from './heroMatchupData';

// ==========================================
// SHARED ZERO-OVERHEAD REUSABLE TEMPLATES
// Minimizes heap RAM allocations and bundle weight for low-memory devices
// ==========================================
const SHARED_NEUTRALS = [
  { tier: 1, items: ['Duelist Gloves', 'Arcane Ring', 'Safety Bubble'] },
  { tier: 2, items: ['Dragon Scale', 'Vampire Fangs', 'Eye of the Vizier'] },
  { tier: 3, items: ['Paladin Sword', 'Nemesis Curse', 'Enchanted Quiver'] },
  { tier: 4, items: ['Mind Breaker', 'Ninja Gear', 'Aviana’s Feather'] },
  { tier: 5, items: ['Apex', 'Pirate Hat', 'Mirror Shield'] }
];

const ARCHETYPE_BUILDS = {
  carry_agi: {
    starting: [
      { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane health sustain' },
      { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Last hitting bonus' },
      { id: 'slippers', name: 'Slippers of Agility', cost: 140, reason: 'Base armor and attack damage' },
      { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Builds into Wraith Band' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stat efficiency' }
    ],
    early: [
      { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed and stat toggling' },
      { id: 'wraith_band', name: 'Wraith Band', cost: 505, reason: 'Armor and agility' },
      { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Emergency burst survival' }
    ],
    core: [
      { id: 'manta_style', name: 'Manta Style', cost: 4600, reason: 'Basic dispel, scouting, and triple damage' },
      { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Debuff immunity against magic lockdown' },
      { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Agility, attack speed, and 35% evasion' }
    ],
    situational: [
      {
        category: 'vs Heavy Magic / Disables',
        items: [
          { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Immunity to crowd control' },
          { id: 'linkens', name: "Linken's Sphere", cost: 4800, reason: 'Blocks instant single-target initiates' }
        ]
      },
      {
        category: 'vs Evasion / High Armor',
        items: [
          { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: '80% True Strike piercing evasion' },
          { id: 'nullifier', name: 'Nullifier', cost: 4375, reason: 'Dispels defensive buffs continuously' }
        ]
      }
    ],
    late: [
      { id: 'skadi', name: 'Eye of Skadi', cost: 5300, reason: 'Reduces enemy healing and lifesteal by 40%' },
      { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Premier physical carry DPS and evasion' },
      { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Lifesteal active to survive focused burst' },
      { id: 'swift_blink', name: 'Swift Blink', cost: 6800, reason: 'Burst mobility and attack speed' }
    ],
    neutrals: SHARED_NEUTRALS
  },
  carry_str: {
    starting: [
      { id: 'tango', name: 'Tango', cost: 90, reason: 'Health sustain during lane contest' },
      { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Essential last-hit bonus' },
      { id: 'gauntlets', name: 'Gauntlets of Strength', cost: 140, reason: 'Builds into Bracer' },
      { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Efficient baseline stats' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Cheap stat point' }
    ],
    early: [
      { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed and tread switching' },
      { id: 'bracer', name: 'Bracer', cost: 505, reason: 'Lane trading and durability' },
      { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Emergency burst HP/mana' },
      { id: 'armlet', name: 'Armlet of Mordiggian', cost: 2500, reason: 'Massive efficient damage and toggle survivability' }
    ],
    core: [
      { id: 'echo_sabre', name: 'Echo Sabre / Harpoon', cost: 2800, reason: 'Burst double-hit slow and mana regeneration' },
      { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Debuff immunity against magic lockdown' },
      { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Instant gap close and initiation' }
    ],
    situational: [
      {
        category: 'vs Heavy Magic / Disables',
        items: [
          { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Absolute magic immunity' },
          { id: 'heart', name: 'Heart of Tarrasque', cost: 5100, reason: 'Massive HP pool against sustained spell poke' }
        ]
      },
      {
        category: 'vs Evasion / High Armor',
        items: [
          { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: 'Pierces evasion' },
          { id: 'ac', name: 'Assault Cuirass', cost: 5125, reason: 'Minus armor aura and massive team attack speed' }
        ]
      }
    ],
    late: [
      { id: 'ac', name: 'Assault Cuirass', cost: 5125, reason: 'Attack speed and physical shred' },
      { id: 'overwhelming_blink', name: 'Overwhelming Blink', cost: 6800, reason: 'AoE slow and strength scaling burst' },
      { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Unholy Rage full heal and status resistance' },
      { id: 'abyssal_blade', name: 'Abyssal Blade', cost: 6250, reason: 'BKB-piercing lockdown' }
    ],
    neutrals: SHARED_NEUTRALS
  },
  offlane: {
    starting: [
      { id: 'tango', name: 'Tango', cost: 90, reason: 'Health sustain during lane trade' },
      { id: 'healing_salve', name: 'Healing Salve', cost: 100, reason: 'Emergency lane recovery' },
      { id: 'ring_of_protection', name: 'Ring of Protection', cost: 175, reason: 'Armor against enemy safelane right clicks' },
      { id: 'gauntlets', name: 'Gauntlets of Strength', cost: 140, reason: 'Base HP and last hit damage' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stat point' }
    ],
    early: [
      { id: 'phase_boots', name: 'Phase Boots', cost: 1500, reason: 'Armor, movement burst, and phase through creeps' },
      { id: 'bracer', name: 'Bracer', cost: 505, reason: 'Doubles at 25 min for massive tankiness' },
      { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Sustains skirmishes' }
    ],
    core: [
      { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Teamfight initiation and positioning' },
      { id: 'blade_mail', name: 'Blade Mail', cost: 2100, reason: 'Reflects incoming physical and magic burst' },
      { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Ensures uninterrupted teamfight initiation' }
    ],
    situational: [
      {
        category: 'vs Physical Burst',
        items: [
          { id: 'crimson_guard', name: 'Crimson Guard', cost: 3725, reason: 'Blocks 100% incoming physical damage procs for allies' },
          { id: 'lotus_orb', name: 'Lotus Orb', cost: 3850, reason: 'Reflects enemy single target spells and dispels' }
        ]
      },
      {
        category: 'vs Magic Burst',
        items: [
          { id: 'pipe', name: 'Pipe of Insight', cost: 3725, reason: 'Team magic resistance and 450 magic shield' },
          { id: 'shroud', name: 'Eternal Shroud', cost: 3600, reason: 'Converts magical damage into mana' }
        ]
      }
    ],
    late: [
      { id: 'overwhelming_blink', name: 'Overwhelming Blink', cost: 6800, reason: 'AoE initiation shockwave and movement slow' },
      { id: 'ac', name: 'Assault Cuirass', cost: 5125, reason: 'Team aura armor and siege utility' },
      { id: 'heart', name: 'Heart of Tarrasque', cost: 5100, reason: 'Limitless health regeneration outside combat' },
      { id: 'shivas_guard', name: "Shiva's Guard", cost: 4825, reason: 'Freezing blast reduces enemy attack speed and healing' }
    ],
    neutrals: SHARED_NEUTRALS
  },
  mid: {
    starting: [
      { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats and tree plant' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Second branch for Wand build' },
      { id: 'faerie_fire', name: 'Faerie Fire', cost: 65, reason: 'Attack damage bonus and instant heal' },
      { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Mid lane stat dominance' }
    ],
    early: [
      { id: 'bottle', name: 'Bottle', cost: 675, reason: 'Rune control and infinite mana/HP sustain' },
      { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Mana efficiency via tread switching' },
      { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Survival during dive attempts' },
      { id: 'null_talisman', name: 'Null Talisman', cost: 505, reason: 'Spell damage amplification' }
    ],
    core: [
      { id: 'kaya_sange', name: 'Kaya and Sange', cost: 4100, reason: 'Spell amp, mana cost reduction, and status resistance' },
      { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Debuff immunity to commit spells in teamfights' },
      { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Gank positioning and target access' }
    ],
    situational: [
      {
        category: 'vs Elusive / Escape Heroes',
        items: [
          { id: 'orchid', name: 'Orchid Malevolence', cost: 3475, reason: 'Silences and amplifies damage against mobile heroes' },
          { id: 'scythe', name: 'Scythe of Vyse', cost: 5675, reason: 'Instant Hex gives zero reaction window' }
        ]
      },
      {
        category: 'vs Heavy Magic / Lockdown',
        items: [
          { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Spell immunity' },
          { id: 'linkens', name: "Linken's Sphere", cost: 4800, reason: 'Blocks instant single target spells' }
        ]
      }
    ],
    late: [
      { id: 'scythe', name: 'Scythe of Vyse', cost: 5675, reason: 'Premier late-game disable' },
      { id: 'arcane_blink', name: 'Arcane Blink', cost: 6800, reason: 'Cast point and cooldown reduction' },
      { id: 'wind_waker', name: 'Wind Waker', cost: 6825, reason: 'Invulnerability save and mobile repositioning' },
      { id: 'refresher_orb', name: 'Refresher Orb', cost: 5000, reason: 'Double BKB and double ultimate in late game' }
    ],
    neutrals: SHARED_NEUTRALS
  },
  support: {
    starting: [
      { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane health sustain and sharing' },
      { id: 'blood_grenade', name: 'Blood Grenade', cost: 65, reason: 'Early kill threat and movement slow' },
      { id: 'clarity', name: 'Clarity', cost: 50, reason: 'Sustains ability harassment' },
      { id: 'sentry_ward', name: 'Sentry Ward', cost: 50, reason: 'Camp de-blocking and lane vision war' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' },
      { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' }
    ],
    early: [
      { id: 'arcane_boots', name: 'Arcane Boots', cost: 1300, reason: 'Team mana replenishment and building into Guardian Greaves' },
      { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Emergency heal during skirmishes' },
      { id: 'wind_lace', name: 'Wind Lace', cost: 250, reason: 'Movement speed for roaming and warding' }
    ],
    core: [
      { id: 'glimmer_cape', name: 'Glimmer Cape', cost: 2150, reason: 'Invisibility and 300 magic damage barrier for cores' },
      { id: 'force_staff', name: 'Force Staff', cost: 2200, reason: 'Saves allies caught in kinetic fields, cogs, or Chrono' },
      { id: 'pavise', name: 'Pavise / Solar Crest', cost: 2700, reason: 'Targeted physical barrier and attack buff' }
    ],
    situational: [
      {
        category: 'vs Physical Right Click',
        items: [
          { id: 'ghost_scepter', name: 'Ghost Scepter', cost: 1500, reason: 'Immunity to physical attacks (PA, Sven, Void)' },
          { id: 'aeon_disk', name: 'Aeon Disk', cost: 3000, reason: 'Triggers dispel and 100% damage reduction when dropped low' }
        ]
      },
      {
        category: 'vs Single Target Spells',
        items: [
          { id: 'lotus_orb', name: 'Lotus Orb', cost: 3850, reason: 'Basic dispel and spell reflection shield' },
          { id: 'euls', name: "Eul's Scepter", cost: 2625, reason: 'Self-dispel and interrupts channeling spells' }
        ]
      }
    ],
    late: [
      { id: 'aeon_disk', name: 'Aeon Disk', cost: 3000, reason: 'Guarantees survival against instant jump ganks' },
      { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'High-impact ultimate or tactical ability enhancement' },
      { id: 'wind_waker', name: 'Wind Waker', cost: 6825, reason: 'Invulnerable repositioning save for allies or self' },
      { id: 'scythe', name: 'Scythe of Vyse', cost: 5675, reason: 'Instant decisive Hex in late-game teamfights' }
    ],
    neutrals: SHARED_NEUTRALS
  }
};



function createArchetypeHero(spec: {
  id: string;
  name: string;
  aliases: string[];
  title: string;
  attribute: 'str' | 'agi' | 'int' | 'all';
  attackType: 'Melee' | 'Ranged';
  roles: ('Carry' | 'Mid' | 'Offlane' | 'Soft Support' | 'Hard Support')[];
  complexity: 1 | 2 | 3;
  winRate: number;
  pickRate: number;
  avatarUrl: string;
  bannerUrl: string;
  summary: string;
  abilities: Ability[];
  talents: TalentOption[];
}): HeroData {
  const primaryRole = spec.roles[0];
  let build = ARCHETYPE_BUILDS.support;
  if (primaryRole === 'Carry') {
    build = spec.attribute === 'str' ? ARCHETYPE_BUILDS.carry_str : ARCHETYPE_BUILDS.carry_agi;
  } else if (primaryRole === 'Offlane') {
    build = ARCHETYPE_BUILDS.offlane;
  } else if (primaryRole === 'Mid') {
    build = ARCHETYPE_BUILDS.mid;
  }

  const ab0 = spec.abilities[0]?.name || 'Primary Spell';
  const ab1 = spec.abilities[1]?.name || 'Mobility';
  const ab2 = spec.abilities[2]?.name || 'Tactical Buff';
  const abUlt = spec.abilities[spec.abilities.length - 1]?.name || 'Ultimate';

  const dynamicMatchups = generateDynamicHeroMatchups(spec);

  return {
    ...spec,
    playstyle: spec.name + ' plays as an impactful ' + primaryRole.toLowerCase() + ', leveraging strong lane pressure and critical power spike timings to control teamfight tempo.',
    powerSpikes: {
      early: 'Level 6 & Core Mobility (Phase / Treads / Boots)',
      mid: 'Core Item Timing (Blink / BKB / Manta / Maelstrom) around 18-22 mins',
      late: 'Full 6-Slot & Level 25/30 Talents, Tier 5 Neutrals'
    },
    build,
    skillOrder: {
      maxPriority: [ab0, ab1, ab2, abUlt],
      levelGuide: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'W', 'Talent', 'W', 'R', 'E', 'E', 'Talent', 'E', 'R']
    },
    strongAgainst: dynamicMatchups.strongAgainst,
    weakAgainst: dynamicMatchups.weakAgainst,
    synergies: dynamicMatchups.synergies,
    counterStrategy: {
      keyCounterItems: [
        { name: 'Black King Bar', reason: 'Negates primary spell lockdown and burst magical damage.' },
        { name: 'Scythe of Vyse', reason: 'Instant 2.8s Hex prevents activation of defensive mobility or BKB.' },
        { name: 'Spirit Vessel', reason: 'Significantly curtails regeneration and deals percentage-based damage.' }
      ],
      laningAdvice: 'Respect ' + spec.name + '’s early trading power. Keep track of cooldowns and contest rune spawns aggressively.',
      teamfightAdvice: 'Wait for ' + spec.name + ' to commit major initiation spells before counter-engaging with Black King Bar.',
      weaknessSummary: [
        'Vulnerable to instant silences and chain-hexes before BKB activation',
        'Relies heavily on initial ability cooldown windows',
        'Susceptible to being kited with Force Staff or Ghost Scepter'
      ]
    }
  };
}

export const HEROES_DATA: HeroData[] = [


  // ==========================================
  // AGILITY HEROES
  // ==========================================
  {
    id: 'anti_mage',
    name: 'Anti-Mage',
    aliases: ['am', 'magina'],
    title: 'The Anti-Mage',
    attribute: 'agi',
    attackType: 'Melee',
    roles: ['Carry'],
    complexity: 1,
    winRate: 51.4,
    pickRate: 14.8,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png',
    summary: 'High mobility carry who burns enemy mana pools and turns magic-heavy teams into ticking time bombs.',
    playstyle: 'Farm aggressively across the map using Blink, hit Battle Fury timing around 12-14 minutes, then Manta Style to split-push and assassinate squishy casters.',
    powerSpikes: {
      early: 'Weak in early laning. Needs safe farm, regen, and tread-switching to sustain Blink.',
      mid: 'Battle Fury + Manta Style timing (min 20-22). Accelerates farm 3x and joins pickoffs.',
      late: 'Full 6-slot beast (Abyssal, Butterfly/MKB, Skadi/BKB). Can solo backlines in 2 seconds.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Essential lane HP regen' },
        { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Last hitting bonus and tree cutting' },
        { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Stats build into Wraith Band' },
        { id: 'slippers_of_agility', name: 'Slippers of Agility', cost: 140, reason: 'Armor and last-hit damage' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Cheap stats and Magic Wand build' }
      ],
      early: [
        { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed and mana conservation via tread-switch' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst health and mana in lane' },
        { id: 'cornucopia', name: 'Cornucopia', cost: 1200, reason: 'HP and mana regen component for Battle Fury' }
      ],
      core: [
        { id: 'battle_fury', name: 'Battle Fury', cost: 4100, reason: 'Farming accelerator: cleaves jungle camps and creep waves instantly' },
        { id: 'manta_style', name: 'Manta Style', cost: 4600, reason: 'Illusion triple Mana Break + basic dispel to remove silences/dust' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Debuff immunity against instant hexes, roots, and heavy lockdown' }
      ],
      situational: [
        {
          category: 'vs Heavy Magic / Targeted Spells',
          items: [
            { id: 'linkens', name: "Linken's Sphere", cost: 4800, reason: 'Blocks instant Doom, Duel, or Flaming Lasso' },
            { id: 'mage_slayer', name: 'Mage Slayer', cost: 2625, reason: 'Attacks reduce enemy spell damage by 35%' }
          ]
        },
        {
          category: 'vs High Armor / Evasion',
          items: [
            { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: 'Pierces enemy evasion (PA, Windranger, Butterfly)' },
            { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Massive agility, attack speed, and 35% evasion against physical cores' }
          ]
        },
        {
          category: 'vs High Regen / Melee Tanks',
          items: [
            { id: 'skadi', name: 'Eye of Skadi', cost: 5300, reason: 'Pierces BKB, slows move/attack speed, and cuts heal/lifesteal by 40%' },
            { id: 'basher', name: 'Skull Basher / Abyssal Blade', cost: 6250, reason: 'BKB-piercing 2.0s lockdown for solo assassinations' }
          ]
        }
      ],
      late: [
        { id: 'abyssal_blade', name: 'Abyssal Blade', cost: 6250, reason: 'Instant melee stun through BKB' },
        { id: 'skadi', name: 'Eye of Skadi', cost: 5300, reason: 'Stats, slow, and 40% healing reduction' },
        { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Peak agility DPS and evasion' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Arcane Ring', 'Safety Bubble'] },
        { tier: 2, items: ['Vampire Fangs', 'Grove Bow', 'Specialist Array'] },
        { tier: 3, items: ['Paladin Sword', 'Elven Tunic', 'Vindicator\'s Axe'] },
        { tier: 4, items: ['Mind Breaker', 'Ninja Gear', 'Giggle Noggin'] },
        { tier: 5, items: ['Apex', 'Pirate Hat', 'Mirror Shield'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Blink (W)', 'Mana Break (Q)', 'Counterspell (E)', 'Mana Void (R)'],
      levelGuide: ['W', 'Q', 'E', 'W', 'W', 'R', 'W', 'Q', 'Q', 'Talent', 'Q', 'R', 'E', 'E', 'Talent', 'E', 'R']
    },
    abilities: [
      { name: 'Mana Break', key: 'Q', description: 'Burns enemy mana per hit and deals 50% of mana burned as physical damage.' },
      { name: 'Blink', key: 'W', description: 'Short-range instant teleportation allowing rapid map traversal.' },
      { name: 'Counterspell', key: 'E', description: 'Passively grants magic resistance. Active reflects targeted spells back to caster for 1.2s.' },
      { name: 'Mana Void', key: 'R', isUltimate: true, description: 'AOE magical explosion centered on target based on their missing mana pool.' }
    ],
    talents: [
      { level: 10, left: '+150 Mana Void AoE', right: '+9 Strength', recommended: 'right', reason: 'Provides essential early game HP to survive burst.' },
      { level: 15, left: '-1s Blink Cooldown', right: '+0.6% Max Mana Mana Break', recommended: 'left', reason: 'Unlocks hyper-mobility for farm speed.' },
      { level: 20, left: '+250 Blink Cast Range', right: '-1s Counterspell Cooldown', recommended: 'left', reason: 'Massive reach to jump sniper backlines.' },
      { level: 25, left: '+20% Counterspell Magic Resist', right: '-50s Mana Void Cooldown', recommended: 'left', reason: 'Makes Anti-Mage practically immune to magic.' }
    ],
    strongAgainst: [
      { heroId: 'medusa', heroName: 'Medusa', reason: 'Burns entire Mana Shield in seconds; Mana Void deals catastrophic AoE teamwipe.' },
      { heroId: 'storm_spirit', heroName: 'Storm Spirit', reason: 'Storm relies heavily on deep mana pool; Mana Void executes him effortlessly.' },
      { heroId: 'zeus', heroName: 'Zeus', reason: 'Counterspell reflects Arc Lightning / Bolt; AM can jump and kill Zeus in 2 hits.' },
      { heroId: 'pugna', heroName: 'Pugna', reason: 'Drains Pugna’s mana and turns Nether Ward against him.' }
    ],
    weakAgainst: [
      { heroId: 'legion_commander', heroName: 'Legion Commander', reason: 'Duel locks down AM through Counterspell and forces physical right-click combat where AM loses early.' },
      { heroId: 'slardar', heroName: 'Slardar', reason: 'Corrosive Haze removes AM’s armor and provides true sight; bash lock prevents Blink.' },
      { heroId: 'meepo', heroName: 'Meepo', reason: 'Earthbind roots prevent Blink entirely; Meepo out-tempos AM by 15 minutes.' },
      { heroId: 'bloodseeker', heroName: 'Bloodseeker', reason: 'Rupture causes AM to take lethal pure damage if he Blinks.' },
      { heroId: 'axe', heroName: 'Axe', reason: 'Berserker’s Call forces AM to attack high-armor Axe and procs lethal Counter Helix.' }
    ],
    synergies: [
      { heroId: 'magnus', heroName: 'Magnus', reason: 'Empower grants cleave early, saving AM 4100 gold from rushing Battle Fury.' },
      { heroId: 'crystal_maiden', heroName: 'Crystal Maiden', reason: 'Arcane Aura supplies limitless mana for spamming Blink in jungle.' },
      { heroId: 'grimstroke', heroName: 'Grimstroke', reason: 'Soulbind doubles Mana Void damage across two targets.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Orchid / Bloodthorn', reason: 'Silences AM so he cannot Blink or cast Counterspell.' },
        { name: 'Scythe of Vyse', reason: 'Instant Hex gives zero reaction window to pop Counterspell or Blink.' },
        { name: 'Skull Basher / Abyssal Blade', reason: 'BKB-piercing stun stops him mid-fight.' }
      ],
      laningAdvice: 'Bully AM heavily before level 6. Pick strong dual offlaners (e.g. Centaur + Tiny or Slardar + Grimstroke) and deny creep waves.',
      teamfightAdvice: 'Never use big single-target spells while Counterspell active animation is visible. Chain stuns precisely; let your carry engage with Break (Silver Edge) to remove Mana Break.',
      weaknessSummary: ['Extremely vulnerable to physical burst and minus-armor', 'Zero teamfight impact before Battle Fury + Manta', 'Stops functioning when locked down with instant Hex or Duel']
    }
  },

  {
    id: 'phantom_assassin',
    name: 'Phantom Assassin',
    aliases: ['pa', 'mortred'],
    title: 'The Phantom Assassin',
    attribute: 'agi',
    attackType: 'Melee',
    roles: ['Carry'],
    complexity: 1,
    winRate: 50.8,
    pickRate: 18.2,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png',
    summary: 'Agility assassin with natural evasion and devastating critical strikes that can delete enemy heroes in one hit.',
    playstyle: 'Spam Stifling Dagger for lane farm, build Desolator and BKB, then use Blur to position in shadows and Phantom Strike unsuspecting backlines.',
    powerSpikes: {
      early: 'Safe farming with Dagger from long range. Low HP pool before stats.',
      mid: 'Desolator + BKB timing (min 18-22). Can delete supports in 1-2 critical hits.',
      late: '6-slot monster with Nullifier, Satanic, and Rapier/Abyssal. Game ends on good jump.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Last hitting' },
        { id: 'slippers_of_agility', name: 'Slippers of Agility', cost: 140, reason: 'Agility stats' },
        { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Wraith Band component' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Cheap stats' }
      ],
      early: [
        { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed and bulk' },
        { id: 'wraith_band', name: 'Wraith Band', cost: 505, reason: 'Early armor and stats (doubles at min 25)' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Emergency burst heal' }
      ],
      core: [
        { id: 'battle_fury', name: 'Battle Fury', cost: 4100, reason: 'Farming power and Dagger cleave' },
        { id: 'desolator', name: 'Desolator', cost: 3500, reason: 'Reduces enemy armor by 6, supercharging critical strike damage' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Immunity to magic burst and disables while assassinating' }
      ],
      situational: [
        {
          category: 'vs Support Saves (Ghost / Force / Euls)',
          items: [
            { id: 'nullifier', name: 'Nullifier', cost: 4375, reason: 'Continuously dispels Ghost Scepter, Force Staff, and Aeon Disk' }
          ]
        },
        {
          category: 'vs Tanky Cores / Sustain',
          items: [
            { id: 'satanic', name: 'Satanic', cost: 5050, reason: '200% unholy lifesteal turns a 1500 crit into full HP restore + basic dispel' },
            { id: 'basher', name: 'Basher / Abyssal', cost: 6250, reason: 'Stun lock on jump' }
          ]
        },
        {
          category: 'vs Enemy Evasion (Butterfly / Windranger)',
          items: [
            { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: '80% True Strike to pierce opponent evasion' }
          ]
        }
      ],
      late: [
        { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Unholy lifesteal and bulk' },
        { id: 'nullifier', name: 'Nullifier', cost: 4375, reason: 'Stops enemy supports from saving themselves' },
        { id: 'abyssal_blade', name: 'Abyssal Blade', cost: 6250, reason: 'Instant BKB-piercing stun' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Safety Bubble', 'Broom Scepter'] },
        { tier: 2, items: ['Vampire Fangs', 'Grove Bow', 'Specialist Array'] },
        { tier: 3, items: ['Paladin Sword', 'Elven Tunic', 'Enchanted Quiver'] },
        { tier: 4, items: ['Mind Breaker', 'Ninja Gear', 'Giggle Noggin'] },
        { tier: 5, items: ['Apex', 'Pirate Hat', 'Desolator 2 / Stygian Desolator'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Stifling Dagger (Q)', 'Phantom Strike (W)', 'Blur (E)', 'Coup de Grace (R)'],
      levelGuide: ['Q', 'W', 'Q', 'E', 'Q', 'R', 'Q', 'W', 'W', 'Talent', 'W', 'R', 'E', 'E', 'Talent', 'E', 'R']
    },
    abilities: [
      { name: 'Stifling Dagger', key: 'Q', description: 'Throws a dagger that applies attack effects, slows enemy, and can crit.' },
      { name: 'Phantom Strike', key: 'W', description: 'Teleports to unit and grants massive +170 attack speed for 2.5s.' },
      { name: 'Blur', key: 'E', description: 'Passively gives 50% evasion. Active makes PA unseen on minimap and invisible near enemies.' },
      { name: 'Coup de Grace', key: 'R', isUltimate: true, description: 'Gives guaranteed deadly critical hits with massive percentage damage multiplier.' }
    ],
    talents: [
      { level: 10, left: '+0.5s Phantom Strike Duration', right: '-1.5s Stifling Dagger Cooldown', recommended: 'right', reason: 'Dagger spam provides continuous harass and farming.' },
      { level: 15, left: '+250 Phantom Strike Cast Range', right: '+20% Blur Evasion', recommended: 'left', reason: 'Dramatically improves jump distance in teamfights.' },
      { level: 20, left: '+25% Blur Active Movement Speed', right: '-3 Armor Corruption', recommended: 'right', reason: 'Synergizes with Desolator to amplify crits.' },
      { level: 25, left: '+7% Coup de Grace Chance', right: 'Triple Stifling Dagger', recommended: 'right', reason: 'Dagger hits 3 targets simultaneously with crits and slow.' }
    ],
    strongAgainst: [
      { heroId: 'drow_ranger', heroName: 'Drow Ranger', reason: 'PA can jump directly onto Drow, disabling Marksmanship bonus and bursting her.' },
      { heroId: 'sniper', heroName: 'Sniper', reason: 'Closes the gap effortlessly using Phantom Strike; Sniper has zero close-range escape.' },
      { heroId: 'zeus', heroName: 'Zeus', reason: 'One Phantom Strike + Dagger deletes Zeus before he can react.' }
    ],
    weakAgainst: [
      { heroId: 'axe', heroName: 'Axe', reason: 'Berserker’s Call forces PA to attack him, proc-ing pure damage Counter Helix that ignores Blur evasion.' },
      { heroId: 'troll_warlord', heroName: 'Troll Warlord', reason: 'Whirling Axes blinds PA, and Battle Trance out-slugs PA in right-click duel.' },
      { heroId: 'bristleback', heroName: 'Bristleback', reason: 'Quill Spray and passive back damage severely damage PA during high-speed attacks.' },
      { heroId: 'razor', heroName: 'Razor', reason: 'Static Link steals all of PA’s damage through BKB, rendering crits harmless.' }
    ],
    synergies: [
      { heroId: 'magnus', heroName: 'Magnus', reason: 'Reverse Polarity clumps enemies together for huge cleave crits.' },
      { heroId: 'slardar', heroName: 'Slardar', reason: 'Corrosive Haze minus armor makes Coup de Grace deal astronomical damage.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Monkey King Bar (MKB)', reason: '80% True Strike completely bypasses PA’s 50% Blur evasion.' },
        { name: 'Ghost Scepter', reason: 'Renders supports 100% immune to PA’s physical right-click crits for 4s.' },
        { name: 'Blade Mail', reason: 'Returns 85% of PA’s massive crits back into her low HP pool.' },
        { name: 'Silver Edge', reason: 'Applies BREAK, removing Blur evasion and Coup de Grace crits for 5 seconds.' }
      ],
      laningAdvice: 'Push waves into PA’s tower to force her to last-hit under pressure. Magic burst heroes crush her early.',
      teamfightAdvice: 'Every support MUST buy Ghost Scepter or Glimmer Cape. When PA jumps, immediately use defensive saves or Blade Mail.',
      weaknessSummary: ['Completely countered by True Strike (MKB/Bloodthorn)', 'Fragile HP pool makes her vulnerable to pure/magic burst', 'Struggles hard if broken by Silver Edge']
    }
  },

  {
    id: 'faceless_void',
    name: 'Faceless Void',
    aliases: ['void', 'darkterror', 'fv'],
    title: 'The Faceless Void',
    attribute: 'agi',
    attackType: 'Melee',
    roles: ['Carry'],
    complexity: 2,
    winRate: 51.0,
    pickRate: 15.6,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/faceless_void.png',
    summary: 'Master of time manipulation who freezes all units in Chronosphere, backtracks damage with Time Walk, and locks targets in place with Time Lock bashes.',
    playstyle: 'Farm safely using Time Walk to shrug off lane harass. Join fights when Chronosphere is ready to trap key enemy cores and backline supports.',
    powerSpikes: {
      early: 'Level 6 Chronosphere guarantees kills when paired with high AoE burst allies (Invoker/Skywrath/Witch Doctor).',
      mid: 'Maelstrom / MoM + Manta / BKB allows solo killing full HP carries inside Chrono.',
      late: '6-slot monster with Refresher Orb (Double Chronosphere for 10 seconds of total freeze).'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Last hitting' },
        { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Wraith Band stats' },
        { id: 'slippers_of_agility', name: 'Slippers', cost: 140, reason: 'Agility' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' }
      ],
      early: [
        { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed for Time Lock procs' },
        { id: 'mask_of_madness', name: 'Mask of Madness', cost: 1775, reason: '+110 Attack Speed inside Chronosphere and jungle sustain' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst health/mana' }
      ],
      core: [
        { id: 'maelstrom', name: 'Maelstrom / Mjollnir', cost: 2700, reason: 'Fast farm speed and lightning procs during Chrono' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Prevents outside enemy disables (e.g. Venge Swap, Pudge Hook, Hex) while hitting inside Chrono' },
        { id: 'manta_style', name: 'Manta / Sange & Yasha', cost: 4600, reason: 'Dispel silences and amplifies attack speed' }
      ],
      situational: [
        {
          category: 'vs Heavy Physical & Evasion',
          items: [
            { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Massive agility and attack speed' },
            { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: 'True Strike against PA / Butterfly' }
          ]
        },
        {
          category: 'vs Late Game Victory Condition',
          items: [
            { id: 'refresher_orb', name: 'Refresher Orb', cost: 5000, reason: 'Double Chronosphere (10s total freeze) wins games in late game' },
            { id: 'skadi', name: 'Eye of Skadi', cost: 5300, reason: 'Massive stats, slow, and 40% anti-heal' }
          ]
        }
      ],
      late: [
        { id: 'refresher_orb', name: 'Refresher Orb', cost: 5000, reason: 'Double Chrono' },
        { id: 'mjollnir', name: 'Mjollnir', cost: 5600, reason: 'Maximum attack speed for Time Lock bashes' },
        { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Unholy lifesteal and bulk' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Safety Bubble', 'Broom Scepter'] },
        { tier: 2, items: ['Grove Bow', 'Vampire Fangs', 'Specialist Array'] },
        { tier: 3, items: ['Paladin Sword', 'Elven Tunic', 'Vindicator\'s Axe'] },
        { tier: 4, items: ['Mind Breaker', 'Ninja Gear', 'Giggle Noggin'] },
        { tier: 5, items: ['Apex', 'Pirate Hat', 'Mirror Shield'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Time Lock (E)', 'Time Walk (Q)', 'Time Dilation (W)', 'Chronosphere (R)'],
      levelGuide: ['Q', 'E', 'E', 'W', 'E', 'R', 'E', 'Q', 'Q', 'Talent', 'Q', 'R', 'W', 'W', 'Talent', 'W', 'R']
    },
    abilities: [
      { name: 'Time Walk', key: 'Q', description: 'Dashes forward and backtracks all damage taken in the last 2 seconds.' },
      { name: 'Time Dilation', key: 'W', description: 'Slows enemies and extends all active cooldowns by up to 10 seconds.' },
      { name: 'Time Lock', key: 'E', description: 'Passive chance to deliver a bonus attack that bashes the target for 0.65s.' },
      { name: 'Chronosphere', key: 'R', isUltimate: true, description: 'Creates a rip in spacetime, freezing all units and structures inside for 5.0 seconds while Void moves at 1000 speed.' }
    ],
    talents: [
      { level: 10, left: '+0.5s Time Walk Backtrack Duration', right: '+6 Strength', recommended: 'left', reason: 'Increases damage undo window to 2.5s.' },
      { level: 15, left: '-1s Time Walk Cooldown', right: '+50 Time Lock Damage', recommended: 'right', reason: 'Significantly boosts DPS inside Chronosphere.' },
      { level: 20, left: '+120 Attack Speed in Chronosphere', right: '+300 Time Walk Cast Range', recommended: 'left', reason: 'Guarantees solo kill during Chronosphere duration.' },
      { level: 25, left: '20% Backtrack Damage Avoidance', right: '+20% Time Lock Damage/Chance', recommended: 'left', reason: 'Grants passive backtrack to evade 20% of all incoming damage.' }
    ],
    strongAgainst: [
      { heroId: 'slark', heroName: 'Slark', reason: 'Chronosphere freezes Slark through Shadow Dance invisibility.' },
      { heroId: 'weaver', heroName: 'Weaver', reason: 'Time Dilation freezes Shukuchi cooldown; Chrono stops Time Lapse.' },
      { heroId: 'anti_mage', heroName: 'Anti-Mage', reason: 'Chrono catches AM before he can Blink away.' }
    ],
    weakAgainst: [
      { heroId: 'outworld_destroyer', heroName: 'Outworld Destroyer', reason: 'Astral Imprisonment saves allies trapped inside Chronosphere.' },
      { heroId: 'shadow_demon', heroName: 'Shadow Demon', reason: 'Disruption saves any ally caught in Chrono from long range.' },
      { heroId: 'pudge', heroName: 'Pudge', reason: 'Meat Hook easily pulls Void or trapped allies out of Chronosphere.' },
      { heroId: 'vengeful_spirit', heroName: 'Vengeful Spirit', reason: 'Nether Swap swaps Void out of his own Chronosphere or rescues allies.' }
    ],
    synergies: [
      { heroId: 'witch_doctor', heroName: 'Witch Doctor', reason: 'Death Ward + Maledict inside Chronosphere wipes entire teams.' },
      { heroId: 'invoker', heroName: 'Invoker', reason: 'Cataclysm and Chaos Meteor guarantee five-man teamwipe inside Chrono.' },
      { heroId: 'snapfire', heroName: 'Snapfire', reason: 'Mortimer Kisses unleashes massive artillery fire on frozen targets.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Aeon Disk', reason: 'Triggers inside Chronosphere when HP drops below 70%, giving 100% damage immunity.' },
        { name: 'Wind Waker / Eul’s', reason: 'Cyclone Void or his target from outside Chrono range to waste his ultimate.' },
        { name: 'Ghost Scepter', reason: 'Forces Void to target someone else or waste Chrono time.' }
      ],
      laningAdvice: 'Void has low base damage. Harass him constantly and force him to waste Time Walk defensively.',
      teamfightAdvice: 'NEVER group together. Keep support heroes far back in fog with save items (Force Staff, Glimmer, Wind Waker).',
      weaknessSummary: ['Extremely reliant on Chronosphere cooldown', 'Vulnerable to outside saves (OD Astral, SD Disruption, Venge Swap)', 'Low farming speed without Maelstrom / Madness']
    }
  },

  {
    id: 'drow_ranger',
    name: 'Drow Ranger',
    aliases: ['drow', 'traxex'],
    title: 'The Drow Ranger',
    attribute: 'agi',
    attackType: 'Ranged',
    roles: ['Carry'],
    complexity: 1,
    winRate: 51.5,
    pickRate: 15.0,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/drow_ranger.png',
    summary: 'Ranged powerhouse who silences casters with Gust, slows with Frost Arrows, and pierces enemy base armor with Marksmanship.',
    playstyle: 'Maintain maximum distance from enemies. Use Multishot to clear waves and shred clustered foes; keep Marksmanship active by staying away from melee proximity.',
    powerSpikes: {
      early: 'Level 6 Marksmanship triples farming speed and harass damage.',
      mid: 'Dragon Lance + Yasha / Hurricane Pike + Manta Style: Safely siege towers from 900+ range.',
      late: 'Butterfly + Silver Edge / Daedalus + Swift Blink: Melts high-armor agility and strength tanks in 3-4 hits.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'slippers_of_agility', name: 'Slippers x2', cost: 280, reason: 'Agility stats for Wraith Bands' },
        { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Stats' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' }
      ],
      early: [
        { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed and stats' },
        { id: 'wraith_band', name: 'Wraith Band x2', cost: 1010, reason: 'Armor and last hit damage' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst health/mana' }
      ],
      core: [
        { id: 'dragon_lance', name: 'Dragon Lance / Hurricane Pike', cost: 1900, reason: '+140 Attack range keeps Marksmanship active and provides escape' },
        { id: 'manta_style', name: 'Manta Style', cost: 4600, reason: 'Dispel for dust/silences and illusions gain Marksmanship aura' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Prevents being gap-closed with magical burst and stuns' }
      ],
      situational: [
        {
          category: 'vs High Armor Tanks (TB / Morphling / DK)',
          items: [
            { id: 'aghanims_shard', name: "Aghanim's Shard (Glacier)", cost: 1400, reason: 'Creates a hill that grants high ground advantage, bonus range, and makes Drow unpierceable' },
            { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Huge agility and attack speed' }
          ]
        },
        {
          category: 'vs Gap Closers (PA / Slark / Clockwerk)',
          items: [
            { id: 'silver_edge', name: 'Silver Edge', cost: 5450, reason: 'Repositioning via invis + Break mechanics' },
            { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Unholy lifesteal when jumped' }
          ]
        }
      ],
      late: [
        { id: 'swift_blink', name: 'Swift Blink', cost: 6800, reason: 'Instant repositioning and massive agility surge' },
        { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Full HP restore' },
        { id: 'butterfly', name: 'Butterfly', cost: 4975, reason: 'Peak DPS' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Safety Bubble', 'Broom Scepter'] },
        { tier: 2, items: ['Grove Bow', 'Specialist Array', 'Vampire Fangs'] },
        { tier: 3, items: ['Enchanted Quiver', 'Elven Tunic', 'Paladin Sword'] },
        { tier: 4, items: ['Ninja Gear', 'Mind Breaker', 'Trickster Cloak'] },
        { tier: 5, items: ['Apex', 'Pirate Hat', 'Mirror Shield'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Frost Arrows (Q)', 'Multishot (E)', 'Gust (W)', 'Marksmanship (R)'],
      levelGuide: ['Q', 'E', 'Q', 'W', 'E', 'R', 'E', 'E', 'Q', 'Talent', 'Q', 'R', 'W', 'W', 'Talent', 'W', 'R']
    },
    abilities: [
      { name: 'Frost Arrows', key: 'Q', description: 'Adds frost to arrows, dealing bonus damage, slowing enemy move speed, and reducing healing.' },
      { name: 'Gust', key: 'W', description: 'Releases a gust of wind that pushes back and silences enemy units for up to 6 seconds.' },
      { name: 'Multishot', key: 'E', description: 'Channels a barrage of arrows in a wide cone, applying Frost Arrows with increased range and damage.' },
      { name: 'Marksmanship', key: 'R', isUltimate: true, description: 'Grants passive bonus agility. Attacks have a chance to pierce base armor entirely. Disabled if an enemy is within 400 range.' }
    ],
    talents: [
      { level: 10, left: '+15 Movement Speed', right: '+40 Gust Blind', recommended: 'right', reason: 'Gust blind causes gap closers to miss attacks.' },
      { level: 15, left: '-8s Gust Cooldown', right: '+20% Multishot Damage', recommended: 'right', reason: 'Huge damage amp on teamfight arrow barrage.' },
      { level: 20, left: '+25% Marksmanship Chance', right: '+3 Multishot Arrows', recommended: 'left', reason: 'Pierces armor much more consistently.' },
      { level: 25, left: '+12% Marksmanship Agility Bonus', right: '+1.5s Gust Duration', recommended: 'left', reason: 'Gives astronomical agility and team damage.' }
    ],
    strongAgainst: [
      { heroId: 'terrorblade', heroName: 'Terrorblade', reason: 'Marksmanship procs completely ignore Terrorblade’s 35+ base armor.' },
      { heroId: 'morphling', heroName: 'Morphling', reason: 'Ignores all agility-shifted armor and Frost Arrows slows his movement.' },
      { heroId: 'necrophos', heroName: 'Necrophos', reason: 'Gust silences Necrophos and Frost Arrows prevents him from closing range.' }
    ],
    weakAgainst: [
      { heroId: 'phantom_assassin', heroName: 'Phantom Assassin', reason: 'Phantom Strike closes distance instantly, disabling Marksmanship and deleting Drow.' },
      { heroId: 'clockwerk', heroName: 'Clockwerk', reason: 'Hookshot + Power Cogs traps Drow in melee range.' },
      { heroId: 'slark', heroName: 'Slark', reason: 'Pounce closes gap and Dark Pact dispels Gust silence.' },
      { heroId: 'spectre', heroName: 'Spectre', reason: 'Haunt / Shadow Step jumps directly on top of Drow from anywhere on map.' }
    ],
    synergies: [
      { heroId: 'vengeful_spirit', heroName: 'Vengeful Spirit', reason: 'Vengeance Aura + Marksmanship provides unbelievable ranged right-click damage.' },
      { heroId: 'treant_protector', heroName: 'Treant Protector', reason: 'Living Armor protects Drow and Overgrowth holds enemies at ideal range.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Blink Dagger', reason: 'Close the 400 range gap onto Drow immediately to disable her Marksmanship bonus agility.' },
        { name: "Heaven's Halberd", reason: 'Disarms Drow for 5.0 seconds, stopping her DPS.' },
        { name: 'Blade Mail', reason: 'Returns Multishot arrow barrage back into her low HP pool.' }
      ],
      laningAdvice: 'Draft gap closers. Drow is very slow and fragile in lane with no natural escape before Hurricane Pike.',
      teamfightAdvice: 'Focus Drow first. Jump directly into her 400 radius to disable her ultimate armor-piercing passive.',
      weaknessSummary: ['Loses all bonus agility when enemies are within 400 melee range', 'Low mobility without Hurricane Pike', 'Fragile against physical burst gap closers']
    }
  },

  // ==========================================
  // STRENGTH HEROES
  // ==========================================
  {
    id: 'axe',
    name: 'Axe',
    aliases: ['axe', 'mogul_kahn'],
    title: 'The Axe',
    attribute: 'str',
    attackType: 'Melee',
    roles: ['Offlane'],
    complexity: 1,
    winRate: 52.1,
    pickRate: 15.3,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png',
    summary: 'Premier initiator who forces enemies to attack his massive armor with Berserker’s Call, retaliating with pure damage Counter Helix and instant Culling Blade executions.',
    playstyle: 'Farm aggressively with Counter Helix, rush Blink Dagger + Blade Mail by minute 12-14, then hide in fog to catch key enemy carries and delete them on Call.',
    powerSpikes: {
      early: 'Dominant laning vs melee carries (Creep skipping, Battle Hunger slow).',
      mid: 'Blink Dagger + Blade Mail timing: Solo kills any physical carry in a single Berserker’s Call.',
      late: 'Aghanim Shard + Scepter + BKB: High armor, permanent Battle Hunger, and instant kill threshold on Culling Blade.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'healing_salve', name: 'Healing Salve', cost: 100, reason: 'Emergency HP recovery' },
        { id: 'ring_of_protection', name: 'Ring of Protection', cost: 175, reason: 'Armor for creep trades' },
        { id: 'gauntlets_of_strength', name: 'Gauntlets of Strength', cost: 140, reason: 'HP and Bracer build' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Cheap stats' }
      ],
      early: [
        { id: 'phase_boots', name: 'Phase Boots', cost: 1500, reason: 'Armor and movement speed to close distance' },
        { id: 'bracer', name: 'Bracer', cost: 505, reason: 'Strength, HP regen, and bulk' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Lane spell burst sustain' }
      ],
      core: [
        { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Instant positioning for game-winning Berserker’s Call' },
        { id: 'blade_mail', name: 'Blade Mail', cost: 2100, reason: 'Returns 85% damage while enemy is forced to attack you during Call' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Prevents enemy supports from CC-ing you during Blink-Call initiation' }
      ],
      situational: [
        {
          category: 'vs Heavy Magic Burst',
          items: [
            { id: 'eternal_shroud', name: 'Eternal Shroud / Pipe', cost: 3600, reason: 'Converts heavy magic damage into mana + huge magic resist' }
          ]
        },
        {
          category: 'vs Physical Heavy Lineups',
          items: [
            { id: 'shivas_guard', name: "Shiva's Guard", cost: 5175, reason: 'AoE slow, 16 armor, and 25% healing reduction' },
            { id: 'assault_cuirass', name: 'Assault Cuirass', cost: 5125, reason: 'Armor and attack speed for team' }
          ]
        },
        {
          category: 'vs Elusive / High Mobility',
          items: [
            { id: 'overwhelming_blink', name: 'Overwhelming Blink', cost: 6800, reason: 'Massive AoE damage and movement/attack slow on blink' },
            { id: 'aghanims_shard', name: "Aghanim's Shard", cost: 1400, reason: 'Attacks proc Counter Helix and reduce enemy damage by 15%' }
          ]
        }
      ],
      late: [
        { id: 'overwhelming_blink', name: 'Overwhelming Blink', cost: 6800, reason: 'Upgraded strength initiation' },
        { id: 'heart', name: 'Heart of Tarrasque', cost: 5100, reason: 'Huge HP pool makes Axe unkillable' },
        { id: 'shivas_guard', name: "Shiva's Guard", cost: 5175, reason: 'Armor aura and anti-heal' }
      ],
      neutrals: [
        { tier: 1, items: ['Safety Bubble', 'Broom Scepter', 'Seeds of Serenity'] },
        { tier: 2, items: ['Dragon Scale', 'Vampire Fangs', 'Bullwhip'] },
        { tier: 3, items: ['Craggy Coat', 'Paladin Sword', 'Cloak of Flames'] },
        { tier: 4, items: ['Martyr’s Plate', 'Havoc Hammer', 'Telescope'] },
        { tier: 5, items: ['Giants Ring', 'Force Field', 'Apex'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Counter Helix (E)', 'Berserker’s Call (Q)', 'Battle Hunger (W)', 'Culling Blade (R)'],
      levelGuide: ['E', 'W', 'E', 'Q', 'E', 'R', 'E', 'Q', 'Q', 'Talent', 'Q', 'R', 'W', 'W', 'Talent', 'W', 'R']
    },
    abilities: [
      { name: 'Berserker’s Call', key: 'Q', description: 'Taunts nearby enemy units to attack Axe while granting him +30 bonus armor.' },
      { name: 'Battle Hunger', key: 'W', description: 'Enrages enemy, slowing them and dealing damage until they kill a unit.' },
      { name: 'Counter Helix', key: 'E', description: 'When attacked, Axe has a chance to perform a counter helix dealing pure damage.' },
      { name: 'Culling Blade', key: 'R', isUltimate: true, description: 'Chops an enemy unit. If below HP threshold, instantly kills through BKB and grants team move/attack speed.' }
    ],
    talents: [
      { level: 10, left: '+10 Berserker’s Call Armor', right: '+8 Strength', recommended: 'right', reason: 'Gives vital base HP and damage.' },
      { level: 15, left: '+12% Battle Hunger Slow', right: '+30 Attack Speed', recommended: 'left', reason: 'Makes Battle Hunger an inescapable slow.' },
      { level: 20, left: '+150 Culling Blade Threshold', right: '+1 Counter Helix Damage per Armor', recommended: 'right', reason: 'Scaling pure damage with Call armor bonus.' },
      { level: 25, left: '+2.0s Berserker’s Call AoE/Duration', right: '+100 Battle Hunger DPS', recommended: 'left', reason: '4.5s piercing AoE taunt wins the game in late teamfights.' }
    ],
    strongAgainst: [
      { heroId: 'phantom_assassin', heroName: 'Phantom Assassin', reason: 'Forces PA to attack Axe with high attack speed, triggering instant fatal Counter Helix procs.' },
      { heroId: 'phantom_lancer', heroName: 'Phantom Lancer', reason: 'Hundreds of illusion hits trigger nonstop Counter Helix pure spins.' },
      { heroId: 'anti_mage', heroName: 'Anti-Mage', reason: 'Blink Call + Blade Mail kills AM before he can react or blink away.' }
    ],
    weakAgainst: [
      { heroId: 'viper', heroName: 'Viper', reason: 'Nethertoxin applies Break (disabling Counter Helix) and Corrosive slows Axe endlessly.' },
      { heroId: 'timbersaw', heroName: 'Timbersaw', reason: 'Pure damage and Reactive Armor makes Timbersaw impossible for Axe to trade against.' },
      { heroId: 'necrophos', heroName: 'Necrophos', reason: 'Heartstopper Aura shreds Axe’s large HP pool and Ghost Shroud invalidates physical hits.' },
      { heroId: 'ursa', heroName: 'Ursa', reason: 'Fury Swipes stacks quickly and shreds Axe even through bonus Call armor.' }
    ],
    synergies: [
      { heroId: 'invoker', heroName: 'Invoker', reason: 'Blink Call groups enemies together for Cataclysm / Sun Strike combo.' },
      { heroId: 'witch_doctor', heroName: 'Witch Doctor', reason: 'Berserker’s Call keeps enemies locked in Death Ward + Maledict range.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Silver Edge', reason: 'Applies BREAK, turning off Counter Helix spins during Call.' },
        { name: 'Eul’s Scepter of Divinity', reason: 'Cyclone Axe when he blinks in to prevent him from spinning down your allies.' },
        { name: 'Aeon Disk', reason: 'Saves you from dying to the initial Call + Blade Mail burst.' },
        { name: 'Wind Waker', reason: 'Cyclone the ally caught in Call to save them from taking damage.' }
      ],
      laningAdvice: 'Do not let Axe pull creeps behind your tower. Ranged heroes should harass him continuously from outside melee range.',
      teamfightAdvice: 'Never group up tightly against Axe. Stay spread so he cannot catch multiple heroes in one Berserker’s Call.',
      weaknessSummary: ['Vulnerable to Break mechanics (Silver Edge, Viper Nethertoxin)', 'Very reliant on Blink Dagger timing', 'Low magical burst resistance']
    }
  },

  {
    id: 'legion_commander',
    name: 'Legion Commander',
    aliases: ['lc', 'tresdin'],
    title: 'The Legion Commander',
    attribute: 'str',
    attackType: 'Melee',
    roles: ['Offlane', 'Mid'],
    complexity: 1,
    winRate: 51.9,
    pickRate: 16.8,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/legion_commander.png',
    summary: 'Dueling warrior who locks enemies in mortal combat, permanently gaining damage for every Duel victory and cleansing debuffs with Press the Attack.',
    playstyle: 'Harass with Overwhelming Odds, farm Blink Dagger and Blade Mail, smoke gank solo enemy squishies, and build up 200+ bonus Duel damage.',
    powerSpikes: {
      early: 'Level 6 Duel + +allied burst secures guaranteed early damage stacks.',
      mid: 'Blink Dagger + Blade Mail + BKB allows solo winning Duels against enemy carries.',
      late: 'Aghanim Scepter (Duel grants spell immunity and lasts 8s) turns LC into an unstoppably scaling carry.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Last hitting' },
        { id: 'gauntlets_of_strength', name: 'Gauntlets x2', cost: 280, reason: 'Bracer builds' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' }
      ],
      early: [
        { id: 'phase_boots', name: 'Phase Boots', cost: 1500, reason: 'Armor and gap closing' },
        { id: 'bracer', name: 'Bracer', cost: 505, reason: 'Strength and sustain' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst mana/health' }
      ],
      core: [
        { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Instant positioning for Duel' },
        { id: 'blade_mail', name: 'Blade Mail', cost: 2100, reason: 'Forces enemy to kill themselves on damage return during Duel' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Prevents enemy supports from stunning you out of Duel' }
      ],
      situational: [
        {
          category: 'vs Heavy Targeted Disables & Saves',
          items: [
            { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'Grants spell immunity and reduces damage taken by 50% from non-duelists' },
            { id: 'desolator', name: 'Desolator / Assault Cuirass', cost: 3500, reason: 'Minus armor melts targets during Duel' }
          ]
        },
        {
          category: 'vs High Evasion (PA / Windranger)',
          items: [
            { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: 'True Strike during Duel' }
          ]
        }
      ],
      late: [
        { id: 'assault_cuirass', name: 'Assault Cuirass', cost: 5125, reason: 'Armor and attack speed' },
        { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Unholy lifesteal and 200 damage' },
        { id: 'overwhelming_blink', name: 'Overwhelming Blink', cost: 6800, reason: 'AoE slow and strength burst' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Safety Bubble', 'Broom Scepter'] },
        { tier: 2, items: ['Dragon Scale', 'Vampire Fangs', 'Specialist Array'] },
        { tier: 3, items: ['Paladin Sword', 'Craggy Coat', 'Elven Tunic'] },
        { tier: 4, items: ['Martyr’s Plate', 'Ninja Gear', 'Mind Breaker'] },
        { tier: 5, items: ['Giants Ring', 'Apex', 'Pirate Hat'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Overwhelming Odds (Q)', 'Moment of Courage (E)', 'Press the Attack (W)', 'Duel (R)'],
      levelGuide: ['Q', 'E', 'Q', 'W', 'Q', 'R', 'Q', 'E', 'E', 'Talent', 'E', 'R', 'W', 'W', 'Talent', 'W', 'R']
    },
    abilities: [
      { name: 'Overwhelming Odds', key: 'Q', description: 'Deals damage and grants movement speed based on number of enemies in targeted AoE.' },
      { name: 'Press the Attack', key: 'W', description: 'Strong dispel on ally or self, granting health regen and attack speed.' },
      { name: 'Moment of Courage', key: 'E', description: 'When attacked, chance to immediately counterattack with 85% lifesteal.' },
      { name: 'Duel', key: 'R', isUltimate: true, description: 'Locks LC and target in physical combat. Winner gains permanent bonus damage (+10/20/30).' }
    ],
    talents: [
      { level: 10, left: '+8 Duel Bonus Damage', right: '+200 Overwhelming Odds AoE', recommended: 'left', reason: 'Accelerates permanent damage scaling rapidly.' },
      { level: 15, left: '+25 Attack Speed', right: '-3s Overwhelming Odds Cooldown', recommended: 'left', reason: 'More hits landed during Duel duration.' },
      { level: 20, left: '+250 Press the Attack HP Regen', right: '+150 Overwhelming Odds Damage', recommended: 'left', reason: 'Massive burst heal and strong dispel.' },
      { level: 25, left: '+300 Duel Cast Range', right: '+1.5s Duel Duration', recommended: 'left', reason: 'Allows jumping enemies from outside vision range.' }
    ],
    strongAgainst: [
      { heroId: 'anti_mage', heroName: 'Anti-Mage', reason: 'Duel locks AM in place through Counterspell and forces physical right-click where AM loses.' },
      { heroId: 'slark', heroName: 'Slark', reason: 'Duel pierces Dark Pact and Shadow Dance, locking Slark until death.' },
      { heroId: 'storm_spirit', heroName: 'Storm Spirit', reason: 'Duel catches Storm instantly, stopping all Ball Lightning escapes.' }
    ],
    weakAgainst: [
      { heroId: 'outworld_destroyer', heroName: 'Outworld Destroyer', reason: 'Astral Imprisonment banishes either LC or target, wasting the entire Duel.' },
      { heroId: 'shadow_demon', heroName: 'Shadow Demon', reason: 'Disruption completely saves ally from Duel.' },
      { heroId: 'troll_warlord', heroName: 'Troll Warlord', reason: 'Battle Trance will defeat LC in a 1v1 right click Duel.' }
    ],
    synergies: [
      { heroId: 'skywrath_mage', heroName: 'Skywrath Mage', reason: 'Mystic Flare dropped onto Duel target guarantees 100% win every single time.' },
      { heroId: 'invoker', heroName: 'Invoker', reason: 'Sun Strike / Cataclysm onto Duel target guarantees kill.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: "Linken's Sphere", reason: 'Blocks Duel from being cast directly on you.' },
        { name: 'Lotus Orb', reason: 'Reflects Duel back onto LC; your team can also hit her.' },
        { name: 'Wind Waker / Eul’s', reason: 'Cyclone LC or ally to disable the fight.' },
        { name: "Heaven's Halberd", reason: 'Disarm LC before she casts Duel on an ally.' }
      ],
      laningAdvice: 'Overwhelming Odds deals massive damage if you stand inside your creep wave. Avoid standing near allied creeps.',
      teamfightAdvice: 'Save single-target saves (Lotus Orb, Astral, Disruption, Wind Waker) for the hero LC Duels.',
      weaknessSummary: ['Giving away Duel damage can lose the game', 'Vulnerable to Linken’s Sphere and Lotus Orb', 'Countered by banish / disruption mechanics']
    }
  },

  {
    id: 'sven',
    name: 'Sven',
    aliases: ['sven', 'rogue_knight'],
    title: 'The Rogue Knight',
    attribute: 'str',
    attackType: 'Melee',
    roles: ['Carry'],
    complexity: 1,
    winRate: 51.6,
    pickRate: 13.9,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sven.png',
    summary: 'Pure physical juggernaut who activates God’s Strength for 200% bonus damage and cleaves entire teams in Storm Hammer stuns.',
    playstyle: 'Farm quickly with Great Cleave, hit Echo Sabre / Blink / BKB timing at 18-20 minutes, pop God’s Strength and jump into fights to cleave down 3 heroes in 3 hits.',
    powerSpikes: {
      early: 'Level 4 Great Cleave allows stacking and clearing ancients early.',
      mid: 'Echo Sabre + Blink Dagger + BKB (min 18-22): God’s Strength wipes teamfights.',
      late: 'Aghanim Shard (Armor aura) + Bloodthorn / Daedalus / Swift Blink: 1800+ physical damage crits per cleave.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'quelling_blade', name: 'Quelling Blade', cost: 100, reason: 'Last hitting' },
        { id: 'gauntlets_of_strength', name: 'Gauntlets x2', cost: 280, reason: 'Bracer' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' }
      ],
      early: [
        { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Attack speed and strength' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Mana for Storm Hammer' },
        { id: 'mask_of_madness', name: 'Mask of Madness / Echo', cost: 1775, reason: 'Attack speed and jungle lifesteal' }
      ],
      core: [
        { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Instant gap close for Storm Hammer initiation' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Debuff immunity so you are not kited during God’s Strength' },
        { id: 'harpoon', name: 'Echo Sabre / Harpoon', cost: 4500, reason: 'Double hit burst and pull elusive targets' }
      ],
      situational: [
        {
          category: 'vs High Evasion & Physical Saves',
          items: [
            { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: 'True Strike vs PA / Butterfly' },
            { id: 'nullifier', name: 'Nullifier', cost: 4375, reason: 'Purges Ghost Scepter and Force Staff during God’s Strength' }
          ]
        },
        {
          category: 'vs Mega Tanks & Lategame',
          items: [
            { id: 'daedalus', name: 'Daedalus', cost: 5150, reason: 'Massive crits multiplied by God’s Strength 200% bonus' },
            { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Full HP restore on 1 cleave hit' }
          ]
        }
      ],
      late: [
        { id: 'swift_blink', name: 'Swift Blink', cost: 6800, reason: 'Agility burst & gap close' },
        { id: 'daedalus', name: 'Daedalus', cost: 5150, reason: 'Massive cleave crits' },
        { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Unholy lifesteal' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Safety Bubble', 'Broom Scepter'] },
        { tier: 2, items: ['Vampire Fangs', 'Dragon Scale', 'Specialist Array'] },
        { tier: 3, items: ['Paladin Sword', 'Elven Tunic', 'Craggy Coat'] },
        { tier: 4, items: ['Mind Breaker', 'Ninja Gear', 'Giggle Noggin'] },
        { tier: 5, items: ['Apex', 'Pirate Hat', 'Mirror Shield'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Great Cleave (W)', 'Storm Hammer (Q)', 'Warcry (E)', 'God’s Strength (R)'],
      levelGuide: ['Q', 'W', 'W', 'E', 'W', 'R', 'W', 'Q', 'Q', 'Talent', 'Q', 'R', 'E', 'E', 'Talent', 'E', 'R']
    },
    abilities: [
      { name: 'Storm Hammer', key: 'Q', description: 'Throws a magical gauntlet that stuns and deals damage to enemies in an AoE.' },
      { name: 'Great Cleave', key: 'W', description: 'Strikes cleave in a cone behind target, dealing up to 100% physical damage.' },
      { name: 'Warcry', key: 'E', description: 'Grants armor and movement speed barrier to Sven and nearby allies.' },
      { name: 'God’s Strength', key: 'R', isUltimate: true, description: 'Channels rogue strength, gaining up to +200% base attack damage for 35 seconds.' }
    ],
    talents: [
      { level: 10, left: '+15 Attack Speed', right: '+3s Warcry Duration', recommended: 'left', reason: 'Improves farm speed and DPS.' },
      { level: 15, left: '-15s God’s Strength Cooldown', right: '+25% Great Cleave Damage', recommended: 'left', reason: 'Allows using God’s Strength in every skirmish.' },
      { level: 20, left: '+25 BKB Piercing Storm Hammer Stun / Armor', right: '+10 Warcry Armor', recommended: 'left', reason: 'Stuns BKB carriers.' },
      { level: 25, left: '+50% God’s Strength Bonus Damage', right: '+1.5s Storm Hammer Stun', recommended: 'left', reason: 'Reaches 1500+ right click damage per swing.' }
    ],
    strongAgainst: [
      { heroId: 'phantom_lancer', heroName: 'Phantom Lancer', reason: '100% Great Cleave evaporates all PL illusions in 2 hits.' },
      { heroId: 'chaos_knight', heroName: 'Chaos Knight', reason: 'Cleave destroys Phantasm clones instantly.' },
      { heroId: 'terrorblade', heroName: 'Terrorblade', reason: 'Cleave damage ignores armor on secondary targets, shredding TB’s low HP pool.' }
    ],
    weakAgainst: [
      { heroId: 'windranger', heroName: 'Windranger', reason: 'Windrun gives 100% physical evasion and Shackleshot kites Sven.' },
      { heroId: 'troll_warlord', heroName: 'Troll Warlord', reason: 'Whirling Axes blind makes Sven miss, and Battle Trance out-duels him.' },
      { heroId: 'razor', heroName: 'Razor', reason: 'Static Link drains 100% of Sven’s damage through BKB.' }
    ],
    synergies: [
      { heroId: 'magnus', heroName: 'Magnus', reason: 'Reverse Polarity groups 5 heroes for instant triple-cleave rampage.' },
      { heroId: 'crystal_maiden', heroName: 'Crystal Maiden', reason: 'Mana aura solves Sven’s severe mana issues.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: "Heaven's Halberd", reason: 'Disarms Sven for 3-5s, completely wasting his God’s Strength window.' },
        { name: 'Ghost Scepter', reason: 'Immunity to physical hits for supports.' },
        { name: 'Nullifier', reason: 'Dispels Warcry speed and armor.' },
        { name: 'Eye of Skadi', reason: 'Pierces BKB and reduces Sven’s move speed so he can be kited.' }
      ],
      laningAdvice: 'Block his ancient jungle camps with sentries. Sven relies heavily on stacking ancients to catch up.',
      teamfightAdvice: 'Kite him! Use Halberd, Force Staffs, and Ghost Scepters to survive his 6-second BKB window.',
      weaknessSummary: ['Easily kited once BKB duration ends', 'Very low mana pool', 'Completely countered by Heaven’s Halberd disarm']
    }
  },

  // ==========================================
  // INTELLIGENCE HEROES
  // ==========================================
  {
    id: 'storm_spirit',
    name: 'Storm Spirit',
    aliases: ['storm', 'raijin'],
    title: 'The Storm Spirit',
    attribute: 'int',
    attackType: 'Ranged',
    roles: ['Mid'],
    complexity: 3,
    winRate: 50.4,
    pickRate: 11.8,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png',
    summary: 'Hyper-mobile spellcaster who zips across the map in Ball Lightning, zapping enemies and triggering Overload charges.',
    playstyle: 'Dominate mid rune control, rush Kaya & Sange / Orchid, zip from long distances for pickoffs, and manage mana pool meticulously in teamfights.',
    powerSpikes: {
      early: 'Level 6 Ball Lightning unlocks instantaneous ganking and dodging.',
      mid: 'Kaya & Sange + Orchid / BKB timing allows diving towers and solo killing backline supports.',
      late: 'Aghanim Scepter (AoE Electric Vortex) + Shiva’s + Arcane Blink/Refresher initiates teamwipes.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'null_talisman', name: 'Null Talisman components', cost: 295, reason: 'Stats and mana regen' },
        { id: 'faerie_fire', name: 'Faerie Fire', cost: 65, reason: 'Last hitting damage and burst HP' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats and Bottle rush' }
      ],
      early: [
        { id: 'bottle', name: 'Bottle', cost: 675, reason: 'Essential mid lane rune sustain for HP and mana' },
        { id: 'power_treads', name: 'Power Treads', cost: 1400, reason: 'Tread-switching saves 20-30% mana on every zip' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst mana in fights' },
        { id: 'null_talisman', name: 'Null Talisman', cost: 505, reason: 'Mana pool and regen' }
      ],
      core: [
        { id: 'kaya_and_sange', name: 'Kaya and Sange', cost: 4100, reason: 'Reduces mana loss and spell cost by 25% while providing status resistance' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Immunity to silences and instant stuns during long zips' },
        { id: 'orchid', name: 'Orchid / Bloodthorn', cost: 3475, reason: 'Silences enemies before they can react with defensive spells' }
      ],
      situational: [
        {
          category: 'vs Heavy Crowd Control / Silences',
          items: [
            { id: 'euls', name: "Eul's Scepter / Wind Waker", cost: 2625, reason: 'Dispels silences, Orchid, and gives move speed + mana regen' },
            { id: 'linkens', name: "Linken's Sphere", cost: 4800, reason: 'Blocks instant Doom, Duel, or Hex' }
          ]
        },
        {
          category: 'vs Heavy Physical Burst & Illusions',
          items: [
            { id: 'shivas_guard', name: "Shiva's Guard", cost: 5175, reason: 'Armor, vision, AoE slow, and magic damage amp during zip' },
            { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'Turns Electric Vortex into a Black Hole AoE pull around Storm' }
          ]
        },
        {
          category: 'vs Late Game Pickoffs',
          items: [
            { id: 'scythe_of_vyse', name: 'Scythe of Vyse (Hex)', cost: 5675, reason: 'Instant Hex out of Ball Lightning deletes cores before BKB' }
          ]
        }
      ],
      late: [
        { id: 'scythe_of_vyse', name: 'Scythe of Vyse', cost: 5675, reason: 'Instant zero cast-point Hex' },
        { id: 'shivas_guard', name: "Shiva's Guard", cost: 5175, reason: 'Armor, slow, and magic amplification' },
        { id: 'arcane_blink', name: 'Arcane Blink', cost: 6800, reason: 'Ultra-fast cast speed and mana restoration' }
      ],
      neutrals: [
        { tier: 1, items: ['Arcane Ring', 'Safety Bubble', 'Fairy’s Trinket'] },
        { tier: 2, items: ['Eye of the Vizier', 'Vampire Fangs', 'Specialist Array'] },
        { tier: 3, items: ['Psychic Headband', 'Ceremonial Robe', 'Paladin Sword'] },
        { tier: 4, items: ['Mind Breaker', 'Timeless Relic', 'Stormcrafter'] },
        { tier: 5, items: ['Apex', 'Mirror Shield', 'Pirate Hat'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Static Remnant (Q)', 'Overload (E)', 'Electric Vortex (W)', 'Ball Lightning (R)'],
      levelGuide: ['Q', 'E', 'Q', 'E', 'W', 'R', 'Q', 'Q', 'E', 'Talent', 'E', 'R', 'W', 'W', 'Talent', 'W', 'R']
    },
    abilities: [
      { name: 'Static Remnant', key: 'Q', description: 'Creates an explosive remnant of Storm Spirit that detonates when enemies approach.' },
      { name: 'Electric Vortex', key: 'W', description: 'Pulls an enemy towards Storm Spirit with magnetic energy.' },
      { name: 'Overload', key: 'E', description: 'Casting a spell creates an electric charge that releases on next attack, slowing and dealing AoE magic damage.' },
      { name: 'Ball Lightning', key: 'R', isUltimate: true, description: 'Wraps in electricity, flying across the map invulnerably while consuming mana per distance traveled.' }
    ],
    talents: [
      { level: 10, left: '+20 Overload Damage', right: '+250 Health', recommended: 'left', reason: 'Boosts waveclear and burst damage on every zip.' },
      { level: 15, left: '+250 Health', right: '+50 Static Remnant Damage', recommended: 'right', reason: 'Fast jungle clearing and combo damage.' },
      { level: 20, left: '-1.25s Electric Vortex Cooldown', right: '+0.3s Electric Vortex Duration', recommended: 'right', reason: 'Extends lockdown duration during ganks.' },
      { level: 25, left: '500 AoE Auto-Remnants in Ball Lightning', right: '+2 Overload Bounces', recommended: 'left', reason: 'Leaves a carpet of high-damage remnants along flight path.' }
    ],
    strongAgainst: [
      { heroId: 'sniper', heroName: 'Sniper', reason: 'Storm zips across 2000 range directly onto Sniper and deletes him in 2 seconds.' },
      { heroId: 'drow_ranger', heroName: 'Drow Ranger', reason: 'Drow cannot kite or escape Ball Lightning jumps.' },
      { heroId: 'zeus', heroName: 'Zeus', reason: 'Storm zips through Zeus’s spells and bursts him instantly.' }
    ],
    weakAgainst: [
      { heroId: 'anti_mage', heroName: 'Anti-Mage', reason: 'AM burns Storm’s entire mana pool in 3 hits; Mana Void deals catastrophic damage on low-mana Storm.' },
      { heroId: 'silencer', heroName: 'Silencer', reason: 'Global Silence stops Storm mid-fight, rendering him a sitting duck.' },
      { heroId: 'doom', heroName: 'Doom', reason: 'Doom completely silences and mutes Storm through BKB for 16 seconds.' },
      { heroId: 'night_stalker', heroName: 'Night Stalker', reason: 'Crippling Fear silence field stops Storm from zipping away.' }
    ],
    synergies: [
      { heroId: 'lifestealer', heroName: 'Lifestealer', reason: 'Infest inside Storm Spirit -> Storm zips into enemy team -> Lifestealer bursts out (Storm Bomb).' },
      { heroId: 'kotl', heroName: 'Keeper of the Light', reason: 'Chakra Magic supplies infinite mana and cooldown reduction for non-stop zips.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Orchid Malevolence / Bloodthorn', reason: 'Silences Storm before he can zip away, leading to easy kill.' },
        { name: 'Scythe of Vyse (Hex)', reason: 'Instant disable with zero reaction time.' },
        { name: 'Rod of Atos / Gleipnir', reason: 'Roots prevent Storm from casting Ball Lightning.' },
        { name: 'Diffusal Blade', reason: 'Burns his mana so he has no fuel to zip.' }
      ],
      laningAdvice: 'Contest the 2, 4, and 6-minute power runes aggressively so Storm cannot refill his Bottle.',
      teamfightAdvice: 'Never wander alone into dark areas when Storm has mana. Chain instant stuns and silences.',
      weaknessSummary: ['Without mana, Storm is completely helpless', 'Zero escape when silenced or rooted', 'Very weak against Mana Burn (Anti-Mage, Diffusal)']
    }
  },

  {
    id: 'lion',
    name: 'Lion',
    aliases: ['lion', 'demon_witch'],
    title: 'The Demon Witch',
    attribute: 'int',
    attackType: 'Ranged',
    roles: ['Soft Support', 'Hard Support'],
    complexity: 1,
    winRate: 51.3,
    pickRate: 23.4,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lion.png',
    summary: 'Premier disabler with instant Hex, Earth Spike stuns, Mana Drain, and Finger of Death that permanently scales damage per kill.',
    playstyle: 'Roam with Blink Dagger, instantly Hex elusive targets from fog, chain stun with Earth Spike, and execute with Finger of Death to stack infinite magical damage.',
    powerSpikes: {
      early: 'Level 6 Finger of Death provides 600 instant magical burst for guaranteed ganks.',
      mid: 'Blink Dagger timing: Instant 0-cast point Hex catches any core hero before they can BKB.',
      late: 'Aghanim Scepter + Shard: AoE Finger of Death on a 40s cooldown + spell-immune Mana Drain.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'blood_grenade', name: 'Blood Grenade', cost: 50, reason: 'First blood kill setup' },
        { id: 'clarity', name: 'Clarity', cost: 50, reason: 'Mana before Mana Drain' },
        { id: 'observer_ward', name: 'Observer & Sentry', cost: 50, reason: 'Vision' },
        { id: 'iron_branch', name: 'Iron Branch x2', cost: 100, reason: 'Stats' }
      ],
      early: [
        { id: 'tranquil_boots', name: 'Tranquil Boots', cost: 925, reason: 'Movement speed to roam and passive HP regen' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst survival' },
        { id: 'wind_lace', name: 'Wind Lace', cost: 250, reason: 'Mobility' }
      ],
      core: [
        { id: 'blink_dagger', name: 'Blink Dagger', cost: 2250, reason: 'Instant Hex initiation from fog' },
        { id: 'aghanims_shard', name: "Aghanim's Shard", cost: 1400, reason: 'Mana Drain affects 3 targets, gives debuff immunity and magic resist' },
        { id: 'glimmer_cape', name: 'Glimmer Cape / Force Staff', cost: 2150, reason: 'Defensive save for yourself and allies' }
      ],
      situational: [
        {
          category: 'vs Heavy Spells & Burst',
          items: [
            { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'AoE Finger of Death on 40s cooldown' },
            { id: 'aeon_disk', name: 'Aeon Disk', cost: 3000, reason: 'Survives being jumped by enemy carries' }
          ]
        },
        {
          category: 'vs Late Game Mobility',
          items: [
            { id: 'wind_waker', name: 'Wind Waker', cost: 6825, reason: 'Invulnerability save and repositioning' }
          ]
        }
      ],
      late: [
        { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'AoE Finger' },
        { id: 'aeon_disk', name: 'Aeon Disk', cost: 3000, reason: 'Combo breaker' },
        { id: 'wind_waker', name: 'Wind Waker', cost: 6825, reason: 'Ultimate save' }
      ],
      neutrals: [
        { tier: 1, items: ['Arcane Ring', 'Safety Bubble', 'Fairy’s Trinket'] },
        { tier: 2, items: ['Philosopher’s Stone', 'Eye of the Vizier', 'Bullwhip'] },
        { tier: 3, items: ['Psychic Headband', 'Ceremonial Robe', 'Paladin Sword'] },
        { tier: 4, items: ['Timeless Relic', 'Spygadget', 'Trickster Cloak'] },
        { tier: 5, items: ['Seer Stone', 'Apex', 'Mirror Shield'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Earth Spike (Q)', 'Hex (W)', 'Mana Drain (E)', 'Finger of Death (R)'],
      levelGuide: ['Q', 'E', 'Q', 'W', 'Q', 'R', 'Q', 'W', 'W', 'Talent', 'W', 'R', 'E', 'E', 'Talent', 'E', 'R']
    },
    abilities: [
      { name: 'Earth Spike', key: 'Q', description: 'Rock spikes burst from the earth, stunning and damaging all enemy units in a line.' },
      { name: 'Hex', key: 'W', description: 'Instantly transforms enemy target into a harmless critter for up to 3.2s with zero cast point.' },
      { name: 'Mana Drain', key: 'E', description: 'Channels to drain enemy mana while slowing them. Shard grants magic immunity and drains 3 targets.' },
      { name: 'Finger of Death', key: 'R', isUltimate: true, description: 'Rips an enemy unit apart with massive magical damage. Permanently gains +40 damage per kill.' }
    ],
    talents: [
      { level: 10, left: '+10% Mana Drain Slow', right: '+60 Earth Spike Damage', recommended: 'right', reason: 'Better waveclear and kill threshold.' },
      { level: 15, left: '+70 Max HP per Finger Kill', right: '-2s Hex Cooldown', recommended: 'right', reason: 'Ensures near-perpetual Hex lock in teamfights.' },
      { level: 20, left: '+2s Mana Drain Break Distance', right: '+20 Finger Damage per Kill', recommended: 'right', reason: '+60 damage scaling per kill turns Finger into a 2000 damage nuke.' },
      { level: 25, left: '+800 Earth Spike Range', right: '+3 Earth Spike Targets', recommended: 'left', reason: 'Allows stunning entire screens from 1600 range.' }
    ],
    strongAgainst: [
      { heroId: 'puck', heroName: 'Puck', reason: 'Instant Hex gives Puck 0.0 seconds to Phase Shift or Jaunt.' },
      { heroId: 'storm_spirit', heroName: 'Storm Spirit', reason: 'Instant Hex catches Storm before he can zip; Mana Drain empties his pool.' },
      { heroId: 'medusa', heroName: 'Medusa', reason: 'Mana Drain rapidly strips Medusa’s shield.' }
    ],
    weakAgainst: [
      { heroId: 'spectre', heroName: 'Spectre', reason: 'Haunt jumps directly on Lion; Dispersion absorbs and reflects Finger of Death.' },
      { heroId: 'phantom_assassin', heroName: 'Phantom Assassin', reason: 'PA can jump and 1-shot Lion before he can turn.' },
      { heroId: 'rubick', heroName: 'Rubick', reason: 'Rubick steals Finger of Death and Earth Spike with superior cast range and damage.' }
    ],
    synergies: [
      { heroId: 'ursa', heroName: 'Ursa', reason: 'Blink Hex holds enemy still for Ursa to shred.' },
      { heroId: 'sven', heroName: 'Sven', reason: 'Hex + Spike sets up clean cleaves.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Lotus Orb', reason: 'Echo Shell reflects Earth Spike, Hex, and Finger of Death right back onto Lion.' },
        { name: "Linken's Sphere", reason: 'Blocks instant Hex from fog.' },
        { name: 'Glimmer Cape / Pipe', reason: 'Absorbs Finger of Death burst damage.' }
      ],
      laningAdvice: 'Do not allow Lion to Mana Drain you freely. Step out of range or stun him to break channel.',
      teamfightAdvice: 'Hunt Lion down before engaging objectives. He dies quickly to any physical jump (PA, Slark, Riki).',
      weaknessSummary: ['Extremely squishy with low HP and 0 base armor', 'Vulnerable to Lotus Orb reflection', 'Hopeless once enemy carries activate BKB']
    }
  },

  // ==========================================
  // UNIVERSAL & FLEX HEROES
  // ==========================================
  {
    id: 'windranger',
    name: 'Windranger',
    aliases: ['wr', 'lyralei'],
    title: 'The Windranger',
    attribute: 'all',
    attackType: 'Ranged',
    roles: ['Mid', 'Carry', 'Offlane', 'Soft Support'],
    complexity: 2,
    winRate: 51.7,
    pickRate: 17.1,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/windrunner.png',
    summary: 'Universal archer who evades physical attacks with Windrun, binds enemies with Shackleshot, and melts single targets with Focus Fire.',
    playstyle: 'Harass with Powershot, secure Shackleshot tree latches, pop Windrun to dive towers or escape ganks, and focus down priority carries with Maelstrom/Gleipnir + Focus Fire.',
    powerSpikes: {
      early: 'Level 6 Focus Fire + Javelin gives enormous single-target solo kill power.',
      mid: 'Maelstrom / Gleipnir + BKB allows deleting any core hero during Shackleshot stun.',
      late: 'Aghanim Scepter + Daedalus / Nullifier turns Windrun into invisibility and maximum physical DPS.'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'circlet', name: 'Circlet', cost: 155, reason: 'Stats build into Universal damage' },
        { id: 'slippers_of_agility', name: 'Slippers', cost: 140, reason: 'Stats' },
        { id: 'iron_branch', name: 'Iron Branch', cost: 50, reason: 'Stats' },
        { id: 'faerie_fire', name: 'Faerie Fire', cost: 65, reason: 'Damage' }
      ],
      early: [
        { id: 'phase_boots', name: 'Phase Boots', cost: 1500, reason: 'Armor, damage, and move speed' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Sustain' },
        { id: 'javelin', name: 'Javelin', cost: 900, reason: 'Procs bonus pierce damage on every Focus Fire hit' }
      ],
      core: [
        { id: 'maelstrom', name: 'Maelstrom / Gleipnir', cost: 2700, reason: 'Chain lightning procs at max attack speed during Focus Fire' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Prevents magical burst and stuns during Windrun Focus Fire' },
        { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'Windrun grants invisibility, physical damage reduction, and prevents slow' }
      ],
      situational: [
        {
          category: 'vs High Armor & Sustain',
          items: [
            { id: 'mkb', name: 'Monkey King Bar', cost: 4975, reason: 'True Strike and huge magic pierce damage' },
            { id: 'daedalus', name: 'Daedalus', cost: 5150, reason: 'Massive critical strikes on Focus Fire' }
          ]
        },
        {
          category: 'vs Saves (Ghost Scepter / Euls)',
          items: [
            { id: 'nullifier', name: 'Nullifier', cost: 4375, reason: 'Dispels enemy Ghost Scepters while you Focus Fire them' },
            { id: 'linkens', name: "Linken's Sphere", cost: 4800, reason: 'Blocks Halberd disarm or targeted stuns' }
          ]
        }
      ],
      late: [
        { id: 'daedalus', name: 'Daedalus', cost: 5150, reason: 'Peak critical damage' },
        { id: 'nullifier', name: 'Nullifier', cost: 4375, reason: 'Anti-save tool' },
        { id: 'satanic', name: 'Satanic', cost: 5050, reason: 'Instant full HP recovery during Focus Fire' }
      ],
      neutrals: [
        { tier: 1, items: ['Duelist Gloves', 'Safety Bubble', 'Arcane Ring'] },
        { tier: 2, items: ['Grove Bow', 'Vampire Fangs', 'Specialist Array'] },
        { tier: 3, items: ['Enchanted Quiver', 'Paladin Sword', 'Elven Tunic'] },
        { tier: 4, items: ['Mind Breaker', 'Ninja Gear', 'Giggle Noggin'] },
        { tier: 5, items: ['Apex', 'Pirate Hat', 'Desolator 2'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Powershot (W)', 'Windrun (E)', 'Shackleshot (Q)', 'Focus Fire (R)'],
      levelGuide: ['W', 'E', 'W', 'Q', 'W', 'R', 'W', 'E', 'E', 'Talent', 'E', 'R', 'Q', 'Q', 'Talent', 'Q', 'R']
    },
    abilities: [
      { name: 'Shackleshot', key: 'Q', description: 'Shackles the target to an enemy unit or tree behind it for up to 3.8 seconds of stun.' },
      { name: 'Powershot', key: 'W', description: 'Channels a powerful arrow that flies 2600 units, dealing high magic damage and cutting trees.' },
      { name: 'Windrun', key: 'E', description: 'Increases movement speed by 60%, slows nearby enemies, and grants 100% physical attack evasion.' },
      { name: 'Focus Fire', key: 'R', isUltimate: true, description: 'Channels maximum +475 attack speed against a single target with bonus move-while-attacking.' }
    ],
    talents: [
      { level: 10, left: '-2s Shackleshot Cooldown', right: '+200 Powershot Range', recommended: 'left', reason: 'Enables frequent shackles in skirmishes.' },
      { level: 15, left: '+100 Attack Range', right: '-3s Windrun Cooldown', recommended: 'right', reason: 'Near 100% uptime on Windrun evasion and speed.' },
      { level: 20, left: '+1 Shackleshot Target', right: '+12% Focus Fire Damage Reduction Reduction', recommended: 'right', reason: 'Increases Focus Fire DPS significantly.' },
      { level: 25, left: 'Windrun Grants Invisibility (if no Aghs) / +20% Slow', right: '+250 Powershot Damage', recommended: 'left', reason: 'Permanent elusive teamfight presence.' }
    ],
    strongAgainst: [
      { heroId: 'ursa', heroName: 'Ursa', reason: 'Windrun gives 100% evasion against Ursa’s physical attacks; Shackleshot kites him effortlessly.' },
      { heroId: 'sven', heroName: 'Sven', reason: 'Sven cannot hit Windranger during God’s Strength while Windrun is active.' },
      { heroId: 'phantom_assassin', heroName: 'Phantom Assassin', reason: 'Windrun avoids PA crits, and MKB Focus Fire shreds PA.' }
    ],
    weakAgainst: [
      { heroId: 'blade_mail_carriers', heroName: 'Axe / Centaur with Blade Mail', reason: 'Focus Fire’s extreme attack speed reflects back and self-kills Windranger in 1 second.' },
      { heroId: 'tinker', heroName: 'Tinker', reason: 'Laser blinds Windranger and heavy magic burst ignores Windrun physical evasion.' },
      { heroId: 'pugna', heroName: 'Pugna', reason: 'Decrepify prevents physical attacks, and Nether Ward punishes frequent spell spam.' }
    ],
    synergies: [
      { heroId: 'treant_protector', heroName: 'Treant Protector', reason: 'Overgrowth and Nature’s Guise guarantee tree latches for Shackleshot.' },
      { heroId: 'slardar', heroName: 'Slardar', reason: 'Corrosive Haze minus armor makes Focus Fire delete heroes in under a second.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Blade Mail', reason: 'CRITICAL: Activate Blade Mail when WR uses Focus Fire on you; she takes lethal reflected damage.' },
        { name: "Heaven's Halberd", reason: 'Disarms Windranger for 5.0 seconds, completely shutting down Focus Fire.' },
        { name: 'Monkey King Bar (MKB)', reason: 'True Strike pierces Windrun’s 100% evasion.' },
        { name: 'Nullifier', reason: 'Dispels Windrun active buff immediately.' }
      ],
      laningAdvice: 'Do not stand directly in line between Windranger and trees/allies to avoid double Shackleshots.',
      teamfightAdvice: 'Buy Blade Mail or Halberd. When she casts Focus Fire, either disarm her or pop Blade Mail to punish her.',
      weaknessSummary: ['Dies instantly to Blade Mail during Focus Fire', 'Countered hard by Nullifier and MKB', 'Vulnerable to magic burst that ignores Windrun']
    }
  },

  {
    id: 'witch_doctor',
    name: 'Witch Doctor',
    aliases: ['wd', 'zharvakko'],
    title: 'The Witch Doctor',
    attribute: 'int',
    attackType: 'Ranged',
    roles: ['Hard Support', 'Soft Support'],
    complexity: 1,
    winRate: 53.2,
    pickRate: 22.1,
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/witch_doctor.png',
    summary: 'Dominant support who turns teamfights with Paralyzing Cask bounces, lethal Maledict percentage burst, and pure damage Death Ward.',
    playstyle: 'Land Paralyzing Cask when 2 enemies or creeps are clustered, apply Maledict, drop Death Ward from fog/invisibility, and watch enemy health bars evaporate.',
    powerSpikes: {
      early: 'Level 2 Cask + Maledict combo in lane results in easy first blood.',
      mid: 'Aghanim Shard (Switcheroo) gives invulnerability; Glimmer Cape protects Death Ward channel.',
      late: 'Aghanim Scepter (Death Ward attacks bounce between enemies with Pure damage and True Strike).'
    },
    build: {
      starting: [
        { id: 'tango', name: 'Tango', cost: 90, reason: 'Lane sustain' },
        { id: 'blood_grenade', name: 'Blood Grenade', cost: 50, reason: 'Slow and burst damage for first blood' },
        { id: 'clarity', name: 'Clarity x2', cost: 100, reason: 'Mana for Cask and Maledict' },
        { id: 'observer_ward', name: 'Observer & Sentry', cost: 50, reason: 'Vision and camp blocking' },
        { id: 'iron_branch', name: 'Iron Branch x2', cost: 100, reason: 'Stats' }
      ],
      early: [
        { id: 'arcane_boots', name: 'Arcane Boots', cost: 1300, reason: 'Mana restore for lane partner' },
        { id: 'magic_wand', name: 'Magic Wand', cost: 450, reason: 'Burst health and mana' },
        { id: 'wind_lace', name: 'Wind Lace', cost: 250, reason: 'Positioning speed' }
      ],
      core: [
        { id: 'glimmer_cape', name: 'Glimmer Cape', cost: 2150, reason: 'Cast on yourself while channeling Death Ward for invisibility and magic shield' },
        { id: 'aghanims_shard', name: "Aghanim's Shard (Switcheroo)", cost: 1400, reason: 'Turns WD invulnerable and hidden while shooting Death Ward for 2s' },
        { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'Death Ward attacks bounce between multiple targets with Pure damage' }
      ],
      situational: [
        {
          category: 'vs Heavy Stuns / Initiation',
          items: [
            { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Guarantees full uninterrupted Death Ward channel in chaotic teamfights' },
            { id: 'aeon_disk', name: 'Aeon Disk', cost: 3000, reason: 'Survives being jumped and lets you counter-ult' }
          ]
        },
        {
          category: 'vs Melee Pursuers',
          items: [
            { id: 'force_staff', name: 'Force Staff', cost: 2200, reason: 'Kite melee heroes and reposition' },
            { id: 'ghost_scepter', name: 'Ghost Scepter', cost: 1500, reason: 'Immunity to physical dive carries (PA/Ursa)' }
          ]
        }
      ],
      late: [
        { id: 'aghanims_scepter', name: "Aghanim's Scepter", cost: 4200, reason: 'Teamwipe bouncing Death Ward' },
        { id: 'bkb', name: 'Black King Bar', cost: 4050, reason: 'Unstoppable Death Ward channel' },
        { id: 'wind_waker', name: 'Wind Waker', cost: 6825, reason: 'Defensive save and mobility' }
      ],
      neutrals: [
        { tier: 1, items: ['Arcane Ring', 'Safety Bubble', 'Fairy’s Trinket'] },
        { tier: 2, items: ['Philosopher’s Stone', 'Eye of the Vizier', 'Bullwhip'] },
        { tier: 3, items: ['Psychic Headband', 'Ceremonial Robe', 'Cloak of Flames'] },
        { tier: 4, items: ['Timeless Relic', 'Spygadget', 'Trickster Cloak'] },
        { tier: 5, items: ['Seer Stone', 'Apex', 'Book of Shadows'] }
      ]
    },
    skillOrder: {
      maxPriority: ['Paralyzing Cask (Q)', 'Maledict (E)', 'Voodoo Restoration (W)', 'Death Ward (R)'],
      levelGuide: ['Q', 'E', 'E', 'Q', 'E', 'R', 'E', 'Q', 'Q', 'Talent', 'W', 'R', 'W', 'W', 'Talent', 'W', 'R']
    },
    abilities: [
      { name: 'Paralyzing Cask', key: 'Q', description: 'Throws a cask of paralyzing powder that bounces between enemy units, stunning and dealing damage.' },
      { name: 'Voodoo Restoration', key: 'W', description: 'Toggles a healing aura that consumes mana to heal nearby allies.' },
      { name: 'Maledict', key: 'E', description: 'Curses an area. Every 4 seconds, cursed units take burst damage based on health lost since the curse began.' },
      { name: 'Death Ward', key: 'R', isUltimate: true, description: 'Channels a deadly totem that fires rapid attacks at nearby enemy heroes, dealing Pure damage.' }
    ],
    talents: [
      { level: 10, left: '+200 Cast Range', right: '+80 Maledict AoE', recommended: 'left', reason: 'Allows casting Cask and Maledict safely from maximum range.' },
      { level: 15, left: '+300 Health', right: '+2 Cask Bounces', recommended: 'right', reason: 'More bounces locks down entire teams.' },
      { level: 20, left: '+25% Maledict Burst Damage', right: '+100 Death Ward Attack Range', recommended: 'left', reason: 'Guarantees lethal Maledict ticks on cores.' },
      { level: 25, left: '+1.5% Max HP Voodoo Restoration', right: '+60 Death Ward Damage', recommended: 'right', reason: 'Aghanim Scepter + Talent Death Ward obliterates whole teams in 3s.' }
    ],
    strongAgainst: [
      { heroId: 'pudge', heroName: 'Pudge', reason: 'Maledict percentage burst destroys Pudge’s massive HP pool.' },
      { heroId: 'bristleback', heroName: 'Bristleback', reason: 'Maledict damage scales directly off health lost and ignores back armor.' },
      { heroId: 'terrorblade', heroName: 'Terrorblade', reason: 'Paralyzing Cask bounces continuously between TB and his illusions.' }
    ],
    weakAgainst: [
      { heroId: 'silencer', heroName: 'Silencer', reason: 'Global Silence instantly interrupts Death Ward channel from anywhere on the map.' },
      { heroId: 'clockwerk', heroName: 'Clockwerk', reason: 'Hookshot and Battery Assault continuously cancels Death Ward channel.' },
      { heroId: 'vengeful_spirit', heroName: 'Vengeful Spirit', reason: 'Nether Swap pierces BKB and interrupts Death Ward.' },
      { heroId: 'riki', heroName: 'Riki', reason: 'Smoke Screen silences WD and backstab quickly deletes his fragile health.' }
    ],
    synergies: [
      { heroId: 'faceless_void', heroName: 'Faceless Void', reason: 'Chronosphere locks entire enemy team inside Death Ward + Maledict range.' },
      { heroId: 'axe', heroName: 'Axe', reason: 'Berserker’s Call keeps enemies clustered for maximum Cask bounces and Death Ward.' }
    ],
    counterStrategy: {
      keyCounterItems: [
        { name: 'Dust of Appearance / Sentries', reason: 'WD will always Glimmer Cape during Death Ward; True Sight allows targeting and stopping him.' },
        { name: 'Lotus Orb / Eul’s Scepter', reason: 'Dispels Maledict curse and reflects Paralyzing Casks.' },
        { name: 'Ghost Scepter', reason: 'Death Ward is pure/physical attack based; Ghost Scepter negates Death Ward hits.' },
        { name: 'Orchid / Scythe of Vyse', reason: 'Instantly silences or Hexes WD before he can drop Death Ward.' }
      ],
      laningAdvice: 'Never stand close to your lane partner or creeps when Witch Doctor is preparing to throw Paralyzing Cask.',
      teamfightAdvice: 'Save one stun specifically to interrupt Witch Doctor’s Death Ward channel. Do not waste all stuns on the enemy offlaner.',
      weaknessSummary: ['Very squishy support', 'Death Ward is a channeled spell easily interrupted by stuns/silences', 'Maledict can be mitigated by Lotus Orb or burst heals']
    }
  },

  // ==========================================
  // EXPANDED HERO ROSTER (OPTIMIZED ZERO-DUPLICATION)
  // ==========================================
  createArchetypeHero({
  "id": "bane",
  "name": "Bane",
  "aliases": [
    "bane",
    "bane"
  ],
  "title": "The Bane",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 2,
  "winRate": 49.5,
  "pickRate": 4.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bane.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bane.png",
  "summary": "When the gods have nightmares, it is Bane Elemental who brings them. Also known as Atropos, Bane was born from the midnight terrors of the goddess Nyctasha.",
  "abilities": [
    {
      "name": "Enfeeble",
      "key": "Q",
      "description": "Deals damage every second and lowers the enemy\\'s total attack damage and cast range.",
      "manaCost": "100/110/120/130",
      "cooldown": "22/17/12/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bane_enfeeble.png"
    },
    {
      "name": "Brain Sap",
      "key": "W",
      "description": "Feasts on the vital energies of an enemy unit, healing Bane and dealing damage.",
      "manaCost": "105/120/135/150",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bane_brain_sap.png"
    },
    {
      "name": "Nightmare",
      "key": "E",
      "description": "Puts the target enemy or friendly Hero to sleep. Sleeping units walk in Bane\\'s chosen direction and are awakened when...",
      "manaCost": "120/130/140/150",
      "cooldown": "25/22/19/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bane_nightmare.png"
    },
    {
      "name": "Fiend\\'s Grip",
      "key": "D",
      "description": "CHANNELED - Grips an enemy unit, disabling it and causing heavy damage over time, while stealing mana every 0.5 secon...",
      "manaCost": "200/300/400",
      "cooldown": "120/110/100",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bane_fiends_grip.png"
    },
    {
      "name": "Nightmare End",
      "key": "R",
      "description": "Ends all ongoing Nightmares.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bane_nightmare_end.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+125 Brain Sap Cast Range",
      "right": "+20% Enfeeble Cast Range Reduction",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+13 Enfeeble Damage Per Second",
      "right": "+5% Fiend\\'s Grip Max Mana Drain",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-3s Nightmare Cooldown",
      "right": "+30 Movement Speed",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+275 Brain Sap Damage/Heal",
      "right": "+3s Fiend\\'s Grip Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "bloodseeker",
  "name": "Bloodseeker",
  "aliases": [
    "bloodseeker",
    "bloodseeker"
  ],
  "title": "The Bloodseeker",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 51.7,
  "pickRate": 5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bloodseeker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bloodseeker.png",
  "summary": "Strygwyr the Bloodseeker is a ritually sanctioned hunter, Hound of the Flayed Twins, sent down from the mist-shrouded peaks of Xhacatocatl in search of blood. The Flayed Ones re...",
  "abilities": [
    {
      "name": "Bloodrage",
      "key": "Q",
      "description": "Drives Bloodseeker into a bloodthirsty rage which causes him to attack faster and deal more spell damage at the cost ...",
      "manaCost": "0",
      "cooldown": "14/12/10/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bloodseeker_bloodrage.png"
    },
    {
      "name": "Blood Rite",
      "key": "W",
      "description": "Bloodseeker baptizes an area in sacred blood. After 2.9 seconds the ritual completes, causing any enemies caught in t...",
      "manaCost": "90/100/110/120",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bloodseeker_blood_bath.png"
    },
    {
      "name": "Thirst",
      "key": "E",
      "description": "Bloodseeker is invigorated by the wounds of his enemies, gaining bonus movement speed when an enemy hero\\'s health fal...",
      "manaCost": "0",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bloodseeker_thirst.png"
    },
    {
      "name": "Sanguivore",
      "key": "D",
      "description": "Bloodseeker restores some life when he kills a unit, equal to 30 health plus a percentage of the units max health.  R...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bloodseeker_sanguivore.png"
    },
    {
      "name": "Rupture",
      "key": "R",
      "description": "Causes an enemy unit\\'s skin to rupture, dealing initial damage based on its current health. If the unit moves, it tak...",
      "manaCost": "125/175/225",
      "cooldown": "75/70/65",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bloodseeker_rupture.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+200 Health",
      "right": "+30 Bloodrage Attack Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-0.7% Bloodrage Max Health DPS",
      "right": "+100 Blood Rite Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+400 Rupture Cast Range",
      "right": "+15 Agility",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+3.0s Blood Rite Silence Duration",
      "right": "+15% Max Thirst Move Speed",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "crystal_maiden",
  "name": "Crystal Maiden",
  "aliases": [
    "cm",
    "rylai"
  ],
  "title": "The Crystal Maiden",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 51.8,
  "pickRate": 16.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/crystal_maiden.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/crystal_maiden.png",
  "summary": "Born in a temperate realm, raised with her fiery older sister Lina, Rylai the Crystal Maiden soon found that her innate elemental affinity to ice created trouble for all those a...",
  "abilities": [
    {
      "name": "Crystal Nova",
      "key": "Q",
      "description": "A burst of damaging frost slows enemy movement in the targeted area.",
      "manaCost": "115/135/155/175",
      "cooldown": "11/10/9/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/crystal_maiden_crystal_nova.png"
    },
    {
      "name": "Frostbite",
      "key": "W",
      "description": "Encases an enemy unit in ice, prohibiting movement and attack, while dealing damage over time. Deals 4x damage to non...",
      "manaCost": "125/135/145/155",
      "cooldown": "9/8/7/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/crystal_maiden_frostbite.png"
    },
    {
      "name": "Arcane Aura",
      "key": "E",
      "description": "Gives mana regeneration to all friendly units on the map. Allies within a 1200 radius of Crystal Maiden receive more ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/crystal_maiden_brilliance_aura.png"
    },
    {
      "name": "Crystal Clone",
      "key": "D",
      "description": "Slides in a direction, creating a crystal clone of herself in her place and disjointing incoming projectiles. If the ...",
      "manaCost": "150",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/crystal_maiden_crystal_clone.png"
    },
    {
      "name": "Glacial Guard",
      "key": "R",
      "description": "A portion of the mana Crystal Maiden spends on her abilities is converted into a physical barrier.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/crystal_maiden_glacial_guard.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+200 Health",
      "right": "+12 Intelligence",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+100 Frostbite Cast Range",
      "right": "-4.5s Crystal Nova Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+20% Glacial Guard Mana Spent To Barrier",
      "right": "+50 Freezing Field Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.0s Frostbite Duration",
      "right": "+300 Crystal Nova Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "earthshaker",
  "name": "Earthshaker",
  "aliases": [
    "es",
    "raigor"
  ],
  "title": "The Earthshaker",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 50.5,
  "pickRate": 18.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/earthshaker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/earthshaker.png",
  "summary": "Like a golem or gargoyle, Earthshaker was one with the earth but now walks freely upon it. Unlike those other entities, he created himself through an act of will, and serves no ...",
  "abilities": [
    {
      "name": "Fissure",
      "key": "Q",
      "description": "Slams the ground with a mighty totem, creating an impassable ridge of stone while stunning and damaging enemy units a...",
      "manaCost": "115/120/125/130",
      "cooldown": "18/17/16/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earthshaker_fissure.png"
    },
    {
      "name": "Enchant Totem",
      "key": "W",
      "description": "Empowers Earthshaker\\'s totem, causing it to deal extra damage and have 100 bonus attack range on the next attack.",
      "manaCost": "45/55/65/75",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earthshaker_enchant_totem.png"
    },
    {
      "name": "Aftershock",
      "key": "E",
      "description": "Causes the earth to shake underfoot, adding additional damage and stuns to nearby enemy units when Earthshaker casts ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earthshaker_aftershock.png"
    },
    {
      "name": "Echo Slam",
      "key": "D",
      "description": "Shockwaves travel through the ground, damaging enemy units. Each enemy hit causes an echo to damage nearby units. Rea...",
      "manaCost": "150/200/250",
      "cooldown": "130/120/110",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earthshaker_echo_slam.png"
    },
    {
      "name": "Slugger",
      "key": "R",
      "description": "Enemies killed with Enchant Totem or Earthshaker\\'s other abilities are sent flying, dealing damage to enemies they hit.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earthshaker_slugger.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25 Base Damage",
      "right": "+75 Fissure Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+200 Fissure Range",
      "right": "+50 Aftershock Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+50 Echo Damage",
      "right": "+65% Enchant Totem Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-50% Echo Slam Cooldown",
      "right": "-1.5s Enchant Totem Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "juggernaut",
  "name": "Juggernaut",
  "aliases": [
    "jugg",
    "yurnero"
  ],
  "title": "The Juggernaut",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 1,
  "winRate": 52.3,
  "pickRate": 21.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/juggernaut.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/juggernaut.png",
  "summary": "No one has ever seen the face hidden beneath the mask of Yurnero the Juggernaut. It is only speculation that he even has one.",
  "abilities": [
    {
      "name": "Blade Fury",
      "key": "Q",
      "description": "Causes a bladestorm of destructive force around Juggernaut, rendering him debuff immune with 80% magic resistance and...",
      "manaCost": "110",
      "cooldown": "30/26/22/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/juggernaut_blade_fury.png"
    },
    {
      "name": "Healing Ward",
      "key": "W",
      "description": "Summons a Healing Ward which heals all nearby allied units, based on their max health. The Healing Ward moves at 325 ...",
      "manaCost": "120",
      "cooldown": "60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/juggernaut_healing_ward.png"
    },
    {
      "name": "Blade Dance",
      "key": "E",
      "description": "Gives Juggernaut a chance to deal critical damage with Blade Fury and on each attack.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/juggernaut_blade_dance.png"
    },
    {
      "name": "Swiftslash",
      "key": "D",
      "description": "Performs a short Omnislash for 1 seconds.",
      "manaCost": "150",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/juggernaut_swift_slash.png"
    },
    {
      "name": "Bladeform",
      "key": "R",
      "description": "Juggernaut gains a stack of Bladeform every 2s that Juggernaut does not take damage. Each stack grants bonus base Agi...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/juggernaut_bladeform.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-12s Healing Ward Cooldown",
      "right": "-1.0s Bladeform Stack Gain Interval",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-15s Omnislash Cooldown",
      "right": "45 Movement Speed During Blade Fury",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+15% Blade Dance Crit Damage",
      "right": "+120 Blade Fury Damage Per Second",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1s Omnislash Duration",
      "right": "+40% Blade Dance Lifesteal",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "mirana",
  "name": "Mirana",
  "aliases": [
    "mirana",
    "mirana"
  ],
  "title": "The Mirana",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Soft Support",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 51.7,
  "pickRate": 15,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/mirana.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/mirana.png",
  "summary": "Born to a royal family, a blood princess next in line for the Solar Throne, Mirana willingly surrendered any claim to mundane land or titles when she dedicated herself completel...",
  "abilities": [
    {
      "name": "Starstorm",
      "key": "Q",
      "description": "Calls down a wave of meteors to damage nearby enemy units. The closest enemy unit to Mirana in a 675 radius will be s...",
      "manaCost": "80/90/100/110",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mirana_starfall.png"
    },
    {
      "name": "Sacred Arrow",
      "key": "W",
      "description": "Fires a long-range arrow with deadly precision, which stuns and damages the first enemy unit it strikes. The stun dur...",
      "manaCost": "90",
      "cooldown": "19/18/17/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mirana_arrow.png"
    },
    {
      "name": "Leap",
      "key": "E",
      "description": "Mirana leaps forward into battle, empowering herself with a ferocious roar that grants bonus attack and movement spee...",
      "manaCost": "50",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mirana_leap.png"
    },
    {
      "name": "Celestial Quiver",
      "key": "D",
      "description": "When a charge is available, Mirana\\'s next attack will deal bonus magic damage.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mirana_celestial_quiver.png"
    },
    {
      "name": "Moonlight Shadow",
      "key": "R",
      "description": "Turns Mirana and all allied heroes invisible and grants bonus movement speed. Mirana gains bonus outgoing damage duri...",
      "manaCost": "125",
      "cooldown": "120/110/100",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mirana_invis.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-2s Starstorm Cooldown",
      "right": "+150 Leap Distance",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "Moonlight Shadow gives +20% Evasion",
      "right": "+100 Leap Attack Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+200 Starstorm Damage",
      "right": "+50 Celestial Quiver Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+2 Multishot Sacred Arrows",
      "right": "-30s Moonlight Shadow Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "morphling",
  "name": "Morphling",
  "aliases": [
    "morphling",
    "morphling"
  ],
  "title": "The Morphling",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 3,
  "winRate": 48,
  "pickRate": 4.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/morphling.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/morphling.png",
  "summary": "For dark eons the comet circled. Held in thrall to a distant sun, bound by gravity\\'s inexorable pull, the massive ball of ice careened through the blackness between worlds, made...",
  "abilities": [
    {
      "name": "Waveform",
      "key": "Q",
      "description": "Morphling dissolves into liquid and surges forward, damaging enemy units in his path. Morphling is invulnerable durin...",
      "manaCost": "115",
      "cooldown": "21/18/15/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/morphling_waveform.png"
    },
    {
      "name": "Adaptive Strike",
      "key": "W",
      "description": "Launches a surge of water toward an enemy unit, stunning them, knocking them back, and dealing base damage plus addit...",
      "manaCost": "40/50/60/70",
      "cooldown": "17/14/11/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/morphling_adaptive_strike_agi.png"
    },
    {
      "name": "Ebb and Flow",
      "key": "E",
      "description": "Morphling receives bonus cast range and slow resistance based on his current Strength, and attack range and movement ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/morphling_ebb_and_flow.png"
    },
    {
      "name": "Attribute Shift (Agility Gain)",
      "key": "D",
      "description": "Morphling shifts its form, pulling points from Strength and pouring them into Agility at a rate of 4. The process is ...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/morphling_morph_agi.png"
    },
    {
      "name": "Attribute Shift (Strength Gain)",
      "key": "R",
      "description": "Morphling shifts its form, pulling points from Agility and pouring them into Strength at a rate of 4. The process is ...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/morphling_morph_str.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+15% Magic Resistance",
      "right": "+12s Morph Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+250 Waveform Range",
      "right": "+75 Attack Range",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-3s Adaptive Strike Cooldown",
      "right": "+15 Agility",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-40% Waveform Cooldown",
      "right": "+35 Strength",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "shadow_fiend",
  "name": "Shadow Fiend",
  "aliases": [
    "sf",
    "nevermore"
  ],
  "title": "The Shadow Fiend",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Carry"
  ],
  "complexity": 2,
  "winRate": 45.4,
  "pickRate": 24.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/nevermore.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/nevermore.png",
  "summary": "It is said that Nevermore the Shadow Fiend has the soul of a poet, and in fact he has thousands of them. Over the ages he has claimed the souls of poets, priests, emperors, begg...",
  "abilities": [
    {
      "name": "Shadowraze",
      "key": "Q",
      "description": "Shadow Fiend razes the ground directly in front of him, dealing damage to enemy units in the area, dealing bonus dama...",
      "manaCost": "75",
      "cooldown": "9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nevermore_shadowraze1.png"
    },
    {
      "name": "Shadowraze",
      "key": "W",
      "description": "Shadow Fiend razes the ground a short distance away from him, dealing damage to enemy units in the area, dealing bonu...",
      "manaCost": "75",
      "cooldown": "9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nevermore_shadowraze2.png"
    },
    {
      "name": "Shadowraze",
      "key": "E",
      "description": "Shadow Fiend razes the ground a longer distance away from him, dealing damage to enemy units in the area, dealing bon...",
      "manaCost": "75",
      "cooldown": "9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nevermore_shadowraze3.png"
    },
    {
      "name": "Feast of Souls",
      "key": "D",
      "description": "Shadow Fiend gains Bonus Movement and Attack Speed for 8 seconds. For the duration of the effect, every 0.5s he colle...",
      "manaCost": "60/65/70/75",
      "cooldown": "21",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nevermore_frenzy.png"
    },
    {
      "name": "Presence of the Dark Lord",
      "key": "R",
      "description": "Shadow Fiend\\'s presence reduces the armor of nearby enemies.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nevermore_dark_lord.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+30 Shadowraze Stack Damage",
      "right": "+30 Feast of Souls Attack Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+2 Presence Armor Reduction",
      "right": "+2 Feast of Souls Souls Collected Per Hero",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+5 Necromastery Max Souls",
      "right": "+0.2s Requiem Fear per line",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Feast of Souls Grants +30% Cast Speed",
      "right": "Shadowraze Applies Attack Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "phantom_lancer",
  "name": "Phantom Lancer",
  "aliases": [
    "pl",
    "azwraith"
  ],
  "title": "The Phantom Lancer",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 2,
  "winRate": 53.2,
  "pickRate": 14.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_lancer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_lancer.png",
  "summary": "The remote village of Pole had no knowledge of the wars raging in the heart of the kingdom. For them, the quiet of spear fishing, and a family meal were all that a full life req...",
  "abilities": [
    {
      "name": "Spirit Lance",
      "key": "Q",
      "description": "Sends a magical spirit lance to a target enemy unit that damages and slows, while summoning an illusory phantom to at...",
      "manaCost": "120",
      "cooldown": "10/9/8/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phantom_lancer_spirit_lance.png"
    },
    {
      "name": "Doppelganger",
      "key": "W",
      "description": "Phantom Lancer briefly vanishes from the battlefield. After 1 second, Phantom Lancer and any of his nearby illusions ...",
      "manaCost": "70",
      "cooldown": "22/18/14/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phantom_lancer_doppelwalk.png"
    },
    {
      "name": "Phantom Rush",
      "key": "E",
      "description": "When targeting an enemy for an attack, Phantom Lancer quickly charges into range, gaining increased movement speed an...",
      "cooldown": "15/11/7/3",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phantom_lancer_phantom_edge.png"
    },
    {
      "name": "Illusory Armaments",
      "key": "D",
      "description": "Whenever an illusion of Phantom Lancer is created, its outgoing damage cannot go below a fixed value for 3 seconds.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phantom_lancer_illusory_armaments.png"
    },
    {
      "name": "Juxtapose",
      "key": "R",
      "description": "Phantom Lancer has a chance to fracture his presence on an attack, creating an illusion of himself. Illusions also ha...",
      "manaCost": "undefined",
      "cooldown": "undefined",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phantom_lancer_juxtapose.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.0s Spirit Lance Slow Duration",
      "right": "+3% Juxtapose Illusion Trigger Chance",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "50% Illusion Spirit Lance Damage",
      "right": "+125 Doppelganger Cast Range",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+100 Spirit Lance Damage",
      "right": "-70% Juxtapose Illusion Damage Taken",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-4s Doppelganger Cooldown",
      "right": "+2s Illusory Armaments Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "puck",
  "name": "Puck",
  "aliases": [
    "puck",
    "puck"
  ],
  "title": "The Puck",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid"
  ],
  "complexity": 2,
  "winRate": 46.6,
  "pickRate": 3.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/puck.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/puck.png",
  "summary": "While Puck seems at first glance a mischievous, childish character, this quality masks an alien personality. The juvenile form of a Faerie Dragon, a creature that lives for eons...",
  "abilities": [
    {
      "name": "Illusory Orb",
      "key": "Q",
      "description": "Vector Targeted. Puck launches a magic orb that travels along the path, damaging enemy units along the way. The orb d...",
      "manaCost": "90/100/110/120",
      "cooldown": "11/10/9/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/puck_illusory_orb.png"
    },
    {
      "name": "Waning Rift",
      "key": "W",
      "description": "Puck teleports to the target location and releases a burst of faerie dust that deals damage and silences enemy units ...",
      "manaCost": "100/110/120/130",
      "cooldown": "16/15/14/13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/puck_waning_rift.png"
    },
    {
      "name": "Phase Shift",
      "key": "E",
      "description": "CHANNELED - Puck briefly shifts into another dimension where it is immune from harm.",
      "manaCost": "0",
      "cooldown": "8/7.5/7/6.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/puck_phase_shift.png"
    },
    {
      "name": "Ethereal Jaunt",
      "key": "D",
      "description": "Teleports Puck to a flying Illusory Orb.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/puck_ethereal_jaunt.png"
    },
    {
      "name": "Puckish",
      "key": "R",
      "description": "Whenever Puck disjoints an attack, it restores 3% of its max health and mana. Dodging a targeted spell projectile res...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/puck_puckish.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+35 Illusory Orb Damage",
      "right": "+1.25s Waning Rift Silence Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-30s Dream Coil Cooldown",
      "right": "+60 Waning Rift Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-2.5s Waning Rift Cooldown",
      "right": "+200 Initial/Break Dream Coil Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+2% Puckish Health and Mana Restoration",
      "right": "+350 Waning Rift Radius/Max Distance",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "pudge",
  "name": "Pudge",
  "aliases": [
    "butcher"
  ],
  "title": "The Pudge",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 51.4,
  "pickRate": 33.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pudge.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pudge.png",
  "summary": "In the Fields of Endless Carnage, far to the south of Quoidge, a corpulent figure works tirelessly through the night--dismembering, disembowelling, piling up the limbs and visce...",
  "abilities": [
    {
      "name": "Meat Hook",
      "key": "Q",
      "description": "Launches a bloody hook toward a unit or location. The hook will snag the first unit it encounters, dragging the unit ...",
      "manaCost": "120",
      "cooldown": "18/16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pudge_meat_hook.png"
    },
    {
      "name": "Rot",
      "key": "W",
      "description": "A toxic cloud that deals intense damage and slows movement--harming not only enemy units but Pudge himself.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pudge_rot.png"
    },
    {
      "name": "Meat Shield",
      "key": "E",
      "description": "Pudge covers himself with a layer of flesh that blocks damage of any type taken from any source.",
      "manaCost": "65/70/75/80",
      "cooldown": "20/19/18/17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pudge_flesh_heap.png"
    },
    {
      "name": "Flesh Heap",
      "key": "D",
      "description": "Pudge\\'s skin thickens permanently every time he kills an enemy Hero, gaining 2 bonus Strength for each stack.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pudge_innate_graft_flesh.png"
    },
    {
      "name": "Dismember",
      "key": "R",
      "description": "CHANNELED - Pudge chows down on an enemy unit, disabling it and dealing damage over time. Damage is increased by Pudg...",
      "manaCost": "100/130/170",
      "cooldown": "30/25/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pudge_dismember.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+5 Armor",
      "right": "+10% Rot Slow",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+8% Spell Lifesteal",
      "right": "+{s:bonus_damage} Meat Hook Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.75s Dismember Duration",
      "right": "-4s Meat Hook Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "1.5x Dismember Damage/Heal",
      "right": "1.5x Flesh Heap and Meat Shield bonuses",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "razor",
  "name": "Razor",
  "aliases": [
    "razor",
    "razor"
  ],
  "title": "The Razor",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 50.5,
  "pickRate": 7.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/razor.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/razor.png",
  "summary": "Among the emblematic powers that populate the Underscape, Razor the Lightning Revenant is one of the most feared. With his whip of lightning, he patrols the Narrow Maze, that tr...",
  "abilities": [
    {
      "name": "Plasma Field",
      "key": "Q",
      "description": "Releases a wave of energetic plasma that grows in power as it expands, but also zaps on contraction, slowing and deal...",
      "manaCost": "125",
      "cooldown": "13/12/11/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/razor_plasma_field.png"
    },
    {
      "name": "Static Link",
      "key": "W",
      "description": "Creates a charged link between Razor and an enemy Hero, stealing damage from the target and giving it to Razor. Allow...",
      "manaCost": "65",
      "cooldown": "44/36/28/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/razor_static_link.png"
    },
    {
      "name": "Storm Surge",
      "key": "E",
      "description": "There\\'s a chance when attacked, and always when targeted with a spell, to release a forked lightning that strikes the...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/razor_storm_surge.png"
    },
    {
      "name": "Unstable Current",
      "key": "D",
      "description": "Unstable Current tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/razor_unstable_current.png"
    },
    {
      "name": "Eye of the Storm",
      "key": "R",
      "description": "A powerful lightning storm strikes out at the enemy unit with the lowest health, dealing damage and reducing armor.",
      "manaCost": "100/150/200",
      "cooldown": "80/70/60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/razor_eye_of_the_storm.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+0.75s Plasma Field Slow Duration",
      "right": "+4 Armor",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+6 Static Link Damage Steal",
      "right": "+12 Strength",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+35% Storm Surge Slow and Damage",
      "right": "-0.1s Eye of the Storm Strike Interval",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Creates A Second Plasma Field Delayed By 0.8s",
      "right": "Static Link Steals Attack Speed",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "sand_king",
  "name": "Sand King",
  "aliases": [
    "sk",
    "crixalis"
  ],
  "title": "The Sand King",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 49.5,
  "pickRate": 5.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sand_king.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sand_king.png",
  "summary": "The sands of the Scintillant Waste are alive and sentient--the whole vast desert speaks to itself, thinking thoughts only such a vastness can conceive. But when it needs must fi...",
  "abilities": [
    {
      "name": "Burrowstrike",
      "key": "Q",
      "description": "Sand King burrows into the ground and tunnels forward, damaging and stunning enemy units above him as he resurfaces. ...",
      "manaCost": "100/110/120/130",
      "cooldown": "14/13/12/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sandking_burrowstrike.png"
    },
    {
      "name": "Sand Storm",
      "key": "W",
      "description": "Sand King creates a fearsome sandstorm that damages enemy units and grants Sand King Invisibility while he is in it. ...",
      "manaCost": "85",
      "cooldown": "40/34/28/22",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sandking_sand_storm.png"
    },
    {
      "name": "Stinger",
      "key": "E",
      "description": "Sand King strikes an area, performing an attack on all enemies in the area of effect, dealing extra damage to each. E...",
      "manaCost": "35/40/45/50",
      "cooldown": "15/12/9/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sandking_scorpion_strike.png"
    },
    {
      "name": "Caustic Finale",
      "key": "D",
      "description": "Sand King\\'s attacks inject a venom that causes enemy units to violently explode when they die that does a flat amount...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sandking_caustic_finale.png"
    },
    {
      "name": "Epicenter",
      "key": "R",
      "description": "After a cast point of 2 seconds, Sand King sends a disturbance into the earth, causing it to shudder violently. All e...",
      "manaCost": "150/225/300",
      "cooldown": "120/110/100",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sandking_epicenter.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+12% Stinger Slow",
      "right": "+100 Caustic Finale Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25 Sand Storm Damage Per Second",
      "right": "+200 Burrowstrike Cast Range",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-3s Burrowstrike Cooldown",
      "right": "+6 Epicenter Pulses",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+125 Stinger Damage",
      "right": "35% Sand Storm Slow and Blind",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "tiny",
  "name": "Tiny",
  "aliases": [
    "stone giant"
  ],
  "title": "The Tiny",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Mid",
    "Carry"
  ],
  "complexity": 2,
  "winRate": 44.8,
  "pickRate": 5.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tiny.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tiny.png",
  "summary": "Coming to life as a chunk of stone, Tiny\\'s origins are a mystery on which he continually speculates. He is a Stone Giant now, but what did he used to be? A splinter broken from ...",
  "abilities": [
    {
      "name": "Avalanche",
      "key": "Q",
      "description": "Bombards an area with rocks, continously doing small intervals of damage and stun to enemy units.",
      "manaCost": "105/120/135/150",
      "cooldown": "23/20/17/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tiny_avalanche.png"
    },
    {
      "name": "Toss",
      "key": "W",
      "description": "Grabs the nearest unit in a 300 radius around Tiny, ally or enemy, and launches it at the target unit or rune to deal...",
      "manaCost": "125",
      "cooldown": "20/17/14/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tiny_toss.png"
    },
    {
      "name": "Tree Grab",
      "key": "E",
      "description": "Grabs a tree and causes Tiny to have bonus range, damage, and a splashing attack for a limited number of attacks. The...",
      "manaCost": "40/35/30/25",
      "cooldown": "16/13/10/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tiny_tree_grab.png"
    },
    {
      "name": "Tree Volley",
      "key": "D",
      "description": "CHANNELED - Tiny channels to throw random trees within range towards the targeted area. Deals Tiny\\'s attack with Tree...",
      "manaCost": "150",
      "cooldown": "17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tiny_tree_channel.png"
    },
    {
      "name": "Insurmountable",
      "key": "R",
      "description": "Tiny gains Status and Slow Resistance from Strength. Slow Resistance also reduces the impact of Attack Speed slows.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tiny_insurmountable.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+150 Avalanche Cast Range",
      "right": "+8 Strength",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+2 Tree Grab Attacks",
      "right": "+90 Avalanche Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+60 Tree Grab Base Damage",
      "right": "Toss Requires No Target",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-8s Avalanche Cooldown",
      "right": "2 Toss Charges",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "vengeful_spirit",
  "name": "Vengeful Spirit",
  "aliases": [
    "vs",
    "venge",
    "shendelzare"
  ],
  "title": "The Vengeful Spirit",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 52.9,
  "pickRate": 13.4,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/vengefulspirit.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/vengefulspirit.png",
  "summary": "Even the most contented Skywrath is an ill-tempered creature, naturally inclined to seek revenge for the slightest insult. But Vengeful Spirit is the essence of vengeance.",
  "abilities": [
    {
      "name": "Magic Missile",
      "key": "Q",
      "description": "Fires a magic missile at an enemy unit, stunning and dealing damage.",
      "manaCost": "90/95/100/105",
      "cooldown": "14/13/12/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/vengefulspirit_magic_missile.png"
    },
    {
      "name": "Wave of Terror",
      "key": "W",
      "description": "Vengeful Spirit lets loose a wicked cry, weakening the total attack damage and armor of enemies, and giving vision of...",
      "manaCost": "40",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/vengefulspirit_wave_of_terror.png"
    },
    {
      "name": "Vengeance Aura",
      "key": "E",
      "description": "Vengeful Spirit\\'s presence increases the damage of nearby friendly heroes. Vengeful Spirit herself receives 25% extra...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/vengefulspirit_command_aura.png"
    },
    {
      "name": "Retribution",
      "key": "D",
      "description": "Vengeful Spirit is considered both a ranged and a melee attacker to gain the respective bonuses.  When killed by an e...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/vengefulspirit_retribution.png"
    },
    {
      "name": "Nether Swap",
      "key": "R",
      "description": "Instantaneously swaps positions with a target Hero, friend or enemy. Nether Swap interrupts channeling abilities on t...",
      "manaCost": "100/150/200",
      "cooldown": "46/38/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/vengefulspirit_nether_swap.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+150 Nether Swap Enemy Damage",
      "right": "+100 Magic Missile Cast Range",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-3 Wave of Terror Armor",
      "right": "+0.3s Magic Missile Stun Duration",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Wave Of Terror Steals 25% Of Reduced Damag...",
      "right": "-2s Magic Missile Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+16% Vengeance Aura Base Damage Bonus",
      "right": "-18s Nether Swap Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "zeus",
  "name": "Zeus",
  "aliases": [
    "zeus",
    "zeus"
  ],
  "title": "The Zeus",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 49.9,
  "pickRate": 16.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/zuus.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/zuus.png",
  "summary": "Lord of Heaven, father of gods, Zeus treats all the Heroes as if they are his rambunctious, rebellious children. After being caught unnumbered times in the midst of trysts with ...",
  "abilities": [
    {
      "name": "Arc Lightning",
      "key": "Q",
      "description": "Hurls a bolt of lightning that leaps through nearby enemy units that deal damage.",
      "manaCost": "85/90/95/100",
      "cooldown": "1.6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/zuus_arc_lightning.png"
    },
    {
      "name": "Lightning Bolt",
      "key": "W",
      "description": "Calls down a bolt of lightning to strike an enemy unit, causing damage and a mini-stun. When cast, Lightning Bolt bri...",
      "manaCost": "120/125/130/135",
      "cooldown": "6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/zuus_lightning_bolt.png"
    },
    {
      "name": "Heavenly Jump",
      "key": "E",
      "description": "Zeus performs a Heavenly Jump, leaping forward and shocking the closest visible nearby enemy (prioritizing heroes), d...",
      "manaCost": "50/60/70/80",
      "cooldown": "26/22/18/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/zuus_heavenly_jump.png"
    },
    {
      "name": "Nimbus",
      "key": "D",
      "description": "Creates a storm cloud anywhere on the map that automatically casts Lightning Bolt on nearby enemies.",
      "manaCost": "275",
      "cooldown": "45",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/zuus_cloud.png"
    },
    {
      "name": "Lightning Hands",
      "key": "R",
      "description": "Zeus gains bonus attack speed and his attacks create Arc Lightnings that deal a percentage of its damage. Can be togg...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/zuus_lightning_hands.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1 Heavenly Jump Target",
      "right": "+200 Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+75 Thundergod\\'s Wrath Damage",
      "right": "-20% Arc Lightning Mana Cost / Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+60 Arc Lightning Damage",
      "right": "+0.5s Lightning Bolt Ministun",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "325 AoE Lightning Bolt",
      "right": "3 Heavenly Jump Charges",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "kunkka",
  "name": "Kunkka",
  "aliases": [
    "kunkka",
    "kunkka"
  ],
  "title": "The Kunkka",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 49.4,
  "pickRate": 5.4,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/kunkka.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/kunkka.png",
  "summary": "As The Admiral of the mighty Claddish Navy, Kunkka was charged with protecting the isles of his homeland when the demons of the Cataract made a concerted grab at the lands of me...",
  "abilities": [
    {
      "name": "Torrent",
      "key": "Q",
      "description": "Summons a rising torrent that, after a short delay, hurls enemy units into the sky, stunning, dealing damage and slow...",
      "manaCost": "90",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kunkka_torrent.png"
    },
    {
      "name": "Tidebringer",
      "key": "W",
      "description": "Kunkka\\'s legendary sword grants increased damage and cleaves a large area of effect in front of him for a single strike.",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kunkka_tidebringer.png"
    },
    {
      "name": "X Marks the Spot",
      "key": "E",
      "description": "Targets a friendly or enemy Hero, marks their position with an X, and returns them to it after several seconds. Kunkk...",
      "manaCost": "50",
      "cooldown": "24/20/16/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kunkka_x_marks_the_spot.png"
    },
    {
      "name": "Admiral\\'s Rum",
      "key": "D",
      "description": "Admiral\\'s Rum tactical ability",
      "cooldown": "50.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kunkka_admirals_rum.png"
    },
    {
      "name": "Tidal Wave",
      "key": "R",
      "description": "Releases a Tidal Wave that spawns behind Kunkka. Deals damage and drags enemies along it. Enemies cannot attack while...",
      "manaCost": "75",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kunkka_tidal_wave.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1s Admiral\\'s Rum Buff Duration",
      "right": "Tidebringer applies 60% slow for 1s",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25% Torrent Damage/Knock Up Duration",
      "right": "+75 Tidebringer Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-4s Torrent Cooldown",
      "right": "+80% Tidebringer Cleave Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+100 Spell Area of Effect",
      "right": "Tidebringer Ignores 25% Armor",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "lina",
  "name": "Lina",
  "aliases": [
    "lina",
    "lina"
  ],
  "title": "The Lina",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Carry",
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 48.4,
  "pickRate": 24.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lina.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lina.png",
  "summary": "The sibling rivalries between Lina the Slayer, and her younger sister Rylai, the Crystal Maiden, were the stuff of legend in the temperate region where they spent their quarrels...",
  "abilities": [
    {
      "name": "Dragon Slave",
      "key": "Q",
      "description": "Lina channels the breath of a dragon, sending out a wave of fire that scorches every enemy in its path.",
      "manaCost": "90/100/110/120",
      "cooldown": "11/10/9/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lina_dragon_slave.png"
    },
    {
      "name": "Light Strike Array",
      "key": "W",
      "description": "Summons a column of flames that damages and stuns enemies.",
      "manaCost": "100/110/120/130",
      "cooldown": "13/11/9/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lina_light_strike_array.png"
    },
    {
      "name": "Fiery Soul",
      "key": "E",
      "description": "Grants bonus attack and movement speed each time Lina hits an enemy with a spell. Stacks with itself. Lasts 18 seconds.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lina_fiery_soul.png"
    },
    {
      "name": "Flame Cloak",
      "key": "D",
      "description": "Grants Lina unobstructed movement and increases her spell damage and magic resistance. Grants max fiery soul stacks o...",
      "manaCost": "50",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lina_flame_cloak.png"
    },
    {
      "name": "Slow Burn",
      "key": "R",
      "description": "Lina\\'s abilities deal an additional 64% damage as burn damage over 4s.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lina_slow_burn.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25 Damage",
      "right": "-3s Dragon Slave Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "5% Fiery Soul Magic Resist Per Stack",
      "right": "+110 Light Strike Array Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-20s Laguna Blade Cooldown",
      "right": "+10/1% Fiery Soul Per Stack",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1s Slow Burn Duration",
      "right": "150% Attack Crit On Targets Affected By Sl...",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "shadow_shaman",
  "name": "Shadow Shaman",
  "aliases": [
    "ss",
    "rhasta"
  ],
  "title": "The Shadow Shaman",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 51.8,
  "pickRate": 18.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shadow_shaman.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shadow_shaman.png",
  "summary": "Born in the Bleeding Hills, Rhasta was just a starving youngling when picked up by a travelling con-man. For two pins of copper, the old con-man would tell your fortune.",
  "abilities": [
    {
      "name": "Ether Shock",
      "key": "Q",
      "description": "Creates a cone of ethereal energy that strikes multiple enemy units.",
      "manaCost": "90/105/120/135",
      "cooldown": "14/12/10/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_shaman_ether_shock.png"
    },
    {
      "name": "Hex",
      "key": "W",
      "description": "Transforms an enemy unit into a harmless creature, disabling their attacks and abilities.",
      "manaCost": "130/150/170/190",
      "cooldown": "24/20/16/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_shaman_voodoo.png"
    },
    {
      "name": "Shackles",
      "key": "E",
      "description": "CHANNELED - Magically binds an enemy unit so that it cannot move or attack, absorbing their life energy over time.",
      "manaCost": "125/140/155/170",
      "cooldown": "14/13/12/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_shaman_shackles.png"
    },
    {
      "name": "Fowl Play",
      "key": "D",
      "description": "When taking lethal damage, Shadow Shaman receives a strong dispel and survives as a 1 HP chicken with increased movem...",
      "cooldown": "120",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_shaman_fowl_play.png"
    },
    {
      "name": "Urnaconda",
      "key": "R",
      "description": "Throw a snake jar at the target location, damaging all enemies in the AoE and creating a Massive Serpent Ward that ha...",
      "manaCost": "140",
      "cooldown": "50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_shaman_urnaconda.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+170 Shackles Total Damage",
      "right": "+1.75 Mana Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+160 Serpent Wards Attack Range",
      "right": "Hex Breaks",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+1.5s Shackles Duration",
      "right": "+50% Serpent Wards Max HP",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+250 Ether Shock Damage",
      "right": "+1 Ward Attack Targets",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "slardar",
  "name": "Slardar",
  "aliases": [
    "slar"
  ],
  "title": "The Slardar",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 49.8,
  "pickRate": 10,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/slardar.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/slardar.png",
  "summary": "Slardar is a Slithereen, one of the Deep Ones, guardian of a vast network of sunken cities and the ancient riches buried within them. In the lightless gulf of the deepest ocean ...",
  "abilities": [
    {
      "name": "Guardian Sprint",
      "key": "Q",
      "description": "Slardar slithers ahead, moving significantly faster and passing through units. Slardar has 100% slow resistance for t...",
      "manaCost": "25",
      "cooldown": "33/28/23/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slardar_sprint.png"
    },
    {
      "name": "Slithereen Crush",
      "key": "W",
      "description": "Slams the ground, leaving a puddle of water, and stunning and damaging nearby enemy units. After the stun, the affect...",
      "manaCost": "100",
      "cooldown": "8.5/8/7.5/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slardar_slithereen_crush.png"
    },
    {
      "name": "Bash of the Deep",
      "key": "E",
      "description": "After 3 attacks, your next attack will bash the target.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slardar_bash.png"
    },
    {
      "name": "Seaborn Sentinel",
      "key": "D",
      "description": "Slardar gains bonus movement speed, health regeneration, attack damage, and armor while in a puddle, trail, or river.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slardar_seaborn_sentinel.png"
    },
    {
      "name": "Corrosive Haze",
      "key": "R",
      "description": "Reduces enemy armor to amplify physical damage and provides True Sight and vision of the targeted unit, revealing inv...",
      "manaCost": "25",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slardar_amplify_damage.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+2s Guardian Sprint Duration",
      "right": "+30 Bash of the Deep Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+250 Health",
      "right": "-3 Corrosive Haze Armor",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+125 Slithereen Crush Damage",
      "right": "+16% Seaborn Sentinel Bonus Attack Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-3s Slithereen Crush Cooldown",
      "right": "Corrosive Haze Undispellable",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "tidehunter",
  "name": "Tidehunter",
  "aliases": [
    "tide",
    "leviathan"
  ],
  "title": "The Tidehunter",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 49.8,
  "pickRate": 8.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tidehunter.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tidehunter.png",
  "summary": "The Tidehunter known as Leviathan was once the champion of the Sunken Isles, but his motives are as mysterious as those of his people. We all know the importance of the Drylande...",
  "abilities": [
    {
      "name": "Gush",
      "key": "Q",
      "description": "Summons a gush of water to damage an enemy unit, reducing their movement speed and armor.",
      "manaCost": "100",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tidehunter_gush.png"
    },
    {
      "name": "Kraken Shell",
      "key": "W",
      "description": "Thickens Tidehunter\\'s hide to passively block a portion of any incoming physical attack damage. Reduced block amount ...",
      "manaCost": "45",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tidehunter_kraken_shell.png"
    },
    {
      "name": "Anchor Smash",
      "key": "E",
      "description": "Tidehunter swings his mighty anchor to attack and deal bonus damage to nearby enemies and reduce their attack damage....",
      "manaCost": "40/45/50/55",
      "cooldown": "7/6/5/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tidehunter_anchor_smash.png"
    },
    {
      "name": "Dead in the Water",
      "key": "D",
      "description": "Tidehunter attaches a heavy anchor to an enemy hero. The hero is leashed while attached to the anchor. Attempting to ...",
      "manaCost": "110",
      "cooldown": "35",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tidehunter_dead_in_the_water.png"
    },
    {
      "name": "Ravage",
      "key": "R",
      "description": "Slams the ground, causing tentacles to erupt in all directions, damaging and stunning all nearby enemy units.",
      "manaCost": "125/225/325",
      "cooldown": "150/145/140",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tidehunter_ravage.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+10% Anchor Smash Damage Reduction",
      "right": "+20% Gush Slow",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+90 Gush Damage",
      "right": "-15s Ravage Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Kraken Shell Cleanse triggers Anchor Smash",
      "right": "-4 Gush Armor",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.0s Ravage Stun Duration",
      "right": "Anchor Smash affects buildings",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "lich",
  "name": "Lich",
  "aliases": [
    "lich",
    "lich"
  ],
  "title": "The Lich",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 52.7,
  "pickRate": 12.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lich.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lich.png",
  "summary": "In life, the frost-mage Ethreain (not yet a Lich) had used the threat of destructive ice to enslave entire kingdoms. His subjects, aided by a few desperate magicians, eventually...",
  "abilities": [
    {
      "name": "Frost Blast",
      "key": "Q",
      "description": "Blasts the target enemy unit with damaging frost, dealing area damage and slowing movement and attack rates for 4 sec...",
      "manaCost": "110/120/130/140",
      "cooldown": "7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lich_frost_nova.png"
    },
    {
      "name": "Frost Shield",
      "key": "W",
      "description": "Applies a magical frost shield around the target, reducing damage from attacks against it. While the shield is active...",
      "manaCost": "100/110/120/130",
      "cooldown": "30/25/20/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lich_frost_shield.png"
    },
    {
      "name": "Sinister Gaze",
      "key": "E",
      "description": "CHANNELED - Hypnotizes an enemy unit, causing it to move towards a point between the two of you and drains a percenta...",
      "manaCost": "25",
      "cooldown": "24/22/20/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lich_sinister_gaze.png"
    },
    {
      "name": "Ice Spire",
      "key": "D",
      "description": "Creates an Ice Spire at the target spot, slowing enemies around it. Can take 4 hero hits or 8 creep hits and when des...",
      "manaCost": "150",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lich_ice_spire.png"
    },
    {
      "name": "Sacrifice",
      "key": "R",
      "description": "Sacrifice an allied creep to convert its current health into mana for Lich and give Lich its experience bounty.  Begi...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lich_death_charge.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+10% Frost Shield Damage Reduction",
      "right": "+125 Frost Blast Radius and Area Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+0.3s Sinister Gaze Duration",
      "right": "-3.5s Frost Blast Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "2 Frost Shield Charges",
      "right": "Chain Frost on Death",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Frost Shield Provides +50 HP Regen",
      "right": "Chain Frost Unlimited Bounces",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "riki",
  "name": "Riki",
  "aliases": [
    "riki",
    "riki"
  ],
  "title": "The Riki",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 52.5,
  "pickRate": 6.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/riki.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/riki.png",
  "summary": "Riki was born middle child to the great dynasty of Tahlin. With an older brother groomed for the throne, and a younger brother coddled and kept, Riki, the small middle son, seem...",
  "abilities": [
    {
      "name": "Smoke Screen",
      "key": "Q",
      "description": "Throws down a smoke bomb, silencing enemies and causing them to miss attacks.",
      "manaCost": "75",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/riki_smoke_screen.png"
    },
    {
      "name": "Blink Strike",
      "key": "W",
      "description": "Teleports behind the target unit, momentarily slowing them by 100% and attacking them with bonus damage if it is an e...",
      "manaCost": "50/55/60/65",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/riki_blink_strike.png"
    },
    {
      "name": "Tricks of the Trade",
      "key": "E",
      "description": "CHANNELED - Riki phases out of the world and periodically strikes 2 random enemy units from behind in an area around ...",
      "manaCost": "65",
      "cooldown": "21/18/15/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/riki_tricks_of_the_trade.png"
    },
    {
      "name": "Backstab",
      "key": "D",
      "description": "Every time Riki strikes his enemy from behind, he deals additional bonus damage equal to a multiple of his Agility.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/riki_innate_backstab.png"
    },
    {
      "name": "Cloak and Dagger",
      "key": "R",
      "description": "Riki fades into the shadows, becoming invisible until he attacks. Hero kills and assists grant additional experience.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/riki_backstab.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+50 Smoke Screen Radius",
      "right": "+10% Cloak and Dagger Movement Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "15% of Riki\\'s Base damage added to Tricks...",
      "right": "-3s Smoke Screen Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.3 Backstab Multiplier",
      "right": "-1s Blink Strike Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-4s Tricks of the Trade Cooldown",
      "right": "+500 Blink Strike Cast Range",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "enigma",
  "name": "Enigma",
  "aliases": [
    "enigma",
    "enigma"
  ],
  "title": "The Enigma",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Offlane",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 50.6,
  "pickRate": 5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/enigma.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/enigma.png",
  "summary": "Nothing is known of Enigma\\'s background. There are only stories and legends, most of them apocryphal, passed down through the ages.",
  "abilities": [
    {
      "name": "Malefice",
      "key": "Q",
      "description": "Focuses Enigma\\'s power on a target, causing it to take damage and become repeatedly stunned for multiple instances. A...",
      "manaCost": "100/110/120/130",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enigma_malefice.png"
    },
    {
      "name": "Demonic Summoning",
      "key": "W",
      "description": "Summons three fragments of Enigma himself at the cost of health. The eidolons health is increased by 3% of Enigma\\'s c...",
      "manaCost": "70/80/90/100",
      "cooldown": "45/40/35/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enigma_demonic_conversion.png"
    },
    {
      "name": "Midnight Pulse",
      "key": "E",
      "description": "Steeps an area in dark resonance, dealing 5 + a percentage of the enemies current HP as damage.",
      "manaCost": "65/90/115/140",
      "cooldown": "40/35/30/25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enigma_midnight_pulse.png"
    },
    {
      "name": "Event Horizon",
      "key": "D",
      "description": "Units in a 600 radius moving away from Enigma have a movespeed penalty.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enigma_event_horizon.png"
    },
    {
      "name": "Black Hole",
      "key": "R",
      "description": "CHANNELED - Summons a vortex that sucks in nearby enemy units. Enemies affected by Black Hole cannot move, attack, or...",
      "manaCost": "300/400/500",
      "cooldown": "180/170/160",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enigma_black_hole.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+10 Eidolon Attack Speed",
      "right": "+50 Black Hole Damage Per Second",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+250 Health",
      "right": "+100 Event Horizon Radius",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+200 Midnight Pulse Radius",
      "right": "+40 Eidolon Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+4 Malefice Instances",
      "right": "+4 Demonic Summoning Eidolons",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "tinker",
  "name": "Tinker",
  "aliases": [
    "boush"
  ],
  "title": "The Tinker",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 46.9,
  "pickRate": 6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tinker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tinker.png",
  "summary": "Boush the Tinker\\'s diminutive race is known for its intelligence, its cunning, and its prickly relationship with magic. As a matter of pride, they survive by their wits, and use...",
  "abilities": [
    {
      "name": "Laser",
      "key": "Q",
      "description": "Fires an intense energy beam, damaging and blinding the target. Blinded targets miss all physical attacks.",
      "manaCost": "95/105/115/125",
      "cooldown": "19/18/17/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tinker_laser.png"
    },
    {
      "name": "March of the Machines",
      "key": "W",
      "description": "Enlists an army of robotic minions to destroy enemy units in an area around Tinker.",
      "manaCost": "100/120/140/160",
      "cooldown": "35/33/31/29",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tinker_march_of_the_machines.png"
    },
    {
      "name": "Deploy Turrets",
      "key": "E",
      "description": "Deploy Turrets tactical ability",
      "manaCost": "100/120/140/160",
      "cooldown": "24/22/20/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tinker_deploy_turrets.png"
    },
    {
      "name": "Warp Flare",
      "key": "D",
      "description": "Throws a flare towards an enemy, dealing damage, teleporting them away, rooting them and reducing their Cast and Atta...",
      "manaCost": "80",
      "cooldown": "15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tinker_warp_grenade.png"
    },
    {
      "name": "Keen Conveyance",
      "key": "R",
      "description": "CHANNELED - Teleport to a target friendly structure. Level 2 allows teleporting to friendly units and Level 3 to frie...",
      "manaCost": "75",
      "cooldown": "50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tinker_keen_teleport.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.0s March of the Machines Duration",
      "right": "+10% Manacost/Manaloss Reduction",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+100 Deploy Turrets Tinker Knockback",
      "right": "+50 Laser Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+60 Deploy Turrets Missile Damage",
      "right": "-0.5s Keen Conveyance Channel Time",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "250 AoE Laser",
      "right": "-0.25s Time to Rearm",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "sniper",
  "name": "Sniper",
  "aliases": [
    "sniper",
    "sniper"
  ],
  "title": "The Sniper",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 50.1,
  "pickRate": 25,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sniper.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sniper.png",
  "summary": "Kardel Sharpeye was born deep in the mountains of Knollen where, since time immemorial, Keen Folk have survived by hunting the strange, cliff-dwelling steepstalkers above their ...",
  "abilities": [
    {
      "name": "Shrapnel",
      "key": "Q",
      "description": "Consumes a charge to launch a ball of shrapnel that showers the target area in explosive pellets. Enemies are subject...",
      "manaCost": "75",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sniper_shrapnel.png"
    },
    {
      "name": "Headshot",
      "key": "W",
      "description": "Sniper increases his accuracy, giving him a chance to deal 20 extra damage and knock back his enemies. Knockback dist...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sniper_headshot.png"
    },
    {
      "name": "Take Aim",
      "key": "E",
      "description": "Passively increases Sniper\\'s attack range by 160.  On cast, Sniper gains increased vision, Headshot chance, and attac...",
      "manaCost": "50",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sniper_take_aim.png"
    },
    {
      "name": "Concussive Grenade",
      "key": "D",
      "description": "Launches a grenade at the target area, dealing damage to enemies and knocking them and Sniper back. Enemies affected ...",
      "manaCost": "50",
      "cooldown": "10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sniper_concussive_grenade.png"
    },
    {
      "name": "Keen Scope",
      "key": "R",
      "description": "Sniper’s attacks deal bonus damage for every 100 units of distance Sniper is from the target.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/sniper_keen_scope.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+50 Take Aim Passive Attack Range",
      "right": "+30 Headshot Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+45 Attack Speed During Take Aim",
      "right": "+150 Assassinate Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+2s Take Aim Duration",
      "right": "+{s:bonus_shrapnel_damage}% Shrapnel Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-30s Shrapnel Charge Restore Time",
      "right": "+50 Max Headshot Knockback Distance",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "necrophos",
  "name": "Necrophos",
  "aliases": [
    "necrophos",
    "necrophos"
  ],
  "title": "The Necrophos",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 51.3,
  "pickRate": 19.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/necrolyte.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/necrolyte.png",
  "summary": "In a time of great plague, an obscure monk of dark inclinations, one Rotund\\'jere, found himself promoted to the rank of Cardinal by the swift death of all his superiors. While o...",
  "abilities": [
    {
      "name": "Death Pulse",
      "key": "Q",
      "description": "Necrophos releases a wave of death around him, dealing damage to enemy units and healing allied units.",
      "manaCost": "115/130/145/160",
      "cooldown": "8/7/6/5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/necrolyte_death_pulse.png"
    },
    {
      "name": "Ghost Shroud",
      "key": "W",
      "description": "Necrophos slips into the realm that separates the living from the dead. Unable to attack or be attacked, he emits an ...",
      "manaCost": "75",
      "cooldown": "28/24/20/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/necrolyte_ghost_shroud.png"
    },
    {
      "name": "Heartstopper Aura",
      "key": "E",
      "description": "Necrophos stills the hearts of his opponents, causing nearby enemy units to lose a percentage of their max health ove...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/necrolyte_heartstopper_aura.png"
    },
    {
      "name": "Death Seeker",
      "key": "D",
      "description": "Necrophos turns into a large Death Pulse towards the target unit\\'s position. Once it arrives to the location, the Dea...",
      "manaCost": "160",
      "cooldown": "19",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/necrolyte_death_seeker.png"
    },
    {
      "name": "Sadist",
      "key": "R",
      "description": "Necrophos gains stacking regen for 8 seconds for each unit he kills. Hero kills multiply the effect.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/necrolyte_sadist.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-2.5s Ghost Shroud Cooldown",
      "right": "+2s Sadist Stack Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+15% Ghost Shroud Movement Slow",
      "right": "+60 Death Pulse Heal",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+75 Spell Area of Effect",
      "right": "+20% Heartstopper Regen Reduction",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+0.3 Reaper\\'s Scythe Damage Per Missing HP",
      "right": "-2.5s Death Pulse Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "warlock",
  "name": "Warlock",
  "aliases": [
    "demnak"
  ],
  "title": "The Warlock",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 49.6,
  "pickRate": 7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/warlock.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/warlock.png",
  "summary": "As Chief Curator and Head of Acquisitions for the Arcane Archives of the Ultimyr Academy, Demnok Lannik was tireless in his pursuit of lost, rare and forbidden tomes. No cursed ...",
  "abilities": [
    {
      "name": "Fatal Bonds",
      "key": "Q",
      "description": "Binds several visible enemy units together, causing a percentage of the damage dealt to one of them to be felt by the...",
      "manaCost": "120/130/140/150",
      "cooldown": "42/34/26/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/warlock_fatal_bonds.png"
    },
    {
      "name": "Shadow Word",
      "key": "W",
      "description": "Warlock whispers an incantation, casting a spell on a unit that makes it deal damage to nearby enemy units and heal n...",
      "manaCost": "110/120/130/140",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/warlock_shadow_word.png"
    },
    {
      "name": "Upheaval",
      "key": "E",
      "description": "CHANNELED - A powerful slowing and damaging current that grows stronger as it\\'s channeled. Lasts up to 10 seconds. En...",
      "manaCost": "100",
      "cooldown": "45/40/35/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/warlock_upheaval.png"
    },
    {
      "name": "Eldritch Summoning",
      "key": "D",
      "description": "Whenever an enemy unit dies while afflicted by one or more of Warlock\\'s abilities, a minor imp is summoned that lasts...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/warlock_eldritch_summoning.png"
    },
    {
      "name": "Chaotic Offering",
      "key": "R",
      "description": "Summons a Golem from the depths, stunning enemies for 0.8 seconds. The Golem lives 60 seconds, takes reduced damage f...",
      "manaCost": "200/400/600",
      "cooldown": "165",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/warlock_rain_of_chaos.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+4% Fatal Bonds Damage",
      "right": "+50 Upheaval Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+8 Upheaval Attack Speed per second on Allies",
      "right": "+150 Shadow Word AoE",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "25% Damage Resistance for Chaotic Offering...",
      "right": "+=45 Upheaval Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Summons a Golem on death",
      "right": "+5 Fatal Bonds Targets",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "beastmaster",
  "name": "Beastmaster",
  "aliases": [
    "bm",
    "karroch"
  ],
  "title": "The Beastmaster",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 45.3,
  "pickRate": 2.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/beastmaster.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/beastmaster.png",
  "summary": "Karroch was born a child of the stocks. His mother died in childbirth; his father, a farrier for the Last King of Slom, was trampled to death when he was five.",
  "abilities": [
    {
      "name": "Wild Axes",
      "key": "Q",
      "description": "Beastmaster sends his axes flying and calls them home again, slicing through enemy units and trees along their path. ...",
      "manaCost": "65",
      "cooldown": "8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/beastmaster_wild_axes.png"
    },
    {
      "name": "Summon Razorback",
      "key": "W",
      "description": "Beastmaster calls forth a Boar to aid in the battlefield. The Boar has a passive poison attack that slows attack and ...",
      "manaCost": "60",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/beastmaster_summon_razorback.png"
    },
    {
      "name": "Summon Raptors",
      "key": "E",
      "description": "Beastmaster summons 2 hawks that circle around Beastmaster and dive-bombs at enemies with a base attack rate of every...",
      "manaCost": "50",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/beastmaster_summon_raptor.png"
    },
    {
      "name": "Inner Beast",
      "key": "D",
      "description": "Untaps the inner fury of Beastmaster and units he controls, passively increasing their attack speed.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/beastmaster_inner_beast.png"
    },
    {
      "name": "Drums of Slom",
      "key": "R",
      "description": "Attacks from Beastmaster or a nearby unit he controls will cause him bang his drum, dealing damage to nearby units an...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/beastmaster_drums_of_slom.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+5 Armor",
      "right": "+1.5% Wild Axes Damage Amp Per Stack",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+15 Movespeed to Beastmaster and his summons",
      "right": "+200 Primal Roar Cast Range",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+30 Damage to Beastmaster and his summons",
      "right": "+250 Health to Beastmaster and his summons",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "No Wild Axes Cooldown",
      "right": "-25s Primal Roar Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "queen_of_pain",
  "name": "Queen of Pain",
  "aliases": [
    "qop",
    "akasha"
  ],
  "title": "The Queen of Pain",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid"
  ],
  "complexity": 2,
  "winRate": 47.6,
  "pickRate": 11.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/queenofpain.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/queenofpain.png",
  "summary": "The Ecclesiast-King of Elze nursed a desire for pain--forbidden pain. In a less prominent political figure, such desires might be considered unwise, but in a monarch of his stat...",
  "abilities": [
    {
      "name": "Shadow Strike",
      "key": "Q",
      "description": "Hurls a poisoned dagger which deals large initial damage, and then deals damage over time. The poisoned unit has its ...",
      "manaCost": "100/110/120/130",
      "cooldown": "11/9/7/5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/queenofpain_shadow_strike.png"
    },
    {
      "name": "Blink",
      "key": "W",
      "description": "Short distance teleportation that allows Queen of Pain to move in and out of combat.",
      "manaCost": "65",
      "cooldown": "12/10/8/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/queenofpain_blink.png"
    },
    {
      "name": "Scream Of Pain",
      "key": "E",
      "description": "The Queen of Pain lets loose a piercing scream around her, damaging nearby enemies.  25% of the damage dealt to heroe...",
      "manaCost": "120",
      "cooldown": "7.5/7/6.5/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/queenofpain_scream_of_pain.png"
    },
    {
      "name": "Succubus",
      "key": "D",
      "description": "All sources of Spell Lifesteal also apply to Pure Damage. Queen of Pain gains Spell Lifesteal that increases with pro...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/queenofpain_succubus.png"
    },
    {
      "name": "Sonic Wave",
      "key": "R",
      "description": "Creates a gigantic wave of sound in front of Queen of Pain, dealing heavy damage to all enemy units in its wake and p...",
      "manaCost": "250/400/550",
      "cooldown": "110/95/80",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/queenofpain_sonic_wave.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+35 Attack Speed against Shadow Striked units",
      "right": "+7 Strength",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-1s Shadow Strike Damage Interval",
      "right": "+30 Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+115 Scream of Pain Damage",
      "right": "-45s Sonic Wave Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-2s Blink Cooldown",
      "right": "+250 Sonic Wave Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "venomancer",
  "name": "Venomancer",
  "aliases": [
    "veno",
    "lesale"
  ],
  "title": "The Venomancer",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Soft Support",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 47.7,
  "pickRate": 8.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/venomancer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/venomancer.png",
  "summary": "In the Acid Jungles of Jidi Isle, poison runs in the veins and bubbles in the guts of every creature that scuttles, climbs or swoops between fluorescent vines dripping with caus...",
  "abilities": [
    {
      "name": "Venomous Gale",
      "key": "Q",
      "description": "Launches a ball of venom in a line, poisoning enemy units so that they take both initial damage and damage over time,...",
      "manaCost": "95/105/115/125",
      "cooldown": "21/20/19/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/venomancer_venomous_gale.png"
    },
    {
      "name": "Snakebite",
      "key": "W",
      "description": "Venomancer summons a Spawn of Aktok to sink its fangs into a target, dealing magic damage and applying a toxin that d...",
      "manaCost": "70/80/90/100",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/venomancer_snakebite.png"
    },
    {
      "name": "Plague Ward",
      "key": "E",
      "description": "Summons a plague ward to attack enemy units and structures. The ward is immune to magic. Wards gain the Poison Sting ...",
      "manaCost": "24/26/28/30",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/venomancer_plague_ward.png"
    },
    {
      "name": "Poison Sting",
      "key": "D",
      "description": "Venomancer\\'s attacks slow enemies and deal damage over time.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/venomancer_poison_sting.png"
    },
    {
      "name": "Noxious Plague",
      "key": "R",
      "description": "Infects an enemy with a plague that does damage on application then slows the target and deals damage over time based...",
      "manaCost": "200/250/300",
      "cooldown": "100/90/80",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/venomancer_noxious_plague.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-5s Venomous Gale CD",
      "right": "15% Poison Sting Health Regen Reduction",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+75 Noxious Plague Spread Radius",
      "right": "+10% Poison Sting Slow",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+100 Snakebite Initial Damage",
      "right": "-2s Plague Ward Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Snakebite Undispellable",
      "right": "2.5x Plague Ward HP/Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "wraith_king",
  "name": "Wraith King",
  "aliases": [
    "wk",
    "skeleton king",
    "snk"
  ],
  "title": "The Wraith King",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 55,
  "pickRate": 15,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/skeleton_king.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/skeleton_king.png",
  "summary": "For untold years, King Ostarion built a kingdom from the remains of his enemies. It was an obsessive\\'s errand, done to pass the long eternities of a monarchy that seemed fated n...",
  "abilities": [
    {
      "name": "Wraithfire Blast",
      "key": "Q",
      "description": "Wraith King sears an enemy unit with spectral fire, dealing damage and stunning, then dealing damage over time and sl...",
      "manaCost": "95/110/125/140",
      "cooldown": "14/12/10/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skeleton_king_hellfire_blast.png"
    },
    {
      "name": "Bone Guard",
      "key": "W",
      "description": "Gains a Charge for every 2 creeps killed and 2 charges per hero killed. Activate to spend all charges, summoning skel...",
      "manaCost": "70/80/90/100",
      "cooldown": "42",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skeleton_king_bone_guard.png"
    },
    {
      "name": "Mortal Strike",
      "key": "E",
      "description": "Wraith King passively deals bonus damage on an attack with a cooldown.",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skeleton_king_mortal_strike.png"
    },
    {
      "name": "Vampiric Spirit",
      "key": "D",
      "description": "Grants Wraith King Lifesteal. When slain Wraith King turns into a free pathing Wraith with Bonus Attack and Movement ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skeleton_king_vampiric_spirit.png"
    },
    {
      "name": "Reincarnation",
      "key": "R",
      "description": "Wraith King\\'s form regroups after death, allowing him to resurrect when killed in battle. Upon death, enemy units in ...",
      "manaCost": "220/110/0",
      "cooldown": "180/150/120",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skeleton_king_reincarnation.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+8% Vampiric Spirit Lifesteal",
      "right": "+2s Wraithfire Blast Slow Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+0.75s Wraithfire Blast Stun Duration",
      "right": "+350 Health",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+50 Attack Speed",
      "right": "+5 Bone Guard Skeletons Spawned",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-2s Mortal Strike Cooldown",
      "right": "Reincarnation Casts Wraithfire Blast",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "death_prophet",
  "name": "Death Prophet",
  "aliases": [
    "dp",
    "krob",
    "krobelus"
  ],
  "title": "The Death Prophet",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 48.8,
  "pickRate": 4.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/death_prophet.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/death_prophet.png",
  "summary": "Krobelus was a Death Prophet--which is one way of saying she told fortunes for the wealthiest of those who wished to look beyond the veil. But after years of inquiring on behalf...",
  "abilities": [
    {
      "name": "Crypt Swarm",
      "key": "Q",
      "description": "Sends a swarm of winged beasts to savage enemy units in front of Death Prophet.",
      "manaCost": "80/90/100/110",
      "cooldown": "9/8/7/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/death_prophet_carrion_swarm.png"
    },
    {
      "name": "Silence",
      "key": "W",
      "description": "Fires a projectile that prevents enemy units in a target area from casting spells.",
      "manaCost": "80/90/100/110",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/death_prophet_silence.png"
    },
    {
      "name": "Spirit Siphon",
      "key": "E",
      "description": "Creates a spirit link between Death Prophet and an enemy unit, draining health from the enemy.",
      "manaCost": "60",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/death_prophet_spirit_siphon.png"
    },
    {
      "name": "Witchcraft",
      "key": "D",
      "description": "Witchcraft tactical ability",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/death_prophet_witchcraft.png"
    },
    {
      "name": "Exorcism",
      "key": "R",
      "description": "Unleashes evil spirits to drain the life of nearby enemy units and structures. Spirits need to return back to Death P...",
      "manaCost": "200/300/400",
      "cooldown": "150",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/death_prophet_exorcism.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+75 Silence AoE",
      "right": "+200 Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+50 Attack Speed",
      "right": "-2.5s Crypt Swarm Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+6 Exorcism Spirits",
      "right": "+30 Spirit Siphon Damage/Heal",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-22s Spirit Siphon Replenish Time",
      "right": "Deaths During Exorcism Extend Duration By +8s",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "pugna",
  "name": "Pugna",
  "aliases": [
    "oblivion"
  ],
  "title": "The Pugna",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 50.3,
  "pickRate": 5.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pugna.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pugna.png",
  "summary": "In the realm of Pugna\\'s birth, near the vents of the Nether Reaches, there stood a lamasery devoted to the Arts of Oblivion, which drew its power from the nether energies. The G...",
  "abilities": [
    {
      "name": "Nether Blast",
      "key": "Q",
      "description": "An exploding pulse deals damage to enemies and structures in the area. Deals 65% damage to structures.",
      "manaCost": "100/115/130/145",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pugna_nether_blast.png"
    },
    {
      "name": "Decrepify",
      "key": "W",
      "description": "A powerful banishing spell that slows a unit and renders it unable to attack or be attacked. Healing on affected alli...",
      "manaCost": "80",
      "cooldown": "16/13/10/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pugna_decrepify.png"
    },
    {
      "name": "Nether Ward",
      "key": "E",
      "description": "Pugna places a Nether Ward at the target location. The ward will fire at any enemy hero who casts a spell dealing bas...",
      "manaCost": "80",
      "cooldown": "40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pugna_nether_ward.png"
    },
    {
      "name": "Oblivion Savant",
      "key": "D",
      "description": "Pugna can cast spells and use items while channeling.  Pugna receives 1.5% spell amplification per destroyed tower.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pugna_oblivion_savant.png"
    },
    {
      "name": "Life Drain",
      "key": "R",
      "description": "CHANNELED - When cast on an enemy, Pugna drains health from the target enemy unit to heal himself and granting vision...",
      "manaCost": "115/160/205",
      "cooldown": "7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pugna_life_drain.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-1s Nether Blast Cooldown",
      "right": "+2 Nether Ward Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+30% Decrepify Movement Speed To Allies",
      "right": "+250 Health",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+15% Life Drain Heal",
      "right": "+1.5s Decrepify Duration",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+200 Nether Blast Damage",
      "right": "+1.9 Nether Ward Damage Per Mana",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "templar_assassin",
  "name": "Templar Assassin",
  "aliases": [
    "ta",
    "lanaya"
  ],
  "title": "The Templar Assassin",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 45.9,
  "pickRate": 6.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/templar_assassin.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/templar_assassin.png",
  "summary": "Lanaya, the Templar Assassin, came to her calling by a path of curious inquiry. Possessed of a scientific bent, she spent her early years engaged in meticulous study of nature\\'s...",
  "abilities": [
    {
      "name": "Refraction",
      "key": "Q",
      "description": "Templar Assassin becomes highly elusive, gaining a small barrier and bonus to her damage. The damage and avoidance ef...",
      "manaCost": "95",
      "cooldown": "14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/templar_assassin_refraction.png"
    },
    {
      "name": "Meld",
      "key": "W",
      "description": "Templar Assassin conceals herself, becoming invisible as long as she remains still. If Meld\\'s invisibility is broken ...",
      "manaCost": "35/40/45/50",
      "cooldown": "11/9/7/5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/templar_assassin_meld.png"
    },
    {
      "name": "Psi Blades",
      "key": "E",
      "description": "Templar Assassin\\'s psi blades slice through the attacked unit, splitting and damaging enemy units directly behind it,...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/templar_assassin_psi_blades.png"
    },
    {
      "name": "Trap",
      "key": "D",
      "description": "Springs the trap nearest to Templar Assassin, slowing nearby enemies.   If the ability is in alt-cast state, springs ...",
      "manaCost": "0",
      "cooldown": "0.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/templar_assassin_trap.png"
    },
    {
      "name": "Psionic Projection",
      "key": "R",
      "description": "CHANNELED - Allows Templar Assassin to teleport to any Psionic Trap after channeling for 2 seconds, detonating it upo...",
      "manaCost": "50",
      "cooldown": "10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/templar_assassin_trap_teleport.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5s Meld Debuff Duration",
      "right": "+15% Psionic Trap Slow",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+225 Meld Attack Range",
      "right": "+3 Psionic Traps",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Refraction Dispels",
      "right": "+4 Meld Armor Reduction",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "=0.8s Meld Hit Bash",
      "right": "+4 Refraction Instances",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "viper",
  "name": "Viper",
  "aliases": [
    "netherdrake"
  ],
  "title": "The Viper",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 48.7,
  "pickRate": 10,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/viper.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/viper.png",
  "summary": "The malevolent familiar of a sadistic wizard who captured and hoped to tame him, Viper was curiously glad to have been sprung from the sealed and unchanging subterranean Nether ...",
  "abilities": [
    {
      "name": "Poison Attack",
      "key": "Q",
      "description": "Intensifies Viper\\'s venom, adding an effect to his normal attack that applies a stacking movement speed slow and magi...",
      "manaCost": "20",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/viper_poison_attack.png"
    },
    {
      "name": "Nethertoxin",
      "key": "W",
      "description": "Viper releases a Nethertoxin at the targeted area. Units in that area take an increasing damage over time based on ho...",
      "manaCost": "70",
      "cooldown": "14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/viper_nethertoxin.png"
    },
    {
      "name": "Corrosive Skin",
      "key": "E",
      "description": "Viper exudes an infectious toxin that damages and slows the attack speed of any enemy that damages it in a 1200 radiu...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/viper_corrosive_skin.png"
    },
    {
      "name": "Nosedive",
      "key": "D",
      "description": "Viper slams into the ground, releasing a Nethertoxin and splattering each enemy in a 500 AoE for 4 seconds with the e...",
      "manaCost": "75",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/viper_nose_dive.png"
    },
    {
      "name": "Predator",
      "key": "R",
      "description": "Predator tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/viper_predator.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1s Viper Strike Duration",
      "right": "+15 Corrosive Skin Damage Per Second",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+20/40 Nethertoxin Min/Max Damage",
      "right": "+15% Poison Attack Slow / Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+70 Viper Strike DPS",
      "right": "+0.35 Predator Damage Per Missing Health",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Nethertoxin Radius increases by 25 every 0.5s",
      "right": "-50% Viper Strike Mana Cost / Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "luna",
  "name": "Luna",
  "aliases": [
    "luna",
    "luna"
  ],
  "title": "The Luna",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry"
  ],
  "complexity": 1,
  "winRate": 50.6,
  "pickRate": 12.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/luna.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/luna.png",
  "summary": "How had she been reduced to this? She was once the Scourge of the Plains, a merciless leader of men and beasts, and able to sow terror wherever she dared. Now she was far from h...",
  "abilities": [
    {
      "name": "Lucent Beam",
      "key": "Q",
      "description": "Calls a beam of lunar energy down upon an enemy, damaging and briefly stunning them.",
      "manaCost": "90/100/110/120",
      "cooldown": "9/8/7/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/luna_lucent_beam.png"
    },
    {
      "name": "Lunar Orbit",
      "key": "W",
      "description": "Creates 4 glaives that rotate 225 radius around Luna. Any enemy unit that collides with a glaive will take a percenta...",
      "manaCost": "65/70/75/80",
      "cooldown": "40/35/30/25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/luna_lunar_orbit.png"
    },
    {
      "name": "Moon Glaives",
      "key": "E",
      "description": "Empowers Luna\\'s glaives, causing her attacks to bounce between enemy units. Deals less damage with each bounce.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/luna_moon_glaive.png"
    },
    {
      "name": "Lunar Blessing",
      "key": "D",
      "description": "Grants attack damage to Luna and nearby allied heroes within 1200 range, with Luna receiving double the attack damage...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/luna_lunar_blessing.png"
    },
    {
      "name": "Eclipse",
      "key": "R",
      "description": "Showers random nearby enemies with strikes from Luna\\'s current level of Lucent Beam. These beams do not stun their ta...",
      "manaCost": "150/200/250",
      "cooldown": "105",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/luna_eclipse.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-5% Moon Glaives Damage Reduction",
      "right": "+0.5s Lucent Beam Ministun",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+1 Lunar Orbit Glaive",
      "right": "+80 Lucent Beam Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-40.0s Eclipse Cooldown",
      "right": "1.5x Lunar Orbit Damage / Speed",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+25/50 Lunar Blessing Allied/Self Damage",
      "right": "Lucent Beam Hits An Additional Target",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "dragon_knight",
  "name": "Dragon Knight",
  "aliases": [
    "dk",
    "davion"
  ],
  "title": "The Dragon Knight",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Mid",
    "Offlane",
    "Carry"
  ],
  "complexity": 1,
  "winRate": 51.5,
  "pickRate": 8.4,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dragon_knight.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dragon_knight.png",
  "summary": "After years on the trail of a legendary Eldwurm, the Knight Davion found himself facing a disappointing foe: the dreaded Slyrak had grown ancient and frail, its wings tattered, ...",
  "abilities": [
    {
      "name": "Breathe Fire",
      "key": "Q",
      "description": "Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.",
      "manaCost": "90/95/100/105",
      "cooldown": "14/13/12/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dragon_knight_breathe_fire.png"
    },
    {
      "name": "Dragon Tail",
      "key": "W",
      "description": "Dragon Knight smites an enemy unit with his shield, stunning and damaging it and units close to it.",
      "manaCost": "70/80/90/100",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dragon_knight_dragon_tail.png"
    },
    {
      "name": "Wyrm\\'s Wrath",
      "key": "E",
      "description": "The life blood of the Dragon improves Dragon Knight\\'s abilities and items to have increased AoE and causes his attack...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dragon_knight_wyrms_wrath.png"
    },
    {
      "name": "Fireball",
      "key": "D",
      "description": "Ignites an area, dealing damage over time that lingers on enemies in it. Has reduced cast range when melee.",
      "manaCost": "80",
      "cooldown": "20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dragon_knight_fireball.png"
    },
    {
      "name": "Dragon Blood",
      "key": "R",
      "description": "The life blood of the Dragon improves Dragon Knight\\'s health regeneration and armor.   Regen and armor are increased ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dragon_knight_dragon_blood.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+15 Damage",
      "right": "-2s Breathe Fire Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+0.4s Dragon Tail Stun",
      "right": "+300 Health",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+150 Elder Dragon Form Attack Range",
      "right": "+220 Breathe Fire Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+12 Dragon Blood HP Regen/Armor",
      "right": "+50% Wyrm\\'s Wrath Bonuses",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "dazzle",
  "name": "Dazzle",
  "aliases": [
    "dazzle",
    "dazzle"
  ],
  "title": "The Dazzle",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 50.7,
  "pickRate": 5.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dazzle.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dazzle.png",
  "summary": "Each young acolyte to the Dezun order must complete a series of rites before becoming a shadow priest. The final rite, the rite of shades, is a harrowing spiritual journey throu...",
  "abilities": [
    {
      "name": "Poison Touch",
      "key": "Q",
      "description": "Releases a cone of poison that strikes multiple enemy units. Deals damage over time and slows the targets. Anytime th...",
      "manaCost": "125/130/135/140",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dazzle_poison_touch.png"
    },
    {
      "name": "Shallow Grave",
      "key": "W",
      "description": "An ally blessed with Shallow Grave, no matter how close to death, cannot die while under its protection. Healing on t...",
      "manaCost": "90/100/110/120",
      "cooldown": "30/26/22/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dazzle_shallow_grave.png"
    },
    {
      "name": "Shadow Wave",
      "key": "E",
      "description": "Sends out a bolt of power that arcs between allies, healing them while damaging any enemy units standing nearby. Dazz...",
      "manaCost": "90",
      "cooldown": "10/9/8/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dazzle_shadow_wave.png"
    },
    {
      "name": "Weave",
      "key": "D",
      "description": "Dazzle\\'s abilities apply Weave to both allies and enemies they affect, increasing allied armor and reducing enemy arm...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dazzle_innate_weave.png"
    },
    {
      "name": "Nothl Projection",
      "key": "R",
      "description": "Dazzle departs his body, traveling through the Nothl Realm as an invulnerable spirit that can cast spells, attack, an...",
      "manaCost": "100/150/200",
      "cooldown": "70/60/50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dazzle_nothl_projection.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+200 Poison Touch Attack Range",
      "right": "+1.75 Mana Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+45 Shadow Wave Heal / Damage",
      "right": "special_bonus_unique_dazzle_nothl_projecti...",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-3s Shallow Grave Cooldown",
      "right": "+75 Poison Touch DPS",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+40% Poison Touch Slow",
      "right": "+1 Weave Armor Reduction/Increase",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "clockwerk",
  "name": "Clockwerk",
  "aliases": [
    "clock",
    "rattletrap"
  ],
  "title": "The Clockwerk",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 47.7,
  "pickRate": 5.5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/rattletrap.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/rattletrap.png",
  "summary": "Rattletrap descends from the same far-flung kindred as Sniper and Tinker, and like many of the Keen Folk, has offset his diminutive stature through the application of gadgetry a...",
  "abilities": [
    {
      "name": "Battery Assault",
      "key": "Q",
      "description": "Discharges high-powered shrapnel at random nearby enemy units, dealing minor magical damage and ministun.",
      "manaCost": "75/80/85/90",
      "cooldown": "24/22/20/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rattletrap_battery_assault.png"
    },
    {
      "name": "Power Cogs",
      "key": "W",
      "description": "Forms a ring of energized cogs around Clockwerk, trapping any units that are near. Enemies outside the trap that touc...",
      "manaCost": "75",
      "cooldown": "21/19/17/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rattletrap_power_cogs.png"
    },
    {
      "name": "Rocket Flare",
      "key": "E",
      "description": "Fires a global range flare that explodes over a given area. Upon impact, enemies in the area take damage and are brie...",
      "manaCost": "35/40/45/50",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rattletrap_rocket_flare.png"
    },
    {
      "name": "Overclocking",
      "key": "D",
      "description": "Supercharges Clockwerks abilities:  Battery Assault: Increased radius and affects all enemies in its range. Power Cog...",
      "manaCost": "90",
      "cooldown": "50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rattletrap_overclocking.png"
    },
    {
      "name": "Jetpack",
      "key": "R",
      "description": "Clockwerk activates a jetpack, gaining flying movement, flying vision, and bonus movement speed. Clockwerk has a seve...",
      "manaCost": "75",
      "cooldown": "16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rattletrap_jetpack.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5 Mana Regen",
      "right": "+75 Hookshot Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-8s Hookshot Cooldown",
      "right": "+25 Battery Assault Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Rocket Flare True Sight",
      "right": "+80 Power Cogs Mana Burn",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "3 Rocket Flare Charges",
      "right": "-0.25s Battery Assault Interval",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "leshrac",
  "name": "Leshrac",
  "aliases": [
    "leshrac",
    "leshrac"
  ],
  "title": "The Leshrac",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 50.5,
  "pickRate": 2.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/leshrac.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/leshrac.png",
  "summary": "Leshrac, Tormented Soul, is an entity torn from the heart of nature, a liminal being that exists half in one plane of existence, half in another. His penetrating intelligence is...",
  "abilities": [
    {
      "name": "Split Earth",
      "key": "Q",
      "description": "Splits the earth under enemies. Deals damage and stuns for a short duration.",
      "manaCost": "80/100/120/140",
      "cooldown": "11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/leshrac_split_earth.png"
    },
    {
      "name": "Diabolic Edict",
      "key": "W",
      "description": "Saturates the area around Leshrac with magical explosions that deal pure damage to enemy units and buildings. The few...",
      "manaCost": "90/120/150/180",
      "cooldown": "22/21/20/19",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/leshrac_diabolic_edict.png"
    },
    {
      "name": "Lightning Storm",
      "key": "E",
      "description": "Summons a lightning storm that blasts the target enemy unit, then strikes any nearby enemy units. Struck enemies have...",
      "manaCost": "80/100/120/140",
      "cooldown": "4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/leshrac_lightning_storm.png"
    },
    {
      "name": "Nihilism",
      "key": "D",
      "description": "Causes Leshrac and all nearby enemies to turn ethereal, preventing them from attacking, slowing them, and making them...",
      "manaCost": "75",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/leshrac_greater_lightning_storm.png"
    },
    {
      "name": "Defilement",
      "key": "R",
      "description": "Defilement tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/leshrac_defilement.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5 Mana Regen",
      "right": "+4 Armor",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+80 Lightning Storm Damage",
      "right": "+10% Damage Reduction during Pulse Nova",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Diabolic Edict Hits An Additional Target",
      "right": "+30 Pulse Nova Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+20 Diabolic Edict Explosions",
      "right": "Pulse Nova triggers Lightning Storm",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "natures_prophet",
  "name": "Nature's Prophet",
  "aliases": [
    "np",
    "furion"
  ],
  "title": "The Nature's Prophet",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Offlane",
    "Soft Support",
    "Carry"
  ],
  "complexity": 2,
  "winRate": 43.3,
  "pickRate": 11.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/furion.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/furion.png",
  "summary": "When Verodicia, Goddess of the Woods, had finished filling in the green places, having planted the coiled-up spirit in the seed, having lured the twining waters from deep within...",
  "abilities": [
    {
      "name": "Sprout",
      "key": "Q",
      "description": "Sprouts a ring of trees around a unit, damaging and trapping it in place and providing vision in a 400 radius.",
      "manaCost": "70/80/90/100",
      "cooldown": "14/12/10/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/furion_sprout.png"
    },
    {
      "name": "Teleportation",
      "key": "W",
      "description": "Teleports to any point on the map. Gains a barrier after arriving to its destination.",
      "manaCost": "50/60/70/80",
      "cooldown": "65/50/35/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/furion_teleportation.png"
    },
    {
      "name": "Nature\\'s Call",
      "key": "E",
      "description": "Converts an area of trees into Treants under the command of Nature\\'s Prophet.",
      "manaCost": "85/90/95/100",
      "cooldown": "45/40/35/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/furion_force_of_nature.png"
    },
    {
      "name": "Curse of the Oldgrowth",
      "key": "D",
      "description": "Applies a curse on all enemy heroes within 900 range, displaying them in fog, slowing them, and dealing damage over t...",
      "manaCost": "80",
      "cooldown": "18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/furion_curse_of_the_forest.png"
    },
    {
      "name": "Spirit of the Forest",
      "key": "R",
      "description": "Nature\\'s Prophet gains 2% bonus damage for each nearby tree. Treants also provide this bonus with multiplied values r...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/furion_spirit_of_the_forest.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-10s Nature\\'s Call Cooldown",
      "right": "+25 Wrath of Nature Base Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+50 Treant Movement Speed",
      "right": "+100 Teleportation Barrier",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-20s Wrath of Nature Cooldown",
      "right": "+240 Sprout Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Removed Teleportation Cooldown",
      "right": "3x Treant HP/Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "lifestealer",
  "name": "Lifestealer",
  "aliases": [
    "naix",
    "ls"
  ],
  "title": "The Lifestealer",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 2,
  "winRate": 52.4,
  "pickRate": 21.4,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/life_stealer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/life_stealer.png",
  "summary": "In the dungeons of Devarque, a vengeful wizard lay in shackles, plotting his escape. He shared his cell with a gibbering creature known as N\\'aix, a thief cursed by the Vile Coun...",
  "abilities": [
    {
      "name": "Rage",
      "key": "Q",
      "description": "Launch into a maddened rage, becoming Debuff Immune, increasing magic resistance and gaining movement speed.  DISPEL ...",
      "manaCost": "80/100/120/140",
      "cooldown": "20/19/18/17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/life_stealer_rage.png"
    },
    {
      "name": "Open Wounds",
      "key": "W",
      "description": "Lifestealer rends an enemy unit, slowing the victim\\'s movement speed and allowing all allies to regain health for a p...",
      "manaCost": "90",
      "cooldown": "30/25/20/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/life_stealer_open_wounds.png"
    },
    {
      "name": "Feast",
      "key": "E",
      "description": "Lifestealer\\'s attacks deal damage and provide heal for a percentage of his target\\'s max health. He gains permanent ma...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/life_stealer_feast.png"
    },
    {
      "name": "Ghoul Frenzy",
      "key": "D",
      "description": "Passively grants Lifestealer Attack Speed.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/life_stealer_ghoul_frenzy.png"
    },
    {
      "name": "Infest",
      "key": "R",
      "description": "Lifestealer infests the body of a target unit, becoming undetectable, and healing for a portion of his max hitpoints ...",
      "manaCost": "100/125/150",
      "cooldown": "80/65/50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/life_stealer_infest.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+4 All Attributes",
      "right": "+20 Movement Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+175 Infest Damage",
      "right": "50 Attack Speed on Open Wounds Target",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+12% Infest Target Movespeed/Health",
      "right": "+25% Open Wounds Lifesteal",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.0% Feast Heal and Damage",
      "right": "+1.0s Rage Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "dark_seer",
  "name": "Dark Seer",
  "aliases": [
    "ds",
    "ishkafel"
  ],
  "title": "The Dark Seer",
  "attribute": "int",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 49.4,
  "pickRate": 6.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dark_seer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dark_seer.png",
  "summary": "Fast when he needs to be, and a cunning strategist, Ish\\'Kafel the Dark Seer requires no edged weapons to vanquish his enemies, relying instead on the strength of his powerful mi...",
  "abilities": [
    {
      "name": "Vacuum",
      "key": "Q",
      "description": "Dark Seer creates a vacuum over the target area that sucks in enemy units, disrupting them and dealing damage.",
      "manaCost": "60/90/120/150",
      "cooldown": "60/50/40/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_seer_vacuum.png"
    },
    {
      "name": "Ion Shell",
      "key": "W",
      "description": "Surrounds the target unit with a bristling shield that damages enemy units in an area around it.",
      "manaCost": "100/110/120/130",
      "cooldown": "9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_seer_ion_shell.png"
    },
    {
      "name": "Surge",
      "key": "E",
      "description": "Charges a target friendly unit with power, giving it a brief burst of phased movement speed. Allows the unit to reach...",
      "manaCost": "50",
      "cooldown": "24/19/14/9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_seer_surge.png"
    },
    {
      "name": "Normal Punch",
      "key": "D",
      "description": "Passive ability. Causes Dark Seer\\'s next attack on a hero to have True Strike, knock a replica out of the victim, dam...",
      "cooldown": "10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_seer_normal_punch.png"
    },
    {
      "name": "Quick Wit",
      "key": "R",
      "description": "Dark Seer gains 1 Attack Speed from each point of Intelligence.  When Dark Seer levels up, he restores a percentage o...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_seer_aggrandize.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+15% Wall of Replica Illusion Damage",
      "right": "+65 Ion Shell Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+75 Vacuum AoE",
      "right": "-1.5s Surge Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-40s Wall of Replica Cooldown",
      "right": "+50 Ion Shell Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "2 Ion Shell Charges",
      "right": "350 AoE Surge",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "clinkz",
  "name": "Clinkz",
  "aliases": [
    "clinkz",
    "clinkz"
  ],
  "title": "The Clinkz",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 49.6,
  "pickRate": 6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/clinkz.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/clinkz.png",
  "summary": "At the base of the Bleeding Hills stretches a thousand-league wood, a place called The Hoven, where black pools gather the tarry blood of the uplands, and the king-mage Sutherex...",
  "abilities": [
    {
      "name": "Strafe",
      "key": "Q",
      "description": "Clinkz gains attack speed and has bonus attack range. Any current Skeleton Archers within a 1200 radius of Clinkz als...",
      "manaCost": "60/70/80/90",
      "cooldown": "30/25/20/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/clinkz_strafe.png"
    },
    {
      "name": "Searing Arrows",
      "key": "W",
      "description": "Imbues Clinkz\\'s arrows with fire for extra damage.  Skeleton Archers will fire Searing Arrows at targets Clinkz attac...",
      "manaCost": "10",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/clinkz_searing_arrows.png"
    },
    {
      "name": "Death Pact",
      "key": "E",
      "description": "Clinkz consumes the target enemy creep or friendly Skeleton Archer, healing and gaining max health. Does not take Cli...",
      "manaCost": "50",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/clinkz_death_pact.png"
    },
    {
      "name": "Burning Barrage",
      "key": "D",
      "description": "CHANNELED - Clinkz channels and shoots multiple piercing arrows in the target direction that hit all enemy units deal...",
      "manaCost": "40",
      "cooldown": "17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/clinkz_burning_barrage.png"
    },
    {
      "name": "Burning Army",
      "key": "R",
      "description": "Summons a row of Burning Skeleton Archers in the target location.",
      "manaCost": "150",
      "cooldown": "70",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/clinkz_burning_army.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.0s Strafe Duration",
      "right": "-4s Skeleton Walk Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+50 Attack Range",
      "right": "-{s:bonus_AbilityChargeRestoreTime}s Death...",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+40 Strafe Attack Speed",
      "right": "+400 Death Pact Bonus Health",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-9s Strafe Cooldown",
      "right": "Searing Arrows Multishot",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "omniknight",
  "name": "Omniknight",
  "aliases": [
    "omni",
    "purist"
  ],
  "title": "The Omniknight",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 50.3,
  "pickRate": 2.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/omniknight.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/omniknight.png",
  "summary": "Purist Thunderwrath was a hard-fighting, road-worn, deeply committed knight, sworn to the order in which he had grown up as squire to elder knights of great reputation. He had s...",
  "abilities": [
    {
      "name": "Purification",
      "key": "Q",
      "description": "Instantly heals a friendly unit and damages all nearby enemy units.",
      "manaCost": "90/105/120/135",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/omniknight_purification.png"
    },
    {
      "name": "Repel",
      "key": "W",
      "description": "Grants Debuff Immunity with 60% magic resistance, as well as bonus HP Regen.",
      "manaCost": "90/105/120/135",
      "cooldown": "40/35/30/25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/omniknight_martyr.png"
    },
    {
      "name": "Hammer of Purity",
      "key": "E",
      "description": "Omniknight imbues his hammer with holy power, causing his attack to have increased range, deal pure damage based on a...",
      "manaCost": "0",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/omniknight_hammer_of_purity.png"
    },
    {
      "name": "Degen Aura",
      "key": "D",
      "description": "Degenerates the movement capabilities of enemy units that stray too near, slowing their movement speed.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/omniknight_degen_aura.png"
    },
    {
      "name": "Guardian Angel",
      "key": "R",
      "description": "Omniknight calls upon a Guardian Angel that grants immunity from physical damage to all allied units near Omniknight.",
      "manaCost": "125/175/225",
      "cooldown": "100/90/80",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/omniknight_guardian_angel.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+200 Repel Cast Range",
      "right": "+30 Base Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-0.5s Hammer of Purity Cooldown",
      "right": "-20s Guardian Angel Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+150 Degen Aura Radius",
      "right": "-3s Purification Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+160 Purification Damage/Heal",
      "right": "+75% Hammer of Purity Bonus Base Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "enchantress",
  "name": "Enchantress",
  "aliases": [
    "ench",
    "aiushtha"
  ],
  "title": "The Enchantress",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 47.9,
  "pickRate": 3.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/enchantress.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/enchantress.png",
  "summary": "Aiushtha appears to be an innocent, carefree creature of the woods, and while this is certainly true, it is hardly the sum of her story. She well understands the suffering of th...",
  "abilities": [
    {
      "name": "Impetus",
      "key": "Q",
      "description": "Places an enchantment on each attack while activated, causing it to deal additional damage based on how far away the ...",
      "manaCost": "40/45/50/55",
      "cooldown": "6/4/2/0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enchantress_impetus.png"
    },
    {
      "name": "Enchant",
      "key": "W",
      "description": "Enchantress charms an enemy. If the enemy is a hero, they are dispelled and slowed for 3.5s, and Enchantress and her ...",
      "manaCost": "70",
      "cooldown": "30/24/18/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enchantress_enchant.png"
    },
    {
      "name": "Nature\\'s Attendants",
      "key": "E",
      "description": "A cloud of wisps heals Enchantress and any friendly units nearby.",
      "manaCost": "140",
      "cooldown": "35",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enchantress_natures_attendants.png"
    },
    {
      "name": "Sproink",
      "key": "D",
      "description": "Leaps backward, dodges incoming projectiles, and launches an Impetus attack on the 2 furthest enemy units within Ench...",
      "manaCost": "60",
      "cooldown": "10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enchantress_bunny_hop.png"
    },
    {
      "name": "Little Friends",
      "key": "R",
      "description": "Enchantress roots an enemy unit. All creeps, ally, enemy and neutral within a radius will gain bonus movement and att...",
      "manaCost": "75",
      "cooldown": "20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/enchantress_little_friends.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+5 Armor for Enchantress and her units",
      "right": "+30 Movespeed during Nature\\'s Attendants",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+30 Attack Speed for Enchantress and her u...",
      "right": "+8 Nature\\'s Attendants Heal",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+9 Nature\\'s Attendants Wisps",
      "right": "+150 Health / +25 Damage  for Enchantress ...",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+6.5% Impetus Damage",
      "right": "+80 Untouchable Attack Slow",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "huskar",
  "name": "Huskar",
  "aliases": [
    "huskar",
    "huskar"
  ],
  "title": "The Huskar",
  "attribute": "str",
  "attackType": "Ranged",
  "roles": [
    "Mid"
  ],
  "complexity": 1,
  "winRate": 45.9,
  "pickRate": 5.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/huskar.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/huskar.png",
  "summary": "Emerging from the throes of the sacred Nothl Realm, Huskar opened his eyes to see the prodigal shadow priest Dazzle working a deep incantation over him. Against the ancient rite...",
  "abilities": [
    {
      "name": "Inner Fire",
      "key": "Q",
      "description": "In a fiery rage, knocks all nearby enemies away from you to a fixed distance, dealing damage and silencing them.",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/huskar_inner_fire.png"
    },
    {
      "name": "Burning Spear",
      "key": "W",
      "description": "Huskar sets his spears aflame, dealing damage over time with his regular attack. Multiple attacks will stack addition...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/huskar_burning_spear.png"
    },
    {
      "name": "Berserker\\'s Blood",
      "key": "E",
      "description": "Huskar\\'s injuries feed his power, giving increased attack speed, magic resistance and health regen based on missing h...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/huskar_berserkers_blood.png"
    },
    {
      "name": "Blood Magic",
      "key": "D",
      "description": "Huskar does not have mana. Mana costs of items are converted into health costs.Huskar\\'s Health Costs are Magical Dama...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/huskar_blood_magic.png"
    },
    {
      "name": "Life Break",
      "key": "R",
      "description": "Huskar draws upon his health to break an enemy\\'s life, leaping at a target to shatter a percentage of that hero\\'s cur...",
      "manaCost": "0",
      "cooldown": "16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/huskar_life_break.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+0.75s Inner Fire Duration",
      "right": "+2s Life Break Slow Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+5 Burning Spear Burn Damage",
      "right": "+12% Lifesteal",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+30% Berserker\\'s Blood Regen",
      "right": "-5s Life Break Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+6s Burning Spear Duration",
      "right": "+22% Life Break Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "night_stalker",
  "name": "Night Stalker",
  "aliases": [
    "ns",
    "balanar"
  ],
  "title": "The Night Stalker",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 51.7,
  "pickRate": 9.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/night_stalker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/night_stalker.png",
  "summary": "Of the Night Stalker, there is no history, only stories. There are ancient tales woven into the lore of every race and every culture, of an impossible time before sunlight and d...",
  "abilities": [
    {
      "name": "Void",
      "key": "Q",
      "description": "Creates a damaging void that slows an enemy unit and deals damage. At night, Void also mini-stuns, interrupting chann...",
      "manaCost": "90/95/100/105",
      "cooldown": "11/10/9/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/night_stalker_void.png"
    },
    {
      "name": "Crippling Fear",
      "key": "W",
      "description": "Night Stalker horrifies all nearby enemies, causing them to become silenced and take damage over time while near him....",
      "manaCost": "50",
      "cooldown": "30/25/20/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/night_stalker_crippling_fear.png"
    },
    {
      "name": "Midnight Feast",
      "key": "E",
      "description": "Midnight Feast tactical ability",
      "manaCost": "0",
      "cooldown": "39/36/33/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/night_stalker_midnight_feast.png"
    },
    {
      "name": "Hunter in the Night",
      "key": "D",
      "description": "Night Stalker is in his element at night, attacking and moving with great swiftness.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/night_stalker_hunter_in_the_night.png"
    },
    {
      "name": "Dark Ascension",
      "key": "R",
      "description": "Night Stalker smothers the sun and summons instant darkness, so that he might use his powers at their fullest. Night ...",
      "manaCost": "125/175/225",
      "cooldown": "140/135/130",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/night_stalker_darkness.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-1s Void Cooldown",
      "right": "+10 Crippling Fear DPS",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25 Dark Ascension Damage",
      "right": "20% Hunter in the Night Status Resistance",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+75 Crippling Fear Radius",
      "right": "+15 Strength",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+100 Midnight Feast Lifesteal",
      "right": "-35s Dark Ascension Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "broodmother",
  "name": "Broodmother",
  "aliases": [
    "brood",
    "black arachnia"
  ],
  "title": "The Broodmother",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 50.2,
  "pickRate": 2.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/broodmother.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/broodmother.png",
  "summary": "For centuries, Black Arachnia the Broodmother lurked in the dark lava tubes beneath the smoldering caldera of Mount Pyrotheos, raising millions of spiderlings in safety before s...",
  "abilities": [
    {
      "name": "Insatiable Hunger",
      "key": "Q",
      "description": "A violent lust for vital fluids increases Broodmother\\'s attack damage and gives her and her Spiderlings a vampiric at...",
      "manaCost": "80",
      "cooldown": "45/40/35/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/broodmother_insatiable_hunger.png"
    },
    {
      "name": "Spin Web",
      "key": "W",
      "description": "Spins a large web that grants Broodmother a passive movement speed increase and increases her Turn Rate, while in its...",
      "manaCost": "40",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/broodmother_spin_web.png"
    },
    {
      "name": "Incapacitating Bite",
      "key": "E",
      "description": "Broodmother\\'s venom cripples enemy units, causing her attacks to slow and giving the affected unit a chance to miss i...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/broodmother_incapacitating_bite.png"
    },
    {
      "name": "Spinner\\'s Snare",
      "key": "D",
      "description": "Spinner\\'s Snare tactical ability",
      "manaCost": "70",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/broodmother_sticky_snare.png"
    },
    {
      "name": "Spider\\'s Milk",
      "key": "R",
      "description": "Whenever Broodmother kills a unit, she and all units under her control in a 600 radius receive a buff for 3s that hea...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/broodmother_spiders_milk.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+80 Spawn Spiderlings Damage",
      "right": "+20% Insatiable Hunger Lifesteal",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+5 Incapacitating Bite Attack Bonus",
      "right": "+175 Spiderlings Health",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-6s Spin Web Charge Restore Time",
      "right": "+20% Incapacitating Bite Slow/Miss Chance",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-0.15s BAT during Insatiable Hunger",
      "right": "+7% Spin Web Move Speed and Ignore Speed L...",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "bounty_hunter",
  "name": "Bounty Hunter",
  "aliases": [
    "bh",
    "gondar"
  ],
  "title": "The Bounty Hunter",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 52.8,
  "pickRate": 10.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bounty_hunter.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bounty_hunter.png",
  "summary": "When the hunted tell tales of Gondar the Bounty Hunter, none are sure of which are true. In whispered tones they say he was abandoned as a kit, learning his skill in tracking as...",
  "abilities": [
    {
      "name": "Shuriken Toss",
      "key": "Q",
      "description": "Hurls a deadly shuriken at an enemy unit, dealing damage and slowing the target\\'s movement speed. The shuriken will b...",
      "manaCost": "75/85/95/105",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bounty_hunter_shuriken_toss.png"
    },
    {
      "name": "Jinada",
      "key": "W",
      "description": "Bounty Hunter plans his next hit, dealing bonus damage and stealing some unreliable gold.",
      "cooldown": "9/7/5/3",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bounty_hunter_jinada.png"
    },
    {
      "name": "Shadow Walk",
      "key": "E",
      "description": "Bounty Hunter becomes invisible and gains bonus movement speed and the ability to move through other units until he a...",
      "manaCost": "50",
      "cooldown": "18/17/16/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bounty_hunter_wind_walk.png"
    },
    {
      "name": "Friendly Shadow",
      "key": "D",
      "description": "Applies Shadow Walk and all of its bonuses to the target ally. Allied fade time is 0.5s. Does not break Bounty Hunter...",
      "manaCost": "50",
      "cooldown": "15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bounty_hunter_wind_walk_ally.png"
    },
    {
      "name": "Big Game Hunter",
      "key": "R",
      "description": "Bounty Hunter receives 20% more kill and assist gold if the dying enemy hero is Big Game. An enemy hero is considered...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bounty_hunter_big_game_hunter.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+0.6s Shuriken Toss Slow",
      "right": "+30 Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-30% Damage Taken in Shadow Walk",
      "right": "+50 Track Gold",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Track Grants Shared Vision",
      "right": "+50 Jinada Gold Steal",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+250 Shuriken Toss Damage",
      "right": "No Cooldown on Jinada",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "weaver",
  "name": "Weaver",
  "aliases": [
    "skitskurr"
  ],
  "title": "The Weaver",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 47.2,
  "pickRate": 7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/weaver.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/weaver.png",
  "summary": "The fabric of creation needs constant care, lest it grow tattered; for when it unravels, whole worlds come undone. It is the work of the Weavers to keep the fabric tight, to rep...",
  "abilities": [
    {
      "name": "The Swarm",
      "key": "Q",
      "description": "Weaver launches a swarm of 12 young Weavers that latch on any enemy unit in their path, attacking and reducing armor ...",
      "manaCost": "110/105/100/95",
      "cooldown": "44/36/28/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/weaver_the_swarm.png"
    },
    {
      "name": "Shukuchi",
      "key": "W",
      "description": "Weaver shifts out of visibility, gaining max movement speed and doing harm to any enemies it passes through.",
      "manaCost": "65",
      "cooldown": "15/12/9/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/weaver_shukuchi.png"
    },
    {
      "name": "Geminate Attack",
      "key": "E",
      "description": "Allows Weaver to dispatch two attacks at once.",
      "cooldown": "9/7/5/3",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/weaver_geminate_attack.png"
    },
    {
      "name": "Time Lapse",
      "key": "D",
      "description": "Weaver warps backward to whatever position it was in five seconds earlier--regaining the HP and mana from that time. ...",
      "manaCost": "150/75/0",
      "cooldown": "70/55/40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/weaver_time_lapse.png"
    },
    {
      "name": "Threads of Fate",
      "key": "R",
      "description": "Whenever Weaver deals damage to an enemy hero with an attack or ability, if he remains within 700 range of them for 1...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/weaver_threads_of_fate.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+50 Shukuchi Movement Speed",
      "right": "+7 Strength",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+90 Shukuchi Damage",
      "right": "+2 Swarm Attacks to Kill",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+60 Bonus Damage On Geminate",
      "right": "+0.5 Swarm Armor Reduction Per Attack",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-3s Shukuchi Cooldown",
      "right": "+1 Geminate Attack",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "jakiro",
  "name": "Jakiro",
  "aliases": [
    "jakiro",
    "jakiro"
  ],
  "title": "The Jakiro",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 48.8,
  "pickRate": 10.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/jakiro.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/jakiro.png",
  "summary": "Even among magical beasts, a twin-headed dragon is a freak. Equal parts ice and fire, cunning and rage, the creature known as Jakiro glides over charred and ice-bound battlefiel...",
  "abilities": [
    {
      "name": "Dual Breath",
      "key": "Q",
      "description": "An icy blast followed by a wave of fire launches out in a path in front of Jakiro. The ice slows enemies, while the f...",
      "manaCost": "135/150/165/180",
      "cooldown": "12/11/10/9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/jakiro_dual_breath.png"
    },
    {
      "name": "Ice Path",
      "key": "W",
      "description": "Creates a path of ice that stuns and damages enemies that touch it.",
      "manaCost": "100",
      "cooldown": "20/17/14/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/jakiro_ice_path.png"
    },
    {
      "name": "Liquid Fire",
      "key": "E",
      "description": "Jakiro burns his enemies in an area of effect with fire added to his attack, while slowing their attacks. Shares a co...",
      "manaCost": "20",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/jakiro_liquid_fire.png"
    },
    {
      "name": "Liquid Frost",
      "key": "D",
      "description": "Jakiro chill his enemies with ice added to his attack, slowing movement for 5 seconds and increasing damage taken fro...",
      "manaCost": "20",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/jakiro_liquid_ice.png"
    },
    {
      "name": "Double Trouble",
      "key": "R",
      "description": "Jakiro\\'s attacks launch an attack from each head, but deal less damage each.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/jakiro_double_trouble.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+30 Liquid Fire Attack Speed Slow",
      "right": "+100 Ice Path Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+175 Attack Range",
      "right": "-3.5s Dual Breath Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.4s Ice Path Stun Duration",
      "right": "+25 Macropyre Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+100% Dual Breath Damage and Range",
      "right": "+3.5% Liquid Frost and Fire Max Health Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "batrider",
  "name": "Batrider",
  "aliases": [
    "bat"
  ],
  "title": "The Batrider",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 44.9,
  "pickRate": 1.4,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/batrider.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/batrider.png",
  "summary": "There is no such thing as harmony among the creatures of the Yama Raskav Jungle. By bite, or claw, or pincer, or hoof, even the slightest sign of weakness means a swift death.",
  "abilities": [
    {
      "name": "Sticky Napalm",
      "key": "Q",
      "description": "Drenches an area in sticky oil, amplifying damage from Batrider\\'s attacks and abilities and slowing the movement spee...",
      "manaCost": "22",
      "cooldown": "3",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/batrider_sticky_napalm.png"
    },
    {
      "name": "Flamebreak",
      "key": "W",
      "description": "Hurls an explosive cocktail that explodes when it reaches the target location, knocking back, slowing and dealing dam...",
      "manaCost": "110",
      "cooldown": "22/19/16/13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/batrider_flamebreak.png"
    },
    {
      "name": "Firefly",
      "key": "E",
      "description": "Batrider takes to the skies, moving increasingly fast and laying down a trail of flames from the air. The fire damage...",
      "manaCost": "100",
      "cooldown": "48/42/36/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/batrider_firefly.png"
    },
    {
      "name": "APPLICATION DAMAGE:",
      "key": "D",
      "description": "APPLICATION DAMAGE: tactical ability",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/batrider_sticky_napalm_application_damage.png"
    },
    {
      "name": "Smoldering Resin",
      "key": "R",
      "description": "Batrider\\'s attacks apply a debuff that deals 20% of the attack damage every 1s for 2s.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/batrider_smoldering_resin.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+5% Firefly Max Movement Speed Bonus",
      "right": "+1s Smoldering Resin Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+30 Firefly Damage Per Second",
      "right": "+0.75% Sticky Napalm Movement Slow",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Attacks apply 1 Stack of Sticky Napalm",
      "right": "-6s Flamebreak Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+0.75s Flaming Lasso Duration",
      "right": "Flamebreak applies 4 Sticky Napalm Stacks",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "chen",
  "name": "Chen",
  "aliases": [
    "chen",
    "chen"
  ],
  "title": "The Chen",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 3,
  "winRate": 44.8,
  "pickRate": 0.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/chen.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/chen.png",
  "summary": "Born in the godless Hazhadal Barrens, Chen came of age among the outlaw tribes who eked out an existence in the shimmering heat of the desert. Using an ancient form of animal en...",
  "abilities": [
    {
      "name": "Penitence",
      "key": "Q",
      "description": "Damages enemy unit, forces it to move slower and lets allies attack it more quickly.",
      "manaCost": "80/90/100/110",
      "cooldown": "20/17/14/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chen_penitence.png"
    },
    {
      "name": "Holy Persuasion",
      "key": "W",
      "description": "Chen takes control of an enemy or neutral creep and receives a percentage of its bounty. Its maximum health is set to...",
      "manaCost": "110/130/150/170",
      "cooldown": "15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chen_holy_persuasion.png"
    },
    {
      "name": "Divine Favor",
      "key": "E",
      "description": "Passively provides an aura that grants increased health regeneration. Can be cast on allies to provide them with bonu...",
      "manaCost": "75",
      "cooldown": "20/18/16/14/",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chen_divine_favor.png"
    },
    {
      "name": "Zealot",
      "key": "D",
      "description": "Zealot tactical ability",
      "manaCost": "50",
      "cooldown": "10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chen_zealot.png"
    },
    {
      "name": "Hand of God",
      "key": "R",
      "description": "Heals all allied heroes on the map as well as all units under Chen\\'s control. A large heal is applied at first and a ...",
      "manaCost": "200/300/400",
      "cooldown": "150/130/110",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chen_hand_of_god.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+75 Penitence Damage",
      "right": "special_bonus_unique_chen_zealot",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+12% Holy Persuasion Damage",
      "right": "+15% Penitence Slow",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+15% Divine Favor Heal Amplification",
      "right": "+1300 Holy Persuasion Minimum Health",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Hand of God applies a Strong Dispel",
      "right": "Hand of God Fully Heals Chen and His Creeps",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "spectre",
  "name": "Spectre",
  "aliases": [
    "spec",
    "mercurial"
  ],
  "title": "The Spectre",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 2,
  "winRate": 53.3,
  "pickRate": 14.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/spectre.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/spectre.png",
  "summary": "Just as higher states of energy seek a lower level, the Spectre known as Mercurial is a being of intense and violent energy who finds herself irresistibly drawn to scenes of str...",
  "abilities": [
    {
      "name": "Spectral Dagger",
      "key": "Q",
      "description": "Spectre flings a dagger to draw a Shadow Path, dealing damage and slowing the movement speed of any enemies along the...",
      "manaCost": "100/110/120/130",
      "cooldown": "22/20/18/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spectre_spectral_dagger.png"
    },
    {
      "name": "Shadow Step",
      "key": "W",
      "description": "Sends an uncontrollable illusion at a target that follows and attacks the target.  The Reality sub-ability may be use...",
      "manaCost": "60/65/70/75",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spectre_shadow_step.png"
    },
    {
      "name": "Dispersion",
      "key": "E",
      "description": "Spectre disperses part of the damage dealt to her, reflecting it to all nearby enemies. The effect lessens with dista...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spectre_dispersion.png"
    },
    {
      "name": "Reality",
      "key": "D",
      "description": "Spectre assumes the target Shadow Step or Haunt illusion, destroying it.",
      "manaCost": "25",
      "cooldown": "1.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spectre_reality.png"
    },
    {
      "name": "Desolate",
      "key": "R",
      "description": "Spectre and her illusions deal bonus Pure damage if attacking an enemy that does not have any allied units within a 3...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spectre_desolate.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-3s Spectral Dagger Cooldown",
      "right": "+12 Desolate Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+1.0s Shadow Step Duration",
      "right": "+80 Spectral Dagger Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+325 Health",
      "right": "+15% Spectral Dagger Slow/Bonus",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+15% All Spectre Illusion Damage",
      "right": "+4% Dispersion",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "ancient_apparition",
  "name": "Ancient Apparition",
  "aliases": [
    "aa",
    "kaldr"
  ],
  "title": "The Ancient Apparition",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 2,
  "winRate": 51.6,
  "pickRate": 8.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ancient_apparition.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ancient_apparition.png",
  "summary": "Kaldr, the Ancient Apparition, is an image projected from outside time. He springs from the cold, infinite void that both predates the universe and awaits its end.",
  "abilities": [
    {
      "name": "Cold Feet",
      "key": "Q",
      "description": "Places a curse on an enemy, dealing damage over time. If the enemy unit doesn\\'t move outside of the given range from ...",
      "manaCost": "110/115/120/125",
      "cooldown": "15/13/11/9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ancient_apparition_cold_feet.png"
    },
    {
      "name": "Ice Vortex",
      "key": "W",
      "description": "Creates a vortex of icy energy that slows, deals damage, and increases magic damage done to enemies in its range.",
      "manaCost": "40/55/70/85",
      "cooldown": "10/8/6/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ancient_apparition_ice_vortex.png"
    },
    {
      "name": "Chilling Touch",
      "key": "E",
      "description": "Enhances Ancient Apparition\\'s attack with increased range and a burst of magical damage and slow.",
      "manaCost": "35",
      "cooldown": "10/7.5/5/2.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ancient_apparition_chilling_touch.png"
    },
    {
      "name": "Bone Chill",
      "key": "D",
      "description": "When Ancient Apparition deals Magic damage to an enemy with his abilities, it is slowed for a short duration. If the ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ancient_apparition_bone_chill.png"
    },
    {
      "name": "Ice Blast",
      "key": "R",
      "description": "Launches a tracer toward any location on the battlefield, which must be triggered again to mark the area to be blaste...",
      "manaCost": "175",
      "cooldown": "60/50/40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ancient_apparition_ice_blast.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+300 Chilling Touch Attack Range",
      "right": "+30 Cold Feet Damage Per Second",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-2s Ice Vortex Cooldown",
      "right": "+250 Cold Feet Break Distance",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+4s Ice Blast Frostbitten Duration",
      "right": "+100 Chilling Touch Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "450 AoE Cold Feet",
      "right": "+4% Ice Blast Kill Threshold",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "doom",
  "name": "Doom",
  "aliases": [
    "lucifer"
  ],
  "title": "The Doom",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 47.8,
  "pickRate": 6.5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/doom_bringer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/doom_bringer.png",
  "summary": "He that burns and is not consumed, devours and is never sated, kills and is beyond all judgment--Lucifer brings doom to all who would stand against him. Bearing away souls on th...",
  "abilities": [
    {
      "name": "Devour",
      "key": "Q",
      "description": "Consumes an enemy or neutral creep, acquiring any special abilities that it possessed. If alt-cast is activated, Doom...",
      "manaCost": "40/50/60/70",
      "cooldown": "66",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/doom_bringer_devour.png"
    },
    {
      "name": "Scorched Earth",
      "key": "W",
      "description": "Carpets the nearby earth in flames which damage enemies, while also granting Doom increased movement speed and health...",
      "manaCost": "60/70/80/90",
      "cooldown": "41/39/37/35",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/doom_bringer_scorched_earth.png"
    },
    {
      "name": "Infernal Blade",
      "key": "E",
      "description": "Doom swings his burning sword, igniting the enemy. Stuns for 0.66 seconds and applies a 4 second burn that deals a ba...",
      "manaCost": "35",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/doom_bringer_infernal_blade.png"
    },
    {
      "name": "Devoured Ability",
      "key": "D",
      "description": "This slot will be replaced with abilities acquired using Devour.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/doom_bringer_empty1.png"
    },
    {
      "name": "Devoured Ability",
      "key": "R",
      "description": "This slot will be replaced with abilities acquired using Devour.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/doom_bringer_empty2.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "Devour grants {s:bonus_magic_resist}% Magi...",
      "right": "+0.2s Infernal Blade Stun Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+7% Scorched Earth Movement Speed",
      "right": "+66 Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-10s Doom Cooldown",
      "right": "+1.5% Infernal Blade Max HP As Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Doom applies Mute",
      "right": "Permanent Scorched Earth",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "ursa",
  "name": "Ursa",
  "aliases": [
    "fuzzy wuzzy",
    "ulfsaar"
  ],
  "title": "The Ursa",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 1,
  "winRate": 48.1,
  "pickRate": 8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ursa.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ursa.png",
  "summary": "Ulfsaar the Warrior is the fiercest member of an ursine tribe, protective of his land and his people. During the long winters, while the mothers sleep and nurse their cubs, the ...",
  "abilities": [
    {
      "name": "Earthshock",
      "key": "Q",
      "description": "Ursa leaps forward 250 units and slams the earth, causing a powerful shock to damage and slow all enemy units in a ne...",
      "manaCost": "95",
      "cooldown": "15/13/11/9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ursa_earthshock.png"
    },
    {
      "name": "Overpower",
      "key": "W",
      "description": "Using his skill in combat, Ursa gains increased attack speed and slow resistance for a number of subsequent attacks.",
      "manaCost": "45/50/55/60",
      "cooldown": "12/11/10/9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ursa_overpower.png"
    },
    {
      "name": "Fury Swipes",
      "key": "E",
      "description": "Ursa\\'s claws dig deeper wounds in the enemy, causing consecutive attacks to the same enemy to deal more damage. If th...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ursa_fury_swipes.png"
    },
    {
      "name": "Maul",
      "key": "D",
      "description": "Ursa gains bonus damage equal to a percentage of his Current HP.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ursa_maul.png"
    },
    {
      "name": "Enrage",
      "key": "R",
      "description": "Ursa goes into a frenzy, providing damage reduction and status resistance. Removes any existing debuffs.  DISPEL TYPE...",
      "manaCost": "0",
      "cooldown": "60/45/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ursa_enrage.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+9s Fury Swipes Reset Time",
      "right": "+1.75 Mana Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+0.5% Maul Health As Damage",
      "right": "+25% Enrage Status Resistance",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+300 Earthshock Radius",
      "right": "+6 Fury Swipes Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Earthshock has 2 Charges",
      "right": "+3 Overpower Attacks",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "spirit_breaker",
  "name": "Spirit Breaker",
  "aliases": [
    "sb",
    "barathrum",
    "cow"
  ],
  "title": "The Spirit Breaker",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 52.1,
  "pickRate": 19.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/spirit_breaker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/spirit_breaker.png",
  "summary": "Barathrum the Spirit Breaker is a lordly and powerful being, a fierce and elemental intelligence which chose to plane-shift into the world of matter to take part in events with ...",
  "abilities": [
    {
      "name": "Charge of Darkness",
      "key": "Q",
      "description": "Spirit Breaker fixes his sight on an enemy unit and starts charging through all objects, starting at 25% of the bonus...",
      "manaCost": "80/90/100/110",
      "cooldown": "22/19/16/13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spirit_breaker_charge_of_darkness.png"
    },
    {
      "name": "Bulldoze",
      "key": "W",
      "description": "Spirit Breaker gains movement speed and status resistance to ram through enemies. Can be used while charging.",
      "manaCost": "30/40/50/60",
      "cooldown": "22/20/18/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spirit_breaker_bulldoze.png"
    },
    {
      "name": "Greater Bash",
      "key": "E",
      "description": "Gives a chance to stun and knockback an enemy unit on an attack. Deals a percentage of movement speed as damage.",
      "cooldown": "1.2",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spirit_breaker_greater_bash.png"
    },
    {
      "name": "Planar Pocket",
      "key": "D",
      "description": "Barathrum gains magic resistance and distorts reality around the selected hero, making any unit-targeted spells cast ...",
      "manaCost": "100",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spirit_breaker_planar_pocket.png"
    },
    {
      "name": "Empowering Haste",
      "key": "R",
      "description": "Spirit Breaker gains bonus Movement Speed for a duration whenever he stuns an enemy. Effects from multiple stuns stac...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/spirit_breaker_bull_rush.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+500 Night Vision",
      "right": "+4 Armor",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-3s Bulldoze Cooldown",
      "right": "+60 Charge of Darkness Bonus Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+8%/+2% Empowering Haste Movespeed Bonus",
      "right": "Bulldoze 375 All Damage Barrier",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+20% Greater Bash Damage",
      "right": "-4s Charge of Darkness Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "gyrocopter",
  "name": "Gyrocopter",
  "aliases": [
    "gyro",
    "aurel"
  ],
  "title": "The Gyrocopter",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 45.8,
  "pickRate": 3.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/gyrocopter.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/gyrocopter.png",
  "summary": "After serving through a lifetime of wars, upheaval, riots, and revolutions, the brass figured Aurel had seen enough. But in addition to a few trinkets and his considerable pensi...",
  "abilities": [
    {
      "name": "Rocket Barrage",
      "key": "Q",
      "description": "Launches a salvo of rockets at nearby enemy units in a radius around the Gyrocopter. Lasts 3 seconds.",
      "manaCost": "85",
      "cooldown": "7/6.5/6/5.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/gyrocopter_rocket_barrage.png"
    },
    {
      "name": "Homing Missile",
      "key": "W",
      "description": "Fires a homing missile to seek the targeted enemy unit. The missile gains speed over time, dealing damage and stunnin...",
      "manaCost": "120/130/140/150",
      "cooldown": "30/24/18/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/gyrocopter_homing_missile.png"
    },
    {
      "name": "Flak Cannon",
      "key": "E",
      "description": "Gyrocopter\\'s attacks hit all enemy units in an area around it for a limited number of attacks. Only the main target o...",
      "manaCost": "50/60/70/80",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/gyrocopter_flak_cannon.png"
    },
    {
      "name": "Afterburner",
      "key": "D",
      "description": "Gyrocopter gains movement speed for a short duration after damaging an enemy with his attacks or abilities.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/gyrocopter_afterburner.png"
    },
    {
      "name": "Side Gunner",
      "key": "R",
      "description": "Side Gunner tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/gyrocopter_side_gunner_spawn_ability.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25% Homing Missile Damage",
      "right": "+150 Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+0.3s Homing Missile Stun Duration",
      "right": "+25 Flak Cannon Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+3 Flak Cannon Attacks",
      "right": "+14 Rocket Barrage Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-6s Flak Cannon Cooldown",
      "right": "-40s Call Down Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "alchemist",
  "name": "Alchemist",
  "aliases": [
    "alchemist",
    "alchemist"
  ],
  "title": "The Alchemist",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 47.6,
  "pickRate": 3.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/alchemist.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/alchemist.png",
  "summary": "The sacred science of Chymistry was a Darkbrew family tradition, but no Darkbrew had ever shown the kind of creativity, ambition, and recklessness of young Razzil. However, when...",
  "abilities": [
    {
      "name": "Acid Spray",
      "key": "Q",
      "description": "Sprays high-pressure acid across a target area. Enemy units who step across the contaminated terrain take damage per ...",
      "manaCost": "120",
      "cooldown": "21",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/alchemist_acid_spray.png"
    },
    {
      "name": "Unstable Concoction",
      "key": "W",
      "description": "Alchemist brews up an unstable concoction that he can throw at an enemy hero, to stun and deal damage in an area arou...",
      "manaCost": "100",
      "cooldown": "17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/alchemist_unstable_concoction.png"
    },
    {
      "name": "Corrosive Weaponry",
      "key": "E",
      "description": "Alchemist coats his weapons and empowers his spells with an acid that applies a stacking slow and base attack damage ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/alchemist_corrosive_weaponry.png"
    },
    {
      "name": "Berserk Potion",
      "key": "D",
      "description": "Alchemist throws a potion at an ally, applying a basic dispel and giving them attack speed, movement speed and HP reg...",
      "manaCost": "100",
      "cooldown": "35",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/alchemist_berserk_potion.png"
    },
    {
      "name": "Greevil\\'s Greed",
      "key": "R",
      "description": "Alchemist synthesizes additional gold from his enemies and bounty runes. With each kill, Alchemist earns base bonus g...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/alchemist_goblins_greed.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1 Acid Spray Armor Reduction",
      "right": "+150 Unstable Concoction Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+1% Corrosive Weaponry Slow / Damage Reduc...",
      "right": "Greevil\\'s Greed provides +3 Damage per stack",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-0.1s Chemical Rage Base Attack Time",
      "right": "+400 Unstable Concoction Max Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+50 Chemical Rage Movement Speed",
      "right": "+50 Chemical Rage Regeneration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "invoker",
  "name": "Invoker",
  "aliases": [
    "kael",
    "vurtune"
  ],
  "title": "The Invoker",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid"
  ],
  "complexity": 3,
  "winRate": 50.1,
  "pickRate": 23.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/invoker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/invoker.png",
  "summary": "In its earliest, and some would say most potent form, magic was primarily the art of memory. It required no technology, no wands or appurtenances other than the mind of the magi...",
  "abilities": [
    {
      "name": "Quas",
      "key": "Q",
      "description": "Allows manipulation of ice elements. Active Quas instances imbue Invoker with bonus hp regeneration. Passively grants...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/invoker_quas.png"
    },
    {
      "name": "Wex",
      "key": "W",
      "description": "Allows manipulation of storm elements. Active Wex instances imbue Invoker with bonus movement and attack speed. Passi...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/invoker_wex.png"
    },
    {
      "name": "Exort",
      "key": "E",
      "description": "Allows manipulation of fire elements. Active Exort instances imbue Invoker with bonus attack damage. Passively grants...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/invoker_exort.png"
    },
    {
      "name": "Invoked Spell",
      "key": "D",
      "description": "Casting Invoke will replace this slot with one of ten unique spells based on Invoker\\'s currently active Quas, Wex, an...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/invoker_empty1.png"
    },
    {
      "name": "Invoked Spell",
      "key": "R",
      "description": "Casting Invoke will replace this slot with one of ten unique spells based on Invoker\\'s currently active Quas, Wex, an...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/invoker_empty2.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+50 Ice Wall DPS",
      "right": "-5s Tornado Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25 Alacrity Damage/Speed",
      "right": "-6s Cold Snap Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+2 Chaos Meteors",
      "right": "+1 Orb Levels",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Radial Deafening Blast",
      "right": "2x Quas/Wex/Exort Active Bonuses",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "silencer",
  "name": "Silencer",
  "aliases": [
    "silencer",
    "silencer"
  ],
  "title": "The Silencer",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 50.6,
  "pickRate": 12.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/silencer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/silencer.png",
  "summary": "Part of the seventh and final generation of a carefully designed pedigree, Nortrom was bred by the ancient order of the Aeol Drias to be the greatest magic user the world had ev...",
  "abilities": [
    {
      "name": "Arcane Curse",
      "key": "Q",
      "description": "Curses the target area, dealing damage and causing enemies to take damage over time and slowing their movement speed....",
      "manaCost": "120/130/140/150",
      "cooldown": "22/20/18/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/silencer_curse_of_the_silent.png"
    },
    {
      "name": "Glaives of Wisdom",
      "key": "W",
      "description": "Silencer enchants his glaives with his wisdom, stealing his target\\'s Intelligence with each hit and dealing additiona...",
      "manaCost": "12/14/16/18",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/silencer_glaives_of_wisdom.png"
    },
    {
      "name": "Last Word",
      "key": "E",
      "description": "Enchants a target, providing vision of them and causing them to be damaged and silenced if they cast a spell or if th...",
      "manaCost": "100/105/110/115",
      "cooldown": "22/18/14/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/silencer_last_word.png"
    },
    {
      "name": "Suffer In Silence",
      "key": "D",
      "description": "Silencer takes less damage from and deals more damage to silenced targets.  If an enemy Hero dies within 925 range of...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/silencer_brain_drain.png"
    },
    {
      "name": "Global Silence",
      "key": "R",
      "description": "Silencer stops all sound, preventing enemy heroes and units on the map from casting spells.",
      "manaCost": "300/450/600",
      "cooldown": "120",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/silencer_global_silence.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25 Attack Speed",
      "right": "+7% Suffer In Silence Silenced Target Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-15s Global Silence Cooldown",
      "right": "special_bonus_unique_silencer_arcane_curse...",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+40s Glaives of Wisdom Int Steal Duration",
      "right": "250 AoE Last Word",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+30% Glaives of Wisdom Damage",
      "right": "+2s Global Silence Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "outworld_destroyer",
  "name": "Outworld Devourer",
  "aliases": [
    "od",
    "outworld devourer",
    "obsidian destroyer"
  ],
  "title": "The Outworld Devourer",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Mid"
  ],
  "complexity": 2,
  "winRate": 53.3,
  "pickRate": 10.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/obsidian_destroyer.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/obsidian_destroyer.png",
  "summary": "One of a lordly and magisterial race, Harbinger prowls the edge of the Void, sole surviving sentry of an outpost on the world at the rim of the abyss. From this jagged crystalli...",
  "abilities": [
    {
      "name": "Arcane Orb",
      "key": "Q",
      "description": "Adds extra pure damage to Outworld Destroyer\\'s attacks, based on his remaining mana pool.",
      "manaCost": "0",
      "cooldown": "4.5/3/1.5/0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/obsidian_destroyer_arcane_orb.png"
    },
    {
      "name": "Astral Imprisonment",
      "key": "W",
      "description": "Steals a percentage of the target\\'s max mana and places them into an astral prison. The hidden unit is invulnerable a...",
      "manaCost": "150",
      "cooldown": "18/16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/obsidian_destroyer_astral_imprisonment.png"
    },
    {
      "name": "Objurgation",
      "key": "E",
      "description": "Increases Outworld Destroyer\\'s maximum mana. When cast, protects Outworld Destroyer with an all damage barrier equal ...",
      "manaCost": "175",
      "cooldown": "36/34/32/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/obsidian_destroyer_objurgation.png"
    },
    {
      "name": "Essence Flux",
      "key": "D",
      "description": "Passively grants a chance to restore a percentage of your max mana each time you cast an ability. Restores less mana ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/obsidian_destroyer_equilibrium.png"
    },
    {
      "name": "Sanity\\'s Eclipse",
      "key": "R",
      "description": "Unleashes a psychic blast that deals damage to enemies based on the difference between your max mana and the target\\'s...",
      "manaCost": "200/300/400",
      "cooldown": "140/130/120",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/obsidian_destroyer_sanity_eclipse.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+100 Astral Imprisonment Cast Range",
      "right": "+200 Mana",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+5% Essence Flux Mana Restored",
      "right": "+=0.8% of Current Mana as Movement Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-10s Objurgation Cooldown",
      "right": "+12% Astral Imprisonment Mana Capacity Steal",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.5% Arcane Orb Damage",
      "right": "-60s Sanity\\'s Eclipse Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "lycan",
  "name": "Lycan",
  "aliases": [
    "lycan",
    "lycan"
  ],
  "title": "The Lycan",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Carry"
  ],
  "complexity": 2,
  "winRate": 48.3,
  "pickRate": 1.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lycan.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lycan.png",
  "summary": "Banehallow was noble-born to the house of Ambry, the greatest of the landed castes in the old kingdom of Slom. Before the Fall, as the King\\'s wants grew strange, and his court g...",
  "abilities": [
    {
      "name": "Summon Wolves",
      "key": "Q",
      "description": "Summons 2 wolves to aid Lycan in battle. At level 3, wolves gain Permanent Invisibility, and at level 4 wolves gain C...",
      "manaCost": "115/120/125/130",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lycan_summon_wolves.png"
    },
    {
      "name": "Howl",
      "key": "W",
      "description": "Strikes fear into enemies, reducing armor and attack damage of all enemies within 2000 range of Lycan and his wolves....",
      "manaCost": "40",
      "cooldown": "22/20/18/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lycan_howl.png"
    },
    {
      "name": "Feral Impulse",
      "key": "E",
      "description": "Increases the HP regeneration and damage of Lycan and all units under his control.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lycan_feral_impulse.png"
    },
    {
      "name": "Wolf Bite",
      "key": "D",
      "description": "Lycan bites an allied hero or creep-hero, granting them Shapeshift properties. Lycan and the bitten target gain 40% L...",
      "manaCost": "150",
      "cooldown": "110/100/90",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lycan_wolf_bite.png"
    },
    {
      "name": "Apex Predator",
      "key": "R",
      "description": "Lycan and units he controls deal extra damage to neutral creeps.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lycan_apex_predator.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+3 Howl Armor Reduction",
      "right": "+14 Wolves Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+375 Summon Wolves Health",
      "right": "-15s Shapeshift Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+7s Shapeshift Duration",
      "right": "+25% Feral Impulse Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-{s:bonus_wolf_bat}% Summon Wolves BAT",
      "right": "Howl Reduces Total Attack Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "brewmaster",
  "name": "Brewmaster",
  "aliases": [
    "panda",
    "mangix"
  ],
  "title": "The Brewmaster",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 3,
  "winRate": 51.4,
  "pickRate": 2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/brewmaster.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/brewmaster.png",
  "summary": "Deep in the Wailing Mountains, in a valley beneath the Ruined City, the ancient Order of the Oyo has for centuries practiced its rites of holy reverie, communing with the spirit...",
  "abilities": [
    {
      "name": "Thunder Clap",
      "key": "Q",
      "description": "Slams the ground, dealing damage and slowing the movement speed and attack rate of nearby enemy units.",
      "manaCost": "100",
      "cooldown": "18/16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/brewmaster_thunder_clap.png"
    },
    {
      "name": "Cinder Brew",
      "key": "W",
      "description": "Rolls a barrel of ale at enemies that damages enemies along its path and spills out at the target location.  Any enem...",
      "manaCost": "50/60/70/80",
      "cooldown": "19/17/15/13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/brewmaster_cinder_brew.png"
    },
    {
      "name": "Drunken Brawler",
      "key": "E",
      "description": "Brewmaster can switch stances based on the elements he controls.  Whenever Brewmaster casts an ability, he becomes Br...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/brewmaster_drunken_brawler.png"
    },
    {
      "name": "Liquid Courage",
      "key": "D",
      "description": "When Brewmaster drops below 50% Health he gains a Status Resistance buff and his movement speed alternates every 1s b...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/brewmaster_liquid_courage.png"
    },
    {
      "name": "Primal Split",
      "key": "R",
      "description": "Splits Brewmaster into elements, forming 3 specialized warriors, adept at survival, each with their own abilities. If...",
      "manaCost": "150/200/250/250",
      "cooldown": "140/130/120",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/brewmaster_primal_split.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+13 Brewlings Base Damage",
      "right": "+2/1s Drunken Brawler Brew Up / Extend Dur...",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+40% Cinder Brew Damage/Duration",
      "right": "+600 Brewlings Health",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-12s Primal Split Cooldown",
      "right": "+110 Attack Speed",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "1.5x Drunken Brawler Stance Bonuses",
      "right": "Cinder Brew applies Fear when ignited",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "shadow_demon",
  "name": "Shadow Demon",
  "aliases": [
    "shadow demon",
    "shadow demon"
  ],
  "title": "The Shadow Demon",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 2,
  "winRate": 45.2,
  "pickRate": 2.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shadow_demon.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shadow_demon.png",
  "summary": "Among the sovereign Demons with explicit access to this world, Doom scarcely bothers with the affairs of Noninfernals and Lesser Spectral Consorts, while Shadow Fiend passes thr...",
  "abilities": [
    {
      "name": "Disruption",
      "key": "Q",
      "description": "Banishes the targeted unit from the battlefield for a short duration. Upon returning, two illusions of the banished u...",
      "manaCost": "120",
      "cooldown": "26/24/22/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_demon_disruption.png"
    },
    {
      "name": "Disseminate",
      "key": "W",
      "description": "Whenever the target takes damage, all enemies, including the target itself if it is an enemy, within 675 range of the...",
      "manaCost": "100",
      "cooldown": "26/22/18/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_demon_disseminate.png"
    },
    {
      "name": "Shadow Poison",
      "key": "E",
      "description": "Deals damage in a line, and afflicts enemy units with a poison effect. The poison deals 1/2/4/8/16 times the stack da...",
      "manaCost": "40",
      "cooldown": "2.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_demon_shadow_poison.png"
    },
    {
      "name": "Shadow Poison Release",
      "key": "D",
      "description": "Releases the poison to do damage on all affected enemies. Units under the effect of Disruption can still be affected ...",
      "cooldown": "1",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_demon_shadow_poison_release.png"
    },
    {
      "name": "Demonic Cleanse",
      "key": "R",
      "description": "Cleanses the target allied unit, removing negative buffs for the duration. At the end of the duration, the unit is he...",
      "manaCost": "150",
      "cooldown": "60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shadow_demon_demonic_cleanse.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+15% Shadow Poison Damage",
      "right": "+8 Strength",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25 Movement Speed",
      "right": "-1s Shadow Poison Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+15% Disseminate Shared Damage",
      "right": "-20s Demonic Purge Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Demonic Purge Applies Shadow Poison",
      "right": "2 Charges of Disruption",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "lone_druid",
  "name": "Lone Druid",
  "aliases": [
    "ld",
    "syllabear"
  ],
  "title": "The Lone Druid",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 3,
  "winRate": 48.3,
  "pickRate": 4.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lone_druid.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lone_druid.png",
  "summary": "Long before the first words of the first histories there rose the druidic Bear Clan. Wise and just they were, and focused in their ways to seek an understanding of the natural o...",
  "abilities": [
    {
      "name": "Entangle",
      "key": "Q",
      "description": "Allows Lone Druid to Entangle enemies once they gain 5 stacks. Entangled enemies are rooted and take damage over time...",
      "manaCost": "60",
      "cooldown": "20/19/18/17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_entangle.png"
    },
    {
      "name": "Spirit Link",
      "key": "W",
      "description": "Links Lone Druid and the Spirit Bear, increasing their movement speed as well as sharing a percentage of their lifest...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_link.png"
    },
    {
      "name": "Savage Roar",
      "key": "E",
      "description": "Lone Druid and the Spirit Bear roar fiercely causing nearby enemies to flee towards their base in terror. Their movem...",
      "manaCost": "50",
      "cooldown": "29/26/23/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_savage_roar.png"
    },
    {
      "name": "Summon Spirit Bear",
      "key": "D",
      "description": "Summons a powerful Spirit Bear companion that can equip items.  If the bear moves 1100 distance away from the Lone Dr...",
      "manaCost": "100",
      "cooldown": "120",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_bear.png"
    },
    {
      "name": "True Form",
      "key": "R",
      "description": "Lone Druid morphs himself into a raging bear, losing his ranged advantage, but gaining bonus armor, bonus health, and...",
      "manaCost": "80",
      "cooldown": "60/55/50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_true_form.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+5s True Form Duration",
      "right": "+20 Entangle Root Damage Per Second",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-5s Savage Roar Cooldown",
      "right": "+12 Agility",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+150 Savage Roar Radius",
      "right": "+55 Attack Speed",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "True Form provides 70% Slow Resistance",
      "right": "+0.6s Entangle Root Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "chaos_knight",
  "name": "Chaos Knight",
  "aliases": [
    "ck"
  ],
  "title": "The Chaos Knight",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 51.8,
  "pickRate": 5.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/chaos_knight.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/chaos_knight.png",
  "summary": "The veteran of countless battles on a thousand worlds, Chaos Knight hails from a far upstream plane where the fundamental laws of the universe have found sentient expression. Of...",
  "abilities": [
    {
      "name": "Chaos Bolt",
      "key": "Q",
      "description": "Throws a mysterious bolt of energy at the target unit. It stuns for a random duration and deals random damage.",
      "manaCost": "110",
      "cooldown": "13/12/11/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chaos_knight_chaos_bolt.png"
    },
    {
      "name": "Reality Rift",
      "key": "W",
      "description": "Teleports Chaos Knight, any illusions he has, and the target unit to a point along the line between him and the targe...",
      "manaCost": "50",
      "cooldown": "15/12/9/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chaos_knight_reality_rift.png"
    },
    {
      "name": "Chaos Strike",
      "key": "E",
      "description": "Chaos Knight and his illusions\\' attacks have a chance to deal a critical strike of varying strength with bonus lifest...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chaos_knight_chaos_strike.png"
    },
    {
      "name": "Fundamental Forging",
      "key": "D",
      "description": "Fundamental Forging tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chaos_knight_fundamental_forging.png"
    },
    {
      "name": "Phantasm",
      "key": "R",
      "description": "Summons several phantasmal copies of the Chaos Knight from alternate dimensions. The phantasms are illusions that dea...",
      "manaCost": "100/200/300",
      "cooldown": "85/80/75",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/chaos_knight_phantasm.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+30% Chaos Strike Lifesteal",
      "right": "+225 Reality Rift Pull Distance",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-3s Chaos Bolt Cooldown",
      "right": "+10 Strength",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.6 Min/Max Chaos Bolt Duration",
      "right": "Reality Rift Pierces Spell Immunity",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+10% Chaos Strike Chance",
      "right": "-125% Phantasm Illusion Incoming Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "meepo",
  "name": "Meepo",
  "aliases": [
    "meepo",
    "meepo"
  ],
  "title": "The Meepo",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Mid",
    "Carry"
  ],
  "complexity": 3,
  "winRate": 52.3,
  "pickRate": 2.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/meepo.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/meepo.png",
  "summary": "\\'If you ask me, life is all about who you know and what you can find. When you live up in the Riftshadow Ruins, just finding food can be tough.",
  "abilities": [
    {
      "name": "Earthbind",
      "key": "Q",
      "description": "Tosses a net at the target point, rooting down all enemy units in an area around it.",
      "manaCost": "70/80/90/100",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/meepo_earthbind.png"
    },
    {
      "name": "Poof",
      "key": "W",
      "description": "Drawing mystical energies from the earth, a Meepo can teleport to another Meepo or itself after channeling for 1.5 se...",
      "manaCost": "80",
      "cooldown": "12/10/8/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/meepo_poof.png"
    },
    {
      "name": "Ransack",
      "key": "E",
      "description": "Steals health from the enemy with each strike and heals all other Meepos for that amount.  Reduced to 60% against cre...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/meepo_ransack.png"
    },
    {
      "name": "Dig",
      "key": "D",
      "description": "Digs into the ground for a short duration, dispelling Meepo and causing him to become invulnerable and untargetable f...",
      "manaCost": "125",
      "cooldown": "40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/meepo_petrify.png"
    },
    {
      "name": "MegaMeepo",
      "key": "R",
      "description": "Primary Meepo mounts all other Meepos in a 600 radius around him on top of his shoulders. While in this form, he gain...",
      "manaCost": "0",
      "cooldown": "90",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/meepo_megameepo.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+7 Strength",
      "right": "+40 Poof Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+15% Evasion",
      "right": "-1.5s Earthbind Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Earthbind grants True Strike on Targets",
      "right": "+6 Ransack Health Steal",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+400 Health",
      "right": "-.75s Poof Cast Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "treant_protector",
  "name": "Treant Protector",
  "aliases": [
    "treant",
    "tree",
    "rooftrellen"
  ],
  "title": "The Treant Protector",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Hard Support"
  ],
  "complexity": 2,
  "winRate": 47.8,
  "pickRate": 5.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/treant.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/treant.png",
  "summary": "Far to the west, in the mountains beyond the Vale of Augury, lie the remains of an ancient power, a fount of eldritch energy nestled deep in the high woods. It is said that the ...",
  "abilities": [
    {
      "name": "Nature\\'s Grasp",
      "key": "Q",
      "description": "Creates vines towards the target location. Vines slow down and deal damage to enemies that walk through. Does 35% les...",
      "manaCost": "90",
      "cooldown": "23/21/19/17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/treant_natures_grasp.png"
    },
    {
      "name": "Leech Seed",
      "key": "W",
      "description": "Treant\\'s attack plants a life-sapping seed in an enemy unit. That unit takes additional magic damage, is rooted and d...",
      "cooldown": "15/12/9/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/treant_leech_seed.png"
    },
    {
      "name": "Living Armor",
      "key": "E",
      "description": "Infuses the target hero or structure with a protective coating which heals the target and blocks damage from player-c...",
      "manaCost": "65/70/75/80",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/treant_living_armor.png"
    },
    {
      "name": "Eyes In The Forest",
      "key": "D",
      "description": "Treant Protector enchants a tree, which grants him unobstructed vision in that location. The eyes last for 360 second...",
      "manaCost": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/treant_eyes_in_the_forest.png"
    },
    {
      "name": "Nature\\'s Guise",
      "key": "R",
      "description": "Grants bonus movement speed when near trees. Treant Protector additionally has Tree Walking if he has not taken damag...",
      "cooldown": "36",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/treant_natures_guise.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+3 Living Armor Heal Per Second",
      "right": "+50 Base Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+10% Leech Seed Damage to Healing",
      "right": "+25 Nature\\'s Grasp Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+20 Living Armor Damage Block",
      "right": "+80 Leech Seed Bonus Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-3s Leech Seed Cooldown",
      "right": "450 AoE Living Armor",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "ogre_magi",
  "name": "Ogre Magi",
  "aliases": [
    "ogre",
    "aggron"
  ],
  "title": "The Ogre Magi",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Hard Support",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 50.7,
  "pickRate": 20.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ogre_magi.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ogre_magi.png",
  "summary": "The ordinary ogre is the creature for whom the phrase \\'As dumb as a bag of rock hammers\\' was coined. In his natural state, an ogre is supremely incapable of doing or deciding an...",
  "abilities": [
    {
      "name": "Fireblast",
      "key": "Q",
      "description": "Blasts an enemy unit with a wave of fire, dealing damage and stunning the target.",
      "manaCost": "70/85/100/115",
      "cooldown": "11/10/9/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ogre_magi_fireblast.png"
    },
    {
      "name": "Ignite",
      "key": "W",
      "description": "Drenches the target and another random unit in volatile chemicals, causing it to burst into flames. The target is in ...",
      "manaCost": "80/90/100/110",
      "cooldown": "17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ogre_magi_ignite.png"
    },
    {
      "name": "Bloodlust",
      "key": "E",
      "description": "Incites a frenzy in a friendly unit, increasing its movement speed and attack speed. Gives bonus attack speed if cast...",
      "manaCost": "40/50/60/70",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ogre_magi_bloodlust.png"
    },
    {
      "name": "Unrefined Fireblast",
      "key": "D",
      "description": "Blasts an enemy unit with a wave of fire, dealing 150 + 1.5x Ogre\\'s Strength in damage and stunning the target. Its m...",
      "manaCost": "400",
      "cooldown": "7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ogre_magi_unrefined_fireblast.png"
    },
    {
      "name": "Fire Shield",
      "key": "R",
      "description": "Creates a shield around the target ally, absorbing a percentage of the damage of next 3 attacks from enemy heroes. Wh...",
      "manaCost": "50",
      "cooldown": "15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ogre_magi_smash.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+10 Ignite Burn Damage",
      "right": "+2/0.01 Dumb Luck Mana/Mana Regen Per Stre...",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+80 Damage",
      "right": "+20/35 Bloodlust / Self Attack Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+30 Strength",
      "right": "+175 Fireblast Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "special_bonus_unique_ogre_magi_3",
      "right": "+10% Multicast Chance",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "undying",
  "name": "Undying",
  "aliases": [
    "dirge"
  ],
  "title": "The Undying",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 50.1,
  "pickRate": 17.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/undying.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/undying.png",
  "summary": "How long has it been since he lost his name? The torn ruin of his mind no longer knows. Dimly he recalls armor and banners and grim-faced kin riding at his side.",
  "abilities": [
    {
      "name": "Decay",
      "key": "Q",
      "description": "Undying steals strength from all enemy heroes in an area, dealing base damage as he claims the enemy\\'s strength for h...",
      "manaCost": "100",
      "cooldown": "13/10/7/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/undying_decay.png"
    },
    {
      "name": "Soul Rip",
      "key": "W",
      "description": "Undying rips health away from all nearby units and uses it to heal an ally, or damage an enemy. Soul Rip can also be ...",
      "manaCost": "80/90/100/110",
      "cooldown": "15/12/9/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/undying_soul_rip.png"
    },
    {
      "name": "Tombstone",
      "key": "E",
      "description": "Summons a tombstone at the target point. Zombies will frequently spawn next to every enemy unit in the area around th...",
      "manaCost": "125/150/175/200",
      "cooldown": "80",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/undying_tombstone.png"
    },
    {
      "name": "Ceaseless Dirge",
      "key": "D",
      "description": "Ceaseless Dirge tactical ability",
      "cooldown": "480",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/undying_ceaseless_dirge.png"
    },
    {
      "name": "Flesh Golem",
      "key": "R",
      "description": "Undying transforms into a horrifying flesh golem. While in this state, he gains a percentage increase to strength, bo...",
      "manaCost": "100/125/150",
      "cooldown": "140",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/undying_flesh_golem.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+30 Decay Damage",
      "right": "-15s Tombstone Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+12 Soul Rip Damage/Heal",
      "right": "+20 Zombie Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-2s Decay Cooldown",
      "right": "+4 Tombstone Attacks to Destroy",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+50% Flesh Golem Strength Bonus",
      "right": "Tombstone On Death",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "rubick",
  "name": "Rubick",
  "aliases": [
    "rubick",
    "rubick"
  ],
  "title": "The Rubick",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Soft Support"
  ],
  "complexity": 3,
  "winRate": 49.8,
  "pickRate": 24,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/rubick.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/rubick.png",
  "summary": "Any mage can cast a spell or two, and a few may even study long enough to become a wizard, but only the most talented are allowed to be recognized as a Magus. Yet as with any so...",
  "abilities": [
    {
      "name": "Telekinesis",
      "key": "Q",
      "description": "Rubick uses his telekinetic powers to lift the enemy into the air briefly and then hurls them back at the ground. The...",
      "manaCost": "110",
      "cooldown": "22/19/16/13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rubick_telekinesis.png"
    },
    {
      "name": "Fade Bolt",
      "key": "W",
      "description": "Rubick creates a powerful stream of arcane energy that travels between enemy units, dealing damage and reducing their...",
      "manaCost": "110/125/140/155",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rubick_fade_bolt.png"
    },
    {
      "name": "Arcane Supremacy",
      "key": "E",
      "description": "Rubick\\'s mastery of the arcane allows him to have a larger cast range and bonus spell amplification.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rubick_arcane_supremacy.png"
    },
    {
      "name": "Stolen Spell",
      "key": "D",
      "description": "Spells acquired with Spell Steal will replace this slot.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rubick_empty1.png"
    },
    {
      "name": "Stolen Spell",
      "key": "R",
      "description": "Spells acquired with Spell Steal will replace this slot.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/rubick_empty2.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-2s Telekinesis Cooldown",
      "right": "+200 Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-40% Stolen Spells Mana Cost",
      "right": "-4s Fade Bolt Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+12% Fade Bolt Damage Reduction",
      "right": "Telekinesis Landing Deals 300 Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "1.5x Curiosity Bonuses",
      "right": "+40% Spell Amp For Stolen Spells",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "disruptor",
  "name": "Disruptor",
  "aliases": [
    "thrall"
  ],
  "title": "The Disruptor",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 2,
  "winRate": 50.3,
  "pickRate": 9.5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/disruptor.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/disruptor.png",
  "summary": "High on the wind-ravaged steppes of Druud, a gifted young stormcrafter called Disruptor was the first to unlock the secrets of the summer squalls. Constantly under assault from ...",
  "abilities": [
    {
      "name": "Thunder Strike",
      "key": "Q",
      "description": "Repeatedly strikes the targeted unit with lightning. Each strike damages nearby enemy units in a small radius and slo...",
      "manaCost": "115/120/125/130",
      "cooldown": "18/15/12/9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/disruptor_thunder_strike.png"
    },
    {
      "name": "Glimpse",
      "key": "W",
      "description": "Teleports the target hero back to where it was 4 seconds ago. Instantly kills illusions. Deals damage equal to a perc...",
      "manaCost": "70/85/100/115",
      "cooldown": "24/22/20/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/disruptor_glimpse.png"
    },
    {
      "name": "Kinetic Field",
      "key": "E",
      "description": "After a short formation time, creates a circular barrier of kinetic energy that enemies can\\'t pass.",
      "manaCost": "70",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/disruptor_kinetic_field.png"
    },
    {
      "name": "Kinetic Fence",
      "key": "D",
      "description": "After a short formation time, creates a wall out of kinetic energy that enemies cannot pass.",
      "manaCost": "70",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/disruptor_kinetic_fence.png"
    },
    {
      "name": "Electromagnetic Repulsion",
      "key": "R",
      "description": "Whenever Disruptor takes more than 250 damage from any source within 400 radius, all nearby enemies within take damag...",
      "cooldown": "5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/disruptor_electromagnetic_repulsion.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+20 Movement Speed",
      "right": "+15 Thunder Strike Damage per Strike",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+15%/300 Glimpse Distance To Damage/Max",
      "right": "+60 Static Storm Max DPS",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+1s Kinetic Field Duration",
      "right": "+75 Static Storm Radius",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "2 Glimpse Charges",
      "right": "+6 Thunder Strike Strikes",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "nyx_assassin",
  "name": "Nyx Assassin",
  "aliases": [
    "nyx",
    "nerubian assassin"
  ],
  "title": "The Nyx Assassin",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 52.5,
  "pickRate": 7.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/nyx_assassin.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/nyx_assassin.png",
  "summary": "Deep in the Archive of Ultimyr, shelved between scholarly treatises on dragon cladistics and books of untranslatable spells, there is an ancient tome of entomological curiositie...",
  "abilities": [
    {
      "name": "Impale",
      "key": "Q",
      "description": "Rock spikes burst from the earth along a straight path. Enemy units take damage, then are hurled into the air and stu...",
      "manaCost": "90/100/110/120",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nyx_assassin_impale.png"
    },
    {
      "name": "Mind Flare",
      "key": "W",
      "description": "Deals damage equal to a percentage of the target\\'s Max Mana and burns part of it away. Deals additional damage equal ...",
      "manaCost": "100/105/110/115",
      "cooldown": "11/9.5/8/6.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nyx_assassin_jolt.png"
    },
    {
      "name": "Spiked Carapace",
      "key": "E",
      "description": "When activated while above ground, Spiked Carapace reflects and negates damage dealt to Nyx Assassin (max once from e...",
      "manaCost": "40",
      "cooldown": "20/16/12/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nyx_assassin_spiked_carapace.png"
    },
    {
      "name": "Burrow",
      "key": "D",
      "description": "Nyx Assassin buries himself beneath the battlefield over a short duration. Once burrowed, Spiked Carapace instantly s...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nyx_assassin_burrow.png"
    },
    {
      "name": "Mana Burn",
      "key": "R",
      "description": "Nyx Assassin\\'s damage on enemies also burns mana as a percentage of the damage dealt.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/nyx_assassin_neuro_sting.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25% Spiked Carapace Damage Reflect",
      "right": "+0.2s Impale Stun Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+50 Vendetta Damage",
      "right": "-3s Mind Flare Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.6s Spiked Carapace Stun Duration",
      "right": "+140 Impale Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "600 Mind Flare Radius",
      "right": "+80 Agility",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "naga_siren",
  "name": "Naga Siren",
  "aliases": [
    "naga siren",
    "naga siren"
  ],
  "title": "The Naga Siren",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 49.2,
  "pickRate": 2.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/naga_siren.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/naga_siren.png",
  "summary": "Among the high-sworn of the Slithereen Guard there is a solemn vow oft repeated before battle: No Slithereen may fail. In truth, these words are equal parts oath and enforceable...",
  "abilities": [
    {
      "name": "Mirror Image",
      "key": "Q",
      "description": "Creates multiple images of Naga Siren under her control.  DISPEL TYPE: Basic Dispel",
      "manaCost": "75/90/105/120",
      "cooldown": "40/35/30/25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/naga_siren_mirror_image.png"
    },
    {
      "name": "Ensnare",
      "key": "W",
      "description": "Interrupts the target and traps them in place, preventing movement or blinking. Can target units affected by Song of ...",
      "manaCost": "70/80/90/100",
      "cooldown": "21/18/15/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/naga_siren_ensnare.png"
    },
    {
      "name": "Rip Tide",
      "key": "E",
      "description": "Naga Siren and her illusions deal bonus damage to enemies and reduce their armor for 4 seconds every 6 attacks.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/naga_siren_rip_tide.png"
    },
    {
      "name": "Reel In",
      "key": "D",
      "description": "CHANNELED - Naga Siren channels for up to 5 seconds, pulling all units affected by Naga\\'s Ensnare in a 1600 range tow...",
      "manaCost": "0",
      "cooldown": "8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/naga_siren_reel_in.png"
    },
    {
      "name": "Eelskin",
      "key": "R",
      "description": "Naga Siren has bonus evasion, increased per every other Naga Siren within 900 radius.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/naga_siren_eelskin.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+125 Reel In Pull Speed",
      "right": "+30% Rip Tide Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+10% Mirror Image Damage",
      "right": "-75% Mirror Image Illusion Damage Taken",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-25s Song of the Siren Cooldown",
      "right": "+1 Mirror Image Illusion",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-10s Mirror Image Cooldown",
      "right": "+25 Agility",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "keeper_of_the_light",
  "name": "Keeper of the Light",
  "aliases": [
    "kotl",
    "ezalor"
  ],
  "title": "The Keeper of the Light",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 49.1,
  "pickRate": 7.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/keeper_of_the_light.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/keeper_of_the_light.png",
  "summary": "Upon a pale horse he rides, this spark of endless suns, this Keeper of the Light. Ezalor long ago escaped the Fundamental plane, separating from the other ancient forces to whic...",
  "abilities": [
    {
      "name": "Illuminate",
      "key": "Q",
      "description": "CHANNELED - Channels light energy, building power the longer it\\'s channeled. Once released, a wave is sent forth that...",
      "manaCost": "100/125/150/175",
      "cooldown": "13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/keeper_of_the_light_illuminate.png"
    },
    {
      "name": "Blinding Light",
      "key": "W",
      "description": "A blinding light flashes over the targeted area, knocking back units to the edge of the area and blinding them, causi...",
      "manaCost": "120/130/140/150",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/keeper_of_the_light_blinding_light.png"
    },
    {
      "name": "Chakra Magic",
      "key": "E",
      "description": "Restores mana to the target unit and reduces cooldowns of all basic abilities currently on cooldown by a fixed amount...",
      "manaCost": "0",
      "cooldown": "19/16/13/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/keeper_of_the_light_chakra_magic.png"
    },
    {
      "name": "Solar Bind",
      "key": "D",
      "description": "Weakens an enemy\\'s magical resistance, and applies a slow that increases in strength the more the target moves.",
      "manaCost": "120",
      "cooldown": "14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/keeper_of_the_light_radiant_bind.png"
    },
    {
      "name": "Will-O-Wisp",
      "key": "R",
      "description": "Summons Ignis Fatuus at the targeted area. Alternates on and off, drawing enemies closer with its mesmerising flicker.",
      "manaCost": "150",
      "cooldown": "60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/keeper_of_the_light_will_o_wisp.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+40% Blinding Light Miss",
      "right": "-2s Illuminate Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25% Spirit Form Bright Speed Bonus",
      "right": "+90 Blinding Light Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+15s Spirit Form Duration",
      "right": "+10% Solar Bind Magic Resistance Reduction",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Chakra Magic Strong Dispels",
      "right": "+200 Illuminate Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "io",
  "name": "Io",
  "aliases": [
    "wisp"
  ],
  "title": "The Io",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 3,
  "winRate": 48.6,
  "pickRate": 5.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/wisp.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/wisp.png",
  "summary": "Io is everywhere, and in all things. Denounced by enemies as the great unmaker, worshiped by scholars as the twinkling of a divine eye, this strange Wisp of life-force occupies ...",
  "abilities": [
    {
      "name": "Tether",
      "key": "Q",
      "description": "Tethers Io to an allied unit, granting bonus movement speed to both. When Io restores health or mana, the tethered un...",
      "manaCost": "40",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/wisp_tether.png"
    },
    {
      "name": "Spirits",
      "key": "W",
      "description": "Summon five particle spirits that dance in a circle around Io. If a particle collides with an enemy hero, it explodes...",
      "manaCost": "90/100/110/120",
      "cooldown": "15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/wisp_spirits.png"
    },
    {
      "name": "Overcharge",
      "key": "E",
      "description": "Io gains attack speed, spell amplification, and health regeneration based on max health. If Io is Tethered to an ally...",
      "manaCost": "40/60/80/100",
      "cooldown": "25/22/19/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/wisp_overcharge.png"
    },
    {
      "name": "Spirits In",
      "key": "D",
      "description": "Sends the spirits closer to you. Can be toggled on and off.",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/wisp_spirits_in.png"
    },
    {
      "name": "Spirits Out",
      "key": "R",
      "description": "Sends the spirits farther away from you. Can be toggled on and off.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/wisp_spirits_out.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5s Overcharge Duration",
      "right": "+8 Strength",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+5% Tether Movement Speed",
      "right": "+50% Spirits Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.2% Overcharge Max HP Regen Bonus",
      "right": "-30s Relocate Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-2.0s Relocate Cast Delay",
      "right": "Attack Tethered Ally\\'s Target (=50% damage)",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "visage",
  "name": "Visage",
  "aliases": [
    "necrolic"
  ],
  "title": "The Visage",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Offlane",
    "Hard Support"
  ],
  "complexity": 3,
  "winRate": 50.9,
  "pickRate": 2.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/visage.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/visage.png",
  "summary": "Perched atop the entrance to the Narrow Maze sit the looming shapes of sneering gargoyles, the paths into the hereafter forever in their gaze. Beasts and birds, men and monsters...",
  "abilities": [
    {
      "name": "Grave Chill",
      "key": "Q",
      "description": "Visage drains the movement and attack speed of the targeted unit, gaining the drained speed for itself and nearby Fam...",
      "manaCost": "75",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/visage_grave_chill.png"
    },
    {
      "name": "Soul Assumption",
      "key": "W",
      "description": "Visage gathers charges of soul essence each time nearby heroes take more than 100 damage. When the essence is release...",
      "manaCost": "110",
      "cooldown": "4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/visage_soul_assumption.png"
    },
    {
      "name": "Gravekeeper\\'s Cloak",
      "key": "E",
      "description": "Visage generates a layered barrier that protects him from damage. If he receives damage from a player, one layer is r...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/visage_gravekeepers_cloak.png"
    },
    {
      "name": "Stone Form",
      "key": "D",
      "description": "Orders the Familiar closest to Visage to cast Stone Form in its current location, turning into stone and smashing int...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/visage_stone_form_self_cast.png"
    },
    {
      "name": "Silent as the Grave",
      "key": "R",
      "description": "Visage gains flying movement and bonus movement speed. Upon attacking or casting, the speed and flying movement are l...",
      "manaCost": "50",
      "cooldown": "45.75",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/visage_silent_as_the_grave.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-1s Soul Assumption Cooldown",
      "right": "+6 Visage and Familiars Base Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+2s Grave Chill Duration",
      "right": "Soul Assumption Hits =3 Targets",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+30 Soul Assumption Damage Per Charge",
      "right": "+1 Armor Corruption to Visage and Familiars",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-2s Gravekeeper\\'s Cloak Recovery Time",
      "right": "+1 Familiar",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "slark",
  "name": "Slark",
  "aliases": [
    "murloc"
  ],
  "title": "The Slark",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 2,
  "winRate": 50.4,
  "pickRate": 13,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/slark.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/slark.png",
  "summary": "Little known to the inhabitants of the dry world, Dark Reef is a sunken prison where the worst of the sea-bred are sent for crimes against their fellows. It is a razor barbed wa...",
  "abilities": [
    {
      "name": "Dark Pact",
      "key": "Q",
      "description": "After a short delay, Slark sacrifices some of his life blood, purging most negative debuffs and dealing damage to ene...",
      "manaCost": "65",
      "cooldown": "9/8/7/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slark_dark_pact.png"
    },
    {
      "name": "Pounce",
      "key": "W",
      "description": "Slark leaps forward, leashing and applying Essence Shift stacks to the first hero he connects. That unit can only mov...",
      "manaCost": "75",
      "cooldown": "24/20/16/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slark_pounce.png"
    },
    {
      "name": "Saltwater Shiv",
      "key": "E",
      "description": "Slark slices the target with his salty shiv, stealing a portion of the target\\'s movement speed, Health Regen and Heal...",
      "manaCost": "25/30/35/40",
      "cooldown": "12/10.5/9/7.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slark_saltwater_shiv.png"
    },
    {
      "name": "Depth Shroud",
      "key": "D",
      "description": "Creates a cloud at the target location. All allies inside the radius are hidden and affected by Shadow Dance.",
      "manaCost": "75",
      "cooldown": "75",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slark_depth_shroud.png"
    },
    {
      "name": "Essence Shift",
      "key": "R",
      "description": "Slark steals the life essence of enemy heroes with his attacks, draining 1 of each of their attributes and converting...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/slark_essence_shift.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-0.75s Dark Pact Cooldown",
      "right": "+0.5s Pounce Leash",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+70 Dark Pact Damage",
      "right": "+30 Shadow Dance Regen",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+1 Agility gain/stolen per Essence Shift S...",
      "right": "+100 Shadow Dance Attack Speed",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.5s Shadow Dance Duration",
      "right": "+20s Essence Shift Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "medusa",
  "name": "Medusa",
  "aliases": [
    "medusa",
    "medusa"
  ],
  "title": "The Medusa",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry"
  ],
  "complexity": 1,
  "winRate": 49.6,
  "pickRate": 3.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/medusa.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/medusa.png",
  "summary": "Beauty is power. This thought comforted Medusa--the youngest and loveliest of three beautiful Gorgon sisters, born to a sea goddess--because she alone of the sisters was mortal.",
  "abilities": [
    {
      "name": "Split Shot",
      "key": "Q",
      "description": "Medusa magically splits her shot into several arrows. These arrows deal a lower percent of her normal damage.The extr...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/medusa_split_shot.png"
    },
    {
      "name": "Mystic Snake",
      "key": "W",
      "description": "A mystic snake made of energy jumps from target to target dealing damage. Damage and speed increases with each jump. ...",
      "manaCost": "80/100/120/140",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/medusa_mystic_snake.png"
    },
    {
      "name": "Gorgon\\'s Grasp",
      "key": "E",
      "description": "Medusa fires arrows in a line that land in 3 groups, with each grouping larger than the previous. Enemies struck by a...",
      "manaCost": "65/85/105/125",
      "cooldown": "30/26/22/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/medusa_gorgon_grasp.png"
    },
    {
      "name": "Cold Blooded",
      "key": "D",
      "description": "When Medusa is targeted with a spell, a single-target Mystic Snake is sent back towards the enemy that turns them int...",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/medusa_cold_blooded.png"
    },
    {
      "name": "Mana Shield",
      "key": "R",
      "description": "Creates a shield that absorbs 98% of incoming damage in exchange for Medusa\\'s mana. Illusions absorb 60% less damage ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/medusa_mana_shield.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+20% Gorgon\\'s Grasp Radius",
      "right": "+12% Stone Gaze Bonus Physical Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+1 Gorgon\\'s Grasp Volley",
      "right": "-4s Mystic Snake Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+40% Mystic Snake Damage / Mana Gain",
      "right": "+12% Split Shot Outgoing Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+2.5s Stone Gaze Duration",
      "right": "+40 Intelligence",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "troll_warlord",
  "name": "Troll Warlord",
  "aliases": [
    "troll",
    "jahrakal"
  ],
  "title": "The Troll Warlord",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Carry"
  ],
  "complexity": 2,
  "winRate": 52,
  "pickRate": 3.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/troll_warlord.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/troll_warlord.png",
  "summary": "It\\'s an easy thing to offend a troll. A prickly and contentious race, trolls thrive on argument and strife, missing no excuse to raise their voices in dispute.",
  "abilities": [
    {
      "name": "Battle Stance",
      "key": "Q",
      "description": "Troll Warlord swaps from using ranged to melee attacks. While melee, Troll Warlord\\'s base attack time is improved to ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/troll_warlord_switch_stance.png"
    },
    {
      "name": "Whirling Axes (Ranged)",
      "key": "W",
      "description": "Troll hurls a fistful of five axes in a cone shape over 950 range, slowing and damaging enemy units.",
      "cooldown": "9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/troll_warlord_whirling_axes_ranged.png"
    },
    {
      "name": "Whirling Axes (Melee)",
      "key": "E",
      "description": "Troll hurls two axes around him in a close range area of effect, damaging enemy units and causing them to miss some a...",
      "cooldown": "9",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/troll_warlord_whirling_axes_melee.png"
    },
    {
      "name": "Fervor",
      "key": "D",
      "description": "With each continuous blow on the same target, Troll gains increased attack speed. If Troll changes targets, the stack...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/troll_warlord_fervor.png"
    },
    {
      "name": "Berserker\\'s Rage",
      "key": "R",
      "description": "While in melee form, Troll Warlord\\'s attacks have a chance to ensnare, preventing the target from moving or using mob...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/troll_warlord_berserkers_rage.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+2.5s Whirling Axes Debuff Duration",
      "right": "+20 Berserker\\'s Rage Movement Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+4 Fervor Attack Speed",
      "right": "+1s Battle Trance Duration",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Allies Receive Battle Trance Attack Speed",
      "right": "+160 Whirling Axes Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Whirling Axes Pierce Magic Immunity",
      "right": "Battle Trance Strong Dispels",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "centaur_warrunner",
  "name": "Centaur Warrunner",
  "aliases": [
    "centaur",
    "bradwarden"
  ],
  "title": "The Centaur Warrunner",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 49.9,
  "pickRate": 9.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/centaur.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/centaur.png",
  "summary": "It\\'s said that a centaur\\'s road is paved with the corpses of the fallen. For the one called Warrunner, it has been a long road indeed.",
  "abilities": [
    {
      "name": "Hoof Stomp",
      "key": "Q",
      "description": "After a brief windup, Centaur Warrunner slams the ground, stunning and damaging nearby enemy units. During the delay,...",
      "manaCost": "100/110/120/130",
      "cooldown": "18/16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/centaur_hoof_stomp.png"
    },
    {
      "name": "Double Edge",
      "key": "W",
      "description": "Centaur strikes a mighty blow at melee range, damaging both himself and a small area around the target. Deals extra d...",
      "manaCost": "0",
      "cooldown": "3.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/centaur_double_edge.png"
    },
    {
      "name": "Retaliate",
      "key": "E",
      "description": "Centaur counters all attacks, dealing damage back to the attacker. Returns a fixed amount plus a percentage of your s...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/centaur_return.png"
    },
    {
      "name": "Work Horse",
      "key": "D",
      "description": "Centaur hitches a cart behind him. While active, Centaur gains the benefit of Stampede for the current level of Stamp...",
      "manaCost": "75",
      "cooldown": "35",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/centaur_work_horse.png"
    },
    {
      "name": "Hitch A Ride",
      "key": "R",
      "description": "Centaur tosses an ally into a cart hitched behind him. While in the cart, the ally is invulnerable and can still cast...",
      "manaCost": "75",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/centaur_mount.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+4 Health Regen",
      "right": "+15 Movement Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+10 Strength",
      "right": "+30% Double Edge Strength Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+45 Retaliate Damage",
      "right": "-25s Stampede Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Gains Retaliate Aura",
      "right": "+1.0s Hoof Stomp Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "magnus",
  "name": "Magnus",
  "aliases": [
    "mag",
    "magnataur"
  ],
  "title": "The Magnus",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 49.2,
  "pickRate": 13.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/magnataur.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/magnataur.png",
  "summary": "The master-smiths of Mt. Joerlak agree on only a single point: that the horn of a magnoceros is more precious than any alloy.",
  "abilities": [
    {
      "name": "Shockwave",
      "key": "Q",
      "description": "Magnus sends out a wave of force, damaging enemy units in a line, pulling them towards him, and slowing them for a br...",
      "manaCost": "85/90/95/100",
      "cooldown": "13/12/11/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/magnataur_shockwave.png"
    },
    {
      "name": "Empower",
      "key": "W",
      "description": "When cast on an ally, grants them bonus damage and cleave on attack.    Empower is always on Magnus with 30% larger b...",
      "manaCost": "45/55/65/75",
      "cooldown": "8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/magnataur_empower.png"
    },
    {
      "name": "Skewer",
      "key": "E",
      "description": "Magnus rushes forward, goring enemy units on his massive tusk. Heroes hit on the way will be dragged to the destinati...",
      "manaCost": "80",
      "cooldown": "22/20/18/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/magnataur_skewer.png"
    },
    {
      "name": "Horn Toss",
      "key": "D",
      "description": "Magnus tosses any enemies in front of him, launching them to his rear. Enemies take damage, spend 0.6 seconds in the ...",
      "manaCost": "100",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/magnataur_horn_toss.png"
    },
    {
      "name": "Solid Core",
      "key": "R",
      "description": "Magnus has increased slow resistance and suffers less knockback from enemy\\'s abilities and items.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/magnataur_solid_core.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5 Mana Regen",
      "right": "+1.25s Skewer Slow Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+14 All Attributes per hero hit with Rever...",
      "right": "-5s Skewer Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+125 Shockwave Damage",
      "right": "+15% Skewer Damage Per Distance Travelled",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Shockwave Returns to Magnus",
      "right": "+0.8s Reverse Polarity Stun Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "timbersaw",
  "name": "Timbersaw",
  "aliases": [
    "timber",
    "rizzrack"
  ],
  "title": "The Timbersaw",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 45.7,
  "pickRate": 5.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shredder.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shredder.png",
  "summary": "Rizzrack could still hear the screams in his mind. He worked, frantically turning wrenches, twisting screws, building and carving and forging.",
  "abilities": [
    {
      "name": "Whirling Death",
      "key": "Q",
      "description": "Timbersaw whirls extremely sharp edges, damaging enemies and destroying trees around him in an area. If an enemy hero...",
      "manaCost": "100",
      "cooldown": "7.5/7/6.5/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shredder_whirling_death.png"
    },
    {
      "name": "Timber Chain",
      "key": "W",
      "description": "Timbersaw fires a chain that embeds itself in the first tree it hits, pulling him towards it. Any enemy in the path t...",
      "manaCost": "60/70/80/90",
      "cooldown": "4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shredder_timber_chain.png"
    },
    {
      "name": "Reactive Armor",
      "key": "E",
      "description": "Each time Timbersaw is attacked, he gains increased health regen and armor. Hero attacks are counted as 4x the amount.",
      "manaCost": "undefined",
      "cooldown": "undefined",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shredder_reactive_armor.png"
    },
    {
      "name": "Flamethrower",
      "key": "D",
      "description": "Releases a flame in the direction Timbersaw is facing. Applies a debuff that deals damage per second and slows enemy ...",
      "manaCost": "100",
      "cooldown": "20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shredder_flamethrower.png"
    },
    {
      "name": "Chakram",
      "key": "R",
      "description": "Fires Timbersaw\\'s main saw blade at the target location where it will spin in place, dealing damage in an area around...",
      "manaCost": "90/120/150",
      "cooldown": "8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/shredder_chakram.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+0.25 Reactive Armor Regeneration Per Stack",
      "right": "+1.5 Mana Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+2% Whirling Death Stat Loss",
      "right": "+6 Max / +1 Hero Attack Reactive Armor Stacks",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Exposure Therapy Heals for 12 HP Per Tree ...",
      "right": "+6% Chakram Slow",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+75 Whirling Death Tree Bonus Damage",
      "right": "+75% Timber Chain Range/Projectile Speed",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "bristleback",
  "name": "Bristleback",
  "aliases": [
    "bb",
    "rigwarl"
  ],
  "title": "The Bristleback",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Carry"
  ],
  "complexity": 1,
  "winRate": 49.1,
  "pickRate": 8.9,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bristleback.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bristleback.png",
  "summary": "Never one to turn his back on a fight, Rigwarl was known for battling the biggest, meanest scrappers he could get his hands on. Christened Bristleback by the drunken crowds, he ...",
  "abilities": [
    {
      "name": "Viscous Nasal Goo",
      "key": "Q",
      "description": "Covers a target in snot, causing it to have reduced armor and movement speed for 5 seconds. Multiple casts stack and ...",
      "manaCost": "12/16/20/24",
      "cooldown": "1.75",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bristleback_viscous_nasal_goo.png"
    },
    {
      "name": "Quill Spray",
      "key": "W",
      "description": "Sprays enemy units with quills dealing damage in an area of effect around Bristleback. Deals bonus damage for every t...",
      "manaCost": "35",
      "cooldown": "3",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bristleback_quill_spray.png"
    },
    {
      "name": "Bristleback",
      "key": "E",
      "description": "Bristleback takes less damage if hit on the sides or rear. If Bristleback takes enough damage from the rear, he relea...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bristleback_bristleback.png"
    },
    {
      "name": "Hairball",
      "key": "D",
      "description": "Coughs a quill-packed hairball towards the target location. Erupts at the location, hitting enemies with Viscous Nasa...",
      "manaCost": "60",
      "cooldown": "15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bristleback_hairball.png"
    },
    {
      "name": "Warpath",
      "key": "R",
      "description": "Bristleback works himself up into a fury every time he casts a spell, increasing his movement speed and damage.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/bristleback_warpath.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25 Attack Speed",
      "right": "+1.5 Mana Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+250 Goo Cast Range",
      "right": "+8%/4% Bristleback Back/Side Damage Reduction",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+25 Health Regen",
      "right": "+20 Quill Stack Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-30 Bristleback Damage Threshold",
      "right": "+{s:bonus_damage_per_stack} Warpath Damage...",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "tusk",
  "name": "Tusk",
  "aliases": [
    "ymir"
  ],
  "title": "The Tusk",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 48,
  "pickRate": 7.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tusk.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/tusk.png",
  "summary": "It had been a brawl to remember. There stood Ymir, the Tusk, the Terror from the Barrier, the Snowball from Cobalt, the only fighter to have bested the Bristled Bruiser in a fai...",
  "abilities": [
    {
      "name": "Ice Shards",
      "key": "Q",
      "description": "Tusk compresses shards of ice into a ball of frozen energy that damages all enemies it comes in contact with. When th...",
      "manaCost": "100",
      "cooldown": "23/20/17/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tusk_ice_shards.png"
    },
    {
      "name": "Snowball",
      "key": "W",
      "description": "Tusk begins rolling into a snowball. Allies within a 325 radius can also be added to the snowball by right-clicking o...",
      "manaCost": "75",
      "cooldown": "21/19/17/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tusk_snowball.png"
    },
    {
      "name": "Tag Team",
      "key": "E",
      "description": "Activate to temporarily apply a negative debuff aura around you, causing enemies that are attacked under it to take b...",
      "manaCost": "70",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tusk_tag_team.png"
    },
    {
      "name": "Drinking Buddies",
      "key": "D",
      "description": "Tusk reaches out to tag an allied unit, pulling them closer. Once tagged, both Tusk and his tagged ally gain movement...",
      "manaCost": "80",
      "cooldown": "14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tusk_drinking_buddies.png"
    },
    {
      "name": "Walrus Kick",
      "key": "R",
      "description": "Kicks the closest enemy unit in the drawn direction, stunning, damaging, and slowing them. Also deals damage to all h...",
      "manaCost": "100",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/tusk_walrus_kick.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+2s Tag Team Duration",
      "right": "+0.75s Walrus Punch Stun Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+325 Health",
      "right": "+120 Snowball Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-6s Snowball Cooldown",
      "right": "+75% Walrus Punch Crit",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Ice Shards slow by 50% and deal 110 DPS",
      "right": "12% Chance Walrus Punch",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "skywrath_mage",
  "name": "Skywrath Mage",
  "aliases": [
    "sky",
    "dragonus"
  ],
  "title": "The Skywrath Mage",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Soft Support",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 50.2,
  "pickRate": 14.5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/skywrath_mage.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/skywrath_mage.png",
  "summary": "A highly placed mage in the court of the Ghastly Eyrie, Dragonus lives a troubled existence. Sworn by birth to protect whoever sits within the Nest of Thorns, he hates the curre...",
  "abilities": [
    {
      "name": "Arcane Bolt",
      "key": "Q",
      "description": "Skywrath Mage launches a slow-moving bolt of arcane magic, dealing damage to an enemy unit based on Skywrath Mage\\'s i...",
      "manaCost": "70",
      "cooldown": "5/4/3/2",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skywrath_mage_arcane_bolt.png"
    },
    {
      "name": "Concussive Shot",
      "key": "W",
      "description": "Skywrath Mage sets off a long range shot that hits the closest hero within a long range. Upon impact, it deals damage...",
      "manaCost": "80/85/90/95",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skywrath_mage_concussive_shot.png"
    },
    {
      "name": "Ancient Seal",
      "key": "E",
      "description": "Skywrath Mage seals the targeted unit with an ancient rune, silencing it and causing it to take additional damage fro...",
      "manaCost": "80/90/100/110",
      "cooldown": "14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skywrath_mage_ancient_seal.png"
    },
    {
      "name": "Shield of the Scion",
      "key": "D",
      "description": "Every time Skywrath Mage deals magical damage to an enemy hero with his abilities, he gains a small magic damage barr...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skywrath_mage_shield_of_the_scion.png"
    },
    {
      "name": "Mystic Flare",
      "key": "R",
      "description": "Skywrath Mage uses his ultimate magical ability to conjure a precise and violent mystical field that lays waste to hi...",
      "manaCost": "300/550/800",
      "cooldown": "55/35/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/skywrath_mage_mystic_flare.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5 Mana Regen",
      "right": "+125 Arcane Bolt Cast Range",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-6s Ancient Seal Cooldown",
      "right": "+20% Concussive Shot Slow",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Global Concussive Shot",
      "right": "+10% Ancient Seal Increased Magic Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.5x Arcane Bolt Int Multiplier",
      "right": "+400 Mystic Flare Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "abaddon",
  "name": "Abaddon",
  "aliases": [
    "abaddon",
    "abaddon"
  ],
  "title": "The Abaddon",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Hard Support"
  ],
  "complexity": 1,
  "winRate": 51.3,
  "pickRate": 4.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/abaddon.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/abaddon.png",
  "summary": "The Font of Avernus is the source of a family\\'s strength, a crack in primal stones from which vapors of prophetic power have issued for generations. Each newborn of the cavernou...",
  "abilities": [
    {
      "name": "Mist Coil",
      "key": "Q",
      "description": "Abaddon releases a coil of deathly mist that can damage an enemy unit or heal a friendly unit at the cost of some of ...",
      "manaCost": "50/55/60/65",
      "cooldown": "8/7/6/5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_death_coil.png"
    },
    {
      "name": "Aphotic Shield",
      "key": "W",
      "description": "Summons dark energies around an ally unit, dispelling them and creating an all damage barrier that absorbs a set amou...",
      "manaCost": "110/120/130/140",
      "cooldown": "12/10/8/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_aphotic_shield.png"
    },
    {
      "name": "Curse of Avernus",
      "key": "E",
      "description": "Abaddon strikes an enemy, affecting them by a chilling curse, slowing them, causing them to take damage over time, an...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_frostmourne.png"
    },
    {
      "name": "Withering Mist",
      "key": "D",
      "description": "Damaging enemies applies the Withering Mist debuff for 5s. Affected enemies have their Health Restoration reduced by ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_withering_mist.png"
    },
    {
      "name": "Borrowed Time",
      "key": "R",
      "description": "When activated, dispels you and all damage dealt to you will heal instead of harm. If the ability is not on cooldown,...",
      "manaCost": "0",
      "cooldown": "85/75/65",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_borrowed_time.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+30 Curse of Avernus DPS",
      "right": "Aphotic Shield provides +8 HP Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-10s Borrowed Time Cooldown",
      "right": "+35 Mist Coil Damage / Heal",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+80 Aphotic Shield Barrier Amount",
      "right": "100 Borrowed Time Immolation DPS",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+65 Curse of Avernus Attack Speed Bonus",
      "right": "350 AoE Mist Coil",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "elder_titan",
  "name": "Elder Titan",
  "aliases": [
    "et",
    "tauren chieftain"
  ],
  "title": "The Elder Titan",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 50,
  "pickRate": 1.4,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/elder_titan.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/elder_titan.png",
  "summary": "Well may you ask, \\'How did this world take its form?\\' Why of all the worlds in creation, has this one its strange properties, its diverse and motley collection of creatures, cul...",
  "abilities": [
    {
      "name": "Echo Stomp",
      "key": "Q",
      "description": "CHANNELED - Elder Titan and his Astral Spirit both stomp the ground, damaging and knocking nearby enemy units unconsc...",
      "manaCost": "100",
      "cooldown": "14/13/12/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/elder_titan_echo_stomp.png"
    },
    {
      "name": "Astral Spirit",
      "key": "W",
      "description": "Elder Titan sends forth his Astral Spirit, damaging any units it passes through. When the spirit rejoins the Titan, i...",
      "manaCost": "80/90/100/110",
      "cooldown": "23/21/19/17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/elder_titan_ancestral_spirit.png"
    },
    {
      "name": "Natural Order",
      "key": "E",
      "description": "Reduces all elements to their basic levels, removing base armor and magic damage resistance from nearby enemy units. ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/elder_titan_natural_order.png"
    },
    {
      "name": "Move Astral Spirit",
      "key": "D",
      "description": "Moves the Astral Spirit to target location.",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/elder_titan_move_spirit.png"
    },
    {
      "name": "Momentum",
      "key": "R",
      "description": "Elder Titan gains armor equal to a percentage of his bonus movement speed.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/elder_titan_momentum.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+2.5% Astral Spirit Bonus Move Speed Per Hero",
      "right": "+150 Echo Stomp Wake Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+75 Echo Stomp Damage",
      "right": "20% of Bonus Movement Speed as Attack Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+30 Astral Spirit Bonus Damage per Hero",
      "right": "+150 Natural Order Radius",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-60s Earth Splitter Cooldown",
      "right": "+100% Cleave",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "techies",
  "name": "Techies",
  "aliases": [
    "squee",
    "spleen",
    "spoon"
  ],
  "title": "The Techies",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 50.8,
  "pickRate": 14.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/techies.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/techies.png",
  "summary": "In the storied saga of Dredger\\'s Bight, no business has ever been more reviled than Techies Demolitions. Then again, Dredger\\'s Bight no longer exists.",
  "abilities": [
    {
      "name": "Sticky Bomb",
      "key": "Q",
      "description": "Lobs a Sticky Bomb towards the target area. If it lands next to an enemy hero, the bomb will stick to it, slowing its...",
      "manaCost": "100/115/130/145",
      "cooldown": "16/13/10/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/techies_sticky_bomb.png"
    },
    {
      "name": "Reactive Tazer",
      "key": "W",
      "description": "Techies trigger an electric charge on the target ally, giving them bonus movement speed for a short period of time. E...",
      "manaCost": "60",
      "cooldown": "26/22/18/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/techies_reactive_tazer.png"
    },
    {
      "name": "Blast Off!",
      "key": "E",
      "description": "Techies hurtle themselves into the enemy\\'s midst, detonating charges upon impact which deal massive area of effect da...",
      "manaCost": "100/125/150/175",
      "cooldown": "40/35/30/25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/techies_suicide.png"
    },
    {
      "name": "M.A.D.",
      "key": "D",
      "description": "Techies gain a percentage of their mana pool as bonus mana regeneration.  When Techies die, they leave behind a barre...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/techies_mutually_assured_destruction.png"
    },
    {
      "name": "Minefield Sign",
      "key": "R",
      "description": "Plant a warning sign, causing Proximity Mines within its radius to be invulnerable and deal 15% more damage. Only one...",
      "manaCost": "0",
      "cooldown": "60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/techies_minefield_sign.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+20% Magic Resistance",
      "right": "-2s Proximity Mines Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+175 Blast Off! Damage",
      "right": "+25% Reactive Tazer Buff and Disarm Duration",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+160 Sticky Bomb Damage",
      "right": "-15s Blast Off! Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+253 Damage",
      "right": "-0.8s Proximity Mines Activation Delay",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "ember_spirit",
  "name": "Ember Spirit",
  "aliases": [
    "xin"
  ],
  "title": "The Ember Spirit",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Mid",
    "Carry"
  ],
  "complexity": 2,
  "winRate": 49.5,
  "pickRate": 9.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ember_spirit.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ember_spirit.png",
  "summary": "Lost within the Wailing Mountains, the Fortress of Flares lay abandoned, its training halls empty, its courtyard covered in leaves and dust. Upon a dais in its sealed temple res...",
  "abilities": [
    {
      "name": "Searing Chains",
      "key": "Q",
      "description": "Ember Spirit unleashes fiery bolas that wrap around nearby enemies, anchoring them in place and dealing damage each s...",
      "manaCost": "80/90/100/110",
      "cooldown": "13/12/11/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ember_spirit_searing_chains.png"
    },
    {
      "name": "Sleight of Fist",
      "key": "W",
      "description": "Ember Spirit dashes around with blazing speed, attacking all enemies in the targeted area of effect, then returning t...",
      "manaCost": "75",
      "cooldown": "13/11/9/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ember_spirit_sleight_of_fist.png"
    },
    {
      "name": "Flame Guard",
      "key": "E",
      "description": "Ember Spirit surrounds himself with a ring of fire that consumes incoming magic damage, absorbing a percentage of the...",
      "manaCost": "65/80/95/110",
      "cooldown": "32",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ember_spirit_flame_guard.png"
    },
    {
      "name": "Activate Fire Remnant",
      "key": "D",
      "description": "Select the Fire Remnant to arrive at.",
      "manaCost": "100/125/150",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ember_spirit_activate_fire_remnant.png"
    },
    {
      "name": "Immolation",
      "key": "R",
      "description": "Ember Spirit is continuously burning, dealing damage per second to all nearby enemies at all times.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ember_spirit_immolation.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+12 Damage",
      "right": "+165 Flame Guard Barrier Amount",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+100% Flame Guard Damage Per Second",
      "right": "+0.8s Searing Chains Duration",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+50 Sleight of Fist Hero Damage",
      "right": "+50 Searing Chains Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "=2 Sleight of Fist Charges",
      "right": "-12s Remnant Charge Restore Time",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "earth_spirit",
  "name": "Earth Spirit",
  "aliases": [
    "kaolin"
  ],
  "title": "The Earth Spirit",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Mid"
  ],
  "complexity": 3,
  "winRate": 49.3,
  "pickRate": 7.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/earth_spirit.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/earth_spirit.png",
  "summary": "Deep amid the Upland crags and cliffs there runs a seam of sacred jade long foresworn by highland miners. From this rare material, the likeness of the great general Kaolin was c...",
  "abilities": [
    {
      "name": "Boulder Smash",
      "key": "Q",
      "description": "Earth Spirit smashes the target enemy or ally, sending them in the direction he is facing. If Earth Spirit targets an...",
      "manaCost": "100",
      "cooldown": "20/17/14/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earth_spirit_boulder_smash.png"
    },
    {
      "name": "Rolling Boulder",
      "key": "W",
      "description": "Earth Spirit gathers himself into a boulder and, after a 0.6s delay, rolls toward the target location, dealing 60 + 1...",
      "manaCost": "50",
      "cooldown": "16/12/8/4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earth_spirit_rolling_boulder.png"
    },
    {
      "name": "Geomagnetic Grip",
      "key": "E",
      "description": "Earth Spirit pulls the target Stone Remnant or Allied Unit. Enemies struck by the gripped target will be silenced.  P...",
      "manaCost": "75",
      "cooldown": "13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earth_spirit_geomagnetic_grip.png"
    },
    {
      "name": "Stone Remnant",
      "key": "D",
      "description": "Call a Stone Remnant to the target location. Stone Remnants have no vision and are invulnerable, and can be used with...",
      "manaCost": "0",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earth_spirit_stone_caller.png"
    },
    {
      "name": "Enchant Remnant",
      "key": "R",
      "description": "Earth Spirit temporarily enchants a hero, granting them the properties of a Stone Remnant. After a short duration the...",
      "manaCost": "150",
      "cooldown": "45",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/earth_spirit_petrify.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "-2.0s Boulder Smash Cooldown",
      "right": "+150 Rolling Boulder Distance",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+0.3s Rolling Boulder Stun Duration",
      "right": "+80 Boulder Smash Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+30% Magnetize Damage & Duration",
      "right": "+175% Rolling Boulder Damage from Strength",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Earth Spirit Magnetizes himself",
      "right": "+250 Geomagnetic Grip Remnant Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "underlord",
  "name": "Underlord",
  "aliases": [
    "pit lord",
    "vrogros"
  ],
  "title": "The Underlord",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 49,
  "pickRate": 12,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/abyssal_underlord.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/abyssal_underlord.png",
  "summary": "Neither myth nor song exist to tell of their coming. Deep below the surface of the world lay unknown wonders and horrors.",
  "abilities": [
    {
      "name": "Firestorm",
      "key": "Q",
      "description": "Calls down waves of fire that damage enemy units in the target area, burning for additional damage over time.",
      "manaCost": "110/125/140/155",
      "cooldown": "16/15/14/13",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abyssal_underlord_firestorm.png"
    },
    {
      "name": "Pit of Malice",
      "key": "W",
      "description": "A deadly pit is conjured at the target location; any unit that enters will be damaged and rooted. Each enemy unit wit...",
      "manaCost": "110/120/130/140",
      "cooldown": "30/25/20/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abyssal_underlord_pit_of_malice.png"
    },
    {
      "name": "Atrophy Aura",
      "key": "E",
      "description": "Nearby enemy units are weakened, losing a portion of their base damage. If an enemy dies while under this effect, Und...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abyssal_underlord_atrophy_aura.png"
    },
    {
      "name": "Invading Force",
      "key": "D",
      "description": "After an allied hero Teleports, they temporarily gain Damage Reduction and Movement Speed. Allies receive 2x bonuses ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abyssal_underlord_raid_boss.png"
    },
    {
      "name": "Fiend\\'s Gate",
      "key": "R",
      "description": "Opens 2 portals, one next to Underlord and one in the target location. Heroes can channel a portal for 3.5 seconds to...",
      "manaCost": "175",
      "cooldown": "110/105/100",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abyssal_underlord_dark_portal.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+5% Invading Force Movement Bonus/Damage R...",
      "right": "+15s Atrophy Aura Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "Pit of Malice Slows by 20%",
      "right": "-5s Firestorm Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.6% Firestorm Burn Damage",
      "right": "+10% Atrophy Aura Attack Damage Reduction/...",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+0.4s Pit of Malice Root",
      "right": "160 DPS in 700 Radius Around Fiend\\'s Gate",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "terrorblade",
  "name": "Terrorblade",
  "aliases": [
    "tb"
  ],
  "title": "The Terrorblade",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry"
  ],
  "complexity": 2,
  "winRate": 47.3,
  "pickRate": 6.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/terrorblade.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/terrorblade.png",
  "summary": "Terrorblade is the demon marauder--an outlaw hellion whom even other demons fear. A cosmic iconoclast, he stole from the Demon Lords, ignored the codified rites that should have...",
  "abilities": [
    {
      "name": "Reflection",
      "key": "Q",
      "description": "Terrorblade brings forth an invulnerable dark reflection of all enemy heroes in a target area. Affected enemy heroes ...",
      "manaCost": "60/65/70/75",
      "cooldown": "23/20/17/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/terrorblade_reflection.png"
    },
    {
      "name": "Conjure Image",
      "key": "W",
      "description": "Creates an illusion of Terrorblade that deals damage.",
      "manaCost": "50/60/70/80",
      "cooldown": "16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/terrorblade_conjure_image.png"
    },
    {
      "name": "Metamorphosis",
      "key": "E",
      "description": "Terrorblade transforms into a powerful demon with a ranged attack. Any of Terrorblade\\'s illusions that are within 120...",
      "manaCost": "100",
      "cooldown": "145/140/135/130",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/terrorblade_metamorphosis.png"
    },
    {
      "name": "Demon Zeal",
      "key": "D",
      "description": "Costs part of Terrorblade\\'s current HP to cast, providing Terrorblade and nearby illusions bonus movement, HP Regen a...",
      "manaCost": "0",
      "cooldown": "45",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/terrorblade_demon_zeal.png"
    },
    {
      "name": "Terror Wave",
      "key": "R",
      "description": "Causes a wave to travel outwards in all directions forcing enemy heroes to become Feared upon impact and dealing dama...",
      "manaCost": "75",
      "cooldown": "90",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/terrorblade_terror_wave.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1s Reflection Duration",
      "right": "-2s Conjure Image Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-10s Metamorphosis Cooldown",
      "right": "-25% Sunder Minimum HP Swap",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+10 All Attributes",
      "right": "+8s Conjure Image Duration",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-30s Sunder Cooldown",
      "right": "+30s Metamorphosis Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "phoenix",
  "name": "Phoenix",
  "aliases": [
    "phoenix",
    "phoenix"
  ],
  "title": "The Phoenix",
  "attribute": "str",
  "attackType": "Ranged",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 51.5,
  "pickRate": 6.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phoenix.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phoenix.png",
  "summary": "Alone across an untouched darkness gleamed the Keeper\\'s first sun, a singular point of conscious light fated to spread warmth into the empty void. Through aeons beyond count, th...",
  "abilities": [
    {
      "name": "Icarus Dive",
      "key": "Q",
      "description": "Phoenix dives forward in an arc with a fixed distance in the targeted direction, dealing damage over time and slowing...",
      "manaCost": "0",
      "cooldown": "40/35/30/25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phoenix_icarus_dive.png"
    },
    {
      "name": "Fire Spirits",
      "key": "W",
      "description": "Summons 4 fire spirits that circle around Phoenix. Each spirit can be launched independently at a targeted area of ef...",
      "manaCost": "100",
      "cooldown": "50/40/30/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phoenix_fire_spirits.png"
    },
    {
      "name": "Sun Ray",
      "key": "E",
      "description": "Phoenix expels a beam of light at the cost of its own health. The beam damages enemies and heals allies for a base am...",
      "manaCost": "100/110/120/130",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phoenix_sun_ray.png"
    },
    {
      "name": "Toggle Movement",
      "key": "D",
      "description": "Toggles slow forward movement during Sun Ray firing.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phoenix_sun_ray_toggle_move.png"
    },
    {
      "name": "Dying Light",
      "key": "R",
      "description": "Phoenix deals 3.5% of its missing health as magic damage to all enemies in a 400 radius every second.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/phoenix_dying_light.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+25% Icarus Dive Slow",
      "right": "+1% Dying Light Missing Health as Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+20 Fire Spirits Damage Per Second",
      "right": "+25 Health Regen",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+1.25% Max Health Sun Ray Damage",
      "right": "+0.6s Supernova Stun Duration",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+2 Supernova Hit Count",
      "right": "+1000 Icarus Dive Cast Range",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "oracle",
  "name": "Oracle",
  "aliases": [
    "oracle",
    "oracle"
  ],
  "title": "The Oracle",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support"
  ],
  "complexity": 3,
  "winRate": 50,
  "pickRate": 4.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/oracle.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/oracle.png",
  "summary": "Ascendants to the Great Seat of Cymurri had for ages imported their Oracles exclusively from the Ivory Incubarium, high in the hollow peaks of the Zealot\\'s Range, with a downpay...",
  "abilities": [
    {
      "name": "Fortune\\'s End",
      "key": "Q",
      "description": "CHANNELED - Gathers Oracle\\'s power into a bolt of scouring energy that, when released, damages, roots, and dispels en...",
      "manaCost": "80",
      "cooldown": "18/14/10/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/oracle_fortunes_end.png"
    },
    {
      "name": "Fate\\'s Edict",
      "key": "W",
      "description": "Oracle enraptures a target, disarming them and granting them 100% magic damage resistance.",
      "manaCost": "70",
      "cooldown": "17/14/11/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/oracle_fates_edict.png"
    },
    {
      "name": "Purifying Flames",
      "key": "E",
      "description": "Burns away impurities, dealing heavy magic damage to the target before causing them to regenerate health over time. T...",
      "manaCost": "75",
      "cooldown": "2.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/oracle_purifying_flames.png"
    },
    {
      "name": "Rain of Destiny",
      "key": "D",
      "description": "Brings forth rain to the target area. Enemies standing in the area receive damage and have reduced Heal Amplification...",
      "manaCost": "150",
      "cooldown": "40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/oracle_rain_of_destiny.png"
    },
    {
      "name": "Diviner\\'s Deck",
      "key": "R",
      "description": "Diviner\\'s Deck tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/oracle_diviners_deck.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+0.5s Fortune\\'s End Duration",
      "right": "+8 Armor False Promise",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+100 Fortune\\'s End Radius",
      "right": "+25% Purifying Flames Enemy Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "-20s False Promise Cooldown",
      "right": "-1s Purifying Flames Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Fortune\\'s End constantly Dispels",
      "right": "+1.5s False Promise Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "winter_wyvern",
  "name": "Winter Wyvern",
  "aliases": [
    "winter wyvern",
    "winter wyvern"
  ],
  "title": "The Winter Wyvern",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 49.9,
  "pickRate": 7.6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/winter_wyvern.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/winter_wyvern.png",
  "summary": "Like many great poets, Auroth just wants time to write, but the Winter Wyvern\\'s life is full of interruptions. The epics of the Eldwurms have a long and colorful history, but so...",
  "abilities": [
    {
      "name": "Arctic Burn",
      "key": "Q",
      "description": "Winter Wyvern soars upon an arctic wind, granting her unobstructed movement and allowing her to exhale a blistering c...",
      "manaCost": "100",
      "cooldown": "26/24/22/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/winter_wyvern_arctic_burn.png"
    },
    {
      "name": "Splinter Blast",
      "key": "W",
      "description": "Launches a ball of brittle ice toward a unit. The ice shatters on impact, leaving the primary target completely unaff...",
      "manaCost": "105/115/125/135",
      "cooldown": "6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/winter_wyvern_splinter_blast.png"
    },
    {
      "name": "Cold Embrace",
      "key": "E",
      "description": "Encases an ally in an icy cocoon, freezing them solid while healing a base amount as well as a percentage of their ma...",
      "manaCost": "50/60/70/80",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/winter_wyvern_cold_embrace.png"
    },
    {
      "name": "Eldwurm\\'s Edda",
      "key": "D",
      "description": "Eldwurm\\'s Edda tactical ability",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/winter_wyvern_eldwurms_edda.png"
    },
    {
      "name": "Winter\\'s Curse",
      "key": "R",
      "description": "Winter Wyvern dispells then freezes an enemy in place while striking those nearby with a maddening curse which causes...",
      "manaCost": "150/200/250",
      "cooldown": "100/90/80",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/winter_wyvern_winters_curse.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+15 Cold Embrace Base Heal Per Second",
      "right": "+35 Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+3s Arctic Burn Debuff Duration",
      "right": "+175 Splinter Blast Shatter Radius",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+10% Arctic Burn Slow",
      "right": "+100 Splinter Blast Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+60 Winter\\'s Curse Attack Speed",
      "right": "Splinter Blast 1s Stun",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "arc_warden",
  "name": "Arc Warden",
  "aliases": [
    "arc warden",
    "arc warden"
  ],
  "title": "The Arc Warden",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Mid",
    "Carry"
  ],
  "complexity": 3,
  "winRate": 51.7,
  "pickRate": 5.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/arc_warden.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/arc_warden.png",
  "summary": "Before the beginning of all, there existed a presence: a primordial mind, infinite, awesome, and set to inscrutable purpose. As the universe thundered into being, this mind was ...",
  "abilities": [
    {
      "name": "Flux",
      "key": "Q",
      "description": "Infuses a lone enemy unit with swirling, volatile energy, dealing damage over time and slowing the target. The damage...",
      "manaCost": "75",
      "cooldown": "16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/arc_warden_flux.png"
    },
    {
      "name": "Magnetic Field",
      "key": "W",
      "description": "Arc Warden generates a circular distortion field of magnetic energy. The Magnetic Field grants bonus attack speed and...",
      "manaCost": "60/70/80/90",
      "cooldown": "20/19/18/17",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/arc_warden_magnetic_field.png"
    },
    {
      "name": "Spark Wraith",
      "key": "E",
      "description": "Summons a Spark Wraith that slowly materializes and patrols a targeted area until an enemy comes within its range. On...",
      "manaCost": "80",
      "cooldown": "4",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/arc_warden_spark_wraith.png"
    },
    {
      "name": "Runic Infusion",
      "key": "D",
      "description": "Runes of Power fuse to the Self. Arc Warden gains +1.5 all attributes permanently whenever Arc Warden or the Tempest ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/arc_warden_runic_infusion.png"
    },
    {
      "name": "Tempest Double",
      "key": "R",
      "description": "Briefly refocusing its fractured elements into a single form, the Arc Warden is able to create a perfect electrical d...",
      "cooldown": "60/55/50",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/arc_warden_tempest_double.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+200 Flux Cast Range",
      "right": "+200 Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+20% Flux Slow",
      "right": "+25 Magnetic Field Attack Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+240 Spark Wraith Damage",
      "right": "-4s Magnetic Field Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+1.0 Runic Infusion All Attributes Bonus",
      "right": "+30s Spark Wraith Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "monkey_king",
  "name": "Monkey King",
  "aliases": [
    "mk",
    "wukong"
  ],
  "title": "The Monkey King",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 45.7,
  "pickRate": 6,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/monkey_king.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/monkey_king.png",
  "summary": "For 500 years the mountain pressed down upon him, only his head free from the crushing weight of the stonewrought prison the elder gods had summoned to halt his childish rebelli...",
  "abilities": [
    {
      "name": "Boundless Strike",
      "key": "Q",
      "description": "Monkey King enlarges his staff and slams it against the ground, stunning enemies in a line and damaging them with bon...",
      "manaCost": "85/90/95/100",
      "cooldown": "24/21/18/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/monkey_king_boundless_strike.png"
    },
    {
      "name": "Tree Dance",
      "key": "W",
      "description": "Monkey King jumps to a tree and perches atop it. While perched, he gains the Primal Spring ability-a channeled leap a...",
      "manaCost": "0",
      "cooldown": "0.9/0.6/0.3/0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/monkey_king_tree_dance.png"
    },
    {
      "name": "Primal Spring",
      "key": "E",
      "description": "CHANNELED - Monkey King springs out from his tree perch, damaging and slowing enemies in the area where he lands. Dam...",
      "manaCost": "100",
      "cooldown": "18/16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/monkey_king_primal_spring.png"
    },
    {
      "name": "Jingu Mastery",
      "key": "D",
      "description": "Monkey King\\'s attacks awaken the Jingu Bang\\'s power. Upon the fourth hit on the same enemy hero, Monkey King earns 4 ...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/monkey_king_jingu_mastery.png"
    },
    {
      "name": "Mischief",
      "key": "R",
      "description": "Changes Monkey King\\'s shape to deceive opponents, using the environment nearby as inspiration for the disguise. Takin...",
      "manaCost": "0",
      "cooldown": "24.5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/monkey_king_mischief.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+300 Tree Dance Cast Range",
      "right": "+0.2s Boundless Strike Stun Duration",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "0 Cooldown Primal Spring",
      "right": "+110 Jingu Mastery Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Jingu Mastery Undispellable",
      "right": "+60% Boundless Strike Critical Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "-1 Jingu Mastery Required Hits",
      "right": "Additional Wukong\\'s Command Ring",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "dark_willow",
  "name": "Dark Willow",
  "aliases": [
    "dark willow",
    "dark willow"
  ],
  "title": "The Dark Willow",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 48.8,
  "pickRate": 7.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dark_willow.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dark_willow.png",
  "summary": "Children love telling stories about the whimsical adventures of fairies... That’s because children don’t know that most fairies are spiteful jerks.",
  "abilities": [
    {
      "name": "Bramble Maze",
      "key": "Q",
      "description": "Dark Willow creates a 500 AoE maze of 8 brambles that grow in the target area after 0.3 seconds. Enemies that walk in...",
      "manaCost": "100/120/140/160",
      "cooldown": "22",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_willow_bramble_maze.png"
    },
    {
      "name": "Shadow Realm",
      "key": "W",
      "description": "Dark Willow recedes into the shadows, becoming untargetable. Her next attack has 600 bonus attack range and deals bon...",
      "manaCost": "80/90/100/110",
      "cooldown": "21/19/17/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_willow_shadow_realm.png"
    },
    {
      "name": "Cursed Crown",
      "key": "E",
      "description": "Dark Willow casts an ancient fae curse on the target. After a delay, the target and nearby enemies are stunned.",
      "manaCost": "80/90/100/110",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_willow_cursed_crown.png"
    },
    {
      "name": "Bedlam",
      "key": "D",
      "description": "Dark Willow sends her pet wisp to roam around herself for the duration, rapidly attacking nearby enemies. Bedlam cann...",
      "manaCost": "100/150/200",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_willow_bedlam.png"
    },
    {
      "name": "Pixie Dust",
      "key": "R",
      "description": "Dark Willow gains 20% bonus Health and Mana Regeneration, increased to 100% while she is untargetable or invulnerable.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dark_willow_pixie_dust.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.0s Bedlam Duration",
      "right": "+12 Intelligence",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+30 Bedlam Damage",
      "right": "-20s Terrorize Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+1.5s Shadow Realm Duration",
      "right": "-7s Bramble Maze CD",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+2 Bedlam Attack Targets",
      "right": "500 Terrorize Impact Damage",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "pangolier",
  "name": "Pangolier",
  "aliases": [
    "pango",
    "donte"
  ],
  "title": "The Pangolier",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 46.6,
  "pickRate": 4.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pangolier.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pangolier.png",
  "summary": "The men and women that make up the Nivan Gallants live a life of swordplay, chandelier swinging, and tawdry romance. And while all adhere to their creed that “A life of adventur...",
  "abilities": [
    {
      "name": "Swashbuckle",
      "key": "Q",
      "description": "Pangolier dashes along the target line, then slashes and briefly slows all enemies in the drawn direction with severa...",
      "manaCost": "85/90/95/100",
      "cooldown": "19/16/13/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pangolier_swashbuckle.png"
    },
    {
      "name": "Shield Crash",
      "key": "W",
      "description": "Pangolier jumps in the air and slams back to the ground in front of his current position damaging all enemies in a ra...",
      "manaCost": "75",
      "cooldown": "15/12/9/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pangolier_shield_crash.png"
    },
    {
      "name": "Lucky Shot",
      "key": "E",
      "description": "Pangolier rolls the dice and lets fate decide the outcome for his enemies. Grants a chance to drastically slow their ...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pangolier_lucky_shot.png"
    },
    {
      "name": "Roll Up",
      "key": "D",
      "description": "Pangolier curls into an immobile protective ball, gaining debuff immunity, 80% magic resistance, and allowing him to ...",
      "manaCost": "75",
      "cooldown": "40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pangolier_rollup.png"
    },
    {
      "name": "Rolling Thunder",
      "key": "R",
      "description": "Pangolier curls into a debuff immune ball with 80% magic resistance and rolls out. When rolling, he moves at an incre...",
      "manaCost": "100/125/150",
      "cooldown": "100/90/80",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/pangolier_gyroshell.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+2 Lucky Shot Armor Reduction",
      "right": "+200 Swashbuckle Slash Range",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-2s Swashbuckle Cooldown",
      "right": "+125 Shield Crash Barrier",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+2s Rolling Thunder Duration",
      "right": "-1.5s Shield Crash Cooldown",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+20% Attack Damage as Swashbuckle Damage",
      "right": "-15s Rolling Thunder Cooldown",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "grimstroke",
  "name": "Grimstroke",
  "aliases": [
    "grimstroke",
    "grimstroke"
  ],
  "title": "The Grimstroke",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Hard Support",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 51.9,
  "pickRate": 7.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/grimstroke.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/grimstroke.png",
  "summary": "The people of Ashkavor crowded around the temple square, eager to witness the ascension of their new guardian -- to stand near the man as he bound their souls to his own. But as...",
  "abilities": [
    {
      "name": "Stroke of Fate",
      "key": "Q",
      "description": "Grimstroke paints a curved path of ink with his brush, damaging and slowing enemies. The damage is increased with eac...",
      "manaCost": "100/110/120/130",
      "cooldown": "11/9/7/5",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/grimstroke_dark_artistry.png"
    },
    {
      "name": "Phantom\\'s Embrace",
      "key": "W",
      "description": "Summons a phantom that moves quickly towards the target, latching to it when she arrives. Once latched, the phantom d...",
      "manaCost": "80/100/120/140",
      "cooldown": "30/26/22/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/grimstroke_ink_creature.png"
    },
    {
      "name": "Ink Swell",
      "key": "E",
      "description": "Grimstroke shrouds an allied unit in ink, increasing its movement speed. Enemies in range of the allied unit are dama...",
      "manaCost": "120/130/140/150",
      "cooldown": "27/24/21/18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/grimstroke_spirit_walk.png"
    },
    {
      "name": "Dark Portrait",
      "key": "D",
      "description": "Dark Portrait tactical ability",
      "manaCost": "200",
      "cooldown": "35",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/grimstroke_dark_portrait.png"
    },
    {
      "name": "Soulbind",
      "key": "R",
      "description": "Binds a targeted enemy hero to its nearest allied hero within the bind radius, preventing both from moving away from ...",
      "manaCost": "150/200/250",
      "cooldown": "70/65/60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/grimstroke_soul_chain.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+65 Phantom\\'s Embrace DPS",
      "right": "-4s Ink Swell Cooldown",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+25.0% Soulbind Spell Damage",
      "right": "+15% Ink Swell Movement Speed",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+80% Stroke of Fate Damage",
      "right": "+2 Attacks to Destroy Phantom",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+150 Ink Swell Radius",
      "right": "+70% Stroke of Fate Speed and Travel Range",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "hoodwink",
  "name": "Hoodwink",
  "aliases": [
    "hoodwink",
    "hoodwink"
  ],
  "title": "The Hoodwink",
  "attribute": "agi",
  "attackType": "Ranged",
  "roles": [
    "Soft Support",
    "Mid"
  ],
  "complexity": 2,
  "winRate": 47.3,
  "pickRate": 14.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/hoodwink.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/hoodwink.png",
  "summary": "Hoodwink\\'s earliest years were spent in the idyllic expanse of green that once filled the edges of Krimwohl. But as that kingdom grew, and the needs of both her citizens and her...",
  "abilities": [
    {
      "name": "Acorn Shot",
      "key": "Q",
      "description": "Fires Hoodwink\\'s attack with an acorn at the target unit. The acorn bounces to nearby targets, slowing them and deali...",
      "manaCost": "70/80/90/100",
      "cooldown": "19/16/13/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/hoodwink_acorn_shot.png"
    },
    {
      "name": "Bushwhack",
      "key": "W",
      "description": "Tosses a net trap that stuns enemies if they are near a tree in the area. Affected enemies take damage over time and ...",
      "manaCost": "90/100/110/120",
      "cooldown": "15/14/13/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/hoodwink_bushwhack.png"
    },
    {
      "name": "Scurry",
      "key": "E",
      "description": "Hoodwink gains bonus movement speed, phased movement, and tree-walking for a brief time. While active, the redirect c...",
      "manaCost": "35",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/hoodwink_scurry.png"
    },
    {
      "name": "Decoy",
      "key": "D",
      "description": "Hoodwink turns invisible, increasing her movement speed, and creates a decoy illusion that starts aiming a decreased ...",
      "manaCost": "60",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/hoodwink_decoy.png"
    },
    {
      "name": "Hunter\\'s Boomerang",
      "key": "R",
      "description": "Tosses a boomerang in an arc. Upon contact, it returns to Hoodwink. The boomerang will deal damage as it passes throu...",
      "manaCost": "125",
      "cooldown": "18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/hoodwink_hunters_boomerang.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+50 Bushwhack Damage",
      "right": "+175 Health",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+1 Scurry Ability Charge",
      "right": "+10 Agility",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Sharpshooter Provides Vision While Charging",
      "right": "+2 Acorn Shot Bounces",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+400 Sharpshooter Max Damage",
      "right": "2 Acorn Shot Charges",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "void_spirit",
  "name": "Void Spirit",
  "aliases": [
    "inai"
  ],
  "title": "The Void Spirit",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Mid",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 49.6,
  "pickRate": 5.3,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/void_spirit.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/void_spirit.png",
  "summary": "Not even the other spirits claim to understand the mind and machinations of the eldest amongst them, Inai the Void Spirit. Privy to secrets that would shatter a mortal mind, the...",
  "abilities": [
    {
      "name": "Aether Remnant",
      "key": "Q",
      "description": "Void Spirit dispatches a remnant to the target location. The remnant stands watch over the region, facing the directi...",
      "manaCost": "75/80/85/90",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/void_spirit_aether_remnant.png"
    },
    {
      "name": "Dissimilate",
      "key": "W",
      "description": "Void Spirit temporarily fades into the aether, creating a number of portals through which he can reassemble himself. ...",
      "manaCost": "120",
      "cooldown": "20/17/14/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/void_spirit_dissimilate.png"
    },
    {
      "name": "Resonant Pulse",
      "key": "E",
      "description": "Void Spirit wraps himself in a protective shield that absorbs physical damage and emits a single damaging pulse aroun...",
      "manaCost": "115/120/125/130",
      "cooldown": "18",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/void_spirit_resonant_pulse.png"
    },
    {
      "name": "Intrinsic Edge",
      "key": "D",
      "description": "Void Spirit gains 15% more attack damage per point of each attribute, and 30% more HP regen from Strength, attack spe...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/void_spirit_intrinsic_edge.png"
    },
    {
      "name": "Astral Step",
      "key": "R",
      "description": "Void Spirit tears a rift through the astral plane to appear at the target location, attacking all enemies along the p...",
      "manaCost": "90",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/void_spirit_astral_step.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5 Mana Regen",
      "right": "+40 Resonant Pulse Damage",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+20% Resonant Pulse Barrier",
      "right": "+65 Aether Remnant Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "Outer Dissimilate Ring",
      "right": "-3s Astral Step Charge Restore Time",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "140% Astral Step Crit",
      "right": "Dissimilate Roots for 2s",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "snapfire",
  "name": "Snapfire",
  "aliases": [
    "mortimer",
    "beatrix"
  ],
  "title": "The Snapfire",
  "attribute": "all",
  "attackType": "Ranged",
  "roles": [
    "Soft Support",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 49.1,
  "pickRate": 13.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/snapfire.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/snapfire.png",
  "summary": "Beatrix Snapfire and her dragon toad Mortimer are a welcome sight to the ragged folk who scratch out lives along the desert routes and oases scattered throughout Nanarak, the ra...",
  "abilities": [
    {
      "name": "Scatterblast",
      "key": "Q",
      "description": "Snapfire unloads with a wide blast that damages and slows enemies in a cone. Damage is increased by 30% and Movement ...",
      "manaCost": "85/90/95/100",
      "cooldown": "17/14/11/8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/snapfire_scatterblast.png"
    },
    {
      "name": "Firesnap Cookie",
      "key": "W",
      "description": "Snapfire feeds a potent cookie to Mortimer or an ally, causing them to hop a short distance. The hopping unit stuns a...",
      "manaCost": "105",
      "cooldown": "18/17/16/15",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/snapfire_firesnap_cookie.png"
    },
    {
      "name": "Lil\\' Shredder",
      "key": "E",
      "description": "Snapfire heats up her mounted turret to rapidly fire 5 attacks dealing fixed damage plus a percentage of her attack d...",
      "manaCost": "70/80/90/100",
      "cooldown": "24/20/16/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/snapfire_lil_shredder.png"
    },
    {
      "name": "Gobble Up",
      "key": "D",
      "description": "Mortimer gobbles up a creep or an allied hero, which he can then spit towards enemies. The unit stays in his belly up...",
      "manaCost": "120",
      "cooldown": "40",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/snapfire_gobble_up.png"
    },
    {
      "name": "Spit Out",
      "key": "R",
      "description": "Mortimer spits out the unit that\\'s in his mouth, causing impact damage and stun in a large area. The glob leaves a po...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/snapfire_spit_creep.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+70 Scatterblast Damage",
      "right": "+35 Mortimer Kisses Burn DPS",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+2 Lil\\' Shredder attacks",
      "right": "-3s Firesnap Cookie Cooldown",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+=2 Lil\\' Shredder Targets",
      "right": "2 Firesnap Cookie Charges",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+60% Lil\\' Shredder Attack Damage",
      "right": "+8 Mortimer Kisses Launched",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "mars",
  "name": "Mars",
  "aliases": [
    "mars",
    "mars"
  ],
  "title": "The Mars",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane"
  ],
  "complexity": 1,
  "winRate": 47.5,
  "pickRate": 5.5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/mars.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/mars.png",
  "summary": "Mars, first son of heaven, spent a long existence waging endless war, and saw countless more crusades waged beneath the banner of his old name. Wars of conquest and of vengeance.",
  "abilities": [
    {
      "name": "Spear of Mars",
      "key": "Q",
      "description": "Mars throws his legendary Spear with deadly precision, damaging each enemy unit it strikes. The first enemy hero it h...",
      "manaCost": "90/100/110/120",
      "cooldown": "14/13/12/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mars_spear.png"
    },
    {
      "name": "God\\'s Rebuke",
      "key": "W",
      "description": "Mars smashes enemies in front of him with his shield, knocking them back and damaging them with a critical hit based ...",
      "manaCost": "90",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mars_gods_rebuke.png"
    },
    {
      "name": "Bulwark",
      "key": "E",
      "description": "Mars wields his massive shield to block a portion of each physical attack when hit from the front or sides.   Can be ...",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mars_bulwark.png"
    },
    {
      "name": "Dauntless",
      "key": "D",
      "description": "Mars gets more HP Regen the more he is outnumbered by enemy heroes in 900 radius.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mars_dauntless.png"
    },
    {
      "name": "Arena Of Blood",
      "key": "R",
      "description": "After a short formation time, Mars summons an arena lined with the undead warriors of the Ash Legion, who block enemy...",
      "manaCost": "150/200/250",
      "cooldown": "100/95/90",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/mars_arena_of_blood.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+100 God\\'s Rebuke Distance",
      "right": "+1.5 Mana Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-2.5s God\\'s Rebuke Cooldown",
      "right": "+100 Spear Of Mars Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+70 Arena Of Blood Spear Damage",
      "right": "+0.5s Spear of Mars Stun",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "God\\'s Rebuke +65% Crit",
      "right": "Arena Of Blood Grants Team +180 HP Regen",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "ring_master",
  "name": "Ring Master",
  "aliases": [
    "ringmaster",
    "clown"
  ],
  "title": "The Ring Master",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Soft Support",
    "Hard Support"
  ],
  "complexity": 2,
  "winRate": 48.7,
  "pickRate": 5.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ringmaster.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ringmaster.png",
  "summary": "Welcome, welcome, one and all — to a stage-lit extravaganza for the ages! Prepare to have your senses shattered! Your expectations demolished! Your Ancients smashed to ruins! Wi...",
  "abilities": [
    {
      "name": "Tame the Beasts",
      "key": "Q",
      "description": "CHANNELED - Ringmaster twirls his whip for up to 1 second then cracks it. Whipped enemies are damaged and flee in fea...",
      "manaCost": "90/105/120/135",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ringmaster_tame_the_beasts.png"
    },
    {
      "name": "Escape Act",
      "key": "W",
      "description": "Ringmaster packs himself or an allied hero into a mobile, extradimensional box. Boxed units gain phased movement, slo...",
      "manaCost": "120",
      "cooldown": "38/32/26/20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ringmaster_the_box.png"
    },
    {
      "name": "Impalement Arts",
      "key": "E",
      "description": "Ringmaster throws one of his daggers to a precise point of his choosing. If he strikes an enemy, the dagger deals imp...",
      "manaCost": "50",
      "cooldown": "1",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ringmaster_impalement.png"
    },
    {
      "name": "Souvenir Slot",
      "key": "D",
      "description": "Gather souvenirs from kills and assists.",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ringmaster_empty_souvenir.png"
    },
    {
      "name": "Spotlight",
      "key": "R",
      "description": "Ringmaster shines 3 spotlights that sweep over an area. Enemies in the light have a chance to miss their attacks and ...",
      "manaCost": "50",
      "cooldown": "30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/ringmaster_spotlight.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "special_bonus_unique_ringmaster_dagger_charge",
      "right": "+75 Tame the Beasts Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "Impalement Arts Penetrates One Target",
      "right": "Debuff Immunity While Channeling Tame the ...",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+1s Impalement Arts Bleed and Slow Duration",
      "right": "+75/+300 Tame the Beasts Min/Max Damage",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+150 Wheel of Wonder Radius and Range",
      "right": "Escape Act Grants Strong Dispel and Flying",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "dawnbreaker",
  "name": "Dawnbreaker",
  "aliases": [
    "dawnbreaker",
    "dawnbreaker"
  ],
  "title": "The Dawnbreaker",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Soft Support"
  ],
  "complexity": 1,
  "winRate": 52.1,
  "pickRate": 10.8,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dawnbreaker.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dawnbreaker.png",
  "summary": "In the aeons after the Keeper\\'s exodus birthed the age of light, some amongst the first sun\\'s lineage began to align against the chaos their ancestor\\'s maker left chasing in his...",
  "abilities": [
    {
      "name": "Starbreaker",
      "key": "Q",
      "description": "Dawnbreaker whirls her hammer around 3 times, damaging enemies with her attack plus bonus damage. On the final strike...",
      "manaCost": "110",
      "cooldown": "17/15/13/11",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dawnbreaker_fire_wreath.png"
    },
    {
      "name": "Celestial Hammer",
      "key": "W",
      "description": "Dawnbreaker hurls her weapon at a target, damaging enemies struck along the way. The hammer pauses for 2 seconds at t...",
      "manaCost": "100/110/120/130",
      "cooldown": "18/16/14/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dawnbreaker_celestial_hammer.png"
    },
    {
      "name": "Luminosity",
      "key": "E",
      "description": "Luminosity tactical ability",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dawnbreaker_luminosity.png"
    },
    {
      "name": "Converge",
      "key": "D",
      "description": "Dawnbreaker recalls her hammer, pulling them together so they meet in the middle.",
      "manaCost": "0",
      "cooldown": "0.25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dawnbreaker_converge.png"
    },
    {
      "name": "Break of Dawn",
      "key": "R",
      "description": "Whenever the sun comes out, Dawnbreaker gains bonus base damage and vision that decreases throughout the course of th...",
      "cooldown": "Passive",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/dawnbreaker_break_of_dawn.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "special_bonus_unique_dawnbreaker_luminosit...",
      "right": "special_bonus_unique_dawnbreaker_celestial...",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "special_bonus_unique_dawnbreaker_celestial...",
      "right": "special_bonus_unique_dawnbreaker_solar_gua...",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "special_bonus_unique_dawnbreaker_solar_gua...",
      "right": "special_bonus_unique_dawnbreaker_luminosit...",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "special_bonus_unique_dawnbreaker_fire_wrea...",
      "right": "special_bonus_unique_dawnbreaker_celestial...",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "marci",
  "name": "Marci",
  "aliases": [
    "marci",
    "marci"
  ],
  "title": "The Marci",
  "attribute": "all",
  "attackType": "Melee",
  "roles": [
    "Soft Support",
    "Offlane"
  ],
  "complexity": 2,
  "winRate": 49.7,
  "pickRate": 5.1,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/marci.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/marci.png",
  "summary": "Admired by many, Marci\\'s origins are known to nameless few. She travels mostly in the company of the Princess Mirana, but the roots of their friendship are entwined in secrets n...",
  "abilities": [
    {
      "name": "Dispose",
      "key": "Q",
      "description": "Marci grabs an allied or enemy target and throws it effortlessly behind her, damaging and slowing the unit if it\\'s an...",
      "manaCost": "80",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/marci_grapple.png"
    },
    {
      "name": "Rebound",
      "key": "W",
      "description": "Marci bounds to the targeted allied unit, choosing a direction and distance she will spring away from it. Upon reachi...",
      "manaCost": "70/80/90/100",
      "cooldown": "24/20/16/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/marci_companion_run.png"
    },
    {
      "name": "Bodyguard",
      "key": "E",
      "description": "Passively grants Marci lifesteal and bonus attack damage.  When cast on an ally, she provides them with 75% of her pa...",
      "manaCost": "60",
      "cooldown": "20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/marci_bodyguard.png"
    },
    {
      "name": "Special Delivery",
      "key": "D",
      "description": "Marci whistles to instantly summon her courier to her. If the courier started in the fountain, it will take items fro...",
      "cooldown": "215",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/marci_special_delivery.png"
    },
    {
      "name": "Unleash",
      "key": "R",
      "description": "Marci taps a hidden power, gaining Fury charges that allow her to deliver a rapid sequence of strikes that slow movem...",
      "manaCost": "100/125/150",
      "cooldown": "80/70/60",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/marci_unleash.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+1.5s Dispose Slow Duration",
      "right": "+50 Rebound Landing Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+115 Dispose Damage",
      "right": "+12% Bodyguard Damage",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+0.75s Rebound Stun Duration",
      "right": "+15% Unleash Movement Speed",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "Unleash Duration Extended By 6s On Kill",
      "right": "Bodyguard Strong Dispels",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "primal_beast",
  "name": "Primal Beast",
  "aliases": [
    "pb"
  ],
  "title": "The Primal Beast",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 49.1,
  "pickRate": 3.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/primal_beast.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/primal_beast.png",
  "summary": "Though the deterioration of the Mistwood and its evolution from idyllic expanse to death-filled tanglewild was a slow, wizard-fueled process, most scholars agree the true beginn...",
  "abilities": [
    {
      "name": "Onslaught",
      "key": "Q",
      "description": "Primal Beast charges up and then runs in the chosen direction, knocking back enemies and allies alike. Enemy units ar...",
      "manaCost": "120",
      "cooldown": "25/22/19/16",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/primal_beast_onslaught.png"
    },
    {
      "name": "Trample",
      "key": "W",
      "description": "Primal Beast stomps over everything. For every 140 units traveled, all enemies around the Beast receive damage. Deals...",
      "manaCost": "100",
      "cooldown": "30/27/24/21",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/primal_beast_trample.png"
    },
    {
      "name": "Uproar",
      "key": "E",
      "description": "The Beast\\'s temper causes every instance of 50 hero damage or more to grant a stack of Uproar.    When activated, Pri...",
      "cooldown": "0",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/primal_beast_uproar.png"
    },
    {
      "name": "Rock Throw",
      "key": "D",
      "description": "Primal Beast throws a rock at the target location that stuns and damages enemies. The rock cannot be thrown within a ...",
      "manaCost": "85",
      "cooldown": "20",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/primal_beast_rock_throw.png"
    },
    {
      "name": "Begin Onslaught",
      "key": "R",
      "description": "Begins the rush to the specified location.",
      "cooldown": "0.3",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/primal_beast_onslaught_release.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+30 Damage",
      "right": "+25% Magic Resistance During Trample",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "-5s Trample Cooldown",
      "right": "+6 Uproar Armor Per Stack",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+20% Trample Attack Multiplier",
      "right": "Basic Self-Dispel on Uproar Cast",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "special_bonus_unique_primal_beast_colossal...",
      "right": "+67% Pulverize Duration",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "muerta",
  "name": "Muerta",
  "aliases": [
    "muerta",
    "muerta"
  ],
  "title": "The Muerta",
  "attribute": "int",
  "attackType": "Ranged",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 1,
  "winRate": 48.2,
  "pickRate": 3.7,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/muerta.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/muerta.png",
  "summary": "There are as many stories about Muerta as there are graves in the Carrion Fields of Gorm. Some tell their children ghost stories of a young peasant girl returned from the dead t...",
  "abilities": [
    {
      "name": "Dead Shot",
      "key": "Q",
      "description": "Dead Shot tactical ability",
      "manaCost": "100/120/140/160",
      "cooldown": "16/14/12/10",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/muerta_dead_shot.png"
    },
    {
      "name": "The Calling",
      "key": "W",
      "description": "The Calling tactical ability",
      "manaCost": "135/150/165/180",
      "cooldown": "30/28/26/24",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/muerta_the_calling.png"
    },
    {
      "name": "Gunslinger",
      "key": "E",
      "description": "Gunslinger tactical ability",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/muerta_gunslinger.png"
    },
    {
      "name": "Spectral Slug",
      "key": "D",
      "description": "Spectral Slug tactical ability",
      "manaCost": "75",
      "cooldown": "12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/muerta_spectral_slug.png"
    },
    {
      "name": "Pierce the Veil",
      "key": "R",
      "description": "Pierce the Veil tactical ability",
      "manaCost": "150/250/350",
      "cooldown": "75/60/45",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/muerta_pierce_the_veil.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+300 Dead Shot Cast Range",
      "right": "+20 Attack Speed",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+3.0% Max HP Regen while inside The Calling",
      "right": "+15 Intelligence",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "special_bonus_unique_muerta_pierce_the_vei...",
      "right": "The Calling summons 2 additional revenants",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "special_bonus_unique_muerta_gunslinger_dou...",
      "right": "special_bonus_unique_muerta_dead_shot_charges",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "kez",
  "name": "Kez",
  "aliases": [
    "bird",
    "kazurai"
  ],
  "title": "The Kez",
  "attribute": "agi",
  "attackType": "Melee",
  "roles": [
    "Carry",
    "Mid"
  ],
  "complexity": 3,
  "winRate": 45.4,
  "pickRate": 5.5,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/kez.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/kez.png",
  "summary": "\\'I was born with a price on my head. As I got better at causing trouble, that price went up.",
  "abilities": [
    {
      "name": "Echo Slash",
      "key": "Q",
      "description": "Kez slashes forward in a 800 distance line with his Katana, attacking enemies in an area and applying a brief 100% im...",
      "manaCost": "75/90/105/120",
      "cooldown": "21/18/15/12",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kez_echo_slash.png"
    },
    {
      "name": "Grappling Claw",
      "key": "W",
      "description": "Kez swings on a grappling hook towards the target unit or tree. When the grappling hook collides with the target, tha...",
      "manaCost": "40",
      "cooldown": "13/11/9/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kez_grappling_claw.png"
    },
    {
      "name": "Kazurai Katana",
      "key": "E",
      "description": "Katana attacks and abilities apply a stacking damage over time to enemies that deals a percentage of the original att...",
      "manaCost": "40",
      "cooldown": "24/18/12/6",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kez_kazurai_katana.png"
    },
    {
      "name": "Switch Discipline",
      "key": "D",
      "description": "Kez switches between his Kazurai Katana and Shodo Sai.  He gains different attack capabilities and abilities based on...",
      "cooldown": "8",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kez_switch_weapons.png"
    },
    {
      "name": "Raptor Dance",
      "key": "R",
      "description": "Kez enters into an uncontrollable state for 1 second, becoming invulnerable for 0.2s and receiving a basic dispel.  I...",
      "manaCost": "100/125/150",
      "cooldown": "40/35/30",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/kez_raptor_dance.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+12% Magic Resistance",
      "right": "+50 Raptor Dance Radius",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "+2.0s Falcon Rush Duration",
      "right": "+1 Raptor Dance Strike",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "+4.0% Kazurai Katana Damage Per Second",
      "right": "=40 Bonus Attack Speed During Falcon Rush",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+80% Shodo Sai Critical Strike",
      "right": "+1 Echo Slash Attack",
      "recommended": "right"
    }
  ]
}),
  createArchetypeHero({
  "id": "largo",
  "name": "Largo",
  "aliases": [
    "largo",
    "largo"
  ],
  "title": "The Largo",
  "attribute": "str",
  "attackType": "Melee",
  "roles": [
    "Offlane",
    "Soft Support"
  ],
  "complexity": 2,
  "winRate": 47.8,
  "pickRate": 2.2,
  "avatarUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/largo.png",
  "bannerUrl": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/largo.png",
  "summary": "The exiled Murkroots of Velu’Mar discovered a living island so ancient it speaks only in song. Raised among the shamanic bards who learned to commune with it, Largo now roams th...",
  "abilities": [
    {
      "name": "Catchy Lick",
      "key": "Q",
      "description": "Largo licks the targeted unit with his tongue, pulling it back a short distance, applying a basic dispel, and dealing...",
      "manaCost": "80/85/90/95",
      "cooldown": "13/11/9/7",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/largo_catchy_lick.png"
    },
    {
      "name": "Frogstomp",
      "key": "W",
      "description": "Largo tosses froglings to an area. They stomp the ground every 1 second, dealing damage and ministuns, and enemies in...",
      "manaCost": "85/95/105/115",
      "cooldown": "20/18/16/14",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/largo_frogstomp.png"
    },
    {
      "name": "Croak of Genius",
      "key": "E",
      "description": "Largo strums a tune to a friendly hero. The hero\\'s items and abilities have reduced mana cost and a percentage of the...",
      "manaCost": "40",
      "cooldown": "25",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/largo_croak_of_genius.png"
    },
    {
      "name": "Encore",
      "key": "D",
      "description": "Buffs that Largo applies to himself or his team have extended duration.",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/largo_encore.png"
    },
    {
      "name": "Amphibian Rhapsody",
      "key": "R",
      "description": "Largo gets ready to groove. He is disarmed and his ability bar switches to 3 song abilities, each with different effe...",
      "manaCost": "0",
      "cooldown": "2",
      "img": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/largo_amphibian_rhapsody.png",
      "isUltimate": true
    }
  ],
  "talents": [
    {
      "level": 10,
      "left": "+15 Frogstomp Damage",
      "right": "2.5x Catchy Lick Health Regen",
      "recommended": "left"
    },
    {
      "level": 15,
      "left": "1% Croak of Genius Max Health DPS",
      "right": "+100 Catchy Lick Cast Range / +50 Pull Dis...",
      "recommended": "right"
    },
    {
      "level": 20,
      "left": "2x Frogstomp Stomps/Interval",
      "right": "50% Groovin\\' Armor Aura",
      "recommended": "left"
    },
    {
      "level": 25,
      "left": "+30% Amphibian Rhapsody Song Effects",
      "right": "2 Catchy Lick Charges",
      "recommended": "right"
    }
  ]
})

];

export const HERO_MAP = new Map<string, HeroData>(
  HEROES_DATA.map((hero) => [hero.id, hero])
);

// Tactical lookup for any Dota 2 hero (exact ID, alias, or localized name)
export function resolveHeroData(heroId: string, customName?: string, _reasonContext?: string): HeroData {
  const existing = HERO_MAP.get(heroId);
  if (existing) return existing;

  const query = (heroId || '').toLowerCase().trim();
  const custom = (customName || '').toLowerCase().trim();

  const bySearch = HEROES_DATA.find((h) => 
    h.id === query || 
    h.name.toLowerCase() === query || 
    h.aliases.some((a) => a.toLowerCase() === query) ||
    (custom && (h.name.toLowerCase() === custom || h.id === custom))
  );
  if (bySearch) return bySearch;

  return HEROES_DATA[0];
}
