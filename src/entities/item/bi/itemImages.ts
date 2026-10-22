/**
 * Comprehensive Item Image Resolution Engine for Dota 2
 * Maps item identifiers and in-game names to official Steam CDN image endpoints.
 */

export const DOTA_ITEM_SLUG_MAP: Record<string, string> = {
  // Consumables & Starting Items
  tango: 'tango',
  quelling_blade: 'quelling_blade',
  healing_salve: 'flask',
  salve: 'flask',
  flask: 'flask',
  clarity: 'clarity',
  faerie_fire: 'faerie_fire',
  smoke_of_deceit: 'smoke_of_deceit',
  dust_of_appearance: 'dust',
  dust: 'dust',
  observer_ward: 'ward_observer',
  ward_observer: 'ward_observer',
  sentry_ward: 'ward_sentry',
  ward_sentry: 'ward_sentry',
  blood_grenade: 'blood_grenade',
  bottle: 'bottle',
  iron_branch: 'branches',
  branches: 'branches',
  gauntlets: 'gauntlets',
  gauntlets_of_strength: 'gauntlets',
  slippers: 'slippers',
  slippers_of_agility: 'slippers',
  mantle: 'mantle',
  mantle_of_intelligence: 'mantle',
  circlet: 'circlet',
  belt_of_strength: 'belt_of_strength',
  boots_of_elves: 'boots_of_elves',
  robe: 'robe',
  robe_of_the_magi: 'robe',
  crown: 'crown',
  ring_of_protection: 'ring_of_protection',
  ring_of_regen: 'ring_of_regen',
  sobi_mask: 'sobi_mask',
  fluffy_hat: 'fluffy_hat',
  wind_lace: 'wind_lace',
  blight_stone: 'blight_stone',
  orb_of_venom: 'orb_of_venom',
  orb_of_corrosion: 'orb_of_corrosion',
  magic_stick: 'magic_stick',
  magic_wand: 'magic_wand',
  null_talisman: 'null_talisman',
  wraith_band: 'wraith_band',
  bracer: 'bracer',
  soul_ring: 'soul_ring',
  falcon_blade: 'falcon_blade',
  cornucopia: 'cornucopia',

  // Boots
  boots: 'boots',
  boots_of_speed: 'boots',
  power_treads: 'power_treads',
  phase_boots: 'phase_boots',
  arcane_boots: 'arcane_boots',
  tranquil_boots: 'tranquil_boots',
  boots_of_bearing: 'boots_of_bearing',
  travel_boots: 'travel_boots',
  travel_boots_2: 'travel_boots_2',

  // Core Weapons & Attack Items
  javelin: 'javelin',
  mithril_hammer: 'mithril_hammer',
  claymore: 'claymore',
  broadsword: 'broadsword',
  blades_of_attack: 'blades_of_attack',
  quarterstaff: 'quarterstaff',
  demon_edge: 'demon_edge',
  relic: 'relic',
  sacred_relic: 'relic',
  armlet: 'armlet',
  armlet_of_mordiggian: 'armlet',
  shadow_blade: 'invis_sword',
  invis_sword: 'invis_sword',
  silver_edge: 'silver_edge',
  battle_fury: 'bfury',
  bfury: 'bfury',
  crystalys: 'lesser_crit',
  lesser_crit: 'lesser_crit',
  daedalus: 'greater_crit',
  greater_crit: 'greater_crit',
  desolator: 'desolator',
  skull_basher: 'basher',
  basher: 'basher',
  abyssal_blade: 'abyssal_blade',
  monkey_king_bar: 'monkey_king_bar',
  mkb: 'monkey_king_bar',
  diffusal_blade: 'diffusal_blade',
  disperser: 'disperser',
  manta: 'manta',
  manta_style: 'manta',
  sange: 'sange',
  yasha: 'yasha',
  kaya: 'kaya',
  sange_and_yasha: 'sange_and_yasha',
  kaya_and_sange: 'kaya_and_sange',
  kaya_sange: 'kaya_and_sange',
  yasha_and_kaya: 'yasha_and_kaya',
  harpoon: 'harpoon',
  echo_sabre: 'echo_sabre',
  mask_of_madness: 'mask_of_madness',
  helm_of_the_dominator: 'helm_of_the_dominator',
  helm_of_the_overlord: 'helm_of_the_overlord',
  satanic: 'satanic',
  butterfly: 'butterfly',
  dragon_lance: 'dragon_lance',
  hurricane_pike: 'hurricane_pike',
  mage_slayer: 'mage_slayer',
  phylactery: 'phylactery',
  khanda: 'khanda',
  parasma: 'parasma',
  witch_blade: 'witch_blade',
  nullifier: 'nullifier',
  radiance: 'radiance',
  maelstrom: 'maelstrom',
  mjollnir: 'mjollnir',
  gleipnir: 'gleipnir',
  eye_of_skadi: 'skadi',
  skadi: 'skadi',
  eaglesong: 'eagle',
  eagle: 'eagle',
  heavens_halberd: 'heavens_halberd',
  halberd: 'heavens_halberd',
  rod_of_atos: 'rod_of_atos',
  atos: 'rod_of_atos',
  meteor_hammer: 'meteor_hammer',
  hand_of_midas: 'hand_of_midas',
  midas: 'hand_of_midas',
  revenants_brooch: 'revenants_brooch',
  brooch: 'revenants_brooch',

  // Armor & Magic Defense
  chainmail: 'chainmail',
  platemail: 'platemail',
  vanguard: 'vanguard',
  crimson_guard: 'crimson_guard',
  blade_mail: 'blade_mail',
  assault_cuirass: 'assault',
  assault: 'assault',
  ac: 'assault',
  shivas_guard: 'shivas_guard',
  heart: 'heart',
  heart_of_tarrasque: 'heart',
  hood_of_defiance: 'hood_of_defiance',
  pipe: 'pipe',
  pipe_of_insight: 'pipe',
  shroud: 'eternal_shroud',
  eternal_shroud: 'eternal_shroud',
  aeon_disk: 'aeon_disk',
  lotus_orb: 'lotus_orb',
  linkens: 'sphere',
  linkens_sphere: 'sphere',
  sphere: 'sphere',
  bkb: 'black_king_bar',
  black_king_bar: 'black_king_bar',

  // Casters & Support Items
  glimmer_cape: 'glimmer_cape',
  force_staff: 'force_staff',
  pavise: 'pavise',
  solar_crest: 'solar_crest',
  urn_of_shadows: 'urn_of_shadows',
  spirit_vessel: 'spirit_vessel',
  vessel: 'spirit_vessel',
  holy_locket: 'holy_locket',
  medallion_of_courage: 'medallion_of_courage',
  mekansm: 'mekansm',
  guardian_greaves: 'guardian_greaves',
  vladmir: 'vladmir',
  vladmirs_offering: 'vladmir',
  euls: 'cyclone',
  euls_scepter: 'cyclone',
  cyclone: 'cyclone',
  wind_waker: 'wind_waker',
  ghost: 'ghost',
  ghost_scepter: 'ghost',
  glimmer: 'glimmer_cape',
  aether_lens: 'aether_lens',
  veil_of_discord: 'veil_of_discord',
  dagon: 'dagon',
  dagon_5: 'dagon_5',
  orchid: 'orchid',
  orchid_malevolence: 'orchid',
  bloodthorn: 'bloodthorn',
  refresher_orb: 'refresher',
  refresher: 'refresher',
  scythe_of_vyse: 'sheepstick',
  scythe: 'sheepstick',
  sheepstick: 'sheepstick',
  octarine_core: 'octarine_core',
  bloodstone: 'bloodstone',
  aghanims_scepter: 'ultimate_scepter',
  ultimate_scepter: 'ultimate_scepter',
  scepter: 'ultimate_scepter',
  aghanims_shard: 'aghanims_shard',
  shard: 'aghanims_shard',

  // Blinks
  blink_dagger: 'blink',
  blink: 'blink',
  swift_blink: 'swift_blink',
  overwhelming_blink: 'overwhelming_blink',
  arcane_blink: 'arcane_blink',
  gem: 'gem',
  gem_of_true_sight: 'gem'
};

