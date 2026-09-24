import { ItemCounteredByHero, HeroCounteredByItem } from '../types/interactions';

export const ITEMS_COUNTERED_BY_HEROES: ItemCounteredByHero[] = [
  {
    itemId: 'bkb',
    itemName: 'Black King Bar (BKB)',
    itemCategory: 'Armor & Magic Defense',
    itemCost: 4050,
    description: 'Grants Debuff Immunity and 50% Magic Resistance. Considered the #1 teamfight defensive item in Dota 2.',
    whyCounteredSummary: 'BKB only protects against non-piercing spells. Heroes with BKB-piercing hard disables, pure damage, or physical roots completely bypass Debuff Immunity and render BKB activation useless.',
    counteredByHeroes: [
      {
        heroId: 'legion_commander',
        heroName: 'Legion Commander',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/legion_commander.png',
        abilityOrMechanic: 'Duel (BKB-Piercing Taunt)',
        howItCounters: 'Duel completely ignores BKB Debuff Immunity, forcing the BKB user into physical right-click combat for up to 5.5 seconds, wasting their entire BKB duration.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'axe',
        heroName: 'Axe',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png',
        abilityOrMechanic: "Berserker's Call & Culling Blade",
        howItCounters: "Berserker's Call pierces BKB to taunt the target into attacking Axe (+30 armor), while Counter Helix and Culling Blade deal Pure damage that bypasses BKB magic resist.",
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'faceless_void',
        heroName: 'Faceless Void',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/faceless_void.png',
        abilityOrMechanic: 'Chronosphere & Time Lock',
        howItCounters: 'Chronosphere freezes all units inside for 5.0 seconds regardless of BKB or Debuff Immunity. BKB charges tick down and expire while frozen.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'pudge',
        heroName: 'Pudge',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pudge.png',
        abilityOrMechanic: 'Dismember & Meat Hook',
        howItCounters: 'Dismember locks the target down through BKB for 3.0 seconds, healing Pudge while Meat Hook drags targets with Pure damage.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'slardar',
        heroName: 'Slardar',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/slardar.png',
        abilityOrMechanic: 'Bash of the Deep & Corrosive Haze',
        howItCounters: 'Slardar’s physical Bashes pierce BKB, keeping the enemy perma-stunned while Corrosive Haze continues reducing armor.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'bane',
        heroName: 'Bane',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bane.png',
        abilityOrMechanic: "Fiend's Grip",
        howItCounters: "Channels a 6-second BKB-piercing lockdown that drains mana and leaves the core immobilized for its entire Avatar duration.",
        severity: 'HARD_COUNTER'
      }
    ]
  },
  {
    itemId: 'ghost_scepter',
    itemName: 'Ghost Scepter & Ethereal Blade',
    itemCategory: 'Support & Save Items',
    itemCost: 1500,
    description: 'Renders the user 100% immune to physical attacks for 4.0 seconds, but amplifies magical damage taken by 40%.',
    whyCounteredSummary: 'Ghost Form is a dispellable buff that increases magic damage taken by 40%. Heroes with heavy magical burst or dispels will either delete the user in 1 hit or strip the ghost form immediately.',
    counteredByHeroes: [
      {
        heroId: 'zeus',
        heroName: 'Zeus',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/zeus.png',
        abilityOrMechanic: "Lightning Bolt & Thundergod's Wrath",
        howItCounters: "Ghost Form increases Zeus's magical burst by 40%, causing Lightning Bolt and Wrath to instantly 1-shot the user.",
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'lina',
        heroName: 'Lina',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lina.png',
        abilityOrMechanic: 'Laguna Blade & Dragon Slave',
        howItCounters: 'Lina deals pure or amplified magic damage that vaporizes Ghost Scepter users in under 1 second.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'invoker',
        heroName: 'Invoker',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/invoker.png',
        abilityOrMechanic: 'Sun Strike / Cataclysm & Tornado',
        howItCounters: 'Sun Strike deals Pure damage (unaffected by Ghost physical immunity), and Tornado dispels Ghost Scepter active instantly.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'shadow_demon',
        heroName: 'Shadow Demon',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/shadow_demon.png',
        abilityOrMechanic: 'Demonic Purge (Continuous Dispel)',
        howItCounters: 'Demonic Purge continuously dispels the target every tick, immediately stripping Ghost Scepter the millisecond it is pressed.',
        severity: 'HARD_COUNTER'
      }
    ]
  },
  {
    itemId: 'shadow_blade',
    itemName: 'Shadow Blade & Silver Edge (Invisibility)',
    itemCategory: 'Weapons & Mobility',
    itemCost: 3000,
    description: 'Grants invisibility and bonus movement speed for 14.0 seconds.',
    whyCounteredSummary: 'Invisibility is countered by heroes with built-in True Sight, wide area reveals, vision tracking, or map-wide aerial sight.',
    counteredByHeroes: [
      {
        heroId: 'slardar',
        heroName: 'Slardar',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/slardar.png',
        abilityOrMechanic: 'Corrosive Haze (True Sight)',
        howItCounters: 'Corrosive Haze provides undispellable True Sight on a 5-second cooldown, completely preventing the target from entering or staying in invisibility.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'bounty_hunter',
        heroName: 'Bounty Hunter',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bounty_hunter.png',
        abilityOrMechanic: 'Track (True Sight & Speed Aura)',
        howItCounters: 'Track reveals invisible units from 1000 range, gives allies movement speed, and yields bonus gold upon kill.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'zeus',
        heroName: 'Zeus',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/zeus.png',
        abilityOrMechanic: "Lightning Bolt & Thundergod's Wrath",
        howItCounters: 'Lightning Bolt grants 750 radius True Sight for 5 seconds; Thundergod’s Wrath globally reveals all invisible heroes across the entire map.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'bloodseeker',
        heroName: 'Bloodseeker',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bloodseeker.png',
        abilityOrMechanic: 'Thirst (True Sight on Low HP)',
        howItCounters: 'Passively grants True Sight over any invisible enemy hero whose health drops below 25%, preventing shadow escapes.',
        severity: 'HARD_COUNTER'
      }
    ]
  },
  {
    itemId: 'linkens',
    itemName: "Linken's Sphere",
    itemCategory: 'Armor & Spellblock',
    itemCost: 4800,
    description: 'Passively blocks one targeted single-target spell every 14 seconds.',
    whyCounteredSummary: "Linken's has a long 14s cooldown and can be triggered by low-mana, short-cooldown single-target spam, completely stripping its protection before high-impact ultimates are cast.",
    counteredByHeroes: [
      {
        heroId: 'phantom_assassin',
        heroName: 'Phantom Assassin',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png',
        abilityOrMechanic: 'Stifling Dagger (6s Cooldown / 30 Mana)',
        howItCounters: "Stifling Dagger pops Linken's Sphere safely from 1150 range on a 6-second cooldown, allowing PA to follow up with Phantom Strike instantly.",
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'bristleback',
        heroName: 'Bristleback',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bristleback.png',
        abilityOrMechanic: 'Viscous Nasal Goo (1.5s Cooldown / 12 Mana)',
        howItCounters: "Goo pops Linken's Sphere instantly for almost 0 mana cost every 1.5 seconds, leaving the target permanently unprotected.",
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'lion',
        heroName: 'Lion',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lion.png',
        abilityOrMechanic: 'Mana Drain',
        howItCounters: "Mana Drain is a targeted spell with 0 cooldown and 0 mana cost that instantly pops Linken's Sphere, followed immediately by Hex or Earth Spike.",
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'zeus',
        heroName: 'Zeus',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/zeus.png',
        abilityOrMechanic: 'Arc Lightning (1.6s Cooldown)',
        howItCounters: "Spams Arc Lightning every 1.6 seconds, ensuring Linken's is never off cooldown.",
        severity: 'HARD_COUNTER'
      }
    ]
  },
  {
    itemId: 'blade_mail',
    itemName: 'Blade Mail',
    itemCategory: 'Armor & Damage Return',
    itemCost: 2100,
    description: 'Returns 85% of incoming damage back to the attacker for 4.5 seconds.',
    whyCounteredSummary: 'Blade Mail relies on the enemy taking reflected damage. Heroes with built-in magic resistance, spell immunity, extreme lifesteal, or untargeted damage take zero threat from Blade Mail.',
    counteredByHeroes: [
      {
        heroId: 'anti_mage',
        heroName: 'Anti-Mage',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png',
        abilityOrMechanic: 'Counterspell (Magic Resistance & Spell Shield)',
        howItCounters: 'Passively boasts 75%+ magic resistance and Counterspell active. Reflected magical damage from Blade Mail deals negligible scratch damage to AM.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'juggernaut',
        heroName: 'Juggernaut',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/juggernaut.png',
        abilityOrMechanic: 'Blade Fury (Debuff Immunity & Magic Immunity)',
        howItCounters: 'Spins during Blade Fury to deal massive AoE damage while completely ignoring all reflected damage.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'ursa',
        heroName: 'Ursa',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ursa.png',
        abilityOrMechanic: 'Enrage (80% Damage Reduction)',
        howItCounters: 'Enrage reduces all incoming and reflected damage by 80%, allowing Ursa to shred Blade Mail carriers without fear.',
        severity: 'HARD_COUNTER'
      }
    ]
  },
  {
    itemId: 'heart',
    itemName: 'Heart of Tarrasque & High HP Items',
    itemCategory: 'Armor & Health Pool',
    itemCost: 5100,
    description: 'Grants +35 Strength, +770 Health, and 1.6% Max HP regeneration per second.',
    whyCounteredSummary: 'Large HP pools are fundamentally counter-productive against heroes whose damage output scales with percentage-based maximum or missing health.',
    counteredByHeroes: [
      {
        heroId: 'necrophos',
        heroName: 'Necrophos',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/necrophos.png',
        abilityOrMechanic: "Heartstopper Aura & Reaper's Scythe",
        howItCounters: "Heartstopper Aura burns up to 2.4% max HP every second passively. Reaper's Scythe deals damage proportional to missing HP, executing massive HP tanks effortlessly.",
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'lifestealer',
        heroName: 'Lifestealer',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/life_stealer.png',
        abilityOrMechanic: 'Feast (% Max HP Damage & Lifesteal)',
        howItCounters: 'Feast steals a percentage of the target’s MAXIMUM health on every single right click, turning high HP tanks into infinite healing batteries for Lifestealer.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'witch_doctor',
        heroName: 'Witch Doctor',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/witch_doctor.png',
        abilityOrMechanic: 'Maledict (% Health Lost Burst)',
        howItCounters: 'Maledict deals burst ticks equal to up to 28% of all HP lost since the curse started. Melting 2000 HP from a 6000 HP Heart tank guarantees a 3000 damage fatal tick.',
        severity: 'HARD_COUNTER'
      },
      {
        heroId: 'timbersaw',
        heroName: 'Timbersaw',
        heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/timbersaw.png',
        abilityOrMechanic: 'Whirling Death (Attribute % Loss)',
        howItCounters: 'Cuts primary attribute (Strength) by 13%, instantly wiping hundreds of HP and health pool scaling.',
        severity: 'HARD_COUNTER'
      }
    ]
  }
];

