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
  DOTA_LOGO_PATH,
  HERO_PORTRAIT_OFFSETS
} from '../bi/heroVisuals';

interface HeroCardProps {
  hero: HeroData;
  isFavorite: boolean;
  onToggleFavorite: (heroId: string) => void;
  onSelectHero: (hero: HeroData) => void;
  onOpenPip?: (hero: HeroData) => void;
  priority?: boolean;
}

export const HeroCard: React.FC<HeroCardProps> = React.memo(({
  hero,
  isFavorite,
  onToggleFavorite,
  onSelectHero,
  onOpenPip,
  priority = false
}) => {
  // Candidate distinguishable portraits with progressive fallback
  const candidates = useRef(getDistinguishablePortraitCandidates(hero.avatarUrl)).current;
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Mathematical centering offset for asymmetrical Valve crop assets
  const heroFilename = hero.avatarUrl.split('/').pop()?.replace('.png', '') || '';
  const xOffset = HERO_PORTRAIT_OFFSETS[heroFilename] || 0;

  // 3D Tilt, Glare, Foil & Dynamic Light Angle states with RAF throttle
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

  // High-performance RAF-throttled mouse move handler for dynamic metallic engravings & 3D tilt
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
      const foilX = 50 + (percentX - 50) * 1.1;
      const foilY = 50 + (percentY - 50) * 1.1;
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
        contain: 'layout style',
        perspective: '1000px'
      }}
      className="w-full aspect-[16/10] select-none"
    >
      {/* 3D Rotating Card Surface with Horizontal Rectangular Proportions and Dynamic Light Reflections */}
      <div
        onClick={() => {
          setTimeout(() => SoundEngine.playPick(), 0);
          onSelectHero(hero);
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered
            ? 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease'
            : 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease, border-color 0.4s ease',
          transformStyle: 'preserve-3d',
          willChange: isHovered ? 'transform' : 'auto'
        }}
        className={`group relative w-full h-full rounded-xl overflow-hidden border ${attrConfig.border} bg-slate-950 cursor-pointer shadow-xl ${
          isHovered ? attrConfig.glow : ''
        }`}
      >
        {/* 1. HERO PORTRAIT - Centered in 16:10 Frame */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center"
          style={{ background: `radial-gradient(circle at 50% 32%, ${attrConfig.accent}25 0%, #020617 80%)` }}
        >
          {/* Skeleton Placeholder while image loads - guarantees card is NEVER blank */}
          {!isImageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-slate-950/80 animate-pulse">
              <div 
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shadow-lg mb-1"
                style={{ backgroundColor: `${attrConfig.accent}20` }}
              >
                <span className="font-dota font-bold text-lg text-white/40">{hero.name.charAt(0)}</span>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">{attrConfig.short}</span>
            </div>
          )}

          <img
            src={candidates[candidateIndex]}
            alt={`${hero.name} - ${hero.title} (${hero.attribute.toUpperCase()})`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            onError={handleImageError}
            style={{
              transform: isHovered
                ? `translateX(${xOffset}%) scale(1.045)`
                : `translateX(${xOffset}%) scale(1.0)`,
              transition: isHovered
                ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease'
                : 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1), filter 0.5s ease'
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            } ${
              isHovered ? 'brightness-105' : 'brightness-100'
            }`}
          />
        </div>

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* 2, 3, 4: Dynamic Holographic & Metallic Layers (Lighter & Rich Metallic Gold/Bronze Lustre) */}
        {isHovered && (
          <>
            {/* 2. DOTA'S OFFICIAL LOGO METALLIC ENGRAVING PATTERN - Gleaming metallic bronze & gold luster */}
            <div 
              className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
              style={{
                mixBlendMode: 'color-dodge',
                opacity: 0.62,
                transform: 'scale(1)',
                transition: 'opacity 0.25s ease-out'
              }}
            >
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Rich chromatic metallic gradient actively tracking cursor light angle */}
                  <linearGradient 
                    id={`dota-metallic-tile-${hero.id}`} 
                    x1="0%" 
                    y1="0%" 
                    x2="100%" 
                    y2="100%" 
                    gradientTransform={`rotate(${tilt.lightAngle + 90})`}
                  >
                    <stop offset="0%" stopColor="#78350f" stopOpacity="0.45" />
                    <stop offset="20%" stopColor="#b45309" stopOpacity="0.85" />
                    <stop offset="42%" stopColor="#f59e0b" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
                    <stop offset="58%" stopColor="#f59e0b" stopOpacity="0.95" />
                    <stop offset="80%" stopColor="#b45309" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.45" />
                  </linearGradient>

                  {/* Repeating Pattern of Small Dota 2 Metallic Engravings covering the hero card */}
                  <pattern 
                    id={`dota-pattern-${hero.id}`} 
                    width="46" 
                    height="46" 
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(18)"
                  >
                    {/* 1st Small Engraved Symbol with Embossed Shadow */}
                    <path 
                      d={DOTA_LOGO_PATH} 
                      transform="translate(5.5, 6.5) scale(0.72)" 
                      fill="#1c1917" 
                      fillOpacity="0.75" 
                    />
                    <path 
                      d={DOTA_LOGO_PATH} 
                      transform="translate(4.5, 4.5) scale(0.72)" 
                      fill={`url(#dota-metallic-tile-${hero.id})`} 
                    />

                    {/* 2nd Staggered Small Engraved Symbol with Embossed Shadow */}
                    <path 
                      d={DOTA_LOGO_PATH} 
                      transform="translate(28.5, 29.5) scale(0.72)" 
                      fill="#1c1917" 
                      fillOpacity="0.75" 
                    />
                    <path 
                      d={DOTA_LOGO_PATH} 
                      transform="translate(27.5, 27.5) scale(0.72)" 
                      fill={`url(#dota-metallic-tile-${hero.id})`} 
                    />
                  </pattern>
                </defs>

                {/* Pattern Fill Covering the Entire Card */}
                <rect width="100%" height="100%" fill={`url(#dota-pattern-${hero.id})`} />
              </svg>
            </div>

            {/* 3. METALLIC GOLD / BRONZE LIGHT RAYS */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: 0.48,
                backgroundImage: `linear-gradient(${tilt.lightAngle + 115}deg, transparent 18%, rgba(180, 83, 9, 0.25) 32%, rgba(254, 240, 138, 0.55) 47%, rgba(255, 255, 255, 0.65) 50%, rgba(245, 158, 11, 0.45) 53%, rgba(180, 83, 9, 0.25) 68%, transparent 82%)`,
                backgroundPosition: `${tilt.foilX}% ${tilt.foilY}%`,
                backgroundSize: '220% 220%',
                mixBlendMode: 'overlay',
                transition: 'opacity 0.25s ease-out'
              }}
            />

            {/* 4. DYNAMIC HOLOGRAPHIC SPOTLIGHT GLARE */}
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: '180%',
                height: '180%',
                left: '-40%',
                top: '-40%',
                opacity: 0.36,
                background: `radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(245, 158, 11, 0.2) 28%, transparent 62%)`,
                mixBlendMode: 'overlay',
                transform: `translate(${(tilt.glareX - 50) / 2}%, ${(tilt.glareY - 50) / 2}%)`,
                transition: 'opacity 0.2s ease-out'
              }}
            />
          </>
        )}

        {/* Top Floating Controls (Meta Badge, Direct PiP Launcher & Favorite Star) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-auto">
          {/* Meta Tier Badge */}
          {isMeta && (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/70 text-amber-300 font-black text-[10px] tracking-wide uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)] backdrop-blur-sm"
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
                className={`p-1.5 rounded-full bg-slate-950/85 hover:bg-amber-500/25 border border-white/20 hover:border-amber-400/80 text-slate-300 hover:text-amber-300 transition-all shadow-sm backdrop-blur-sm ${
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
              className="p-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-slate-300 hover:text-amber-400 transition-colors shadow-sm backdrop-blur-sm"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={`Favorite ${hero.name}`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* RESTING STATE BOTTOM OVERLAY: Hero Name + Attribute Gem + Win Rate */}
        <div 
          className={`absolute bottom-0 inset-x-0 p-3 z-10 ${
            isHovered ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          style={{
            opacity: isHovered ? 0 : 1,
            transform: isHovered ? 'translateY(10px)' : 'translateY(0)',
            transition: isHovered
              ? 'opacity 0.2s ease-out, transform 0.22s ease-out'
              : 'opacity 0.35s cubic-bezier(0.23, 1, 0.32, 1), transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              {/* Primary Attribute Gem */}
              <div 
                className="flex items-center justify-center w-5 h-5 rounded-md bg-black/75 border border-white/20 flex-shrink-0 shadow-sm"
                title={`Primary Attribute: ${attrConfig.label}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${attrConfig.gem}`} />
              </div>

              {/* Hero Name */}
              <h3 className="font-dota font-bold text-sm sm:text-base text-white tracking-wide truncate drop-shadow-md">
                {hero.name}
              </h3>
            </div>

            {/* Win Rate Chip */}
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/20 shadow-sm flex-shrink-0">
              {hero.winRate}%
            </span>
          </div>
        </div>

        {/* HOVER TACTICAL HUD DRAWER: Rich details with comfortable reading typography */}
        <div 
          className={`absolute inset-x-0 bottom-0 p-3 sm:p-3.5 z-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 space-y-1.5 text-xs font-sans ${
            isHovered ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(14px)',
            transition: isHovered
              ? 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.2s ease-in, transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
          {/* Row 1: Name + Attribute Tag + Win Rate */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-dota font-black text-sm sm:text-base text-amber-300 tracking-wide truncate">
              {hero.name}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/70 px-1.5 py-0.5 rounded border border-white/15 uppercase">
                {attrConfig.short}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {hero.winRate}% WR
              </span>
            </div>
          </div>

          {/* Row 2: Damage Type + Attack Type + Complexity */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/90 text-xs">
            {/* Damage Type Badge */}
            <div 
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-bold ${dmgConfig.bg} ${dmgConfig.border} ${dmgConfig.text}`}
              title={`Primary Damage Profile: ${dmgConfig.label} Damage`}
            >
              {dmgType === 'Physical' && <Swords className="w-3 h-3 text-amber-400" />}
              {dmgType === 'Magical' && <Zap className="w-3 h-3 text-cyan-400" />}
              {dmgType === 'Pure' && <Target className="w-3 h-3 text-yellow-400" />}
              {dmgType === 'Mixed' && <Layers className="w-3 h-3 text-purple-400" />}
              <span>{dmgConfig.label}</span>
            </div>

            {/* Attack Type & Complexity */}
            <div className="flex items-center gap-2 text-slate-300">
              <span className="flex items-center gap-1 text-[11px] font-medium">
                {hero.attackType === 'Melee' ? (
                  <Swords className="w-3 h-3 text-amber-400" />
                ) : (
                  <Crosshair className="w-3 h-3 text-cyan-400" />
                )}
                {hero.attackType}
              </span>
              <DotaComplexity complexity={hero.complexity} size="sm" showLabel={false} />
            </div>
          </div>

          {/* Row 3: Roles tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {hero.roles.slice(0, 3).map((r) => (
              <span 
                key={r}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300 font-medium"
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
