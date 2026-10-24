'use client';

import React, { useState, useMemo } from 'react';
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

export const RoleOptimalPicks: React.FC<RoleOptimalPicksProps> = React.memo(({
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
  } = useMemo(() => {
    return getRolePickSuggestions(selectedPos, allySlots, opponentSlots, banIds, favorites);
  }, [selectedPos, allySlots, opponentSlots, banIds, favorites]);

  const roleDef = POSITION_DEFINITIONS[selectedPos];
  const currentAllyHeroId = allySlots[selectedPos - 1];

  return (
    <div className="space-y-4 rounded-lg bg-hud-surface border border-white/[0.08] p-4 sm:p-5">
      
      {/* Top Header: Title & Role Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text flex items-center gap-2">
              Optimal & Counter Picks
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                Per-Role Analytics
              </span>
            </h3>
            <p className="text-xs text-hud-text-muted">
              Suggestions for Allies tailored to each assigned lane and position
            </p>
          </div>
        </div>

        {/* Dedicated 5 Role Tabs */}
        <div className="flex items-center gap-0.5 bg-hud-bg p-0.5 rounded-md border border-white/[0.08] overflow-x-auto">
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-hud-surface-raised text-hud-text font-medium border border-white/[0.12] shadow-sm'
                    : 'text-hud-text-muted hover:text-hud-text'
                }`}
              >
                <span>Pos {pos}</span>
                <span className="text-[11px] opacity-75 hidden sm:inline">
                  {def.name.split(' ')[2] || def.name.split(' ')[1]}
                </span>
                {hasAlly && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Ally role filled" />
                )}
                {hasOpp && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Opponent hero locked" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matchup Context Banner */}
      <div className="p-3 rounded-md border border-white/[0.08] bg-hud-bg/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-base">
            {hasOpponentPickedRole ? '⚔️' : isFirstPickSituation ? '👑' : '🎯'}
          </span>
          <div>
            <div className="font-medium text-hud-text flex items-center gap-2">
              <span>{roleDef.name} ({roleDef.lane})</span>
              <span className="text-hud-text-muted">•</span>
              {hasOpponentPickedRole && opponentHero ? (
                <span className="text-red-400 font-medium flex items-center gap-1">
                  Opponent Locked: <strong className="text-hud-text font-semibold">{opponentHero.name}</strong>
                </span>
              ) : isFirstPickSituation ? (
                <span className="text-amber-400 font-medium">
                  First Pick Advantage — Showing Safe Blind Meta Picks
                </span>
              ) : (
                <span className="text-sky-300 font-medium">
                  Opponent has not selected a {roleDef.name} yet
                </span>
              )}
            </div>
            <p className="text-xs text-hud-text-muted mt-0.5">
              {hasOpponentPickedRole && opponentHero
                ? `Direct counter-measures and armor/damage profile advantages vs ${opponentHero.name}`
                : `Excluding all banned heroes from the ban roster (${banIds.length} banned heroes). Favoring your marked favorites.`}
            </p>
          </div>
        </div>

        {currentAllyHeroId && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ally Slot Pos {selectedPos} currently assigned</span>
          </div>
        )}
      </div>

      {/* Suggestions Cards Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {suggestions.map((sugg) => {
            const isFav = sugg.isFavorite;

            return (
              <div
                key={`pick-card-${sugg.hero.id}`}
                className={`relative rounded-md border p-3 flex flex-col justify-between transition-colors group ${
                  isFav
                    ? 'bg-hud-bg/90 border-amber-500/40 hover:border-amber-400'
                    : 'bg-hud-bg/70 border-white/[0.08] hover:border-emerald-500/40 hover:bg-hud-surface-raised'
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
                          className="w-10 h-10 rounded-md object-cover border border-white/[0.1] group-hover:border-emerald-500/50 transition-colors"
                        />
                        {isFav && (
                          <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                            <Star className="w-2 h-2 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-xs text-hud-text truncate group-hover:text-emerald-400 transition-colors">
                            {sugg.hero.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-hud-text-muted">
                          <span className="font-mono text-emerald-400 font-medium tabular-nums">{sugg.winRate}% WR</span>
                          <span>•</span>
                          <span className="uppercase text-[9px] font-mono px-1 py-0.2 rounded bg-hud-surface text-hud-text-muted border border-white/[0.06]">
                            {sugg.hero.attribute.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Score Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold tabular-nums">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{sugg.score}%</span>
                      </div>
                      {isFav && (
                        <span className="text-[9px] text-amber-400 font-mono mt-0.5">
                          ★ Favorite
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Tactical Reason */}
                  <div className="p-2 rounded bg-hud-surface border border-white/[0.06] text-xs text-hud-text-muted leading-relaxed">
                    <span className="text-emerald-400 font-medium mr-1">Why pick:</span>
                    {sugg.reasons[0]}
                  </div>

                  {/* Strengths Section */}
                  <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-emerald-400 tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Strengths:</span>
                    </div>
                    <ul className="text-xs text-hud-text-muted space-y-0.5 list-disc list-inside">
                      {sugg.strengths.slice(0, 2).map((str, idx) => (
                        <li key={`str-${idx}`} className="leading-tight">
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses Section */}
                  <div className="p-2.5 rounded bg-red-500/5 border border-red-500/20 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-red-400 tracking-wider">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>Weaknesses:</span>
                    </div>
                    <ul className="text-xs text-hud-text-muted space-y-0.5 list-disc list-inside">
                      {sugg.weaknesses.slice(0, 2).map((weak, idx) => (
                        <li key={`weak-${idx}`} className="leading-tight">
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onSelectHero && (
                      <button
                        onClick={() => onSelectHero(sugg.hero)}
                        className="text-xs text-hud-text-muted hover:text-hud-text font-mono transition-colors touch-target"
                        title={`View tactical guide for ${sugg.hero.name}`}
                      >
                        Guide →
                      </button>
                    )}

                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(sugg.hero.id)}
                        className={`p-1.5 rounded transition-colors touch-target ${
                          isFav ? 'text-amber-400 hover:text-hud-text-muted' : 'text-hud-text-muted hover:text-amber-400'
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
                    className="px-2.5 py-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-medium text-xs transition-colors flex items-center gap-1 touch-target"
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
        <div className="p-8 rounded-lg bg-hud-surface border border-white/[0.08] text-center space-y-2">
          <Info className="w-5 h-5 text-hud-text-muted mx-auto" />
          <h4 className="font-semibold text-sm text-hud-text">
            No Available Heroes for {roleDef.name}
          </h4>
          <p className="text-xs text-hud-text-muted max-w-md mx-auto">
            All valid heroes for this role have either been drafted or eliminated in the ban roster.
          </p>
        </div>
      )}

    </div>
  );
});
