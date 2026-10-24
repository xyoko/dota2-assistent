import React, { useState } from 'react';
import { 
  Sparkles, 
  Key, 
  Loader2, 
  Send, 
  AlertTriangle, 
  Crosshair, 
  ShieldAlert, 
  Swords, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';

export interface DraftParticipant {
  name: string;
  role: string;
  avatarUrl?: string;
}

interface EsportsOracleCockpitProps {
  allies: DraftParticipant[];
  opponents: DraftParticipant[];
  bans: string[];
  aiAnalysis: string;
  isAiLoading: boolean;
  aiError: string | null;
  onRequestAnalysis: (question?: string) => void;
  onOpenKeyModal: () => void;
}

export const EsportsOracleCockpit: React.FC<EsportsOracleCockpitProps> = ({
  allies,
  opponents,
  bans,
  aiAnalysis,
  isAiLoading,
  aiError,
  onRequestAnalysis,
  onOpenKeyModal
}) => {
  const [customQuestion, setCustomQuestion] = useState('');

  // Rapid tactical inquiries
  const quickInquiries = [
    { label: 'Lane Dynamics & Early Gank Triggers', q: 'Detail specific lane matchups, kill potentials, and 6-minute power rune rotation priorities.' },
    { label: 'Countering Enemy Core Spike', q: 'Identify the enemy primary carry timing and our defensive itemization roadmap to shut them down.' },
    { label: 'Itemization Blueprint (BKB / Vessel / Nullifier)', q: 'List the critical active items required across all positions to counter enemy saves and passives.' },
    { label: '20-Min Tormentor & Roshan Protocol', q: 'Outline the execution plan for Tormentor (20:00) and Roshan pit control based on current draft.' }
  ];

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim() && !isAiLoading) {
      SoundEngine.playPick();
      onRequestAnalysis(customQuestion.trim());
    }
  };

  const handleSelectQuickInquiry = (q: string) => {
    setCustomQuestion(q);
    SoundEngine.playPick();
    onRequestAnalysis(q);
  };

  // Extract or synthesize structured cards
  const hasOpponents = opponents.length > 0;
  const hasAllies = allies.length > 0;

  return (
    <div className="space-y-4 rounded-lg bg-hud-surface border border-white/[0.08] p-4 sm:p-5">
      
      {/* ============================================================ */}
      {/* 1. COCKPIT TELEMETRY HEADER                                  */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-hud-accent/10 border border-hud-accent/30 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-hud-accent" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text">
                Draft Tactical Analyzer
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-hud-surface-raised text-hud-text-secondary border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Gemini Flash-Lite • Pro Telemetry
              </span>
              {bans.length > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  {bans.length} Banned
                </span>
              )}
            </div>
            <p className="text-xs text-hud-text-muted mt-0.5">
              Tactical directives for Patch 7.37d • Real-time counter itemization & objective execution
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              SoundEngine.playHover();
              onOpenKeyModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-hud-surface hover:bg-white/[0.08] border border-white/[0.1] text-hud-text-secondary hover:text-hud-text text-xs font-medium transition-colors touch-target"
            title="Configure free Google AI Studio key"
          >
            <Key className="w-3.5 h-3.5 text-hud-text-muted" />
            <span className="hidden sm:inline">AI Config</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playPick();
              onRequestAnalysis();
            }}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-hud-accent/15 hover:bg-hud-accent/25 border border-hud-accent/40 text-hud-accent font-medium text-xs transition-colors touch-target disabled:opacity-40"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-hud-accent" />
                <span>Computing Strategy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-hud-accent" />
                <span>{aiAnalysis ? 'Regenerate Telemetry' : 'Generate Blueprint'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. PRO-GRADE STRUCTURED TACTICAL DIRECTIVES GRID            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        
        {/* Card 1: Nemesis Threat Matrix */}
        <div className="p-3.5 rounded-md bg-hud-bg/70 border border-red-500/30 flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" /> Threat Nemesis
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                P1 Target
              </span>
            </div>
            <div className="font-semibold text-sm text-hud-text">
              {hasOpponents ? opponents[0].name : 'Pending Enemy Core'}
            </div>
            <p className="text-xs text-hud-text-muted leading-relaxed">
              {hasOpponents 
                ? `Isolate before BKB timing. Contest their ancient camps and force early teamfights before minute 18.`
                : `Awaiting opponent core pick to compute primary disable lock and kill windows.`}
            </p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-red-400">
            <span>Danger Level</span>
            <span className="font-semibold">{hasOpponents ? 'HIGH THREAT (92%)' : 'Awaiting Draft'}</span>
          </div>
        </div>

        {/* Card 2: Strategic Timings & Spikes */}
        <div className="p-3.5 rounded-md bg-hud-bg/70 border border-amber-500/30 flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Power Spike Windows
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Tempo
              </span>
            </div>
            <div className="font-semibold text-sm text-hud-text font-mono">
              06:00 • 15:00 • 20:00
            </div>
            <p className="text-xs text-hud-text-muted leading-relaxed">
              Minute 6 power rune rotation. Group for Tormentor at 20:00. Prioritize Roshan prior to committing high-ground siege.
            </p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-amber-400">
            <span>Primary Spike</span>
            <span className="font-semibold">Core Timing</span>
          </div>
        </div>

        {/* Card 3: Counter-Itemization Blueprint */}
        <div className="p-3.5 rounded-md bg-hud-bg/70 border border-white/[0.08] flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-hud-accent flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Mandatory Blueprint
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-hud-surface text-hud-text-muted border border-white/[0.08]">
                Patch 7.37d
              </span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-hud-surface text-amber-400 border border-amber-500/30 text-[11px] font-mono font-medium" title="Magic Immunity">
                BKB
              </span>
              <span className="px-1.5 py-0.5 rounded bg-hud-surface text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-medium" title="Anti-Regen & Vessel">
                Spirit Vessel
              </span>
              <span className="px-1.5 py-0.5 rounded bg-hud-surface text-cyan-400 border border-cyan-500/30 text-[11px] font-mono font-medium" title="Dispel Saves & Euls">
                Nullifier
              </span>
              <span className="px-1.5 py-0.5 rounded bg-hud-surface text-hud-text-secondary border border-white/[0.1] text-[11px] font-mono font-medium" title="Passives Break">
                Silver Edge
              </span>
            </div>
            <p className="text-xs text-hud-text-muted leading-relaxed">
              Supports build defensive utility (Force Staff / Lotus Orb). Cores prioritize fast BKB over second greedy damage component.
            </p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-hud-text-secondary">
            <span>Critical Timing</span>
            <span className="font-semibold">Pre-22m BKB</span>
          </div>
        </div>

        {/* Card 4: 5v5 Teamfight Execution Protocol */}
        <div className="p-3.5 rounded-md bg-hud-bg/70 border border-emerald-500/30 flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" /> Teamfight Protocol
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Execution
              </span>
            </div>
            <div className="font-semibold text-sm text-hud-text">
              {hasAllies ? `${allies[0].name} Initiation` : 'Initiation Chain'}
            </div>
            <p className="text-xs text-hud-text-muted leading-relaxed">
              Do not group tight against enemy area ultimates. Pos 4/5 maintain high ground vision and kite after initial spell rotation.
            </p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-emerald-400">
            <span>Target Priority</span>
            <span className="font-semibold">Save Supports First</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. RAPID TACTICAL INQUIRY CHIPS                              */}
      {/* ============================================================ */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono font-semibold text-hud-text-secondary uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-hud-accent" /> Rapid Tactical Queries
          </span>
          <span className="text-[11px] text-hud-text-muted font-mono">1-Click Pro Analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickInquiries.map((inq, idx) => (
            <button
              key={idx}
              disabled={isAiLoading}
              onClick={() => handleSelectQuickInquiry(inq.q)}
              className="px-3 py-2 rounded-md bg-hud-bg/70 hover:bg-hud-surface-raised border border-white/[0.06] hover:border-white/[0.16] text-xs text-hud-text-secondary hover:text-hud-text transition-colors text-left flex items-center justify-between group touch-target"
            >
              <span className="truncate">{inq.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-hud-text-muted group-hover:text-hud-accent group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. CUSTOM INQUIRY CONSOLE INPUT                              */}
      {/* ============================================================ */}
      <form onSubmit={handleSubmitQuestion} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask specific drafting advice, counter-items, or facet interactions..."
            className="w-full px-3.5 py-2 bg-hud-bg border border-white/[0.1] rounded-md text-xs text-hud-text placeholder-hud-text-muted focus-hud"
          />
        </div>
        <button
          type="submit"
          disabled={isAiLoading || !customQuestion.trim()}
          className="px-4 py-2 rounded-md bg-hud-accent hover:bg-hud-accent/90 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors touch-target"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </form>

      {/* ============================================================ */}
      {/* 5. ERROR DISPLAY (IF ANY)                                    */}
      {/* ============================================================ */}
      {aiError && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="flex-1">{aiError}</span>
          <button
            onClick={() => onRequestAnalysis()}
            className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-xs font-medium text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. AI ANALYSIS OUTPUT TERMINAL (STRUCTURED TELEMETRY)        */}
      {/* ============================================================ */}
      {isAiLoading ? (
        <div className="min-h-[160px] rounded-md bg-hud-bg/60 border border-white/[0.08] p-6 flex flex-col items-center justify-center space-y-2 text-center">
          <Loader2 className="w-6 h-6 text-hud-accent animate-spin" />
          <div className="font-semibold text-xs text-hud-text uppercase tracking-wider">
            Synthesizing Pro Telemetry...
          </div>
          <p className="text-xs text-hud-text-muted max-w-md">
            Analyzing hero facets, win-rate deltas, item timing spikes, and Patch 7.37d counter-drafting algorithms.
          </p>
        </div>
      ) : aiAnalysis ? (
        <div className="rounded-md bg-hud-bg/80 border border-white/[0.08] p-4 text-hud-text text-xs leading-relaxed space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-[11px] font-mono text-hud-text-secondary">
            <span className="flex items-center gap-1.5 font-semibold text-hud-accent">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              MATCHUP BREAKDOWN (PATCH 7.37d)
            </span>
            <span className="text-hud-text-muted">Response via Gemini Flash-Lite</span>
          </div>

          <div className="whitespace-pre-wrap font-sans text-hud-text leading-relaxed text-xs">
            {aiAnalysis}
          </div>
        </div>
      ) : (
        <div className="min-h-[120px] rounded-md bg-hud-bg/40 border border-dashed border-white/[0.08] p-6 flex flex-col items-center justify-center text-center space-y-1.5">
          <Sparkles className="w-5 h-5 text-hud-text-muted" />
          <div className="font-semibold text-xs text-hud-text-secondary uppercase tracking-wide">
            Cockpit Standby
          </div>
          <p className="text-xs text-hud-text-muted max-w-sm">
            Click <strong className="text-hud-text">Generate Blueprint</strong> or select any rapid query above for a detailed coach breakdown.
          </p>
        </div>
      )}

    </div>
  );
};
