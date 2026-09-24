import { PatchNoteData } from '../types/patch';

export const PATCH_NOTES_DATA: PatchNoteData[] = [
  // ==============================================================
  // PATCH 7.37d (LATEST)
  // ==============================================================
  {
    version: '7.37d',
    isLatest: true,
    releaseDate: 'October 2024',
    title: 'Post-International Balance & Hero Bug Fixes',
    overview: 'Patch 7.37d addresses post-TI tournament dominance by toning down overtuned Universal flex carries, adjusting defensive armor barriers, and squashing persistent gameplay and Facet bugs across key heroes.',
    highlights: [
      'Universal Hero attribute damage per stat point slightly reduced from 0.7 to 0.65.',
      'Tormentor shield regeneration rate adjusted to prevent 20-minute trivialization by solo illusion cores.',
      'Critical bugfixes for Facet interactions (Windranger Whirlwind, Sven Heavy Plate, Witch Doctor Switcheroo).',
      'Neutral Item Tier 3 and 4 rebalancing: Paladin Sword and Mind Breaker adjusted.'
    ],
    systemChanges: [
      {
        category: 'Attributes',
        title: 'Universal Attribute Scaling',
        changes: [
          'Damage per point of each attribute reduced from 0.7 to 0.65.',
          'Base health regeneration on all Universal heroes normalized to 0.5 HP/sec.'
        ],
        impact: 'Slightly reduces the runaway right-click damage of heroes like Windranger and Mirana when stacking stat items like Dragon Lance and Disperser.'
      },
      {
        category: 'Map & Objectives',
        title: 'Tormentor & Wisdom Runes',
        changes: [
          'Tormentor initial shield reflection increased from 70% to 80% to discourage single-hero soloing without support help.',
          'Wisdom Rune experience granted to the lowest-level hero increased by 10%.'
        ],
        impact: 'Forces teams to gather at minute 20 as a unit to secure Shards, increasing early teamfight frequency.'
      },
      {
        category: 'Items',
        title: 'Gleipnir & Solar Crest',
        changes: [
          'Gleipnir recipe cost increased from 450 to 650 (total cost 5650).',
          'Solar Crest active barrier duration reduced from 8s to 6s.'
        ],
        impact: 'Delays the peak timing of Gleipnir by approximately 1 minute, giving defensive supports more breathing room.'
      }
    ],
    heroChanges: [
      // Windranger
      {
        heroId: 'windranger',
        heroName: 'Windranger',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/windrunner.png',
        primaryRole: 'Carry',
        changeType: 'nerf',
        category: 'facet',
        targetName: 'Whirlwind (Facet) & Powershot',
        summary: 'Reduced Whirlwind search radius and increased Powershot mana cost.',
        details: [
          'Whirlwind Facet: Target acquisition search radius reduced from 1200 to 1050.',
          'Powershot: Mana cost rescaled from 90/100/110/120 to 100/110/120/130.',
          'Windrun: Tailwind Facet ally bonus movement speed reduced from 15% to 12%.'
        ],
        bugfixContext: 'Fixed an issue where Focus Fire under Whirlwind would occasionally stop firing if a target entered and quickly exited fog of war.',
        metaImpact: 'Windranger remains S-Tier due to her raw mobility and Universal damage, but her teamfight multi-target reach is now slightly more reasonable.',
        verdict: 'Targeted Nerf & Bug Fix'
      },

      // Sven
      {
        heroId: 'sven',
        heroName: 'Sven',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sven.png',
        primaryRole: 'Carry',
        changeType: 'fix',
        category: 'facet',
        targetName: 'Heavy Plate (Facet) & Warcry',
        summary: 'Fixed stacking armor calculation and adjusted Warcry early barrier numbers.',
        details: [
          'Heavy Plate Facet: Fixed a bug where bonus armor was calculating before temporary strength buffs expired, granting permanent unintended armor.',
          'Warcry: Physical damage barrier reduced from 180/300/420/540 to 160/280/400/520.',
          'Storm Hammer: Stun duration increased from 1.25/1.5/1.75/2.0s to 1.4/1.6/1.8/2.0s.'
        ],
        bugfixContext: 'Heavy Plate now strictly updates dynamically with strength changes rather than snapshotting on level-up.',
        metaImpact: 'Fixes the unkillable raid-boss bug in early lane while giving him better early setup with longer low-level Storm Hammer stuns.',
        verdict: 'Bugfix & Lane Rebalance'
      },

      // Axe
      {
        heroId: 'axe',
        heroName: 'Axe',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png',
        primaryRole: 'Offlane',
        changeType: 'fix',
        category: 'facet',
        targetName: 'One Man Army (Facet) & Counter Helix',
        summary: 'Fixed One Man Army ally detection radius and resolved double Helix bug.',
        details: [
          'One Man Army Facet: Ally hero check radius strictly fixed at 600 units (previously ignored cloned units and meepo clones).',
          'Counter Helix: Fixed bug where Counter Helix could proc twice if an attack missed due to uphill terrain.',
          'Berserker’s Call: Bonus armor granted during call adjusted from 16/19/22/25 to 14/17/20/23.'
        ],
        bugfixContext: 'Fixed an edge-case crash where Culling Blade killing an illusion holding an active Lotus Orb caused server desync.',
        metaImpact: 'Axe remains the undisputed top offlaner against physical right-clickers, but Call armor is dialed down slightly.',
        verdict: 'Essential Bug Fix'
      },

      // Witch Doctor
      {
        heroId: 'witch_doctor',
        heroName: 'Witch Doctor',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/witch_doctor.png',
        primaryRole: 'Hard Support',
        changeType: 'fix',
        category: 'ability',
        targetName: 'Voodoo Switcheroo & Maledict',
        summary: 'Fixed invulnerability state in Voodoo Switcheroo and re-timed Maledict burst.',
        details: [
          'Voodoo Switcheroo (Shard): Fixed a major bug where Witch Doctor could still be hooked by Pudge or dragged by Batrider while hidden.',
          'Maledict: Base tick burst damage reduced by 5 at level 1 (from 18 to 13), scaling remains 18/22/26 at later levels.',
          'Death Ward: Fixed pure damage interaction so that attack speed slows from items like Shiva’s Guard correctly reduce Death Ward attack rate.'
        ],
        bugfixContext: 'Voodoo Switcheroo now provides complete invulnerable and hidden state as originally intended in tooltip.',
        metaImpact: 'Massive quality of life fix for Witch Doctor players against Pudge and Batrider; early level 1 lane cheese is slightly tamed.',
        verdict: 'Critical Fix & Slight Nerf'
      },

      // Legion Commander
      {
        heroId: 'legion_commander',
        heroName: 'Legion Commander',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/legion_commander.png',
        primaryRole: 'Offlane',
        changeType: 'buff',
        category: 'ability',
        targetName: 'Overwhelming Odds & Stonehall Plate',
        summary: 'Increased barrier duration on Stonehall Plate and boosted creep damage.',
        details: [
          'Stonehall Plate Facet: Barrier duration increased from 8 seconds to 10 seconds.',
          'Overwhelming Odds: Base creep damage increased from 35/50/65/80 to 45/60/75/90.',
          'Press the Attack: Mana cost reduced from 110 to 100.'
        ],
        bugfixContext: 'Fixed an issue where Duel victory buff counter would fail to increment if the enemy died to neutral creep damage during Duel.',
        metaImpact: 'Improves her ability to secure last hits and trade in difficult lanes; Stonehall Plate barrier now lasts long enough for full Duel engagements.',
        verdict: 'Substantial Buff'
      },

      // Storm Spirit
      {
        heroId: 'storm_spirit',
        heroName: 'Storm Spirit',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png',
        primaryRole: 'Mid',
        changeType: 'fix',
        category: 'facet',
        targetName: 'Static Slide (Facet) & Ball Lightning',
        summary: 'Fixed remnant mana consumption during zip and normalized arrival burst.',
        details: [
          'Static Slide Facet: Fixed a bug where dropping Static Remnant while zipping consumed full double mana cost.',
          'Shocking Arrival Facet: Damage cap at 1500 distance travel normalized to prevent 1-shotting supports at level 6.',
          'Overload: Attack slow increased from 50 to 55.'
        ],
        bugfixContext: 'Resolved an exploit where rapid queuing of Ball Lightning allowed Storm to bypass mana drain when crossing bloodthorn debuffs.',
        metaImpact: 'Storm Spirit feels much smoother to play with Static Slide now that mana isn’t accidentally doubled.',
        verdict: 'Fix & QoL Improvement'
      },

      // Lion
      {
        heroId: 'lion',
        heroName: 'Lion',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/lion.png',
        primaryRole: 'Soft Support',
        changeType: 'buff',
        category: 'ability',
        targetName: 'Fist of Death (Facet) & Mana Drain',
        summary: 'Widened Fist of Death cleave and improved Mana Drain break distance.',
        details: [
          'Fist of Death Facet: Cleave cone angle widened from 60 degrees to 80 degrees; bonus damage per kill increased from 40 to 45.',
          'Mana Drain: Break distance increased from 1100 to 1200.',
          'Earth Spike: Projectile speed increased from 1600 to 1800.'
        ],
        bugfixContext: 'Fixed a bug where Finger of Death kill credit would reset if Lion was holding an Aegis of the Immortal upon dying.',
        metaImpact: 'Earth Spike lands noticeably faster, making it much harder for enemies to dodge with Eul’s or Blink.',
        verdict: 'Impactful Buff'
      },

      // Anti-Mage
      {
        heroId: 'anti_mage',
        heroName: 'Anti-Mage',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png',
        primaryRole: 'Carry',
        changeType: 'fix',
        category: 'facet',
        targetName: 'Magebane’s Mirror & Counterspell',
        summary: 'Fixed spell reflection interactions with targeted secondary projectiles.',
        details: [
          'Magebane’s Mirror Facet: Fixed bug where secondary reflected projectiles did not inherit spell amplification.',
          'Counterspell: Magic resistance bonus rescaled from 15/25/35/45% to 20/30/40/50%.',
          'Mana Void: Stun duration increased from 0.3s to 0.5s.'
        ],
        bugfixContext: 'Fixed a bug where AM reflecting Lich’s Chain Frost caused the frost ball to bounce between invisible units.',
        metaImpact: 'Gives Anti-Mage a cleaner laning phase against magic spammers thanks to the +5% early magic resistance boost.',
        verdict: 'Buff & Fix'
      },

      // Phantom Assassin
      {
        heroId: 'phantom_assassin',
        heroName: 'Phantom Assassin',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png',
        primaryRole: 'Carry',
        changeType: 'fix',
        category: 'facet',
        targetName: 'Methodical (Facet) & Coup de Grace',
        summary: 'Fixed attack hit counter on Methodical and clarified structure interaction.',
        details: [
          'Methodical Facet: Fixed a bug where attacks against buildings or wards were advancing the 6-hit critical counter.',
          'Stifling Dagger: Cast range rescaled from 550/750/950/1150 to 600/800/1000/1200.',
          'Blur: Vanish delay when enemies approach reduced from 0.75s to 0.6s.'
        ],
        bugfixContext: 'Methodical now only counts attacks against valid enemy and neutral heroes/creeps.',
        metaImpact: 'Slightly buffed Stifling Dagger range eases her early game farming in hostile lanes.',
        verdict: 'Bugfix & Minor Buff'
      },

      // Faceless Void
      {
        heroId: 'faceless_void',
        heroName: 'Faceless Void',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/faceless_void.png',
        primaryRole: 'Carry',
        changeType: 'buff',
        category: 'ability',
        targetName: 'Time Dilation & Time Walk',
        summary: 'Reduced Time Dilation cooldown and fixed Chronosphere aura freeze.',
        details: [
          'Time Dilation: Cooldown reduced from 28/24/20/16s to 26/22/18/14s; movement slow per cooldown increased from 10% to 11%.',
          'Time Walk: Shard reverse Time Walk cast window increased from 1.5s to 2.0s.'
        ],
        bugfixContext: 'Fixed an issue where Chronosphere failed to pause the respawn timer of enemy wards placed inside the sphere.',
        metaImpact: 'Low-cooldown Time Dilation wreaks havoc against spam-reliant heroes in early teamfights.',
        verdict: 'Solid Buff'
      },

      // Drow Ranger
      {
        heroId: 'drow_ranger',
        heroName: 'Drow Ranger',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/drow_ranger.png',
        primaryRole: 'Carry',
        changeType: 'buff',
        category: 'facet',
        targetName: 'Sidestep (Facet) & Vantage Point',
        summary: 'Decreased movement penalty during Multishot and fixed cliff elevation bonus.',
        details: [
          'Sidestep Facet: Movement speed penalty while channeling Multishot reduced from 50% to 35%.',
          'Vantage Point Facet: Fixed bonus damage not applying when shooting from natural cliff terrain near Roshan pits.',
          'Frost Arrows: Mana cost reduced from 12 to 10.'
        ],
        bugfixContext: 'Fixed terrain height map calculation for Vantage Point near the Dire secret shop ramp.',
        metaImpact: 'Sidestep is now much more viable in competitive matches, allowing Drow to reposition while dishing out full Multishot waves.',
        verdict: 'Noticeable Buff'
      }
    ]
  },

  // ==============================================================
  // PATCH 7.37c
  // ==============================================================
  {
    version: '7.37c',
    releaseDate: 'September 2024',
    title: 'Post-TI Tournament Stabilization Patch',
    overview: 'Focused on fine-tuning hero abilities and addressing runaway win rates of newly introduced hero facets following The International group stages.',
    highlights: [
      'Iron Talon and Philosopher’s Stone neutral adjustments.',
      'Sven Great Cleave damage scaling tweaked.',
      'Axe One Man Army strength conversion ratio toned down.',
      'Windranger Tailwind haste re-calibrated.'
    ],
    systemChanges: [
      {
        category: 'Neutral Items',
        title: 'Tier 2 & 3 Neutrals',
        changes: [
          'Iron Talon: Cooldown on creep percentage damage increased from 20s to 25s.',
          'Philosopher’s Stone: Attack damage penalty increased from -30 to -35.'
        ],
        impact: 'Slows down offlane and support passive gold and farming efficiency.'
      }
    ],
    heroChanges: [
      {
        heroId: 'windranger',
        heroName: 'Windranger',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/windrunner.png',
        primaryRole: 'Carry',
        changeType: 'nerf',
        category: 'ability',
        targetName: 'Focus Fire & Windrun',
        summary: 'Focus Fire damage reduction increased; Windrun cooldown adjusted.',
        details: [
          'Focus Fire: Attack damage reduction increased from -30% to -35% at level 1.',
          'Windrun: Mana cost increased from 50 to 60.'
        ],
        metaImpact: 'Slightly reduced her early kill speed upon unlocking level 6 Focus Fire.',
        verdict: 'Minor Nerf'
      },
      {
        heroId: 'axe',
        heroName: 'Axe',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png',
        primaryRole: 'Offlane',
        changeType: 'nerf',
        category: 'facet',
        targetName: 'One Man Army',
        summary: 'Reduced strength conversion ratio.',
        details: [
          'One Man Army Facet: Strength gained from armor reduced from 60% to 50%.'
        ],
        metaImpact: 'Reduced his peak HP pool in mid game by about 250-350 health.',
        verdict: 'Balance Adjustment'
      },
      {
        heroId: 'witch_doctor',
        heroName: 'Witch Doctor',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/witch_doctor.png',
        primaryRole: 'Hard Support',
        changeType: 'nerf',
        category: 'ability',
        targetName: 'Paralyzing Cask',
        summary: 'Reduced hero stun duration on first bounce.',
        details: [
          'Paralyzing Cask: Hero stun duration reduced from 1.5s to 1.3s on initial hit.'
        ],
        metaImpact: 'Offers opponent offlaners a brief split-second window to pop BKB or escape.',
        verdict: 'Targeted Nerf'
      }
    ]
  },

  // ==============================================================
  // PATCH 7.37b
  // ==============================================================
  {
    version: '7.37b',
    releaseDate: 'August 2024',
    title: 'Post-Release Facet Adjustments & Fixes',
    overview: 'Emergency tuning patch deployed shortly after Patch 7.37 to correct game-breaking interactions and balance wildly skewed facet win rates.',
    highlights: [
      'Fixed dozens of Innate and Facet tooltips and mechanics.',
      'Sven Vanquisher bonus damage standardized.',
      'Legion Commander Overwhelming Odds radius adjusted.',
      'Storm Spirit Galvanized mana regen formula fixed.'
    ],
    systemChanges: [
      {
        category: 'Game Mechanics',
        title: 'Innates & Facets System',
        changes: [
          'Resolved an issue where Innates were not displaying correctly on spectator HUD.',
          'Ensured all Facets properly persist across morphs and illusions.'
        ],
        impact: 'Core stability and gameplay clarity improvement.'
      }
    ],
    heroChanges: [
      {
        heroId: 'storm_spirit',
        heroName: 'Storm Spirit',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png',
        primaryRole: 'Mid',
        changeType: 'fix',
        category: 'innate',
        targetName: 'Galvanized (Innate)',
        summary: 'Fixed mana regen stacking formula.',
        details: [
          'Galvanized Innate: Fixed bug where assists were not awarding passive permanent mana regeneration stacks.'
        ],
        metaImpact: 'Restored Storm’s intended snowball scaling through team participation.',
        verdict: 'Important Fix'
      },
      {
        heroId: 'legion_commander',
        heroName: 'Legion Commander',
        avatarUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/legion_commander.png',
        primaryRole: 'Offlane',
        changeType: 'rework',
        category: 'facet',
        targetName: 'Stonehall Plate',
        summary: 'Reworked barrier formula to scale with all damage dealt.',
        details: [
          'Stonehall Plate now absorbs all damage types rather than only physical damage.'
        ],
        metaImpact: 'Propelled Legion Commander directly into top-tier offlane contention against magic burst.',
        verdict: 'Game-Changing Rework'
      }
    ]
  }
];
