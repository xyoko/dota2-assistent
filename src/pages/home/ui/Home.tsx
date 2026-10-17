import React, { useState } from 'react';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { 
  ChevronRight, 
  Sparkles, 
  Swords, 
  Crown, 
  Layers, 
  FlaskConical, 
  Cpu, 
  Activity, 
  Radar, 
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { OrbitalHeroVault } from '../../../widgets/orbital-hero-vault';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { HeroAnimationDisplay } from '../../../widgets/hero-animation-display';
import { ErrorBoundary } from '../../../shared/ui/error/ErrorBoundary';
import { ActiveTab } from '../../../widgets/navbar/ui/Navbar';

interface HomeProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectHero?: (hero: HeroData) => void;
  isActive?: boolean;
}

export const Home: React.FC<HomeProps> = React.memo(({ 
  onNavigateTab, 
  onSelectHero, 
  isActive = true 
}) => {
  // Main featured hero for the animated display
  const [mainHero, setMainHero] = useState<HeroData>(HEROES_DATA[0]);

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 overflow-hidden w-full selection:bg-red-500 selection:text-white">


      {/* ============================================================ */}
      {/* 2. HERO COMMAND DECK (EMIL KOWALSKI CRAFT & OPTICAL HARMONY) */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full pt-8 sm:pt-14 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Hero Headline, Telemetry Pill & Tactical CTAs */}
          <div className="flex-1 space-y-6 sm:space-y-8 animate-fadeIn text-center lg:text-left">
            
            {/* Live Telemetry Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] text-xs font-mono backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-300 font-medium">LIVE TACTICAL TELEMETRY</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold tracking-wider">PATCH 7.37d</span>
            </div>

            {/* High-Impact Headline with Optical Kerning */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-dota font-black text-white tracking-tight leading-[1.05] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                AUTONOMOUS <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                  TACTICAL ORACLE
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Deterministic counter-drafting algorithms, real-time threat telemetry, and dynamic situational builds — 100% client-side, zero-latency, and privacy-first.
              </p>
            </div>

            {/* Tactile Action Buttons with Emil Kowalski micro-press states */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => {
                  SoundEngine.playPick();
                  onNavigateTab('predictive');
                }}
                className="px-7 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-2xl shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.6)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all flex items-center gap-2 group cursor-pointer select-none"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Launch Oracle 5v5</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  SoundEngine.playHover();
                  onNavigateTab('heroes');
                }}
                className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.09] hover:border-amber-500/50 text-slate-200 hover:text-white font-semibold rounded-2xl backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer select-none"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Hero Arsenal</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-400">
                  124
                </span>
              </button>

              <button
                onClick={() => {
                  SoundEngine.playHover();
                  onNavigateTab('draft');
                }}
                className="px-5 py-3.5 bg-slate-900/50 hover:bg-slate-800/60 border border-white/[0.06] hover:border-slate-700 text-slate-400 hover:text-slate-200 font-semibold rounded-2xl backdrop-blur-xl active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer select-none text-xs"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Draft Studio</span>
              </button>
            </div>

            {/* Quick Micro-Features Bar */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>V8 Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.04ms Heuristics</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>100% Client-Side</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Animation Display with dark.design frame */}
          <div className="flex-1 relative w-full flex justify-center items-center perspective-1000">
            <div className="relative w-full max-w-[500px]">
              {/* Subtle ambient back-glow behind hero portrait */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-amber-600/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

              <div className="relative rounded-3xl bg-slate-950/70 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2 backdrop-blur-2xl overflow-hidden">
                <ErrorBoundary compact title="Selected Hero Animation">
                  <HeroAnimationDisplay
                    hero={mainHero}
                    isActive={isActive}
                    onSelectHero={onSelectHero}
                  />
                </ErrorBoundary>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. TACTICAL ACTION CARDS (THE 4 CORE PILLARS) */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-amber-500 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-dota font-bold text-white tracking-wide">
              TACTICAL SUITE
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest hidden sm:inline">
            Fast Launch Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            {
              id: 'predictive' as ActiveTab,
              num: '01',
              title: 'Predictive Oracle 5v5',
              tag: 'Neural Drafting',
              desc: 'Algorithmic 5-hero drafting engine with lane advantages and threat spikes.',
              icon: <Sparkles className="w-5 h-5 text-purple-400" />,
              border: 'hover:border-purple-500/60',
              glow: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.2)]'
            },
            {
              id: 'draft' as ActiveTab,
              num: '02',
              title: 'Draft Counter Studio',
              tag: 'Pick / Ban Matrix',
              desc: 'Direct enemy counters, ally synergies, and composition vulnerability checks.',
              icon: <Swords className="w-5 h-5 text-red-400" />,
              border: 'hover:border-red-500/60',
              glow: 'hover:shadow-[0_8px_30px_rgba(239,68,68,0.2)]'
            },
            {
              id: 'arena' as ActiveTab,
              num: '03',
              title: '1v1 Matchup Arena',
              tag: 'Combat Simulator',
              desc: 'Detailed head-to-head matchup kill threats, timings, and item interactions.',
              icon: <Radar className="w-5 h-5 text-amber-400" />,
              border: 'hover:border-amber-500/60',
              glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]'
            },
            {
              id: 'sandbox' as ActiveTab,
              num: '04',
              title: 'Build Sandbox Lab',
              tag: 'DPS & Item Lab',
              desc: 'Experiment with custom item builds, damage calculations, and stat curves.',
              icon: <FlaskConical className="w-5 h-5 text-cyan-400" />,
              border: 'hover:border-cyan-500/60',
              glow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]'
            }
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => {
                SoundEngine.playPick();
                onNavigateTab(card.id);
              }}
              className={`group relative p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/[0.07] ${card.border} ${card.glow} transition-all duration-200 cursor-pointer backdrop-blur-xl shadow-lg flex flex-col justify-between active:scale-[0.98] select-none`}
            >
              {/* Card Header: Tag & Number */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/[0.08] text-slate-400">
                  {card.tag}
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-600 group-hover:text-slate-400 transition-colors">
                  {card.num}
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/[0.08] group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="font-dota font-bold text-base text-white group-hover:text-amber-200 transition-colors">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* Card Footer: Launch Link */}
              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                <span>Enter Module</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ORBITAL HERO VAULT & 3D INTERACTIVE ROSTER */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 mb-24">
        <ErrorBoundary compact title="Orbital Hero Vault">
          <OrbitalHeroVault 
            onSelectHero={setMainHero} 
            onOpenHeroDetails={onSelectHero}
          />
        </ErrorBoundary>
      </div>

      {/* ============================================================ */}
      {/* 5. TACTICAL VALUE PROPOSITIONS */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              num: '01',
              title: "Predictive Neural Heuristics", 
              desc: "Isolates enemy roles, timings, and facets to suggest the mathematically ideal response before the draft closes.",
              icon: <Radar className="w-5 h-5 text-red-400" />
            },
            { 
              num: '02',
              title: "Dynamic Situational Builds", 
              desc: "Item progressions adapt continuously to enemy damage types, spell immunities, and critical match phases.",
              icon: <Layers className="w-5 h-5 text-amber-400" />
            },
            { 
              num: '03',
              title: "Picture-in-Picture Mini HUD", 
              desc: "Native Document PiP window keeps vital build phases and hard counters floating above Dota 2 on any monitor.",
              icon: <Cpu className="w-5 h-5 text-emerald-400" />
            }
          ].map((vp, i) => (
            <div 
              key={i} 
              className="p-6 rounded-2xl bg-slate-900/40 border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/[0.08] flex items-center justify-center">
                  {vp.icon}
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {vp.num}
                </span>
              </div>
              <h3 className="text-base font-dota font-bold text-white mb-2">{vp.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{vp.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

export default Home;
