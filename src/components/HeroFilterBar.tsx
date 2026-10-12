import React from 'react';
import { AttributeType, RoleType, AttackType } from '../types/hero';
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
    <div className="glass-card border border-purple-500/25 rounded-2xl p-4 mb-6 shadow-[0_8px_30px_rgba(168,85,247,0.1)] space-y-3.5">
      
      {/* Top Row: Attribute Filters + Roles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Attribute Selector */}
        <div className="flex items-center gap-1 bg-dota-bg/80 p-1 rounded-lg border border-dota-border">
          <button
            onClick={() => setSelectedAttr('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              selectedAttr === 'all'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedAttr('str')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              selectedAttr === 'str'
                ? 'bg-red-900/60 text-red-400 border border-red-500/50 shadow'
                : 'text-red-400/70 hover:text-red-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-dota-str" />
            <span>Strength</span>
          </button>
          <button
            onClick={() => setSelectedAttr('agi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              selectedAttr === 'agi'
                ? 'bg-green-900/60 text-green-400 border border-green-500/50 shadow'
                : 'text-green-400/70 hover:text-green-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-dota-agi" />
            <span>Agility</span>
          </button>
          <button
            onClick={() => setSelectedAttr('int')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              selectedAttr === 'int'
                ? 'bg-blue-900/60 text-blue-400 border border-blue-500/50 shadow'
                : 'text-blue-400/70 hover:text-blue-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-dota-int" />
            <span>Intelligence</span>
          </button>
          <button
            onClick={() => setSelectedAttr('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              selectedAttr === 'all'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 shadow'
                : 'text-purple-400/70 hover:text-purple-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 via-purple-400 to-pink-500 inline-block" />
            <span>Universal</span>
          </button>
        </div>

        {/* Favorites & Sort Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showFavoritesOnly
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-dota-glow'
                : 'bg-dota-bg/60 border-dota-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>

          <div className="flex items-center gap-1.5 bg-dota-bg/60 border border-dota-border rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="winRate" className="bg-slate-900">Win Rate</option>
              <option value="name" className="bg-slate-900">Hero Name</option>
              <option value="complexity" className="bg-slate-900">Complexity</option>
            </select>
          </div>
        </div>

      </div>

      {/* Bottom Row: Role & Attack Type Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-dota-border/60">
        <span className="text-xs font-medium text-slate-500 mr-1">Role:</span>
        {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedRole === role
                ? 'bg-dota-gold/20 text-dota-gold border border-dota-gold/50 font-semibold'
                : 'bg-dota-bg/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {role === 'all' ? 'All Roles' : role}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

        <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">Attack:</span>
        {(['all', 'Melee', 'Ranged'] as const).map((attack) => (
          <button
            key={attack}
            onClick={() => setSelectedAttack(attack)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedAttack === attack
                ? 'bg-slate-700 text-white border border-slate-500'
                : 'bg-dota-bg/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {attack === 'all' ? 'All Types' : attack}
          </button>
        ))}
      </div>

    </div>
  );
});
