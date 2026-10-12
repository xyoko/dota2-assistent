import React, { useState, useRef } from 'react';
import { HeroData } from '../types/hero';
import { SoundEngine } from '../services/soundFx';
import { DotaComplexity } from './DotaUIComponents';
import { SEASON_META_DATA } from '../data/seasonMetaData';
import { 
  Star, 
  Flame, 
  Swords, 
  Crosshair, 
  Zap, 
  Target, 
  Layers,
  PictureInPicture
} from 'lucide-react';
import { 
  getDistinguishablePortraitCandidates, 
  getHeroDamageType, 
  DAMAGE_TYPE_CONFIG 
} from '../utils/heroVisuals';

interface HeroCardProps {
  hero: HeroData;
  isFavorite: boolean;
  onToggleFavorite: (heroId: string) => void;
  onSelectHero: (hero: HeroData) => void;
  onOpenPip?: (hero: HeroData) => void;
}

export const HeroCard: React.FC<HeroCardProps> = React.memo(({
  hero,
  isFavorite,
  onToggleFavorite,
  onSelectHero,
  onOpenPip
}) => {
  // Candidate distinguishable portraits with progressive fallback
  const candidates = useRef(getDistinguishablePortraitCandidates(hero.avatarUrl)).current;
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Season Meta Status
  const metaEntry = SEASON_META_DATA.heroes.find((m) => m.heroId === hero.id);
  const isMeta = Boolean(metaEntry && (metaEntry.tier === 'S+' || metaEntry.tier === 'S'));
  const metaTier = metaEntry?.tier || null;

  // Damage type analysis & presentation
  const dmgType = getHeroDamageType(hero);
  const dmgConfig = DAMAGE_TYPE_CONFIG[dmgType];

  // Attribute styling config
  const attrConfig = {
    str: {
      label: 'Strength',
      short: 'STR',
      gem: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
      border: 'border-red-600/40 hover:border-red-500/80',
      glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      accent: '#ef4444'
    },
    agi: {
      label: 'Agility',
      short: 'AGI',
      gem: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      border: 'border-emerald-600/40 hover:border-emerald-500/80',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      accent: '#10b981'
    },
    int: {
      label: 'Intelligence',
      short: 'INT',
      gem: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]',
      border: 'border-cyan-600/40 hover:border-cyan-500/80',
      glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      accent: '#06b6d4'
    },
    all: {
      label: 'Universal',
      short: 'UNI',
      gem: 'bg-gradient-to-r from-teal-400 via-purple-400 to-pink-500 shadow-[0_0_8px_#d946ef]',
      border: 'border-purple-600/40 hover:border-purple-500/80',
      glow: 'hover:shadow-[0_0_20px_rgba(217,70,239,0.25)]',
      accent: '#d946ef'
    }
  }[hero.attribute];

  // Image progressive fallback
  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(prev => prev + 1);
    }
  };

  return (
    <div
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '320px',
        contain: 'layout paint style'
      }}
      className="w-full select-none"
    >
      {/* Hardware-accelerated CSS Hover Card */}
      <div
        onClick={() => {
          setTimeout(() => SoundEngine.playPick(), 0);
          onSelectHero(hero);
        }}
        className={`group relative h-[320px] w-full rounded-2xl overflow-hidden border ${attrConfig.border} bg-slate-950 cursor-pointer shadow-lg hover:shadow-2xl ${attrConfig.glow} hover:-translate-y-1 hover:scale-[1.02] transition-all duration-150 will-change-transform`}
      >
        {/* 1. HERO PORTRAIT */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ background: `radial-gradient(circle at 50% 20%, ${attrConfig.accent}25 0%, #020617 80%)` }}
        >
          <img
            src={candidates[candidateIndex]}
            alt={`${hero.name} - ${hero.title} (${hero.attribute.toUpperCase()})`}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="w-full h-full object-cover object-top group-hover:scale-105 group-hover:brightness-105 transition-transform duration-200"
          />
        </div>

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* 2. Sleek Metallic Sheen on Hover (Pure CSS, 0 Reflows) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />

        {/* Top Floating Controls (Meta Badge, Direct PiP Launcher & Favorite Star) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-auto">
          {/* Meta Tier Badge */}
          {isMeta && (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/70 text-amber-300 font-black text-[10px] tracking-wide uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              title={`Meta Tier ${metaTier} in Patch 7.37d`}
            >
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{metaTier} Tier</span>
            </div>
          )}

          {/* Action buttons (Direct PiP Trigger + Favorite Star) */}
          <div className="flex items-center gap-1.5 ml-auto">
            {onOpenPip && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeout(() => SoundEngine.playPick(), 0);
                  onOpenPip(hero);
                }}
                className="p-1.5 rounded-full bg-slate-950/80 hover:bg-amber-500/25 border border-white/20 hover:border-amber-400/80 text-slate-300 hover:text-amber-300 transition-colors shadow-sm"
                title={`Launch ${hero.name} Picture-in-Picture Mini HUD`}
                aria-label={`Open PiP Mini HUD for ${hero.name}`}
              >
                <PictureInPicture className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Favorite Star Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(hero.id);
                setTimeout(() => SoundEngine.playHover(), 0);
              }}
              className="p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-slate-300 hover:text-amber-400 transition-colors shadow-sm"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={`Favorite ${hero.name}`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* RESTING STATE BOTTOM OVERLAY: Hero Name + Attribute Gem */}
        <div className="absolute bottom-0 inset-x-0 p-3 z-10 group-hover:opacity-0 group-hover:translate-y-2 opacity-100 translate-y-0 transition-all duration-150 pointer-events-none">
          <div className="flex items-center gap-2">
            {/* Primary Attribute Gem */}
            <div 
              className="flex items-center justify-center w-6 h-6 rounded-lg bg-black/70 border border-white/15 flex-shrink-0"
              title={`Primary Attribute: ${attrConfig.label}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${attrConfig.gem}`} />
            </div>

            {/* Hero Name */}
            <div className="truncate flex-1">
              <h3 className="font-dota font-bold text-base text-white tracking-wide truncate drop-shadow-md">
                {hero.name}
              </h3>
            </div>
          </div>
        </div>

        {/* HOVER TACTICAL HUD DRAWER: Showing Damage Type, Complexity, Roles & Quick Stats */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 z-20 bg-slate-950/92 border-t border-slate-800 space-y-2 text-xs font-sans group-hover:opacity-100 group-hover:translate-y-0 opacity-0 translate-y-3 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto shadow-2xl">
          {/* Header on Hover: Name & Primary Attribute Short Tag */}
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-dota font-black text-sm text-amber-300 tracking-wide truncate">
              {hero.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onOpenPip && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeout(() => SoundEngine.playPick(), 0);
                    onOpenPip(hero);
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold tracking-wide transition-colors"
                  title={`Open Mini HUD for ${hero.name}`}
                >
                  <PictureInPicture className="w-3 h-3 text-amber-400" />
                  <span>PiP</span>
                </button>
              )}
              <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/60 px-1.5 py-0.2 rounded border border-white/10 uppercase">
                {attrConfig.short}
              </span>
            </div>
          </div>

          {/* Row 1: Damage Type & Difficulty */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800">
            {/* Damage Type Badge */}
            <div 
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${dmgConfig.bg} ${dmgConfig.border} ${dmgConfig.text}`}
              title={`Primary Damage Profile: ${dmgConfig.label} Damage`}
            >
              {dmgType === 'Physical' && <Swords className="w-3 h-3 text-amber-400" />}
              {dmgType === 'Magical' && <Zap className="w-3 h-3 text-cyan-400" />}
              {dmgType === 'Pure' && <Target className="w-3 h-3 text-yellow-400" />}
              {dmgType === 'Mixed' && <Layers className="w-3 h-3 text-purple-400" />}
              <span>{dmgConfig.label}</span>
            </div>

            {/* Difficulty Type */}
            <div 
              className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md border border-white/10"
              title={`Difficulty Level: ${hero.complexity === 1 ? 'Simple' : hero.complexity === 2 ? 'Moderate' : 'Complex'}`}
            >
              <DotaComplexity complexity={hero.complexity} size="sm" showLabel={false} />
              <span className="text-[9px] text-slate-300 font-mono ml-0.5">
                {hero.complexity === 1 ? 'Simple' : hero.complexity === 2 ? 'Medium' : 'Hard'}
              </span>
            </div>
          </div>

          {/* Row 2: Attack Type & Win Rate */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
            <div className="flex items-center gap-1">
              {hero.attackType === 'Melee' ? (
                <Swords className="w-3 h-3 text-amber-400" />
              ) : (
                <Crosshair className="w-3 h-3 text-cyan-400" />
              )}
              <span className="text-[10px] text-slate-300 font-medium">{hero.attackType}</span>
            </div>

            <div className="text-[10px] font-mono font-bold text-emerald-400">
              {hero.winRate}% Win Rate
            </div>
          </div>

          {/* Row 3: Role Tags */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {hero.roles.slice(0, 3).map((r) => (
              <span 
                key={r}
                className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});
