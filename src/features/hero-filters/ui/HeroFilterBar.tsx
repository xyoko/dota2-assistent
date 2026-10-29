import React from 'react';
import { AttributeType, RoleType, AttackType } from '../../../entities/hero/bi/types';
import { Star, ShieldAlert, Zap, Compass } from 'lucide-react';

interface HeroFilterBarProps {
  selectedAttr: AttributeType | 'all';
  setSelectedAttr: (attr: AttributeType | 'all') => void;
  selectedRole: RoleType | 'all';
  setSelectedRole: (role: RoleType | 'all') => void;
  selectedAttack: AttackType | 'all';
  setSelectedAttack: (attack: AttackType | 'all') => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  sortBy: 'winRate' | 'name' | 'complexity';
  setSortBy: (sort: 'winRate' | 'name' | 'complexity') => void;
}

export const HeroFilterBar: React.FC<HeroFilterBarProps> = React.memo(({
  selectedAttr,
  setSelectedAttr,
  selectedRole,
  setSelectedRole,
  selectedAttack,
  setSelectedAttack,
  showFavoritesOnly,
  setShowFavoritesOnly,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 mb-6 shadow-hud-sm space-y-3.5">
      
      {/* Top Row: Attribute Filters + Roles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Attribute Selector */}
        <div className="flex items-center gap-1 bg-hud-bg p-1 rounded-lg border border-white/[0.08] overflow-x-auto no-scrollbar max-w-full touch-pan-x">
          <button
            onClick={() => setSelectedAttr('all')}
            className={`min-h-[44px] sm:min-h-0 touch-target px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedAttr === 'all'
                ? 'bg-hud-surface text-slate-100 border border-white/[0.12] shadow-hud-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedAttr('str')}
            className={`min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedAttr === 'str'
                ? 'bg-red-950/60 text-red-400 border border-red-500/50 shadow-hud-sm'
                : 'text-red-400/70 hover:text-red-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="hidden sm:inline">Strength</span>
            <span className="sm:hidden">STR</span>
          </button>
          <button
            onClick={() => setSelectedAttr('agi')}
            className={`min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedAttr === 'agi'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/50 shadow-hud-sm'
                : 'text-emerald-400/70 hover:text-emerald-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Agility</span>
            <span className="sm:hidden">AGI</span>
          </button>
          <button
            onClick={() => setSelectedAttr('int')}
            className={`min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedAttr === 'int'
                ? 'bg-sky-950/60 text-sky-400 border border-sky-500/50 shadow-hud-sm'
                : 'text-sky-400/70 hover:text-sky-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Intelligence</span>
            <span className="sm:hidden">INT</span>
          </button>
          <button
            onClick={() => setSelectedAttr('uni' as any)}
            className={`min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedAttr === ('uni' as any)
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50 shadow-hud-sm'
                : 'text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
            <span className="hidden sm:inline">Universal</span>
            <span className="sm:hidden">UNI</span>
          </button>
        </div>

        {/* Favorites & Sort Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors focus-hud ${
              showFavoritesOnly
                ? 'bg-hud-surface border-hud-gold/60 text-hud-gold shadow-hud-sm'
                : 'bg-hud-surface border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-hud-gold text-hud-gold' : 'text-slate-400'}`} />
            <span>Favorites</span>
          </button>

          <div className="min-h-[44px] sm:min-h-0 flex items-center gap-1.5 bg-hud-surface border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus-hud">
            <span className="text-slate-400 font-mono text-[11px] uppercase">Sort:</span>
            <select
              value={sortBy}
              aria-label="Sort heroes by"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-mono text-xs uppercase focus:outline-none cursor-pointer"
            >
              <option value="winRate" className="bg-slate-900">Win Rate</option>
              <option value="name" className="bg-slate-900">Hero Name</option>
              <option value="complexity" className="bg-slate-900">Complexity</option>
            </select>
          </div>
        </div>

      </div>

      {/* Bottom Row: Role & Attack Type Pills */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06] overflow-x-auto no-scrollbar touch-pan-x pr-2">
        <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 shrink-0">Role:</span>
        {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`min-h-[44px] sm:min-h-0 touch-target px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedRole === role
                ? 'bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/40 font-semibold shadow-hud-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {role === 'all' ? 'All Roles' : role}
          </button>
        ))}

        <div className="h-4 w-px bg-white/[0.1] mx-1 shrink-0" />

        <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 shrink-0">Attack:</span>
        {(['all', 'Melee', 'Ranged'] as const).map((attack) => (
          <button
            key={attack}
            onClick={() => setSelectedAttack(attack)}
            className={`min-h-[44px] sm:min-h-0 touch-target px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap active:scale-95 shrink-0 focus-hud ${
              selectedAttack === attack
                ? 'bg-hud-surface text-slate-100 border border-white/[0.12] shadow-hud-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {attack === 'all' ? 'All Types' : attack}
          </button>
        ))}
      </div>

    </div>
  );
});
