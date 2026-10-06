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
  Layers
} from 'lucide-react';
import { 
  getDistinguishablePortraitCandidates, 
  getHeroDamageType, 
  DAMAGE_TYPE_CONFIG, 
  DOTA_LOGO_PATH 
} from '../utils/heroVisuals';

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
  // Candidate distinguishable portraits with progressive fallback
  const candidates = useRef(getDistinguishablePortraitCandidates(hero.avatarUrl)).current;
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Pokemon-cards-css 3D Tilt, Glare, Foil & Light Angle states
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

  // 3D Card Hover & Movement Handler (Pokemon-cards-css style)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    // Dynamic 3D rotation (max +/- 14 degrees)
    const rotateY = ((percentX - 50) / 50) * 13;
    const rotateX = -((percentY - 50) / 50) * 13;

    // Foil & Glare positions following light source
    const foilX = 50 + (percentX - 50) * 0.9;
    const foilY = 50 + (percentY - 50) * 0.9;

    // Specular light angle in degrees
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
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    SoundEngine.playHover();
  };

  const handleMouseLeave = () => {
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
      style={{ perspective: '1000px' }}
      className="w-full select-none"
    >
      {/* 3D Rotating Card Surface */}
      <div
        onClick={() => {
          SoundEngine.playPick();
          onSelectHero(hero);
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${isHovered ? 1.04 : 1}, ${isHovered ? 1.04 : 1}, 1)`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
        className={`group relative h-[320px] w-full rounded-2xl overflow-hidden border ${attrConfig.border} bg-slate-950 cursor-pointer shadow-xl transition-all duration-300 ${isHovered ? attrConfig.glow : ''}`}
      >

        {/* 1. HERO PORTRAIT (Fills Entire Card Similar to Official Dota 2 Web) */}
        <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden">
          <img
            src={candidates[candidateIndex]}
            alt={`${hero.name} - ${hero.title} (${hero.attribute.toUpperCase()})`}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out ${
              isHovered ? 'scale-110 brightness-105' : 'scale-100'
            }`}
          />
        </div>

        {/* Cinematic Vignettes for Optimal Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* 2. DOTA'S OFFICIAL LOGO METALLIC ENGRAVING (Appears & Gleams on Light Change) */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 overflow-hidden"
          style={{ opacity: isHovered ? 0.95 : 0.25 }}
        >
          <div className="relative w-32 h-32 sm:w-36 sm:h-36">
            {/* Base Metallic Embossed Watermark */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-full h-full text-amber-500/20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              fill="currentColor"
            >
              <path d={DOTA_LOGO_PATH} />
            </svg>

            {/* Specular Light-Reactive Metallic Reflection Foil Sheen */}
            {isHovered && (
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0 w-full h-full"
                style={{
                  mixBlendMode: 'color-dodge',
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.75))'
                }}
              >
                <defs>
                  <linearGradient 
                    id={`dota-metallic-${hero.id}`} 
                    x1="0%" 
                    y1="0%" 
                    x2="100%" 
                    y2="100%" 
                    gradientTransform={`rotate(${tilt.lightAngle + 90})`}
                  >
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="30%" stopColor="rgba(255, 215, 0, 0.15)" />
                    <stop offset="50%" stopColor="rgba(255, 245, 220, 0.95)" />
                    <stop offset="70%" stopColor="rgba(255, 215, 0, 0.15)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path d={DOTA_LOGO_PATH} fill={`url(#dota-metallic-${hero.id})`} />
              </svg>
            )}
          </div>
        </div>

        {/* 3. POKEMON-CARDS-CSS HOLOGRAPHIC CHROMATIC FOIL SHEEN */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.75 : 0,
            backgroundImage: `linear-gradient(115deg, transparent 0%, rgba(255, 0, 150, 0.22) 20%, rgba(0, 220, 255, 0.3) 40%, rgba(255, 230, 0, 0.3) 60%, rgba(168, 85, 247, 0.22) 80%, transparent 100%)`,
            backgroundPosition: `${tilt.foilX}% ${tilt.foilY}%`,
            backgroundSize: '240% 240%',
            mixBlendMode: 'color-dodge'
          }}
        />

        {/* 4. POKEMON-CARDS-CSS DYNAMIC HOLOGRAPHIC SPOTLIGHT GLARE */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            opacity: isHovered ? 0.65 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.18) 30%, transparent 70%)`,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Top Floating Controls (Favorite Star & Meta Badge) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-auto">
          {/* Meta Tier Badge */}
          {isMeta ? (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/25 border border-amber-500/80 text-amber-300 font-black text-[10px] tracking-wide uppercase backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              title={`Meta Tier ${metaTier} in Patch 7.37d`}
            >
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{metaTier} Tier</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-slate-400 font-mono text-[9px] uppercase backdrop-blur-md">
              {hero.winRate}% WR
            </div>
          )}

          {/* Favorite Star Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(hero.id);
              SoundEngine.playHover();
            }}
            className="p-1.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-slate-300 hover:text-amber-400 transition-colors backdrop-blur-md shadow-md btn-fade"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={`Favorite ${hero.name}`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* RESTING STATE BOTTOM OVERLAY: Similar to Official Dota 2 Web (Name + Attribute Gem) */}
        <div 
          className={`absolute bottom-0 inset-x-0 p-3 z-10 transition-all duration-300 ${
            isHovered ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Primary Attribute Gem */}
            <div 
              className="flex items-center justify-center w-6 h-6 rounded-lg bg-black/70 border border-white/15 backdrop-blur-md flex-shrink-0"
              title={`Primary Attribute: ${attrConfig.label}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${attrConfig.gem}`} />
            </div>

            {/* Official Dota 2 Web Style Hero Name */}
            <div className="truncate flex-1">
              <h3 className="font-dota font-bold text-base text-white tracking-wide truncate drop-shadow-md">
                {hero.name}
              </h3>
            </div>
          </div>
        </div>

        {/* 5. HOVER EFFECT TACTICAL HUD: Showing Damage Type (dmgtype), Difficulty (diff type), Attack Type & Roles */}
        <div 
          className={`absolute inset-x-0 bottom-0 p-3.5 z-20 transition-all duration-300 bg-slate-950/90 backdrop-blur-md border-t border-white/15 space-y-2 text-xs font-sans ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Header on Hover: Name & Primary Attribute Short Tag */}
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-dota font-black text-sm text-amber-300 tracking-wide truncate">
              {hero.name}
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/60 px-1.5 py-0.2 rounded border border-white/10 uppercase">
              {attrConfig.short}
            </span>
          </div>

          {/* Row 1: Damage Type (dmgtype) & Difficulty Type (diff type) */}
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

            {/* Difficulty Type (diff type) */}
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
};