export const DOTA_NEUTRAL_SLUG_MAP: Record<string, string> = {
  // Tier 1
  'duelist gloves': 'duelist_gloves',
  'arcane ring': 'arcane_ring',
  'safety bubble': 'safety_bubble',
  'trusty shovel': 'trusty_shovel',
  'pig pole': 'piglet_pole',
  'pig_pole': 'piglet_pole',
  'piglet pole': 'piglet_pole',
  'royal jelly': 'royal_jelly',
  'occult bracelet': 'occult_bracelet',
  'spark of courage': 'spark_of_courage',
  'broom handle': 'broom_handle',
  'fairy trinket': 'mysterious_hat',
  'fairy_trinket': 'mysterious_hat',
  'mysterious hat': 'mysterious_hat',

  // Tier 2
  'dragon scale': 'dragon_scale',
  'vampire fangs': 'vampire_fangs',
  'grove bow': 'grove_bow',
  'eye of the vizier': 'eye_of_the_vizier',
  'specialist array': 'specialists_array',
  "specialist's array": 'specialists_array',
  'specialists_array': 'specialists_array',
  'bullwhip': 'bullwhip',
  'ring of aquila': 'ring_of_aquila',
  'philosopher stone': 'philosophers_stone',
  "philosopher's stone": 'philosophers_stone',
  'pupils gift': 'pupils_gift',
  "pupil's gift": 'pupils_gift',
  'whisper of the dread': 'whisper_of_the_dread',
  'gossamer cape': 'gossamer_cape',

  // Tier 3
  'paladin sword': 'paladin_sword',
  'nemesis curse': 'nemesis_curse',
  'enchanted quiver': 'enchanted_quiver',
  'elven tunic': 'elven_tunic',
  'ceremonial robe': 'ceremonial_robe',
  'dandelion amulet': 'dandelion_amulet',
  'defiant shell': 'defiant_shell',
  'craggy coat': 'craggy_coat',
  'vindicators axe': 'vindicators_axe',
  "vindicator's axe": 'vindicators_axe',
  'vindicators_axe': 'vindicators_axe',
  'ogre seal totem': 'ogre_seal_totem',
  'cloak of flames': 'cloak_of_flames',

  // Tier 4
  'mind breaker': 'mind_breaker',
  'ninja gear': 'ninja_gear',
  'aviana feather': 'avianas_feather',
  "aviana's feather": 'avianas_feather',
  'avianas_feather': 'avianas_feather',
  'timeless relic': 'timeless_relic',
  'stormcrafter': 'stormcrafter',
  'telescope': 'telescope',
  'trickster cloak': 'trickster_cloak',
  'havoc hammer': 'havoc_hammer',
  'martyrs plate': 'martyrs_plate',
  "martyr's plate": 'martyrs_plate',
  'rattlecage': 'rattlecage',

  // Tier 5
  'apex': 'apex',
  'pirate hat': 'pirate_hat',
  'mirror shield': 'mirror_shield',
  'fallen sky': 'fallen_sky',
  'force boots': 'force_boots',
  'seer stone': 'seer_stone',
  'book of shadows': 'book_of_shadows',
  'stygian desolator': 'desolator_2',
  'unwavering condition': 'unwavering_condition'
};

