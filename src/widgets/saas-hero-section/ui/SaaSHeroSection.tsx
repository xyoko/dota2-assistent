import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  Shield, 
  ArrowRight, 
  Lock, 
  Scale, 
  CheckCircle2,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/ui/primitives/card';
import { Badge } from '../../../shared/ui/primitives/badge';
import { Button } from '../../../shared/ui/primitives/button';
import { ActiveTab } from '../../navbar/ui/Navbar';

interface SaaSHeroSectionProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenLegal: () => void;
}

export const SaaSHeroSection: React.FC<SaaSHeroSectionProps> = ({
  onNavigateTab,
  onOpenLegal
}) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 400, y: 250 });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Cursor-following ambient beam tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-slate-950/90 shadow-2xl pt-11 pb-7 px-5 mt-3 mb-9 text-slate-100 transition-all duration-300 animate-fadeIn"
      style={{
        boxShadow: '0 20px 50px rgba(79, 70, 229, 0.12), 0 0 30px rgba(147, 51, 234, 0.08)'
      }}
    >
      {/* 20. Grain Texture Over Gradient */}
      <div className="absolute inset-0 grain-overlay z-0 pointer-events-none" />

      {/* 13. Cursor-following Light Beam */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.18), rgba(59, 130, 246, 0.10) 40%, transparent 70%)`
        }}
      />

      {/* Ambient background blur blobs (Purple-to-Blue Gradient) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Controls Bar */}
      <div className="relative z-10 flex items-center justify-between mb-4 px-2">
        {/* 9. Badge Above Headline */}
        <div className="inline-flex items-center gap-2">
          <Badge 
            variant="gradient"
            className="px-3.5 py-1 text-[11px] font-grotesk tracking-wide uppercase border border-purple-500/40 shadow-sm flex items-center gap-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Next-Gen Autonomous Intelligence — Powered by Patch 7.37d</span>
          </Badge>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-sans btn-fade"
          title={isCollapsed ? 'Expand banner' : 'Collapse banner'}
        >
          <span>{isCollapsed ? 'Show Overview' : 'Minimize'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'rotate-90' : '-rotate-90'}`} />
        </button>
      </div>

      {!isCollapsed && (
        <div className="relative z-10 space-y-7">
          {/* Main Headline & Buzzword Copy */}
          <div className="max-w-4xl space-y-3.5 px-2">
            {/* 3. Emojis in your headings + 2. Gradient hero text + 19. Space Grotesk + 18. Serif italic accents */}
            <h1 className="font-grotesk text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="mr-2">🔮</span>
              <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent">
                Synergize Your Drafting Meta
              </span>{' '}
              with{' '}
              <span className="font-serif italic font-normal text-purple-300 text-4xl sm:text-5xl lg:text-6xl tracking-normal">
                autonomous
              </span>{' '}
              intelligence —{' '}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                precision engineered
              </span>{' '}
              for match dominance.
            </h1>

            {/* 17. Generic buzzword copy + 16. Em dashes everywhere + 4. Inter font */}
            <p className="font-sans text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-3xl">
              Seamlessly orchestrate high-conviction drafts with zero-latency counter-matrices — empowering next-generation competitive agility through deterministic situational analytics, real-time threat telemetry, and hyper-scalable hero itemization.
            </p>

            {/* Action Buttons (14. Buttons fade on hover) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => onNavigateTab('predictive')}
                variant="gradient"
                size="lg"
                className="gap-2 font-semibold shadow-lg shadow-purple-900/30 btn-fade"
              >
                <BrainCircuit className="w-4 h-4 text-purple-200" />
                <span>Launch 5v5 Predictive Oracle</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                onClick={() => onNavigateTab('draft')}
                variant="outline"
                size="lg"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-950/40 hover:text-white btn-fade"
              >
                <Zap className="w-4 h-4 mr-1.5 text-amber-400" />
                <span>Draft Studio Counter-Picker</span>
              </Button>

              <Button
                onClick={onOpenLegal}
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-purple-300 gap-1.5 btn-fade"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compliance & Legal Hub ⚖️</span>
              </Button>
            </div>
          </div>

          {/* 8. 3 Icon Boxes in a Row (5. Colored border cards + 6. Glassmorphism cards + 11. Untouched shadcn UI) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            
            {/* Box 1: Purple Border Card */}
            <Card className="glass-card border-purple-500/35 hover:border-purple-400/60 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(168,85,247,0.12)]">
              <CardHeader className="p-5 pb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-3 shadow-inner">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                </div>
                {/* 3. Emojis in headings + 16. Em dashes */}
                <CardTitle className="font-grotesk text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <span>🔮</span>
                  <span>Autonomous Synergy — AI Drafts</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 pt-1 leading-normal">
                  Predictive line-up synthesis evaluates team compositions and telegraphed enemy picks across all 5 dedicated roles with sub-millisecond precision.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 text-[11px] text-purple-300/80 font-sans flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Dedicated lane-role counter prioritization</span>
              </CardContent>
            </Card>

            {/* Box 2: Blue Border Card */}
            <Card className="glass-card border-blue-500/35 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(59,130,246,0.12)]">
              <CardHeader className="p-5 pb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-300 mb-3 shadow-inner">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                {/* 3. Emojis in headings + 16. Em dashes */}
                <CardTitle className="font-grotesk text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Dynamic Telemetry — Threat Matrix</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 pt-1 leading-normal">
                  Real-time threat evaluation highlights dangerous disables, silence vulnerabilities, and break requirements before the battle horn sounds.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 text-[11px] text-blue-300/80 font-sans flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant situational item counters & mitigations</span>
              </CardContent>
            </Card>

            {/* Box 3: Cyan/Emerald Border Card */}
            <Card className="glass-card border-cyan-500/35 hover:border-cyan-400/60 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(6,182,212,0.12)]">
              <CardHeader className="p-5 pb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-3 shadow-inner">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                {/* 3. Emojis in headings + 16. Em dashes */}
                <CardTitle className="font-grotesk text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Deterministic Itemization — Builds</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 pt-1 leading-normal">
                  Hyper-scalable build sandbox with adaptive progression trees, neutral item benchmarks, and game-phase gold optimization for Patch 7.37d.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 text-[11px] text-cyan-300/80 font-sans flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>100% Client-side privacy & offline capability</span>
              </CardContent>
            </Card>

          </div>

          {/* Quick Metrics Bar (15. Inconsistent spacing & 16. Em dashes) */}
          <div className="pt-1 px-2 border-t border-purple-500/20 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero Cloud Latency — 100% Local Compute</span>
              </span>
              <span className="hidden sm:inline text-purple-500/40">•</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Radical Data Minimization — 0 Tracking SDKs</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">
                Official Patch 7.37d Baseline Dataset
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
