import React from 'react';
import { HeroData } from '../../../entities/hero/bi/types';

interface HeroAnimationLoadingProps {
  hero: HeroData;
  progress: number;
}

export const HeroAnimationLoading: React.FC<HeroAnimationLoadingProps> = ({ hero, progress }) => {
  const primaryColor =
    hero.attribute === 'str'
      ? 'from-red-600 to-amber-600'
      : hero.attribute === 'agi'
      ? 'from-emerald-500 to-teal-400'
      : hero.attribute === 'int'
      ? 'from-cyan-500 to-blue-500'
      : 'from-purple-500 to-pink-500';

  const glowColor =
    hero.attribute === 'str'
      ? 'rgba(239, 68, 68, 0.4)'
      : hero.attribute === 'agi'
      ? 'rgba(34, 197, 94, 0.4)'
      : hero.attribute === 'int'
      ? 'rgba(6, 182, 212, 0.4)'
      : 'rgba(217, 70, 239, 0.4)';

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/95 rounded-3xl border border-red-500/20 overflow-hidden animate-fadeIn">
      {/* Background radiant aura */}
      <div 
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-opacity duration-700"
        style={{ backgroundColor: glowColor }}
      />

      {/* Rotating Aegis Rune Ring */}
      <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
        {/* Outer spinning dash ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/40 animate-spin" style={{ animationDuration: '6s' }} />
        
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border border-red-500/40 opacity-25" />

        {/* Inner rotating rune ring */}
        <div className="absolute inset-3 rounded-full border-2 border-t-red-500 border-r-transparent border-b-red-400 border-l-transparent animate-spin" style={{ animationDuration: '1.8s' }} />

        {/* Center Dota Rune Core */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.8)] border border-red-400/50">
          <span className="text-[11px] font-mono font-bold text-white tracking-widest">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Hero Summoning Status */}
      <div className="text-center space-y-1 z-10">
        <div className="text-xs font-mono tracking-widest text-red-400 uppercase font-bold flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Channeling {hero.name}
        </div>
        <p className="text-[11px] text-slate-400 font-sans">
          Fetching official Valve WebM animation
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[200px] h-2 bg-slate-900/90 rounded-full mt-4 p-0.5 border border-white/10 overflow-hidden shadow-inner z-10 relative">
        <div 
          className={`h-full w-full rounded-full bg-gradient-to-r ${primaryColor} origin-left transition-transform duration-200 ease-out shadow-[0_0_10px_rgba(239,68,68,0.6)]`}
          style={{ transform: `scaleX(${Math.max(0.05, Math.min(1, progress / 100))})` }}
        />
      </div>

      {/* Progress Indicator Details */}
      <div className="flex items-center justify-between w-full max-w-[200px] mt-2 text-[11px] font-mono text-slate-400 z-10">
        <span>AXIOS STREAM</span>
        <span className="text-slate-300 font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
