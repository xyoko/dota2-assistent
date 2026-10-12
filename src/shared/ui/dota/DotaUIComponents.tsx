import React from 'react';
import { RoleType } from '../../../entities/hero/bi/types';
import { DOTA_ITEMS } from '../../../entities/item/bi/items';
import { 
  Swords, 
  Crosshair, 
  Shield, 
  Sparkles, 
  Heart,
  HelpCircle
} from 'lucide-react';

/**
 * Official Dota 2 Complexity Metric:
 * Represented by 3 glowing diamond / prism glyphs
 */
export const DotaComplexity: React.FC<{ complexity: 1 | 2 | 3; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }> = ({ 
  complexity, 
  size = 'sm',
  showLabel = false 
}) => {
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }[size];

  const complexityLabel = {
    1: 'Simple • Easy to pick up',
    2: 'Moderate • Requires practice',
    3: 'Complex • High skill ceiling'
  }[complexity];

  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-900/90 px-1.5 py-0.5 rounded-md border border-slate-800 shadow-sm" title={`Dota 2 Complexity: Level ${complexity}/3 (${complexityLabel})`}>
      {showLabel && (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
          Complexity
        </span>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((lvl) => {
          const isFilled = lvl <= complexity;
          return (
            <svg
              key={lvl}
              viewBox="0 0 16 16"
              className={`${sizeClasses} transition-all ${
                isFilled
                  ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                  : 'text-slate-700 fill-slate-800/60 stroke-slate-600 stroke-[1]'
              }`}
            >
              <polygon points="8,1 15,8 8,15 1,8" />
            </svg>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Official Dota 2 Role Definitions and Icons
 */
export const DOTA_ROLE_DEFINITIONS: Record<RoleType, { label: string; pos: string; icon: React.ElementType; definition: string; color: string }> = {
  Carry: {
    label: 'Carry',
    pos: 'Pos 1',
    icon: Swords,
    definition: 'Becomes exponentially stronger with farm. Primary damage dealer responsible for late-game objectives and winning teamfights.',
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/40'
  },
  Mid: {
    label: 'Mid',
    pos: 'Pos 2',
    icon: Crosshair,
    definition: 'Solos the central lane for rapid levels and solo gold. Sets the tempo through aggressive map rotations and mid-game playmaking.',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40'
  },
  Offlane: {
    label: 'Offlane',
    pos: 'Pos 3',
    icon: Shield,
    definition: 'Contests the enemy safelane, absorbs physical/magic pressure, initiates teamfights, and builds critical team defensive auras.',
    color: 'text-rose-400 border-rose-500/40 bg-rose-950/40'
  },
  'Soft Support': {
    label: 'Soft Support',
    pos: 'Pos 4',
    icon: Sparkles,
    definition: 'Roams to contest active runes, provides secondary initiation, assists ganks, and builds versatile mid-game utility items.',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
  },
  'Hard Support': {
    label: 'Hard Support',
    pos: 'Pos 5',
    icon: Heart,
    definition: 'Protects the Carry in early lane, stacks neutral camps, controls map vision with wards, and sacrifices net worth for defensive saves.',
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/40'
  }
};

export const DotaRoleBadge: React.FC<{ role: RoleType; showDefinition?: boolean }> = ({ 
  role,
  showDefinition = true 
}) => {
  const roleInfo = DOTA_ROLE_DEFINITIONS[role] || {
    label: role,
    pos: '',
    icon: HelpCircle,
    definition: role,
    color: 'text-slate-300 border-slate-700 bg-slate-800'
  };

  const Icon = roleInfo.icon;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold transition-all shadow-sm ${roleInfo.color}`}
      title={showDefinition ? `${roleInfo.label} (${roleInfo.pos}): ${roleInfo.definition}` : undefined}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{roleInfo.label}</span>
      {roleInfo.pos && <span className="opacity-70 text-[10px] font-mono">({roleInfo.pos})</span>}
    </div>
  );
};

/**
 * Compact Icon-Only Dota 2 Role Icon (Zero Text, Tooltip Included)
 */
export const DotaRoleIcon: React.FC<{ 
  role: RoleType; 
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
}> = ({ 
  role, 
  size = 'sm',
  showTooltip = true 
}) => {
  const roleInfo = DOTA_ROLE_DEFINITIONS[role] || {
    label: role,
    pos: '',
    icon: HelpCircle,
    definition: role,
    color: 'text-slate-300 border-slate-700 bg-slate-800'
  };

  const Icon = roleInfo.icon;

  const containerSizes = {
    xs: 'w-5 h-5 p-1',
    sm: 'w-6 h-6 p-1',
    md: 'w-7 h-7 p-1.5'
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  }[size];

  return (
    <div 
      className={`inline-flex items-center justify-center rounded border transition-all shadow-sm ${roleInfo.color} ${containerSizes} hover:brightness-125 cursor-help`}
      title={showTooltip ? `${roleInfo.label} (${roleInfo.pos}): ${roleInfo.definition}` : undefined}
    >
      <Icon className={`${iconSizes} flex-shrink-0`} />
    </div>
  );
};

/**
 * Universal Dota 2 Item Picture Resolver
 */
export const getItemImageUrl = (itemId: string): string => {
  // Check predefined items first
  if (DOTA_ITEMS[itemId]?.img) {
    return DOTA_ITEMS[itemId].img!;
  }

  // Common item slug mappings for Valve's Dota 2 CDN
  const slugOverrides: Record<string, string> = {
    bkb: 'black_king_bar',
    battle_fury: 'bfury',
    manta_style: 'manta',
    power_treads: 'power_treads',
    magic_wand: 'magic_wand',
    tango: 'tango',
    quelling_blade: 'quelling_blade',
    circlet: 'circlet',
    slippers_of_agility: 'slippers',
    iron_branch: 'branches',
    cornucopia: 'cornucopia',
    wraith_band: 'wraith_band',
    desolator: 'desolator',
    satanic: 'satanic',
    nullifier: 'nullifier',
    abyssal_blade: 'abyssal_blade',
    basher: 'basher',
    mkb: 'monkey_king_bar',
    butterfly: 'butterfly',
    skadi: 'skadi',
    daedalus: 'greater_crit',
    linkens: 'sphere',
    blade_mail: 'blade_mail',
    heart: 'heart',
    vanguard: 'vanguard',
    phase_boots: 'phase_boots',
    arcane_boots: 'arcane_boots',
    tranquil_boots: 'tranquil_boots',
    orchid: 'orchid',
    witch_blade: 'witch_blade',
    bloodstone: 'bloodstone',
    kaya_and_sange: 'kaya_and_sange',
    dragon_lance: 'dragon_lance',
    hurricane_pike: 'hurricane_pike',
    glimmer_cape: 'glimmer_cape',
    force_staff: 'force_staff',
    blink_dagger: 'blink',
    echo_sabre: 'echo_sabre',
    mask_of_madness: 'mask_of_madness',
    silver_edge: 'silver_edge',
    spirit_vessel: 'spirit_vessel',
    scythe_of_vyse: 'sheepstick',
    bloodthorn: 'bloodthorn',
    halberd: 'heavens_halberd',
    lotus_orb: 'lotus_orb',
    ghost_scepter: 'ghost',
    euls: 'cyclone',
    wind_waker: 'wind_waker',
    diffusal_blade: 'diffusal_blade',
    shivas_guard: 'shivas_guard',
    gleipnir: 'gleipnir',
    aeon_disk: 'aeon_disk',
    assault_cuirass: 'assault',
    dagon: 'dagon',
    pipe_of_insight: 'pipe',
    mage_slayer: 'mage_slayer',
    dust_of_appearance: 'dust',
    sentry_ward: 'ward_sentry',
    gem_of_true_sight: 'gem'
  };

  const cleanSlug = slugOverrides[itemId.toLowerCase()] || itemId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${cleanSlug}.png`;
};

/**
 * Resolves the official full-body transparent PNG render from Valve's Dota 2 CDN.
 * Endpoint: https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/<hero_name>.png
 */
export const getHeroFullBodyRenderUrl = (avatarUrl: string): string => {
  if (!avatarUrl) return '';
  const cleanUrl = avatarUrl.replace('/crops/', '/');
  if (cleanUrl.includes('/images/dota_react/heroes/')) {
    return cleanUrl.replace('/images/dota_react/heroes/', '/videos/dota_react/heroes/renders/');
  }
  const match = cleanUrl.match(/heroes\/([a-zA-Z0-9_-]+?)(?:_full|_vert|_sb|_lg)?\.(?:png|jpg|jpeg)/);
  if (match && match[1]) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${match[1]}.png`;
  }
  return avatarUrl;
};
