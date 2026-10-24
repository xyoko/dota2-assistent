'use client';

import React, { useState, useMemo } from 'react';
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

export const RoleBanSuggestions: React.FC<RoleBanSuggestionsProps> = React.memo(({
  allySlots,
  opponentSlots,
  banIds,
  favorites,
  onBanHero,
  onSelectHero,
  initialPos = 1
}) => {
  const [selectedPos, setSelectedPos] = useState<PositionNumber>(initialPos);

  const { suggestions, allyRoleHero, opponentRoleHero } = useMemo(() => {
    return getRoleBanSuggestions(
      selectedPos,
      allySlots,
      opponentSlots,
      banIds,
      favorites
    );
  }, [selectedPos, allySlots, opponentSlots, banIds, favorites]);

  const roleDef = POSITION_DEFINITIONS[selectedPos];

  return (
    <div className="space-y-4 rounded-lg bg-hud-surface border border-white/[0.08] p-4 sm:p-5">
      
      {/* Top Header: Title & Role Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text flex items-center gap-2">
              Targeted Ban Suggestions
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 uppercase">
                Threat Defense
              </span>
            </h3>
            <p className="text-xs text-hud-text-muted">
              Strategic bans that neutralize hard counters and deny opponent win conditions
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
                key={`ban-tab-pos-${pos}`}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Ally hero picked" />
                )}
                {hasOpp && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Opponent hero picked" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategic Context Banner */}
      <div className="p-3 rounded-md border border-white/[0.08] bg-hud-bg/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-base">
            {allyRoleHero ? '🛡️' : opponentRoleHero ? '🚫' : '⚠️'}
          </span>
          <div>
            <div className="font-medium text-hud-text flex items-center gap-2">
              <span>{roleDef.name} ({roleDef.lane}) Ban Strategy</span>
              <span className="text-hud-text-muted">•</span>
              {allyRoleHero ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  Protecting Ally Core: <strong className="text-hud-text font-semibold">{allyRoleHero.name}</strong>
                </span>
              ) : opponentRoleHero ? (
                <span className="text-red-400 font-medium">
                  Denying Synergies with Opponent’s {opponentRoleHero.name}
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  Pre-Draft Meta Bans (Neutralizing High-MMR Threats)
                </span>
              )}
            </div>
            <p className="text-xs text-hud-text-muted mt-0.5">
              Active Ban Roster: <strong className="text-red-400 font-mono tabular-nums">{banIds.length}</strong> heroes banned across both teams. All banned heroes are excluded from recommendations.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-hud-text-muted bg-hud-surface px-2.5 py-1 rounded-md border border-white/[0.06] tabular-nums">
          {suggestions.length} Threats for {roleDef.name}
        </div>
      </div>

      {/* Ban Suggestions Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {suggestions.map((ban) => {
            const isCritical = ban.priority === 'CRITICAL';
            const isHigh = ban.priority === 'HIGH';

            return (
              <div
                key={`ban-card-${ban.hero.id}`}
                className={`relative rounded-md border p-3 flex flex-col justify-between transition-colors group ${
                  isCritical
                    ? 'bg-hud-bg/90 border-red-500/40 hover:border-red-400'
                    : isHigh
                    ? 'bg-hud-bg/80 border-amber-500/40 hover:border-amber-400'
                    : 'bg-hud-bg/70 border-white/[0.08] hover:border-white/[0.16]'
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
                          className="w-10 h-10 rounded-md object-cover border border-white/[0.1] group-hover:border-red-500/60 transition-colors"
                        />
                        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-red-600 flex items-center justify-center text-white">
                          <Lock className="w-2 h-2" />
                        </div>
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-xs text-hud-text truncate group-hover:text-red-400 transition-colors">
                            {ban.hero.name}
                          </h4>
                          {ban.isFavorite && (
                            <span className="text-[9px] font-mono font-medium text-amber-400 flex items-center gap-0.5">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-hud-text-muted">
                          <span className="font-mono text-red-400 font-medium tabular-nums">{ban.hero.winRate}% WR</span>
                          <span>•</span>
                          <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-hud-surface text-hud-text-muted border border-white/[0.06]">
                            {ban.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Threat Priority Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 font-semibold'
                          : isHigh
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium'
                          : 'bg-hud-surface text-hud-text-muted border-white/[0.08]'
                      }`}>
                        {ban.priority}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-amber-400 mt-0.5 tabular-nums">
                        {ban.impactScore}/100 Threat
                      </span>
                    </div>
                  </div>

                  {/* Why Ban Reason */}
                  <div className="p-2 rounded bg-hud-surface border border-white/[0.06] text-xs text-hud-text-muted leading-relaxed">
                    <span className="text-red-400 font-medium mr-1">Why ban:</span>
                    {ban.reason}
                  </div>

                  {/* Dangerous Strengths if Left Unbanned */}
                  <div className="p-2.5 rounded bg-red-500/5 border border-red-500/20 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-red-400 tracking-wider">
                      <Flame className="w-3 h-3 text-red-400" />
                      <span>Threat Strengths if Unbanned:</span>
                    </div>
                    <ul className="text-xs text-hud-text-muted space-y-0.5 list-disc list-inside">
                      {ban.strengths.slice(0, 2).map((str, idx) => (
                        <li key={`ban-str-${idx}`} className="leading-tight">
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exploitable Weaknesses if Left in Pool */}
                  <div className="p-2.5 rounded bg-hud-surface border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-hud-text-muted tracking-wider">
                      <Shield className="w-3 h-3 text-hud-text-muted" />
                      <span>Vulnerabilities if Allowed:</span>
                    </div>
                    <ul className="text-xs text-hud-text-muted space-y-0.5 list-disc list-inside">
                      {ban.weaknesses.slice(0, 2).map((weak, idx) => (
                        <li key={`ban-weak-${idx}`} className="leading-tight">
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  {onSelectHero ? (
                    <button
                      onClick={() => onSelectHero(ban.hero)}
                      className="text-xs text-hud-text-muted hover:text-hud-text font-mono transition-colors touch-target"
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
                    className="px-2.5 py-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-medium text-xs transition-colors flex items-center gap-1.5 touch-target"
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
        <div className="p-8 rounded-lg bg-hud-surface border border-white/[0.08] text-center space-y-2">
          <Info className="w-5 h-5 text-hud-text-muted mx-auto" />
          <h4 className="font-semibold text-sm text-hud-text">
            No Active Ban Threats for {roleDef.name}
          </h4>
          <p className="text-xs text-hud-text-muted max-w-md mx-auto">
            All major threats for this role have already been banned or picked in the current draft.
          </p>
        </div>
      )}

    </div>
  );
});
