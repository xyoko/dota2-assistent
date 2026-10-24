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
    <div className="relative min-h-screen bg-transparent text-slate-100 overflow-hidden w-full selection:bg-hud-cyan selection:text-slate-950">

      {/* ============================================================ */}
      {/* 1. HERO COMMAND DECK (TACTICAL HUD WAR-ROOM) */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* Left Column: Hero Headline, Telemetry Pill & Tactical CTAs */}
          <div className="flex-1 space-y-6 animate-fadeIn text-center lg:text-left">
            
            {/* Live Telemetry Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-hud-surface border border-white/[0.08] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium tracking-wide">LIVE TACTICAL TELEMETRY</span>
              <span className="text-slate-600">•</span>
              <span className="text-hud-gold font-bold tracking-wider">PATCH 7.37d</span>
            </div>

            {/* Tactical Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-display font-bold text-slate-100 tracking-tight leading-[1.1] uppercase">
                Tactical Command & <br className="hidden sm:block" />
                <span className="text-hud-cyan">Draft Engine</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Deterministic counter-drafting algorithms, situational item progressions, and real-time lane telemetry — zero latency, 100% client-side execution.
              </p>
            </div>

            {/* Tactile Action Buttons with 44px hit targets */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <button
                onClick={() => {
                  SoundEngine.playPick();
                  onNavigateTab('predictive');
                }}
                className="min-h-[44px] touch-target px-6 py-3 bg-hud-cyan hover:bg-sky-300 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-hud-sm active:scale-[0.98] transition-[transform,colors] duration-150 flex items-center gap-2 group cursor-pointer focus-hud"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch 5v5 Draft Analyzer</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  SoundEngine.playHover();
                  onNavigateTab('heroes');
                }}
                className="min-h-[44px] touch-target px-5 py-3 bg-hud-surface hover:bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2] text-slate-200 hover:text-white font-mono text-xs uppercase tracking-wider rounded-lg active:scale-[0.98] transition-[transform,colors] duration-150 flex items-center gap-2 cursor-pointer focus-hud"
              >
                <Crown className="w-4 h-4 text-hud-gold" />
                <span>Hero Arsenal</span>
                <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-sm bg-hud-bg border border-white/[0.08] text-slate-400">
                  124
                </span>
              </button>

              <button
                onClick={() => {
                  SoundEngine.playHover();
                  onNavigateTab('draft');
                }}
                className="min-h-[44px] touch-target px-4 py-3 bg-transparent hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] text-slate-400 hover:text-slate-200 font-mono text-xs uppercase tracking-wider rounded-lg active:scale-[0.98] transition-[transform,colors] duration-150 flex items-center gap-1.5 cursor-pointer focus-hud"
              >
                <Swords className="w-3.5 h-3.5 text-hud-cyan" />
                <span>Draft Studio</span>
              </button>
            </div>

            {/* Quick Micro-Features Bar */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-hud-gold" />
                <span>V8 HEURISTICS</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.04ms LATENCY</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-hud-cyan" />
                <span>100% LOCAL CACHE</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Animation Display with Tactical HUD Frame */}
          <div className="flex-1 relative w-full flex justify-center items-center">
            <div className="relative w-full max-w-[500px]">
              <div className="relative rounded-xl bg-hud-panel border border-white/[0.08] shadow-hud-md p-2 overflow-hidden">
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
      {/* 2. TACTICAL ACTION CARDS (THE 4 CORE MODULES) */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 bg-hud-cyan rounded-full" />
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-100 uppercase tracking-wide">
              Tactical Modules
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono uppercase tracking-widest hidden sm:inline">
            Tactical Navigation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'predictive' as ActiveTab,
              num: '01',
              title: '5v5 Draft Analyzer',
              tag: '5V5 DRAFT',
              desc: 'Algorithmic 5-hero drafting engine evaluating lane advantage splits and threat spikes.',
              icon: <Sparkles className="w-4 h-4 text-hud-cyan" />
            },
            {
              id: 'draft' as ActiveTab,
              num: '02',
              title: 'Draft Counter Studio',
              tag: 'PICK & BAN',
              desc: 'Direct enemy counters, ally synergies, and team composition vulnerability metrics.',
              icon: <Swords className="w-4 h-4 text-red-400" />
            },
            {
              id: 'arena' as ActiveTab,
              num: '03',
              title: '1v1 Matchup Arena',
              tag: 'COMBAT SIMULATOR',
              desc: 'Head-to-head duel power curves, item timing spikes, and advantage trajectories.',
              icon: <Radar className="w-4 h-4 text-hud-gold" />
            },
            {
              id: 'sandbox' as ActiveTab,
              num: '04',
              title: 'Build Sandbox Lab',
              tag: 'DPS & ITEM LAB',
              desc: 'Experiment with custom item builds, damage calculations, and stat curves.',
              icon: <FlaskConical className="w-4 h-4 text-emerald-400" />
            }
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => {
                SoundEngine.playPick();
                onNavigateTab(card.id);
              }}
              className="group relative p-4 sm:p-5 rounded-xl bg-hud-panel hover:bg-hud-surface border border-white/[0.08] hover:border-hud-cyan/40 transition-colors cursor-pointer shadow-hud-sm flex flex-col justify-between active:scale-[0.98] select-none min-h-[44px]"
            >
              {/* Card Header: Tag & Number */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-sm bg-hud-surface border border-white/[0.06] text-slate-400">
                  {card.tag}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-300 transition-colors">
                  {card.num}
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-hud-surface border border-white/[0.08] group-hover:border-hud-cyan/30 transition-colors shrink-0">
                    {card.icon}
                  </div>
                  <h3 className="font-display font-semibold text-sm sm:text-base text-slate-100 group-hover:text-hud-cyan transition-colors truncate">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* Card Footer: Launch Link */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                <span>OPEN MODULE</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-hud-cyan" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ORBITAL HERO VAULT & 3D INTERACTIVE ROSTER */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 mb-20">
        <ErrorBoundary compact title="Orbital Hero Vault">
          <OrbitalHeroVault 
            onSelectHero={setMainHero} 
            onOpenHeroDetails={onSelectHero}
          />
        </ErrorBoundary>
      </div>

      {/* ============================================================ */}
      {/* 4. TACTICAL VALUE PROPOSITIONS */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { 
              num: '01',
              title: "Predictive Draft Heuristics", 
              desc: "Isolates enemy roles, timings, and facets to suggest the mathematically ideal response before the draft closes.",
              icon: <Radar className="w-4 h-4 text-hud-cyan" />
            },
            { 
              num: '02',
              title: "Situational Item Progressions", 
              desc: "Build paths adapt continuously to enemy damage profiles, spell immunities, and critical match phases.",
              icon: <Layers className="w-4 h-4 text-hud-gold" />
            },
            { 
              num: '03',
              title: "Picture-in-Picture Mini HUD", 
              desc: "Native Document PiP window keeps vital build phases and hard counters floating above Dota 2 on any display.",
              icon: <Cpu className="w-4 h-4 text-emerald-400" />
            }
          ].map((vp, i) => (
            <div 
              key={i} 
              className="p-5 rounded-xl bg-hud-panel border border-white/[0.08] shadow-hud-sm"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-hud-surface border border-white/[0.08] flex items-center justify-center shrink-0">
                  {vp.icon}
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {vp.num}
                </span>
              </div>
              <h3 className="text-sm font-display font-semibold text-slate-100 mb-1.5">{vp.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{vp.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

export default Home;
