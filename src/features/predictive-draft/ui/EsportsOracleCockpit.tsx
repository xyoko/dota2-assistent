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
    <div className="space-y-4 rounded-3xl bg-slate-950/85 border border-purple-500/30 p-4 sm:p-6 shadow-[0_0_35px_rgba(168,85,247,0.12)] backdrop-blur-2xl">
      
      {/* ============================================================ */}
      {/* 1. COCKPIT TELEMETRY HEADER                                  */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
        
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600/30 via-indigo-600/20 to-purple-900/40 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.35)]">
            <BrainCircuit className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-dota font-black text-lg text-white tracking-wide">
                NEURAL TACTICAL COCKPIT
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini Flash-Lite • Pro Esports Telemetry
              </span>
              {bans.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30">
                  {bans.length} Banned
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              High-precision tactical directives for Patch 7.37d • Real-time counter itemization & objective execution
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              SoundEngine.playHover();
              onOpenKeyModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Configure free Google AI Studio key"
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Free Tier Config</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playPick();
              onRequestAnalysis();
            }}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer active:scale-95"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                <span>Computing Strategy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>{aiAnalysis ? 'Regenerate Telemetry' : 'Generate Match Blueprint'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. PRO-GRADE STRUCTURED TACTICAL DIRECTIVES GRID            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        
        {/* Card 1: Nemesis Threat Matrix */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-red-500/30 hover:border-red-500/50 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" /> Threat Nemesis
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/40">
                P1 Target
              </span>
            </div>
            <div className="font-dota font-bold text-sm text-white">
              {hasOpponents ? opponents[0].name : 'Pending Enemy Core'}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {hasOpponents 
                ? `Isolate before BKB timing. Contest their ancient camps and force early teamfights before minute 18.`
                : `Awaiting opponent core pick to compute primary disable lock and kill windows.`}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-red-300">
            <span>Danger Level</span>
            <span className="font-bold">{hasOpponents ? 'HIGH THREAT (92%)' : 'Awaiting Draft'}</span>
          </div>
        </div>

        {/* Card 2: Strategic Timings & Spikes */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Power Spike Windows
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                Tempo
              </span>
            </div>
            <div className="font-dota font-bold text-sm text-white">
              06:00 • 15:00 • 20:00
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Minute 6 power rune rotation. Group for Tormentor at 20:00. Prioritize Roshan prior to committing high-ground siege.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-amber-300">
            <span>Primary Spike</span>
            <span className="font-bold">First Core Item Spike</span>
          </div>
        </div>

        {/* Card 3: Counter-Itemization Blueprint */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-purple-500/30 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Mandatory Item Blueprint
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-200 border border-purple-500/40">
                Patch 7.37d
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold" title="Magic Immunity">
                BKB
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold" title="Anti-Regen & Vessel">
                Spirit Vessel
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold" title="Dispel Saves & Euls">
                Nullifier
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold" title="Passives Break">
                Silver Edge
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Supports build defensive utility (Force Staff / Lotus Orb). Cores prioritize fast BKB over second greedy damage component.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-purple-300">
            <span>Critical Timing</span>
            <span className="font-bold">Pre-Minute 22 BKB</span>
          </div>
        </div>

        {/* Card 4: 5v5 Teamfight Execution Protocol */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" /> Teamfight Protocol
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Immortal Guide
              </span>
            </div>
            <div className="font-dota font-bold text-sm text-white">
              {hasAllies ? `${allies[0].name} Initiation` : 'Initiation Chain'}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Do not group tight against enemy area ultimates. Pos 4/5 maintain high ground vision and kite after initial spell rotation.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-emerald-300">
            <span>Target Priority</span>
            <span className="font-bold">Eliminate Save Supports First</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. RAPID TACTICAL INQUIRY CHIPS                              */}
      {/* ============================================================ */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono font-bold text-purple-300/80 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" /> Rapid Tactical Queries
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Pro Analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickInquiries.map((inq, idx) => (
            <button
              key={idx}
              disabled={isAiLoading}
              onClick={() => handleSelectQuickInquiry(inq.q)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/50 text-[11px] text-slate-300 hover:text-white transition-all text-left flex items-center justify-between group"
            >
              <span className="truncate">{inq.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
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
            placeholder="Ask Gemini Flash-Lite specific drafting advice, counter-items, or facet interactions..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400/50 text-xs text-slate-200 placeholder-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={isAiLoading || !customQuestion.trim()}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </form>

      {/* ============================================================ */}
      {/* 5. ERROR DISPLAY (IF ANY)                                    */}
      {/* ============================================================ */}
      {aiError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-2.5 text-red-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="flex-1">{aiError}</span>
          <button
            onClick={() => onRequestAnalysis()}
            className="px-2.5 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-[11px] font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. AI ANALYSIS OUTPUT TERMINAL (STRUCTURED TELEMETRY)        */}
      {/* ============================================================ */}
      {isAiLoading ? (
        <div className="min-h-[200px] rounded-2xl bg-slate-900/60 border border-purple-500/20 p-8 flex flex-col items-center justify-center space-y-3 text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Loader2 className="w-6 h-6 text-purple-300 animate-spin" />
          </div>
          <div className="font-dota font-bold text-sm text-purple-200 uppercase tracking-wider">
            Gemini Flash-Lite Synthesizing Pro Telemetry...
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Analyzing hero facets, win-rate deltas, item timing spikes, and Patch 7.37d counter-drafting algorithms.
          </p>
        </div>
      ) : aiAnalysis ? (
        <div className="rounded-2xl bg-slate-900/85 border border-purple-500/30 p-4 sm:p-5 text-slate-200 text-xs leading-relaxed space-y-3 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 text-[10px] font-mono text-purple-300">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              GRANDMASTER DRAFT BREAKDOWN (PATCH 7.37d)
            </span>
            <span className="text-slate-400">Response via Gemini Flash-Lite</span>
          </div>

          <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed text-xs">
            {aiAnalysis}
          </div>
        </div>
      ) : (
        <div className="min-h-[140px] rounded-2xl bg-slate-900/40 border border-dashed border-purple-500/30 p-6 flex flex-col items-center justify-center text-center space-y-2">
          <Sparkles className="w-7 h-7 text-purple-400/60" />
          <div className="font-dota font-bold text-xs text-purple-200 uppercase tracking-wide">
            Cockpit Standby
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm">
            Click <strong className="text-purple-300">Generate Match Blueprint</strong> or select any rapid query above for an elite TI coach breakdown.
          </p>
        </div>
      )}

    </div>
  );
};