/**
 * Resolves standard Dota 2 item CDN image URL with priority fallback
 */
export function getItemIconUrl(itemId?: string, itemName?: string): string {
  const normId = (itemId || '').toLowerCase().trim();
  const normName = (itemName || '').toLowerCase().trim();

  // 1. Direct ID match
  if (normId && DOTA_ITEM_SLUG_MAP[normId]) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${DOTA_ITEM_SLUG_MAP[normId]}.png`;
  }

  // 2. Direct name match in item map
  const cleanNameKey = normName.replace(/['’]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (DOTA_ITEM_SLUG_MAP[cleanNameKey]) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${DOTA_ITEM_SLUG_MAP[cleanNameKey]}.png`;
  }

  // 3. Check for neutral item name
  if (DOTA_NEUTRAL_SLUG_MAP[normName]) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${DOTA_NEUTRAL_SLUG_MAP[normName]}.png`;
  }
  if (DOTA_NEUTRAL_SLUG_MAP[cleanNameKey]) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${DOTA_NEUTRAL_SLUG_MAP[cleanNameKey]}.png`;
  }

  // 4. Default clean slug
  const fallbackSlug = cleanNameKey || normId.replace(/[^a-z0-9]/g, '_') || 'black_king_bar';
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${fallbackSlug}.png`;
}

/**
 * Resolves neutral item CDN image URL
 */
export function getNeutralItemIconUrl(neutralName: string): string {
  const cleanLower = neutralName.toLowerCase().trim();
  const mapped = DOTA_NEUTRAL_SLUG_MAP[cleanLower];
  if (mapped) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${mapped}.png`;
  }
  const clean = cleanLower.replace(/['’]/g, '').replace(/[^a-z0-9]/g, '_');
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${clean}.png`;
}

/**
 * Generates an SVG placeholder with the item initials to prevent duplicate fallback pictures
 */
export function getItemFallbackSvg(name: string): string {
  const words = (name || 'Item').replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean);
  const initials = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase() 
    : (name.slice(0, 2) || 'IT').toUpperCase();

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="56" viewBox="0 0 80 56"><rect width="80" height="56" fill="%230b0f19" rx="6"/><rect x="1" y="1" width="78" height="54" fill="none" stroke="%23c89b3c" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/><text x="40" y="34" fill="%23f59e0b" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">${initials}</text></svg>`;
}
