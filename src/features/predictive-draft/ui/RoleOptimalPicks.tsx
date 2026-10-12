'use client';

import React, { useState } from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { PositionNumber, POSITION_DEFINITIONS, DedicatedSlots } from '../bi/predictiveDraftEngine';
import { 
  getRolePickSuggestions 
} from '../bi/roleDraftAnalysisService';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  Target, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Info
} from 'lucide-react';

interface RoleOptimalPicksProps {
  allySlots: DedicatedSlots;
  opponentSlots: DedicatedSlots;
  banIds: string[];
  favorites: string[];
  onPickHero: (heroId: string, pos: PositionNumber) => void;
  onSelectHero?: (hero: HeroData) => void;
  onToggleFavorite?: (heroId: string) => void;
  initialPos?: PositionNumber;
}

export const RoleOptimalPicks: React.FC<RoleOptimalPicksProps> = ({
  allySlots,
  opponentSlots,
  banIds,
  favorites,
  onPickHero,
  onSelectHero,
  onToggleFavorite,
  initialPos = 1
}) => {
  const [selectedPos, setSelectedPos] = useState<PositionNumber>(initialPos);

  const { 
    suggestions, 
    opponentHero, 
    hasOpponentPickedRole, 
    isFirstPickSituation 
  } = getRolePickSuggestions(selectedPos, allySlots, opponentSlots, banIds, favorites);

  const roleDef = POSITION_DEFINITIONS[selectedPos];
  const currentAllyHeroId = allySlots[selectedPos - 1];

  return (
    <div className="space-y-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      
      {/* Top Header: Title & Role Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Target className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-dota font-black text-base text-white tracking-wide flex items-center gap-2">
              OPTIMAL & COUNTER PICKS
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Per-Role Analytics
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Tailored suggestions for Allies strictly matching each assigned position
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
                key={`pick-tab-pos-${pos}`}
                onClick={() => {
                  SoundEngine.playHover();
                  setSelectedPos(pos);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-black scale-102'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>Pos {pos}</span>
                <span className="text-[10px] font-normal opacity-90 hidden sm:inline">
                  {def.name.split(' ')[2] || def.name.split(' ')[1]}
                </span>
                {hasAlly && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Ally role filled" />
                )}
                {hasOpp && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Opponent hero locked" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matchup Context Banner */}
      <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-gradient-to-r from-slate-900/80 via-slate-950 to-slate-900/80 border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">
            {hasOpponentPickedRole ? '⚔️' : isFirstPickSituation ? '👑' : '🎯'}
          </span>
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span>{roleDef.name} ({roleDef.lane})</span>
              <span className="text-slate-400">•</span>
              {hasOpponentPickedRole && opponentHero ? (
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  Opponent Locked: <strong className="text-white font-dota">{opponentHero.name}</strong>
                </span>
              ) : isFirstPickSituation ? (
                <span className="text-amber-300 font-semibold">
                  First Pick Advantage — Showing Safe Blind Meta Picks
                </span>
              ) : (
                <span className="text-sky-300 font-semibold">
                  Opponent has not selected a {roleDef.name} yet
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              {hasOpponentPickedRole && opponentHero
                ? `Direct counter-measures and armor/damage profile advantages vs ${opponentHero.name}`
                : `Excluding all banned heroes from the ban roster (${banIds.length} banned heroes). Favoring your marked favorites.`}
            </p>
          </div>
        </div>

        {currentAllyHeroId && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ally Slot Pos {selectedPos} currently assigned</span>
          </div>
        )}
      </div>

      {/* Suggestions Cards Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {suggestions.map((sugg) => {
            const isFav = sugg.isFavorite;

            return (
              <div
                key={`pick-card-${sugg.hero.id}`}
                className={`relative rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
                  isFav
                    ? 'bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-900'
                }`}
              >
                {/* Card Top: Hero Portrait & Score Badges */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={sugg.hero.avatarUrl}
                          alt={sugg.hero.name}
                          className="w-11 h-11 rounded-xl object-cover border border-emerald-400/50 shadow-md group-hover:scale-105 transition-transform"
                        />
                        {isFav && (
                          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow">
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-dota font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
                            {sugg.hero.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="font-mono text-emerald-400 font-bold">{sugg.winRate}% WR</span>
                          <span>•</span>
                          <span className="uppercase text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                            {sugg.hero.attribute.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Score Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-[11px]">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{sugg.score}%</span>
                      </div>
                      {isFav && (
                        <span className="text-[9px] font-bold text-amber-400 font-mono mt-0.5">
                          ★ Favorite
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Tactical Reason */}
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-snug">
                    <span className="text-emerald-400 font-bold mr-1">Why pick:</span>
                    {sugg.reasons[0]}
                  </div>

                  {/* Strengths Section */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400 tracking-wider font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Strengths:</span>
                    </div>
                    <ul className="text-[10.5px] text-slate-300 space-y-0.5 list-disc list-inside">
                      {sugg.strengths.slice(0, 2).map((str, idx) => (
                        <li key={`str-${idx}`} className="leading-tight">
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses Section */}
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 tracking-wider font-mono">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>Weaknesses:</span>
                    </div>
                    <ul className="text-[10.5px] text-slate-300 space-y-0.5 list-disc list-inside">
                      {sugg.weaknesses.slice(0, 2).map((weak, idx) => (
                        <li key={`weak-${idx}`} className="leading-tight">
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onSelectHero && (
                      <button
                        onClick={() => onSelectHero(sugg.hero)}
                        className="text-[10px] text-slate-400 hover:text-white font-bold transition-colors"
                        title={`View tactical guide for ${sugg.hero.name}`}
                      >
                        Guide →
                      </button>
                    )}

                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(sugg.hero.id)}
                        className={`p-1 rounded-md transition-colors ${
                          isFav ? 'text-amber-400 hover:text-slate-400' : 'text-slate-500 hover:text-amber-400'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Mark as favorite'}
                        aria-label={`Favorite ${sugg.hero.name}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      SoundEngine.playPick();
                      onPickHero(sugg.hero.id, selectedPos);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-dota font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Pick Pos {selectedPos}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
            No Available Heroes for {roleDef.name}
          </h4>
          <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
            All valid heroes for this role have either been drafted or eliminated in the ban roster.
          </p>
        </div>
      )}

    </div>
  );
};
