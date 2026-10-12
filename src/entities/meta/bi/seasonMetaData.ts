import { MetaSeasonData } from './types';

export const SEASON_META_DATA: MetaSeasonData = {
  seasonTitle: 'Season 2024-2025 Meta Landscape',
  patchVersion: 'Patch 7.37d',
  lastUpdated: 'Current Patch Analysis',
  metaSummary: 'The current season is defined by high-tempo objective brawling, the absolute dominance of Universal hero scaling, critical Facet choices that redefine hero kits, and 20-minute Tormentor/Roshan map control. AFK 40-minute farming carries have fallen behind aggressive tempo cores who can participate in early skirmishes with a single 15-minute item spike.',
  
  themes: [
    {
      title: 'Universal Heroes & Stat Dominance',
      badge: 'Stat Scaling',
      description: 'Universal heroes continue to rule high-tier brackets due to damage scaling from all attribute items (Dragon Lance, Disperser, Gleipnir, Manta). They dominate laning trades and transition effortlessly from utility to hyper-carries.',
      keyHeroes: ['Windranger', 'Mirana', 'Dark Willow', 'Enigma'],
      tacticalAdvice: 'Prioritize building versatile stat items rather than pure damage. A Bracer or Wraith Band provides unmatched cost-to-damage ratio on Universal cores.'
    },
    {
      title: 'Facet & Innate Synergy Dictates Viability',
      badge: 'Facets Impact',
      description: 'The difference between an S-tier and a C-tier hero in 7.37d often comes down to a single game-breaking Facet that fixes a historical hero weakness or enables a brand-new playstyle.',
      keyHeroes: ['Axe (One Man Army)', 'Windranger (Whirlwind/Tailwind)', 'Sven (Heavy Plate)', 'Witch Doctor (Cleft Death)'],
      tacticalAdvice: 'Always inspect enemy facets during strategy time. An Axe with One Man Army requires you to group on him, while Tailwind Windranger dictates positioning in lane.'
    },
    {
      title: 'The 20-Minute Tormentor & Aura Pivot',
      badge: 'Macro Timing',
      description: 'Matches are frequently decided between minutes 18 and 24 around the Tormentor spawn and Roshan pit. Teams with defensive auras (Crimson Guard, Pipe) and AoE lockdown inevitably crush uncoordinated greedy teams.',
      keyHeroes: ['Sven', 'Legion Commander', 'Axe', 'Witch Doctor'],
      tacticalAdvice: 'Do not stay isolated in jungle past minute 18. Consolidate around your offlaner, secure your team’s Tormentor Shard immediately, and force enemy tier-2 towers.'
    },
    {
      title: 'Gleipnir & Disperser Supremacy',
      badge: 'Item Meta',
      description: 'Gleipnir remains the most drafted mid-game core item across carries and midlaners, offering 2.0s AoE rooting, wave push, and lightning burst in a single slot.',
      keyHeroes: ['Windranger', 'Mirana', 'Storm Spirit', 'Drow Ranger'],
      tacticalAdvice: 'Every core should assess if they can incorporate Maelstrom into Gleipnir. The AoE root counters mobile elusive heroes before they finish BKB.'
    }
  ],

  heroes: [
    // -------------------------------------------------------------
    // WINDRANGER (S+ Tier)
    // -------------------------------------------------------------
    {
      heroId: 'windranger',
      name: 'Windranger',
      title: 'Lyralei the Windranger',
      attribute: 'all',
      roles: ['Carry', 'Mid', 'Offlane'],
      primaryRole: 'Carry',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/windrunner.png',
      tier: 'S+',
      winRate: 53.8,
      pickRate: 22.4,
      banRate: 31.2,
      trend: '+3.1%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'The premier Universal flex pick of the season with game-breaking movement speed and single-target deletion.',
        coreReasons: [
          'Universal attribute scaling allows her to build defensive stat items (Dragon Lance, Manta, Disperser) while still achieving astronomically high right-click DPS.',
          'Whirlwind facet gives her multi-target Focus Fire, turning her from a pure pickoff assassin into an unmatched 5v5 teamfight decimer.',
          'Tailwind facet grants an absurd haste aura that boosts entire team rotation speeds for early runes and Tormentor secures.',
          'Windrun gives 100% physical evasion and unslowable max movement speed, making her nearly unkillable without Nullifier or True Strike.'
        ],
        facetSynergy: {
          facetName: 'Whirlwind / Tailwind',
          description: 'Whirlwind fires Focus Fire arrows at all nearby enemy targets; Tailwind grants +15% move speed aura to nearby allies during Windrun.',
          metaImpact: 'Solves her historical weakness of being solely single-target. In teamfights she melts supports while simultaneously whittling down frontlane tanks.'
        },
        innateFactor: {
          innateName: 'Easy Breezy',
          description: 'Windranger has a maximum movement speed limit of 600 instead of 550, and movement slows are 25% less effective against her.'
        },
        timingSpikes: [
          { timing: '13-15 min', item: 'Maelstrom + Dragon Lance', impact: 'Accelerates farm across multiple camps and gives safe attack range.' },
          { timing: '20-22 min', item: 'Gleipnir', impact: 'Enables 100-to-0 solo pickoffs with AoE root into Focus Fire.' },
          { timing: '28-30 min', item: 'BKB + Daedalus / Aghanim', impact: 'Full immunity to magic disables; unstoppable teamfight carry.' }
        ],
        bestWith: ['Centaur Warrunner', 'Shadow Demon', 'Grimstroke', 'Tusk'],
        counteredBy: ['Axe (Call ignores evasion)', 'Bloodseeker (Rupture stops Windrun)', 'Mars (Arena catches her)', 'Nullifier / MKB carriers'],
        proTip: 'In lane, spam Powershot on both the ranged creep and enemy heroes simultaneously. Rush Boots of Speed to abuse your 600 max speed cap.'
      }
    },

    // -------------------------------------------------------------
    // SVEN (S+ Tier)
    // -------------------------------------------------------------
    {
      heroId: 'sven',
      name: 'Sven',
      title: 'The Rogue Knight',
      attribute: 'str',
      roles: ['Carry', 'Offlane', 'Soft Support'],
      primaryRole: 'Carry',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sven.png',
      tier: 'S+',
      winRate: 53.1,
      pickRate: 17.6,
      banRate: 19.8,
      trend: '+2.4%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'Dominating both Safe Lane and Support flex roles due to ridiculous Warcry defensive barriers and flash-farming.',
        coreReasons: [
          'Heavy Plate facet grants passive bonus armor based on strength, making him virtually immune to physical harassment in lane.',
          'Warcry provides a colossal 400+ physical damage barrier and movement speed boost to your entire team, neutralizing physical burst comps.',
          'God’s Strength + Great Cleave lets him vacuum up ancient stacks at minute 12 and reach 3-slotted power by minute 22.',
          'Can be flexed into Position 4 / 5 Support with Solar Crest + Aghanim’s Scepter, confusing enemy draft counters completely.'
        ],
        facetSynergy: {
          facetName: 'Heavy Plate / Vanquisher',
          description: 'Heavy Plate gives bonus armor scaling; Vanquisher increases attack damage against stunned targets by 15%.',
          metaImpact: 'Heavy Plate allows Sven to win lane trades against aggressive offlaners, while Vanquisher synergizes with Storm Hammer for instant burst.'
        },
        innateFactor: {
          innateName: 'Vanquisher',
          description: 'Deals 15% extra bonus attack damage to enemies that are stunned or disabled.'
        },
        timingSpikes: [
          { timing: '12-14 min', item: 'Mask of Madness + Echo Sabre', impact: 'Clears ancient stacks in 10 seconds; reaches exponential farm curve.' },
          { timing: '20-22 min', item: 'BKB + Blink Dagger', impact: 'Initiates 5v5 teamfights and deletes backline supports in two swings.' },
          { timing: '27-30 min', item: 'Aghanim’s Shard + Daedalus', impact: 'Massive AoE crits and unslowable Warcry for entire squad.' }
        ],
        bestWith: ['Magnus', 'Enigma', 'Vengeful Spirit', 'Crystal Maiden'],
        counteredBy: ['Terrorblade (Sunder + Reflection)', 'Razor (Static Link steals God’s Strength)', 'Necrophos (Reaper’s Scythe)', 'Pugna (Decrepify)'],
        proTip: 'Do not activate God’s Strength just to farm single creep waves. Save it for ancient stacks or immediate tower dives with your supports.'
      }
    },

    // -------------------------------------------------------------
    // AXE (S Tier)
    // -------------------------------------------------------------
    {
      heroId: 'axe',
      name: 'Axe',
      title: 'Mogul Khan the Axe',
      attribute: 'str',
      roles: ['Offlane'],
      primaryRole: 'Offlane',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png',
      tier: 'S',
      winRate: 52.8,
      pickRate: 19.5,
      banRate: 25.1,
      trend: '+1.8%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'The premier anti-carry offlaner whose One Man Army facet turns him into an impenetrable mountain of strength.',
        coreReasons: [
          'One Man Army facet gives Axe colossal bonus strength (+50% of armor as strength) whenever he is isolated from allies, making him a solo lane god.',
          'Berserker’s Call is the most reliable BKB-piercing disable in the game, completely shutting down meta agility and universal right-clickers.',
          'Counter Helix deals pure damage, completely bypassing high-armor heroes like Sven, Terrorblade, and Morphling.',
          'Culling Blade kill threshold ensures instant resets and team-wide haste buffs to snowball teamfights.'
        ],
        facetSynergy: {
          facetName: 'One Man Army',
          description: 'Axe gains bonus strength equal to 50% of his current armor as long as no friendly heroes are within 600 radius.',
          metaImpact: 'Makes Axe virtually un-gankable while cutting creep waves behind enemy tier-1 and tier-2 towers. He hits 3500 HP by minute 18.'
        },
        innateFactor: {
          innateName: 'Coat of Blood',
          description: 'Axe permanently gains +1 armor each time he kills an enemy hero with Culling Blade.'
        },
        timingSpikes: [
          { timing: '9-11 min', item: 'Vanguard / Blade Mail', impact: 'Allows him to comfortably cut waves and dive enemy safelaner under tower.' },
          { timing: '14-16 min', item: 'Blink Dagger', impact: 'Unlocks map-wide threat; any carry showing on lane is dead on arrival.' },
          { timing: '24-26 min', item: 'Aghanim’s Scepter + BKB', impact: 'Call applies Battle Hunger, reduces enemy attack damage by 30%, and lowers Call CD.' }
        ],
        bestWith: ['Invoker (Cataclysm)', 'Witch Doctor (Death Ward during Call)', 'Dazzle (Grave saves)', 'Zeus'],
        counteredBy: ['Timbersaw (Pure damage cuts Axe down)', 'Ursa (Fury Swipes out-damages Call)', 'Venomancer (Constant slows)', 'Eul’s / Wind Waker'],
        proTip: 'When cutting waves between towers, stay slightly away from your creep wave and allied support to maintain your One Man Army strength boost.'
      }
    },

    // -------------------------------------------------------------
    // LEGION COMMANDER (S Tier)
    // -------------------------------------------------------------
    {
      heroId: 'legion_commander',
      name: 'Legion Commander',
      title: 'Tresdin the Legion Commander',
      attribute: 'str',
      roles: ['Offlane'],
      primaryRole: 'Offlane',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/legion_commander.png',
      tier: 'S',
      winRate: 52.4,
      pickRate: 18.1,
      banRate: 22.0,
      trend: '+1.5%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'Endless scaling through Duel damage and immense anti-illusion waveclear make her the premier lockdown offlaner.',
        coreReasons: [
          'Stonehall Plate facet gives her a stacking physical barrier from Overwhelming Odds, letting her trade blows with any carry in lane.',
          'Press the Attack provides a strong dispel, removing stuns, silences, and slows from herself or key allied carries.',
          'Duel pierces BKB and locks elusive meta heroes (Windranger, Storm Spirit, Anti-Mage, Puck) in place with zero counterplay.',
          'Scales infinitely into late game. By minute 30, she often possesses +150 Duel damage, rivaling Pos 1 carries in physical burst.'
        ],
        facetSynergy: {
          facetName: 'Stonehall Plate',
          description: 'Overwhelming Odds grants an all-damage barrier equal to 50% of the damage dealt to heroes and 20% to creeps.',
          metaImpact: 'Turns Overwhelming Odds into both an offensive harass tool and a massive 500-HP defensive shield before jumping into Duel.'
        },
        innateFactor: {
          innateName: 'Outfight Them!',
          description: 'Legion Commander heals for 50% of her damage dealt whenever she attacks an enemy hero who is higher level than her.'
        },
        timingSpikes: [
          { timing: '10-12 min', item: 'Phase Boots + Blade Mail', impact: 'Ready to win first Duels with allied support burst.' },
          { timing: '15-17 min', item: 'Blink Dagger', impact: 'Instant initiation onto squishy mid or support heroes out of position.' },
          { timing: '24-26 min', item: 'BKB + Aghanim’s Shard', impact: 'Debuff immunity during Duel prevents enemy team from counter-disabling.' }
        ],
        bestWith: ['Skywrath Mage (Mystic Flare)', 'Invoker (Sun Strike)', 'Lion (Finger of Death)', 'Ancient Apparition'],
        counteredBy: ['Dazzle (Shallow Grave prevents Duel win)', 'Shadow Demon (Disruption saves Duel target)', 'Winter Wyvern (Cold Embrace)', 'Linken’s Sphere'],
        proTip: 'Cast Press the Attack on yourself BEFORE blinking into Duel to ensure maximum attack speed and HP regen during the combat.'
      }
    },

    // -------------------------------------------------------------
    // WITCH DOCTOR (S Tier)
    // -------------------------------------------------------------
    {
      heroId: 'witch_doctor',
      name: 'Witch Doctor',
      title: 'Zharvakko the Witch Doctor',
      attribute: 'int',
      roles: ['Hard Support', 'Soft Support'],
      primaryRole: 'Hard Support',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/witch_doctor.png',
      tier: 'S',
      winRate: 53.4,
      pickRate: 24.8,
      banRate: 18.5,
      trend: '+1.9%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'Highest win-rate support in the game; Maledict and pure damage Death Ward single-handedly decide teamfights.',
        coreReasons: [
          'Voodoo Fester facet converts his heal into an offensive damaging aura, bullying enemy offlaners out of experience range in lane.',
          'Maledict percent-based burst melts high-health meta strength heroes (Axe, Sven, Centaur, Pudge) with ease.',
          'Death Ward deals pure damage and bounces with Aghanim’s Scepter, capable of wiping 5 heroes in 4 seconds.',
          'Aghanim’s Shard (Voodoo Switcheroo) grants complete invulnerability for 2 seconds while continuing to fire Death Ward attacks.'
        ],
        facetSynergy: {
          facetName: 'Headhunter / Voodoo Fester',
          description: 'Headhunter increases Paralyzing Cask damage per bounce; Voodoo Fester turns restoration into enemy health drain.',
          metaImpact: 'Enables unprecedented early lane aggression. Enemy safelaners cannot contest last hits without dying to Cask + Maledict.'
        },
        innateFactor: {
          innateName: 'Gris-Gris',
          description: 'Witch Doctor carries a Gris-Gris talisman that restores lost gold on death and grants passive gold over time.'
        },
        timingSpikes: [
          { timing: '15 min', item: 'Aghanim’s Shard (Switcheroo)', impact: 'Gives him a self-save that dodges ganks and counter-kills diving carries.' },
          { timing: '20-22 min', item: 'Glimmer Cape + Blink / Force', impact: 'Safe channel positioning during chaotic mid-game teamfights.' },
          { timing: '28-32 min', item: 'Aghanim’s Scepter', impact: 'Bouncing pure damage Death Ward pierces BKB and wins the game.' }
        ],
        bestWith: ['Faceless Void (Chrono + Ward)', 'Axe (Call + Maledict)', 'Slardar', 'Mars'],
        counteredBy: ['Silencer (Global Silence cancels Ward)', 'Rubick (Steals Death Ward)', 'Spirit Breaker (Charge interrupts channel)', 'Lotus Orb / BKB'],
        proTip: 'Do not channel Death Ward out in the open. Always cast it from behind high ground trees or while invisible under Glimmer Cape.'
      }
    },

    // -------------------------------------------------------------
    // STORM SPIRIT (S Tier)
    // -------------------------------------------------------------
    {
      heroId: 'storm_spirit',
      name: 'Storm Spirit',
      title: 'Raijin Thunderkeg the Storm Spirit',
      attribute: 'int',
      roles: ['Mid'],
      primaryRole: 'Mid',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png',
      tier: 'S',
      winRate: 52.2,
      pickRate: 15.2,
      banRate: 20.4,
      trend: '+1.6%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'Hyper-tempo midlaner who punishes uncoordinated map movements and dominates the high-ground defense meta.',
        coreReasons: [
          'Shocking Arrival facet grants bonus burst damage upon zip arrival, accelerating his mid-game pickoff thresholds significantly.',
          'Static Slide facet allows remnant placement while zipping, granting wave-clear without stopping his momentum.',
          'Orchid timing around minute 13-15 completely locks down enemy supports and squishy carries across the entire map.',
          'Kaya and Sange / Bloodstone sustain rework enables him to zip in and out of 5v5 teamfights repeatedly.'
        ],
        facetSynergy: {
          facetName: 'Shocking Arrival / Static Slide',
          description: 'Shocking Arrival deals damage in an area where Storm arrives based on distance traveled.',
          metaImpact: 'Amplifies his long-distance assassination capability. He can one-shot squishy supports before they can press Glimmer or Ghost.'
        },
        innateFactor: {
          innateName: 'Galvanized',
          description: 'Storm Spirit permanently gains mana regen whenever an enemy hero dies within 1200 radius.'
        },
        timingSpikes: [
          { timing: '13-15 min', item: 'Witch Blade / Orchid Malevolence', impact: 'Deletes isolated enemy heroes anywhere on the map.' },
          { timing: '20-22 min', item: 'Kaya and Sange / BKB', impact: 'Immunity to instant silences and counter-stuns in teamfights.' },
          { timing: '28-30 min', item: 'Aghanim’s Scepter (Black Hole Vortex)', impact: 'AoE Electric Vortex pulls 3-5 enemies together through BKB with Shard.' }
        ],
        bestWith: ['Lifestealer (Infest bomb)', 'Spectre', 'Spirit Breaker', 'Lion'],
        counteredBy: ['Anti-Mage (Mana Void nukes his team)', 'Silencer (Global Silence)', 'Doom (Instant Doom disables Zip)', 'Nyx Assassin (Mana Burn / Carapace)'],
        proTip: 'Bottle rune control at 6 and 8 minutes is crucial. Use Remnant to push the wave at :45 to secure active runes every single time.'
      }
    },

    // -------------------------------------------------------------
    // LION (A Tier)
    // -------------------------------------------------------------
    {
      heroId: 'lion',
      name: 'Lion',
      title: 'The Demon Witch',
      attribute: 'int',
      roles: ['Soft Support', 'Hard Support'],
      primaryRole: 'Soft Support',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lion.png',
      tier: 'A',
      winRate: 51.7,
      pickRate: 23.5,
      banRate: 14.2,
      trend: '+0.8%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'Instant disable king with infinite lane mana sustain and scaling Finger of Death burst.',
        coreReasons: [
          'Hex is an instant 0-cast-point disable, providing the cleanest counter to elusive meta threats like Windranger, AM, and Puck.',
          'Mana Drain now drains movement speed and grants an ally mana or Lion a magic barrier with Shard.',
          'Finger of Death gains +40 damage per kill, turning Lion into a lethal nuker by the 30-minute mark.',
          'Fist of Death facet gives melee physical cleaving burst for aggressive position 4 play.'
        ],
        facetSynergy: {
          facetName: 'Essence Drain / Fist of Death',
          description: 'Essence Drain allows multi-target mana draining and grants magic damage barrier.',
          metaImpact: 'Completely starves enemy strength and agility cores of mana in lane, leaving them unable to cast their defensive escapes.'
        },
        innateFactor: {
          innateName: 'To Hell and Back',
          description: 'Upon respawning, Lion gains 20% increased spell amplification for 90 seconds.'
        },
        timingSpikes: [
          { timing: '12-14 min', item: 'Tranquil Boots + Blink Dagger', impact: 'Instant Blink-Hex enables effortless pickoffs with midlaner.' },
          { timing: '20-22 min', item: 'Aghanim’s Shard + Glimmer', impact: 'Provides magic immunity and multi-target drain during pushes.' },
          { timing: '28-32 min', item: 'Aghanim’s Scepter + Aeon Disk', impact: 'AoE Finger of Death on 40s cooldown wipes creep waves and chunks teams.' }
        ],
        bestWith: ['Legion Commander', 'Ursa', 'Juggernaut', 'Sven'],
        counteredBy: ['Rubick (Steals stuns and Finger)', 'Tidehunter (Kraken Shell dispels stuns)', 'Lotus Orb', 'BKB rushes'],
        proTip: 'Never initiate with Earth Spike when Hex is off cooldown. Always Hex first because it is instant and cannot be dodged or reacted to.'
      }
    },

    // -------------------------------------------------------------
    // ANTI-MAGE (A Tier)
    // -------------------------------------------------------------
    {
      heroId: 'anti_mage',
      name: 'Anti-Mage',
      title: 'The Anti-Mage',
      attribute: 'agi',
      roles: ['Carry'],
      primaryRole: 'Carry',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png',
      tier: 'A',
      winRate: 51.4,
      pickRate: 14.8,
      banRate: 17.1,
      trend: '+1.1%',
      trendDirection: 'up',
      whyMeta: {
        headline: 'The premier late-game split pusher and the definitive answer to heavy Intelligence/Storm/Zeus drafts.',
        coreReasons: [
          'Magebane’s Mirror facet reflects enemy single-target spells back with amplified damage, punishing targeted lockdown drafts.',
          'Blink hyper-mobility allows him to farm the entire enemy triangle while remaining completely safe from uncoordinated smoke ganks.',
          'Mana Break shreds enemy mana pools, completely neutralizing heroes like Medusa, Storm Spirit, Leshrac, and Timbersaw.',
          'Manta Style + Battle Fury timing around 20 minutes creates intolerable split-push pressure that forces enemies to break their 5-man deathballs.'
        ],
        facetSynergy: {
          facetName: "Magebane's Mirror",
          description: 'Counterspell reflects spells back with +20% damage amplification and increased reflect window.',
          metaImpact: 'Turns spells like Doom, Finger of Death, and Laguna Blade into self-inflicted suicide for enemy casters.'
        },
        innateFactor: {
          innateName: 'Peremptory Counter',
          description: 'Passively grants Anti-Mage +15% magic resistance that scales with his Agility attribute.'
        },
        timingSpikes: [
          { timing: '13-15 min', item: 'Battle Fury', impact: 'Farming accelerator: cleaves jungle camps and waves in 2 hits.' },
          { timing: '20-22 min', item: 'Manta Style', impact: 'Illusion triple-mana-break and instant basic dispel for silences/dust.' },
          { timing: '26-28 min', item: 'BKB + Basher / Skadi', impact: 'Becomes unstoppable in teamfights; jumps backline and deletes supports.' }
        ],
        bestWith: ['Crystal Maiden', 'Grimstroke', 'Magnus', 'Centaur'],
        counteredBy: ['Legion Commander (Duel)', 'Axe (Call ignores Counterspell)', 'Slardar (Corrosive Haze)', 'Meepo / Bloodseeker'],
        proTip: 'If your lane is contested by aggressive offlaners, immediately purchase Cornucopia and retreat to the side jungle camps at minute 6.'
      }
    },

    // -------------------------------------------------------------
    // FACELESS VOID (A Tier)
    // -------------------------------------------------------------
    {
      heroId: 'faceless_void',
      name: 'Faceless Void',
      title: 'Darkterror the Faceless Void',
      attribute: 'agi',
      roles: ['Carry'],
      primaryRole: 'Carry',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/faceless_void.png',
      tier: 'A',
      winRate: 51.0,
      pickRate: 16.3,
      banRate: 15.8,
      trend: '+0.5%',
      trendDirection: 'stable',
      whyMeta: {
        headline: 'The ultimate insurance policy carry whose Chronosphere turns chaotic 5v5 teamfights into guaranteed cleanups.',
        coreReasons: [
          'Chronosphere is the most absolute teamfight control ultimate in Dota, piercing all debuff immunity and freezing enemy brawlers.',
          'Time Dilation freezes cooldowns of enemy heroes, crippling spam-heavy meta heroes (Windranger, Bristleback, Zeus).',
          'Time Walk backtracks 100% of damage taken in the last 2 seconds, countering burst damage combinations.',
          'Temporal Impunity facet grants complete damage negation for 1s after Time Walk, making him immune to instant chain stuns.'
        ],
        facetSynergy: {
          facetName: 'Temporal Impunity / Chrono Sphere Range',
          description: 'Temporal Impunity grants 100% damage reduction for 1.2s upon landing Time Walk.',
          metaImpact: 'Allows Void to aggressively Time Walk into enemy lines without fear of getting bursted down before casting Chrono.'
        },
        innateFactor: {
          innateName: 'Distortion Field',
          description: 'Slows the attack projectile speeds of enemies firing at Faceless Void by 35%.'
        },
        timingSpikes: [
          { timing: '13-15 min', item: 'Maelstrom + Power Treads', impact: 'Sustains competitive farm rate and adds lightning procs to Chrono.' },
          { timing: '21-23 min', item: 'Manta Style / BKB', impact: 'Guarantees uninterrupted Chrono execution against enemy saves.' },
          { timing: '28-30 min', item: 'Mjollnir + Eye of Skadi', impact: 'Can kill 2-3 heroes inside a single 4.5s Chronosphere.' }
        ],
        bestWith: ['Invoker (Cataclysm in Chrono)', 'Witch Doctor (Death Ward)', 'Snapfire (Mortimer Kisses)', 'Jakiro'],
        counteredBy: ['Shadow Demon (Disruption saves trapped ally)', 'Pudge (Hook pulls ally out of Chrono)', 'Wraith King (Reincarnation)', 'Aeon Disk'],
        proTip: 'Do not aim to catch all 5 enemies in Chrono. Catching the enemy carry or the key defensive support (like Dazzle or SD) guarantees the teamfight win.'
      }
    },

    // -------------------------------------------------------------
    // PHANTOM ASSASSIN (A Tier)
    // -------------------------------------------------------------
    {
      heroId: 'phantom_assassin',
      name: 'Phantom Assassin',
      title: 'Mortred the Phantom Assassin',
      attribute: 'agi',
      roles: ['Carry'],
      primaryRole: 'Carry',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png',
      tier: 'A',
      winRate: 50.8,
      pickRate: 18.2,
      banRate: 16.5,
      trend: '+0.4%',
      trendDirection: 'stable',
      whyMeta: {
        headline: 'Unmatched physical burst that forces enemy teams to alter their entire itemization around defensive saves and True Strike.',
        coreReasons: [
          'Methodical facet replaces random critical strikes with guaranteed crits every 6 hits, removing RNG and allowing precise damage execution.',
          'Blur passive evasion gives 50% physical evasion, while active makes her untargetable on the minimap for sneaky Roshan attempts.',
          'Stifling Dagger enables safe farming against difficult offlane matchups and applies attack modifiers from 1200 range.',
          'Desolator + BKB timing allows her to assassinate enemy supports in 1-2 hits before they can react.'
        ],
        facetSynergy: {
          facetName: 'Methodical / Veiled Secret',
          description: 'Methodical guarantees Coup de Grace crits after 6 attack/dagger hits with increased crit multiplier.',
          metaImpact: 'Players can prime 4 hits on a creep wave, then Phantom Strike onto the enemy carry for an instant double-crit delete.'
        },
        innateFactor: {
          innateName: 'Immaterial',
          description: 'Passively gains evasion that starts at 15% and increases by 1.5% with every hero level up to 60%.'
        },
        timingSpikes: [
          { timing: '13-15 min', item: 'Battle Fury', impact: 'Clears waves with Dagger and jumps between camps rapidly.' },
          { timing: '19-21 min', item: 'Desolator + BKB', impact: 'Prime kill window: one-shots backline casters under BKB.' },
          { timing: '28-30 min', item: 'Nullifier / Satanic', impact: 'Nullifies Ghost Scepters and restores full HP with 200% lifesteal.' }
        ],
        bestWith: ['Magnus (Cleave & RP)', 'Slardar (Minus Armor)', 'Vengeful Spirit', 'Ogre Magi (Bloodlust)'],
        counteredBy: ['Axe (Berserker’s Call + Blade Mail)', 'Monkey King Bar rushers', 'Ghost Scepter / Force Staff', 'Silver Edge (Break)'],
        proTip: 'Always buy Nullifier as your 4th item when against supports with Ghost Scepter, Glimmer Cape, or Force Staff. It renders their defenses useless.'
      }
    },

    // -------------------------------------------------------------
    // DROW RANGER (A Tier)
    // -------------------------------------------------------------
    {
      heroId: 'drow_ranger',
      name: 'Drow Ranger',
      title: 'Traxex the Drow Ranger',
      attribute: 'agi',
      roles: ['Carry'],
      primaryRole: 'Carry',
      avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/drow_ranger.png',
      tier: 'A',
      winRate: 50.9,
      pickRate: 15.1,
      banRate: 12.4,
      trend: '+0.6%',
      trendDirection: 'stable',
      whyMeta: {
        headline: 'The premier tank-shredder whose Marksmanship base armor piercing dismantles high-armor strength meta cores.',
        coreReasons: [
          'Marksmanship procs pierce 100% of enemy base armor, melting meta tanks like Sven, Axe, Dragon Knight, and Terrorblade.',
          'Vantage Point facet provides bonus damage when attacking from elevated high ground, making base defense nearly impossible to breach.',
          'Multishot provides massive wave-clear and applies Frost Arrows slow from immense distance.',
          'Gust silences and knocks back diving heroes, providing self-peel against melee initiators.'
        ],
        facetSynergy: {
          facetName: 'Vantage Point / Sidestep',
          description: 'Vantage Point gives +20% bonus damage from high ground; Sidestep allows movement during Multishot.',
          metaImpact: 'Vantage Point makes sieging against Drow suicidal, while Sidestep fixes her vulnerability during Multishot channeling.'
        },
        innateFactor: {
          innateName: 'Precision Aura',
          description: 'Passively grants bonus Agility to Drow Ranger and all allied ranged heroes based on Drow’s current Agility.'
        },
        timingSpikes: [
          { timing: '12-14 min', item: 'Dragon Lance + Power Treads', impact: 'Safe attack range to dominate mid-lane towers.' },
          { timing: '18-20 min', item: 'Yasha / Manta Style + Shard', impact: 'Hypothermia stacks reduce enemy healing by 10% per stack.' },
          { timing: '25-28 min', item: 'Hurricane Pike + Butterfly / BKB', impact: 'High agility stats shred through Roshan and enemy tanks.' }
        ],
        bestWith: ['Vengeful Spirit', 'Clockwerk (Cogs block gap-closers)', 'Treant Protector', 'Tidehunter'],
        counteredBy: ['Phantom Assassin (Jumps directly onto Drow)', 'Spectre (Haunt ignores positioning)', 'Axe (Blink Call)', 'Halberd (Disarm)'],
        proTip: 'Stand on cliff wards or elevated terrain during Roshan and Tormentor fights to trigger Vantage Point’s +20% damage amplification.'
      }
    }
  ]
};
