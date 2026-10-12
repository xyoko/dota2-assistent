'use client';

import React, { useState } from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { PositionNumber, POSITION_DEFINITIONS, DedicatedSlots } from '../bi/predictiveDraftEngine';
import { 
  getRoleBanSuggestions 
} from '../bi/roleDraftAnalysisService';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  Lock, 
  Flame, 
  Shield, 
  Info
} from 'lucide-react';

interface RoleBanSuggestionsProps {
  allySlots: DedicatedSlots;
  opponentSlots: DedicatedSlots;
  banIds: string[];
  favorites: string[];
  onBanHero: (heroId: string) => void;
  onSelectHero?: (hero: HeroData) => void;
  initialPos?: PositionNumber;
}

export const RoleBanSuggestions: React.FC<RoleBanSuggestionsProps> = ({
  allySlots,
  opponentSlots,
  banIds,
  favorites,
  onBanHero,
  onSelectHero,
  initialPos = 1
}) => {
  const [selectedPos, setSelectedPos] = useState<PositionNumber>(initialPos);

  const { suggestions, allyRoleHero, opponentRoleHero } = getRoleBanSuggestions(
    selectedPos,
    allySlots,
    opponentSlots,
    banIds,
    favorites
  );

  const roleDef = POSITION_DEFINITIONS[selectedPos];

  return (
    <div className="space-y-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      
      {/* Top Header: Title & Role Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 via-red-800 to-slate-900 border border-rose-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Lock className="w-5 h-5 text-rose-200" />
          </div>
          <div>
            <h3 className="font-dota font-black text-base text-white tracking-wide flex items-center gap-2">
              TARGETED BAN SUGGESTIONS
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                Per-Role Threat Defense
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Strategic bans that neutralize hard counters to your allies and deny opponent powerhouses
            </p>
          </div>
        </div>

        {/* Dedicated 5 Role Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
            const def = POSITION_DEFINITIONS[pos];
            const isSelected = selectedPos === pos;
            const hasAlly = Boolean(allySlots[pos - 1]);
            const hasOpp = Boolean(opponentSlots[pos - 1]);

            return (
              <button
                key={`ban-tab-pos-${pos}`}
                onClick={() => {
                  SoundEngine.playHover();
                  setSelectedPos(pos);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md font-black scale-102'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>Pos {pos}</span>
                <span className="text-[10px] font-normal opacity-90 hidden sm:inline">
                  {def.name.split(' ')[2] || def.name.split(' ')[1]}
                </span>
                {hasAlly && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Ally hero picked" />
                )}
                {hasOpp && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Opponent hero picked" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategic Context Banner */}
      <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-gradient-to-r from-slate-900/80 via-slate-950 to-slate-900/80 border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">
            {allyRoleHero ? '🛡️' : opponentRoleHero ? '🚫' : '⚠️'}
          </span>
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span>{roleDef.name} ({roleDef.lane}) Ban Strategy</span>
              <span className="text-slate-400">•</span>
              {allyRoleHero ? (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  Protecting Ally Core: <strong className="text-white font-dota">{allyRoleHero.name}</strong>
                </span>
              ) : opponentRoleHero ? (
                <span className="text-rose-300 font-semibold">
                  Denying Synergies with Opponent’s {opponentRoleHero.name}
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  Pre-Draft Meta Bans (Neutralizing High-MMR High-Winrate Threats)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Active Ban Roster: <strong className="text-rose-400">{banIds.length}</strong> heroes banned across both teams. All banned heroes are excluded from recommendations.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          Showing {suggestions.length} Threats for {roleDef.name}
        </div>
      </div>

      {/* Ban Suggestions Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {suggestions.map((ban) => {
            const isCritical = ban.priority === 'CRITICAL';
            const isHigh = ban.priority === 'HIGH';

            return (
              <div
                key={`ban-card-${ban.hero.id}`}
                className={`relative rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
                  isCritical
                    ? 'bg-gradient-to-b from-rose-950/30 via-slate-950 to-slate-950 border-rose-500/60 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : isHigh
                    ? 'bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top: Hero Portrait & Threat Badges */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={ban.hero.avatarUrl}
                          alt={ban.hero.name}
                          className="w-11 h-11 rounded-xl object-cover border border-rose-500/50 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white shadow">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-dota font-bold text-sm text-white truncate group-hover:text-rose-300 transition-colors">
                            {ban.hero.name}
                          </h4>
                          {ban.isFavorite && (
                            <span className="text-[9px] font-mono font-bold text-amber-400 flex items-center gap-0.5">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="font-mono text-rose-400 font-bold">{ban.hero.winRate}% WR</span>
                          <span>•</span>
                          <span className="text-[9px] font-mono text-slate-300">
                            {ban.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Threat Priority Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border-rose-500/60 animate-pulse'
                          : isHigh
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {ban.priority}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">
                        {ban.impactScore}/100 Threat
                      </span>
                    </div>
                  </div>

                  {/* Why Ban Reason */}
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-snug">
                    <span className="text-rose-400 font-bold mr-1">Why ban:</span>
                    {ban.reason}
                  </div>

                  {/* Dangerous Strengths if Left Unbanned */}
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 tracking-wider font-mono">
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Threat Strengths if Unbanned:</span>
                    </div>
                    <ul className="text-[10.5px] text-slate-300 space-y-0.5 list-disc list-inside">
                      {ban.strengths.slice(0, 2).map((str, idx) => (
                        <li key={`ban-str-${idx}`} className="leading-tight">
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exploitable Weaknesses if Left in Pool */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>Vulnerabilities if Allowed:</span>
                    </div>
                    <ul className="text-[10.5px] text-slate-400 space-y-0.5 list-disc list-inside">
                      {ban.weaknesses.slice(0, 2).map((weak, idx) => (
                        <li key={`ban-weak-${idx}`} className="leading-tight">
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  {onSelectHero ? (
                    <button
                      onClick={() => onSelectHero(ban.hero)}
                      className="text-[10px] text-slate-400 hover:text-white font-bold transition-colors"
                      title={`View hero details for ${ban.hero.name}`}
                    >
                      Guide →
                    </button>
                  ) : <div />}

                  <button
                    onClick={() => {
                      SoundEngine.playPick();
                      onBanHero(ban.hero.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-dota font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Ban {ban.hero.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
          <Info className="w-6 h-6 text-slate-500 mx-auto" />
          <h4 className="font-dota font-bold text-sm text-slate-300">
            No Active Ban Threats for {roleDef.name}
          </h4>
          <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
            All major threats for this role have already been banned or picked in the current draft.
          </p>
        </div>
      )}

    </div>
  );
};
