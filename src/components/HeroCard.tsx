import React from 'react';
import { HeroData } from '../types/hero';
import { SoundEngine } from '../services/soundFx';
import { DotaComplexity, DotaRoleIcon } from './DotaUIComponents';
import { SEASON_META_DATA } from '../data/seasonMetaData';
import { Star, Flame, Swords, Crosshair } from 'lucide-react';

interface HeroCardProps {
  hero: HeroData;
  isFavorite: boolean;
  onToggleFavorite: (heroId: string) => void;
  onSelectHero: (hero: HeroData) => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  isFavorite,
  onToggleFavorite,
  onSelectHero
}) => {
  // Season Meta Status ("if they are meta this season or not")
  const metaEntry = SEASON_META_DATA.heroes.find((m) => m.heroId === hero.id);
  const isMeta = Boolean(metaEntry && (metaEntry.tier === 'S+' || metaEntry.tier === 'S'));
  const metaTier = metaEntry?.tier || null;

  // Attribute visual styling configuration
  const attrConfig = {
    str: {
      label: 'Strength',
      short: 'STR',
      gem: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
      text: 'text-red-400',
      border: 'border-red-600/30 hover:border-red-500/80',
      glow: 'hover:shadow-[0_0_24px_rgba(239,68,68,0.3)]',
      pill: 'bg-red-950/70 border-red-800/70 text-red-400'
    },
    agi: {
      label: 'Agility',
      short: 'AGI',
      gem: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      text: 'text-emerald-400',
      border: 'border-emerald-600/30 hover:border-emerald-500/80',
      glow: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]',
      pill: 'bg-emerald-950/70 border-emerald-800/70 text-emerald-400'
    },
    int: {
      label: 'Intelligence',
      short: 'INT',
      gem: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]',
      text: 'text-cyan-400',
      border: 'border-cyan-600/30 hover:border-cyan-500/80',
      glow: 'hover:shadow-[0_0_24px_rgba(6,182,212,0.3)]',
      pill: 'bg-cyan-950/70 border-cyan-800/70 text-cyan-400'
    },
    all: {
      label: 'Universal',
      short: 'UNI',
      gem: 'bg-gradient-to-r from-teal-400 via-purple-400 to-pink-500 shadow-[0_0_8px_#d946ef]',
      text: 'text-purple-300',
      border: 'border-purple-600/30 hover:border-purple-500/80',
      glow: 'hover:shadow-[0_0_24px_rgba(217,70,239,0.3)]',
      pill: 'bg-purple-950/70 border-purple-800/70 text-purple-300'
    }
  }[hero.attribute];

  return (
    <div
      onClick={() => {
        SoundEngine.playPick();
        onSelectHero(hero);
      }}
      onMouseEnter={() => SoundEngine.playHover()}
      className={`group relative h-[280px] w-full bg-slate-900/95 border ${attrConfig.border} ${attrConfig.glow} rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between shadow-xl select-none backdrop-blur-sm`}
    >
      {/* Top Banner / Avatar (Fixed Height 185px) */}
      <div className="relative h-[185px] w-full overflow-hidden bg-slate-950 flex-shrink-0">
        <img
          src={hero.avatarUrl}
          alt={hero.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
          }}
        />

        {/* Dark Vignette Gradients for Text & Badges Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Favorite Star Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(hero.id);
            SoundEngine.playHover();
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black/95 border border-white/15 text-slate-300 hover:text-amber-400 transition-colors z-10 backdrop-blur-md shadow-md"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {/* Meta Status Badge (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {isMeta ? (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/70 text-amber-300 font-black text-[10px] tracking-wide uppercase backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              title={`Meta Pick Tier ${metaTier} in current patch`}
            >
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Meta ({metaTier})</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80 text-slate-400 font-semibold text-[10px] tracking-wide uppercase backdrop-blur-md"
              title="Balanced / Standard competitive tier"
            >
              <span>Balanced</span>
            </div>
          )}
        </div>

        {/* Hero Name on Banner (Single line, truncated) */}
        <div className="absolute bottom-2 left-3 right-3 z-10">
          <h3 className="font-dota font-black text-lg text-white group-hover:text-amber-300 transition-colors drop-shadow leading-tight truncate pr-2">
            {hero.name}
          </h3>
        </div>
      </div>

      {/* Bottom HUD Bar (Fixed Height 95px): Type, Winrate, Roles (Icon-Only), Complexity */}
      <div className="h-[95px] w-full px-3.5 py-2.5 bg-dota-panel/95 flex flex-col justify-between border-t border-slate-800/80 flex-shrink-0">
        
        {/* Row 1: Type (Attribute Pill + Attack Icon) & Win Rate */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Attribute Pill */}
            <div 
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-extrabold ${attrConfig.pill}`}
              title={`Primary Attribute: ${attrConfig.label}`}
            >
              <span className={`w-2 h-2 rounded-full ${attrConfig.gem}`} />
              <span>{attrConfig.short}</span>
            </div>

            {/* Attack Type Icon */}
            <div 
              className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-800/90 border border-slate-700/70 text-slate-300 shadow-sm"
              title={`Attack Type: ${hero.attackType}`}
            >
              {hero.attackType === 'Melee' ? (
                <Swords className="w-3.5 h-3.5 text-amber-400/90" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-cyan-400/90" />
              )}
            </div>
          </div>

          {/* Win Rate Badge */}
          <div 
            className={`px-2 py-0.5 rounded-md border text-xs font-mono font-black shadow-sm ${
              hero.winRate >= 50
                ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400'
                : 'bg-amber-950/70 border-amber-800/80 text-amber-400'
            }`}
            title={`Overall Win Rate: ${hero.winRate}%`}
          >
            {hero.winRate}% WR
          </div>
        </div>

        {/* Row 2: Roles (Icons only!) & Complexity (3 Diamonds) */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/60">
          {/* Icon-Only Role Glyphs */}
          <div className="flex items-center gap-1.5" title="Hero Roles (hover icon for definition)">
            {hero.roles.map((role) => (
              <DotaRoleIcon key={role} role={role} size="sm" />
            ))}
          </div>

          {/* Complexity Metric: 3 Diamonds */}
          <div className="flex-shrink-0" title={`Complexity: Level ${hero.complexity} of 3`}>
            <DotaComplexity complexity={hero.complexity} size="sm" showLabel={false} />
          </div>
        </div>

      </div>
    </div>
  );
};
