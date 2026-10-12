import React, { useState, useRef } from 'react';
import { HeroData } from '../bi/types';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { DotaComplexity } from '../../../shared/ui/dota/DotaUIComponents';
import { SEASON_META_DATA } from '../../meta/bi/seasonMetaData';
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
  DAMAGE_TYPE_CONFIG,
  DOTA_LOGO_PATH
} from '../bi/heroVisuals';

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

  // 3D Tilt, Glare, Foil & Light Angle states with RAF throttle
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    foilX: 50,
    foilY: 50,
    lightAngle: 0
  });

  const rafId = useRef<number | null>(null);

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
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      accent: '#ef4444'
    },
    agi: {
      label: 'Agility',
      short: 'AGI',
      gem: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      border: 'border-emerald-600/40 hover:border-emerald-500/80',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      accent: '#10b981'
    },
    int: {
      label: 'Intelligence',
      short: 'INT',
      gem: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]',
      border: 'border-cyan-600/40 hover:border-cyan-500/80',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      accent: '#06b6d4'
    },
    all: {
      label: 'Universal',
      short: 'UNI',
      gem: 'bg-gradient-to-r from-teal-400 via-purple-400 to-pink-500 shadow-[0_0_8px_#d946ef]',
      border: 'border-purple-600/40 hover:border-purple-500/80',
      glow: 'shadow-[0_0_20px_rgba(217,70,239,0.25)]',
      accent: '#d946ef'
    }
  }[hero.attribute];

  // High-performance RAF-throttled mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    const currentTarget = e.currentTarget;

    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!currentTarget) return;
      const rect = currentTarget.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

      const rotateY = ((percentX - 50) / 50) * 13;
      const rotateX = -((percentY - 50) / 50) * 13;
      const foilX = 50 + (percentX - 50) * 0.9;
      const foilY = 50 + (percentY - 50) * 0.9;
      const lightAngle = Math.atan2(percentY - 50, percentX - 50) * (180 / Math.PI);

      setTilt({
        rotateX,
        rotateY,
        glareX: percentX,
        glareY: percentY,
        foilX,
        foilY,
        lightAngle
      });
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => SoundEngine.playHover(), 0);
  };

  const handleMouseLeave = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setIsHovered(false);
    setTilt(prev => ({
      ...prev,
      rotateX: 0,
      rotateY: 0
    }));
  };

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
        contain: 'layout paint style',
        perspective: '1000px'
      }}
      className="w-full select-none"
    >
      {/* 3D Rotating Card Surface with Metallic Engravings and Dynamic Light Reflections */}
      <div
        onClick={() => {
          setTimeout(() => SoundEngine.playPick(), 0);
          onSelectHero(hero);
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${isHovered ? 1.04 : 1}, ${isHovered ? 1.04 : 1}, 1)`,
          transition: isHovered
            ? 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease'
            : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.45s ease, border-color 0.4s ease',
          transformStyle: 'preserve-3d',
          willChange: isHovered ? 'transform' : 'auto'
        }}
        className={`group relative h-[320px] w-full rounded-2xl overflow-hidden border ${attrConfig.border} bg-slate-950 cursor-pointer shadow-xl ${
          isHovered ? attrConfig.glow : ''
        }`}
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
            style={{
              transition: isHovered
                ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease'
                : 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1), filter 0.5s ease'
            }}
            className={`w-full h-full object-cover object-top ${
              isHovered ? 'scale-110 brightness-105' : 'scale-100 brightness-100'
            }`}
          />
        </div>

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* 2. DOTA'S OFFICIAL LOGO METALLIC ENGRAVING PATTERN (Small, covers card, appears ONLY on hover with entering/leaving transition) */}
        <div 
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
          style={{
            mixBlendMode: 'color-dodge',
            opacity: isHovered ? 0.85 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.96)',
            transition: isHovered
              ? 'opacity 0.28s ease-out, transform 0.32s ease-out'
              : 'opacity 0.42s cubic-bezier(0.23, 1, 0.32, 1), transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Dynamic metallic light reflection gradient responding to light angle */}
              <linearGradient 
                id={`dota-metallic-tile-${hero.id}`} 
                x1="0%" 
                y1="0%" 
                x2="100%" 
                y2="100%" 
                gradientTransform={`rotate(${tilt.lightAngle + 90})`}
              >
                <stop offset="0%" stopColor="rgba(255, 215, 0, 0.08)" />
                <stop offset="35%" stopColor="rgba(255, 215, 0, 0.3)" />
                <stop offset="50%" stopColor="rgba(255, 250, 230, 0.95)" />
                <stop offset="65%" stopColor="rgba(255, 215, 0, 0.3)" />
                <stop offset="100%" stopColor="rgba(255, 215, 0, 0.08)" />
              </linearGradient>

              {/* Repeating Pattern of Small Dota 2 Metallic Engravings covering the hero card */}
              <pattern 
                id={`dota-pattern-${hero.id}`} 
                width="52" 
                height="52" 
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(18)"
              >
                {/* 1st Small Engraved Symbol (19px) with Embossed Shadow */}
                <path 
                  d={DOTA_LOGO_PATH} 
                  transform="translate(6, 6) scale(0.81)" 
                  fill="rgba(0, 0, 0, 0.75)" 
                />
                <path 
                  d={DOTA_LOGO_PATH} 
                  transform="translate(5, 5) scale(0.81)" 
                  fill={`url(#dota-metallic-tile-${hero.id})`} 
                />

                {/* 2nd Staggered Small Engraved Symbol (19px) with Embossed Shadow */}
                <path 
                  d={DOTA_LOGO_PATH} 
                  transform="translate(32, 32) scale(0.81)" 
                  fill="rgba(0, 0, 0, 0.75)" 
                />
                <path 
                  d={DOTA_LOGO_PATH} 
                  transform="translate(31, 31) scale(0.81)" 
                  fill={`url(#dota-metallic-tile-${hero.id})`} 
                />
              </pattern>
            </defs>

            {/* Pattern Fill Covering the Entire Card */}
            <rect width="100%" height="100%" fill={`url(#dota-pattern-${hero.id})`} />
          </svg>
        </div>

        {/* 3. METALLIC DARK TONE LIGHT RAYS */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isHovered ? 0.8 : 0,
            backgroundImage: `linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.4) 45%, rgba(0, 0, 0, 0.6) 50%, rgba(255, 255, 255, 0.15) 55%, transparent 70%)`,
            backgroundPosition: `${tilt.foilX}% ${tilt.foilY}%`,
            backgroundSize: '240% 240%',
            mixBlendMode: 'overlay',
            transition: isHovered
              ? 'opacity 0.25s ease-out'
              : 'opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        />

        {/* 4. DYNAMIC HOLOGRAPHIC SPOTLIGHT GLARE (Entering vs Leaving Transitions) */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '200%',
            height: '200%',
            left: '-50%',
            top: '-50%',
            opacity: isHovered ? 0.65 : 0,
            background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.18) 30%, transparent 70%)`,
            mixBlendMode: 'overlay',
            transform: `translate(${(tilt.glareX - 50) / 2}%, ${(tilt.glareY - 50) / 2}%)`,
            transition: isHovered
              ? 'opacity 0.2s ease-out'
              : 'opacity 0.38s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        />

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
                className={`p-1.5 rounded-full bg-slate-950/80 hover:bg-amber-500/25 border border-white/20 hover:border-amber-400/80 text-slate-300 hover:text-amber-300 transition-all shadow-sm ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
                }`}
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
        <div 
          className={`absolute bottom-0 inset-x-0 p-3 z-10 ${
            isHovered ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          style={{
            opacity: isHovered ? 0 : 1,
            transform: isHovered ? 'translateY(12px)' : 'translateY(0)',
            transition: isHovered
              ? 'opacity 0.2s ease-out, transform 0.22s ease-out'
              : 'opacity 0.35s cubic-bezier(0.23, 1, 0.32, 1), transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
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
        <div 
          className={`absolute inset-x-0 bottom-0 p-3.5 z-20 bg-slate-950/92 border-t border-slate-800 space-y-2 text-xs font-sans ${
            isHovered ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(16px)',
            transition: isHovered
              ? 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.25s ease-in, transform 0.32s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
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