export const HEROES_COUNTERED_BY_ITEMS: HeroCounteredByItem[] = [
  {
    heroId: 'phantom_assassin',
    heroName: 'Phantom Assassin',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png',
    attribute: 'Agility',
    primaryRole: 'Carry',
    coreVulnerability: 'Relies 100% on physical attack crits (Coup de Grace) and natural Blur evasion (50%). Has a low base HP pool and zero natural escape once jumped.',
    counteredByItems: [
      {
        itemId: 'mkb',
        itemName: 'Monkey King Bar (MKB)',
        cost: 4975,
        mechanicTag: 'True Strike',
        howItCounters: '80% True Strike completely bypasses PA’s 50% Blur evasion, turning her defensive passive into dead weight.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'silver_edge',
        itemName: 'Silver Edge',
        cost: 5450,
        mechanicTag: 'Break (Passives Disabler)',
        howItCounters: 'Attacking out of Shadow Walk applies BREAK for 5.0s, turning off both Blur evasion AND Coup de Grace critical hits.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'ghost_scepter',
        itemName: 'Ghost Scepter',
        cost: 1500,
        mechanicTag: 'Physical Immunity',
        howItCounters: 'Renders squishy supports 100% immune to PA’s Phantom Strike and critical hits for 4.0 seconds.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'blade_mail',
        itemName: 'Blade Mail',
        cost: 2100,
        mechanicTag: 'Damage Return',
        howItCounters: 'Reflects 85% of PA’s 1500+ critical hits back into her frail health pool, causing her to suicide in 2 hits.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'halberd',
        itemName: "Heaven's Halberd",
        cost: 3550,
        mechanicTag: 'Disarm (Undispellable by basic dispel)',
        howItCounters: 'Disarms PA for 3.0 seconds, preventing her from landing any attacks or critical strikes.',
        priority: 'HIGH_VALUE'
      }
    ]
  },
  {
    heroId: 'bristleback',
    heroName: 'Bristleback',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bristleback.png',
    attribute: 'Strength',
    primaryRole: 'Offlane / Carry',
    coreVulnerability: 'Survivability relies entirely on his passive Bristleback (40% damage reduction from rear) and Warpath right-click stacking.',
    counteredByItems: [
      {
        itemId: 'silver_edge',
        itemName: 'Silver Edge',
        cost: 5450,
        mechanicTag: 'Break',
        howItCounters: 'Disables his 40% rear damage reduction and stops automatic Quill Sprays and Warpath damage stacks for 5.0 seconds.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'spirit_vessel',
        itemName: 'Spirit Vessel',
        cost: 2980,
        mechanicTag: 'Healing Reduction & % HP Burn',
        howItCounters: 'Cuts Bristleback’s Bloodstone / Vanguard spell lifesteal and HP regen by 45% while burning 4% current HP per second.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'diffusal_blade',
        itemName: 'Diffusal Blade / Disperser',
        cost: 2500,
        mechanicTag: 'Mana Burn',
        howItCounters: 'Bristleback has a tiny mana pool; burning his mana leaves him unable to cast Quill Spray or Nasal Goo to build Warpath.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'skadi',
        itemName: 'Eye of Skadi',
        cost: 5300,
        mechanicTag: 'BKB-Piercing Heal Reduction',
        howItCounters: 'Reduces healing and lifesteal by 40% on attack and pierces BKB, slowing Bristleback’s high Warpath movement speed.',
        priority: 'HIGH_VALUE'
      }
    ]
  },
  {
    heroId: 'storm_spirit',
    heroName: 'Storm Spirit',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png',
    attribute: 'Intelligence',
    primaryRole: 'Mid',
    coreVulnerability: 'Hyper-reliant on Ball Lightning to reposition and dodge damage. If silenced, hexed, or out of mana, Storm is completely helpless.',
    counteredByItems: [
      {
        itemId: 'orchid',
        itemName: 'Orchid Malevolence / Bloodthorn',
        cost: 3475,
        mechanicTag: 'Silence & Soul Burn',
        howItCounters: 'Silences Storm for 5.0 seconds, preventing him from zipping away or casting Overload remnants before he can acquire BKB/Eul’s.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'scythe_of_vyse',
        itemName: 'Scythe of Vyse (Hex)',
        cost: 5675,
        mechanicTag: 'Instant 0-Cast Point Disable',
        howItCounters: 'Hex transforms Storm into a pig with zero cast point delay, leaving zero reaction window to zip away.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'gleipnir',
        itemName: 'Rod of Atos / Gleipnir',
        cost: 5650,
        mechanicTag: 'AoE Root',
        howItCounters: 'Roots prevent Storm Spirit from casting Ball Lightning, holding him in place for 2.0 seconds.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'diffusal_blade',
        itemName: 'Diffusal Blade',
        cost: 2500,
        mechanicTag: 'Mana Burn',
        howItCounters: 'Drains his mana pool on every attack, depriving him of the fuel needed for Ball Lightning.',
        priority: 'SITUATIONAL'
      }
    ]
  },
  {
    heroId: 'windranger',
    heroName: 'Windranger',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/windrunner.png',
    attribute: 'Universal',
    primaryRole: 'Mid / Carry / Offlane',
    coreVulnerability: 'Relies on Windrun for 100% physical evasion and Focus Fire for high attack speed single-target lock.',
    counteredByItems: [
      {
        itemId: 'blade_mail',
        itemName: 'Blade Mail',
        cost: 2100,
        mechanicTag: 'Damage Return vs Max Attack Speed',
        howItCounters: 'When Windranger casts Focus Fire (+475 Attack Speed), activating Blade Mail reflects the damage back, causing her to delete herself.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'mkb',
        itemName: 'Monkey King Bar (MKB)',
        cost: 4975,
        mechanicTag: 'True Strike',
        howItCounters: '80% True Strike pierces Windrun’s 100% physical evasion.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'nullifier',
        itemName: 'Nullifier',
        cost: 4375,
        mechanicTag: 'Continuous Dispel',
        howItCounters: 'Continuously dispels Windranger, stripping her Windrun evasion and movement speed buff immediately.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'halberd',
        itemName: "Heaven's Halberd",
        cost: 3550,
        mechanicTag: '5.0s Ranged Disarm',
        howItCounters: 'Disarms Windranger for 5 full seconds, completely shutting down Focus Fire.',
        priority: 'HIGH_VALUE'
      }
    ]
  },
  {
    heroId: 'huskar',
    heroName: 'Huskar / Morphling / Necrophos',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/huskar.png',
    attribute: 'Strength / Agi / Int',
    primaryRole: 'Core',
    coreVulnerability: 'High regeneration, burst healing, and lifesteal at low health thresholds (Berserker Blood, Morph Attribute Shift, Heartstopper/Death Pulse).',
    counteredByItems: [
      {
        itemId: 'spirit_vessel',
        itemName: 'Spirit Vessel',
        cost: 2980,
        mechanicTag: '45% Healing Reduction & % HP Burn',
        howItCounters: 'Cuts healing, Morphling stat shift, and Huskar Berserker Blood regen by 45% while burning 4% current HP per second.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'skadi',
        itemName: 'Eye of Skadi',
        cost: 5300,
        mechanicTag: '40% Anti-Heal on Attack',
        howItCounters: 'Pierces BKB to cut lifesteal and healing by 40% on every right click.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'shivas_guard',
        itemName: "Shiva's Guard",
        cost: 5175,
        mechanicTag: '25% Healing Reduction Aura & Armor',
        howItCounters: 'Reduces enemy healing in 1200 AoE by 25% and slows attack speed by 45.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'nullifier',
        itemName: 'Nullifier',
        cost: 4375,
        mechanicTag: 'Continuous Dispel vs Ghost Shroud',
        howItCounters: 'Instantly dispels Necrophos’s Ghost Shroud and Ethereal forms.',
        priority: 'HIGH_VALUE'
      }
    ]
  },
  {
    heroId: 'legion_commander',
    heroName: 'Legion Commander / Doom / Batrider',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/legion_commander.png',
    attribute: 'Strength',
    primaryRole: 'Offlane',
    coreVulnerability: 'Game-defining point-and-click BKB-piercing targeted spells (Duel, Doom, Flaming Lasso).',
    counteredByItems: [
      {
        itemId: 'linkens',
        itemName: "Linken's Sphere",
        cost: 4800,
        mechanicTag: 'Targeted Spellblock',
        howItCounters: 'Passively blocks Duel, Doom, and Flaming Lasso before the initiation can happen.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'lotus_orb',
        itemName: 'Lotus Orb',
        cost: 3850,
        mechanicTag: 'Echo Shell (Spell Reflection)',
        howItCounters: 'Reflects Duel or Doom back onto the caster (LC gets locked into Duel with your ally, allowing your team to counter-burst).',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'wind_waker',
        itemName: 'Wind Waker',
        cost: 6825,
        mechanicTag: 'Target Ally Cyclone Save',
        howItCounters: 'Allows cycloning an ally caught in Duel or Doom, lifting them safely into the air for 2.5s.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'aeon_disk',
        itemName: 'Aeon Disk',
        cost: 3000,
        mechanicTag: 'Combo Breaker Invulnerability',
        howItCounters: 'Automatically triggers at 70% HP, applying a strong dispel and 100% damage immunity for 2.5s.',
        priority: 'HIGH_VALUE'
      }
    ]
  },
  {
    heroId: 'phantom_lancer',
    heroName: 'Phantom Lancer / Chaos Knight / Terrorblade',
    heroAvatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_lancer.png',
    attribute: 'Agility / Strength',
    primaryRole: 'Carry',
    coreVulnerability: 'Relies on overwhelming numbers of illusions and clones that share low individual health pools and take increased damage.',
    counteredByItems: [
      {
        itemId: 'mjollnir',
        itemName: 'Maelstrom / Mjollnir',
        cost: 5600,
        mechanicTag: 'Chain Lightning & Static Shield',
        howItCounters: 'Chain lightning bounces across all illusions dealing 180 magic damage per proc, while Static Shield zaps all attacking illusions simultaneously.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'battle_fury',
        itemName: 'Battle Fury',
        cost: 4100,
        mechanicTag: 'Cleave Physical AoE',
        howItCounters: '70% Cleave damage evaporates entire packs of illusions in 2-3 swings.',
        priority: 'MUST_BUY'
      },
      {
        itemId: 'shivas_guard',
        itemName: "Shiva's Guard",
        cost: 5175,
        mechanicTag: 'Arctic Blast & Freezing Aura',
        howItCounters: '200 AoE magic damage blast slows illusion movement and reduces their attack speed by 45.',
        priority: 'HIGH_VALUE'
      },
      {
        itemId: 'crimson_guard',
        itemName: 'Crimson Guard',
        cost: 3725,
        mechanicTag: 'Team Physical Damage Block',
        howItCounters: 'Gives the entire team a physical damage block shield that neutralizes 100% of low-damage illusion hits for 12 seconds.',
        priority: 'HIGH_VALUE'
      }
    ]
  }
];

export const ITEM_TO_ITEM_COUNTERS: Record<string, { itemId: string; itemName: string; cost: number; mechanicTag: string; howItCounters: string }[]> = {
  bkb: [
    {
      itemId: 'abyssal',
      itemName: 'Abyssal Blade / Skull Basher',
      cost: 6250,
      mechanicTag: 'BKB-Piercing Stun',
      howItCounters: 'Active Overwhelm stuns for 2.0s straight through Debuff Immunity, wasting valuable BKB uptime.'
    },
    {
      itemId: 'skadi',
      itemName: 'Eye of Skadi',
      cost: 5300,
      mechanicTag: 'Piercing Slow & Anti-Heal',
      howItCounters: 'Cold Attack pierces BKB to apply a 50% move/attack slow and reduces health restoration by 40%.'
    },
    {
      itemId: 'blade_mail',
      itemName: 'Blade Mail',
      cost: 2100,
      mechanicTag: 'Pure/Physical Damage Return',
      howItCounters: 'Returns 85% of incoming physical damage directly back to the BKB user, punishing rapid attacks.'
    },
    {
      itemId: 'nullifier',
      itemName: 'Nullifier',
      cost: 4375,
      mechanicTag: 'Continuous Dispel & Slow',
      howItCounters: 'While it cannot dispel BKB itself, Nullifier continuously dispels any other defensive buffs applied alongside BKB and slows by 80% on attack.'
    }
  ],
  linkens: [
    {
      itemId: 'force_staff',
      itemName: 'Force Staff / Hurricane Pike',
      cost: 2200,
      mechanicTag: 'Cheap 800-Range Spell Pop',
      howItCounters: 'Pushes the target from 800 range to cheaply break the Spellblock shield, paving the way for lethal single-target stuns.'
    },
    {
      itemId: 'diffusal_blade',
      itemName: 'Diffusal Blade / Disperser',
      cost: 2500,
      mechanicTag: 'Instant Target Slow Pop',
      howItCounters: 'Has zero cast time; instantly consumes the Linken’s Sphere cooldown on an 8-second item cooldown.'
    },
    {
      itemId: 'euls',
      itemName: "Eul's Scepter of Divinity",
      cost: 2625,
      mechanicTag: 'Target Cyclone Pop',
      howItCounters: 'Target cast removes Linken’s Spellblock, allowing instant Hex or Duel followup.'
    },
    {
      itemId: 'orchid',
      itemName: 'Orchid Malevolence / Bloodthorn',
      cost: 3475,
      mechanicTag: 'Instant Silence Pop',
      howItCounters: 'Has zero cast point; consumes Linken’s cooldown from long range before key ultimate spells.'
    }
  ],
  butterfly: [
    {
      itemId: 'mkb',
      itemName: 'Monkey King Bar (MKB)',
      cost: 4975,
      mechanicTag: '80% True Strike',
      howItCounters: 'Grants 80% True Strike to ignore Butterfly’s 35% evasion and deals +70 bonus magical damage per proc.'
    },
    {
      itemId: 'bloodthorn',
      itemName: 'Bloodthorn',
      cost: 6800,
      mechanicTag: '100% Team True Strike',
      howItCounters: 'Soul Rend grants 100% True Strike to ALL allied attacks on the target, completely nullifying Butterfly.'
    },
    {
      itemId: 'scythe_of_vyse',
      itemName: 'Scythe of Vyse (Hex)',
      cost: 5675,
      mechanicTag: 'Hex Evasion Disable',
      howItCounters: 'Transformed into a harmless creature for 2.8 seconds with all passive evasion disabled.'
    }
  ],
  radiance: [
    {
      itemId: 'mage_slayer',
      itemName: 'Mage Slayer',
      cost: 2625,
      mechanicTag: '-35% Spell Damage Debuff',
      howItCounters: 'Attacks reduce enemy spell damage by 35%, severely crippling Radiance burn damage.'
    },
    {
      itemId: 'pipe_of_insight',
      itemName: 'Pipe of Insight',
      cost: 3725,
      mechanicTag: '400 Magic Damage Barrier',
      howItCounters: 'Grants an active 400 magic shield across all 5 allies, soaking 7+ seconds of Radiance burn.'
    },
    {
      itemId: 'mkb',
      itemName: 'Monkey King Bar (MKB)',
      cost: 4975,
      mechanicTag: 'True Strike vs Blind',
      howItCounters: 'Completely ignores the 15% miss chance aura granted by Radiance.'
    }
  ],
  blade_mail: [
    {
      itemId: 'bkb',
      itemName: 'Black King Bar (BKB)',
      cost: 4050,
      mechanicTag: 'Spell Damage Immunity',
      howItCounters: 'Completely negates magic damage return from Blade Mail while active.'
    },
    {
      itemId: 'satanic',
      itemName: 'Satanic',
      cost: 5050,
      mechanicTag: '200% Unholy Lifesteal',
      howItCounters: 'Activating Unholy Rage out-heals the 85% returned damage, keeping the core at 100% HP during combat.'
    },
    {
      itemId: 'euls',
      itemName: "Eul's Scepter / Wind Waker",
      cost: 2625,
      mechanicTag: '2.5s Cyclone Reset',
      howItCounters: 'Lifts the Blade Mail user into the air, wasting 2.5 seconds of their 4.5s return duration.'
    }
  ],
  shadow_blade: [
    {
      itemId: 'dust_of_appearance',
      itemName: 'Dust of Appearance',
      cost: 80,
      mechanicTag: 'True Sight + 20% Slow',
      howItCounters: '1050 AoE reveal that tracks and slows invisible units by 20% for 12 seconds.'
    },
    {
      itemId: 'sentry_ward',
      itemName: 'Sentry Ward',
      cost: 50,
      mechanicTag: 'Static 1000 True Sight',
      howItCounters: 'Reveals approaching invis initiators before they can land bonus damage strikes.'
    },
    {
      itemId: 'gem_of_true_sight',
      itemName: 'Gem of True Sight',
      cost: 900,
      mechanicTag: 'Permanent Mobile True Sight',
      howItCounters: 'Permanently shuts down Shadow Blade and Silver Edge roamers across the map.'
    },
    {
      itemId: 'gleipnir',
      itemName: 'Gleipnir',
      cost: 5650,
      mechanicTag: 'AoE Root + True Sight',
      howItCounters: 'AoE root catches invisible units and applies true sight for 2.0 seconds.'
    }
  ],
  ghost_scepter: [
    {
      itemId: 'nullifier',
      itemName: 'Nullifier',
      cost: 4375,
      mechanicTag: 'Continuous Dispel',
      howItCounters: 'Instantly dispels Ghost Form upon impact and continuously dispels it every 0.2s for 5 seconds.'
    },
    {
      itemId: 'diffusal_blade',
      itemName: 'Diffusal Blade',
      cost: 2500,
      mechanicTag: 'Mana Burn & Physical Root',
      howItCounters: 'Burns all support mana before they can cast defensive items, leaving them stranded.'
    },
    {
      itemId: 'dagon',
      itemName: 'Dagon',
      cost: 2850,
      mechanicTag: '+40% Magic Damage Burst',
      howItCounters: 'Ghost Scepter increases magic damage taken by 40%, turning Dagon into a catastrophic one-shot execute.'
    }
  ],
  heart: [
    {
      itemId: 'spirit_vessel',
      itemName: 'Spirit Vessel',
      cost: 2980,
      mechanicTag: '-45% Health Regen & Lifesteal',
      howItCounters: 'Reduces Heart’s out-of-combat regeneration and max health restore by 45% while dealing percentage damage.'
    },
    {
      itemId: 'skadi',
      itemName: 'Eye of Skadi',
      cost: 5300,
      mechanicTag: '-40% Heal Reduction',
      howItCounters: 'Pierces BKB to cut all healing, regeneration, and lifesteal by 40%.'
    },
    {
      itemId: 'shivas_guard',
      itemName: "Shiva's Guard",
      cost: 5175,
      mechanicTag: 'Freezing Aura -25% Healing',
      howItCounters: 'Passively reduces all health restoration and regen of nearby tanks by 25%.'
    }
  ],
  orchid: [
    {
      itemId: 'manta_style',
      itemName: 'Manta Style',
      cost: 4600,
      mechanicTag: 'Instant Basic Dispel',
      howItCounters: 'Instantly cleanses Soul Burn silence on activation, disjoints projectiles, and summons 2 illusions.'
    },
    {
      itemId: 'lotus_orb',
      itemName: 'Lotus Orb',
      cost: 3850,
      mechanicTag: 'Basic Dispel & Spell Echo',
      howItCounters: 'Dispels silence and reflects Orchid back onto the caster.'
    },
    {
      itemId: 'euls',
      itemName: "Eul's Scepter of Divinity",
      cost: 2625,
      mechanicTag: 'Self-Cyclone Dispel',
      howItCounters: 'Lifts yourself into invulnerability, purging Orchid silence on landing.'
    },
    {
      itemId: 'bkb',
      itemName: 'Black King Bar (BKB)',
      cost: 4050,
      mechanicTag: 'Debuff Immunity Dispel',
      howItCounters: 'Dispels active silence and prevents further disables during Avatar.'
    }
  ],
  aeon_disk: [
    {
      itemId: 'nullifier',
      itemName: 'Nullifier',
      cost: 4375,
      mechanicTag: 'Instant Combo Breaker Dispel',
      howItCounters: 'Nullifier projectile continuously dispels Combo Breaker invulnerability and status resistance as soon as it triggers.'
    }
  ]
};
