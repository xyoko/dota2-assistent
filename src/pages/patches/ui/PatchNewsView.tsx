import React, { useState, useMemo } from 'react';
import { PATCH_NOTES_DATA } from '../../../entities/patch/bi/patchNotes';
import { PatchChangeType } from '../../../entities/patch/bi/types';
import { HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData, RoleType } from '../../../entities/hero/bi/types';
import { 
  Newspaper, 
  Bug, 
  Wrench, 
  Sparkles, 
  Search, 
  ExternalLink, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Zap 
} from 'lucide-react';

interface PatchNewsViewProps {
  onSelectHero: (hero: HeroData) => void;
}

export const PatchNewsView: React.FC<PatchNewsViewProps> = ({ onSelectHero }) => {
  const [selectedPatchVersion, setSelectedPatchVersion] = useState<string>(
    PATCH_NOTES_DATA[0].version
  );
  const [filterType, setFilterType] = useState<PatchChangeType | 'all'>('all');
  const [filterRole, setFilterRole] = useState<RoleType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentPatch = useMemo(() => {
    return (
      PATCH_NOTES_DATA.find((p) => p.version === selectedPatchVersion) ||
      PATCH_NOTES_DATA[0]
    );
  }, [selectedPatchVersion]);

  // Filtered hero changes
  const filteredChanges = useMemo(() => {
    return currentPatch.heroChanges.filter((change) => {
      // Type filter
      if (filterType !== 'all' && change.changeType !== filterType) {
        return false;
      }
      // Role filter
      if (filterRole !== 'all' && change.primaryRole !== filterRole) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesHero = change.heroName.toLowerCase().includes(q);
        const matchesTarget = change.targetName.toLowerCase().includes(q);
        const matchesSummary = change.summary.toLowerCase().includes(q);
        const matchesDetails = change.details.some((d) => d.toLowerCase().includes(q));
        const matchesBugfix = change.bugfixContext?.toLowerCase().includes(q);
        const matchesImpact = change.metaImpact.toLowerCase().includes(q);
        if (!matchesHero && !matchesTarget && !matchesSummary && !matchesDetails && !matchesBugfix && !matchesImpact) {
          return false;
        }
      }
      return true;
    });
  }, [currentPatch, filterType, filterRole, searchQuery]);

  // Statistics for current patch
  const stats = useMemo(() => {
    const total = currentPatch.heroChanges.length;
    const buffs = currentPatch.heroChanges.filter((c) => c.changeType === 'buff').length;
    const nerfs = currentPatch.heroChanges.filter((c) => c.changeType === 'nerf').length;
    const fixes = currentPatch.heroChanges.filter((c) => c.changeType === 'fix' || !!c.bugfixContext).length;
    const facetChanges = currentPatch.heroChanges.filter((c) => c.category === 'facet' || c.category === 'innate').length;
    return { total, buffs, nerfs, fixes, facetChanges };
  }, [currentPatch]);

  const handleHeroClick = (heroId: string) => {
    const hero = HERO_MAP.get(heroId);
    if (hero) {
      onSelectHero(hero);
    }
  };

  const getChangeTypeBadge = (type: PatchChangeType) => {
    switch (type) {
      case 'buff':
        return {
          label: 'Buff',
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'nerf':
        return {
          label: 'Nerf',
          style: 'bg-red-500/20 text-red-300 border-red-500/50',
          icon: <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
        };
      case 'fix':
        return {
          label: 'Bug Fix',
          style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
          icon: <Bug className="w-3.5 h-3.5 text-cyan-400" />
        };
      case 'rework':
        return {
          label: 'Rework',
          style: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          icon: <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-dota-panel to-blue-950/40 border-2 border-dota-border rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
                Patch Notes & Hero Fixes
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {currentPatch.releaseDate}
              </span>
            </div>
            
            <h1 className="font-dota font-black text-2xl sm:text-3xl text-white tracking-wide flex items-center gap-3">
              <span>Patch {currentPatch.version}: {currentPatch.title}</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              {currentPatch.overview}
            </p>
          </div>

          {/* Patch Version Selector Tabs */}
          <div className="flex flex-wrap lg:flex-col gap-2 flex-shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Patch:
            </span>
            <div className="flex gap-1.5 bg-dota-bg/90 p-1.5 rounded-xl border border-slate-800">
              {PATCH_NOTES_DATA.map((p) => (
                <button
                  key={p.version}
                  onClick={() => setSelectedPatchVersion(p.version)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPatchVersion === p.version
                      ? 'bg-cyan-600 text-white shadow font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Patch {p.version}
                  {p.isLatest && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-emerald-500 text-slate-950 font-black uppercase">
                      Latest
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patch Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-dota-panel border border-slate-800 p-3.5 rounded-xl text-center shadow">
          <div className="text-xl font-black font-dota text-slate-200">{stats.total}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Hero Updates</div>
        </div>

        <div className="bg-dota-panel border border-emerald-950/60 p-3.5 rounded-xl text-center shadow">
          <div className="text-xl font-black font-dota text-emerald-400 flex items-center justify-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>{stats.buffs}</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-emerald-400/80">Buffed Heroes</div>
        </div>

        <div className="bg-dota-panel border border-red-950/60 p-3.5 rounded-xl text-center shadow">
          <div className="text-xl font-black font-dota text-red-400 flex items-center justify-center gap-1">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <span>{stats.nerfs}</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-red-400/80">Nerfed Heroes</div>
        </div>

        <div className="bg-dota-panel border border-cyan-950/60 p-3.5 rounded-xl text-center shadow">
          <div className="text-xl font-black font-dota text-cyan-400 flex items-center justify-center gap-1">
            <Bug className="w-4 h-4 text-cyan-400" />
            <span>{stats.fixes}</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-cyan-400/80">Bug Fixes Applied</div>
        </div>

        <div className="bg-dota-panel border border-purple-950/60 p-3.5 rounded-xl text-center shadow col-span-2 sm:col-span-1">
          <div className="text-xl font-black font-dota text-purple-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{stats.facetChanges}</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-purple-400/80">Facet / Innate Tweaks</div>
        </div>
      </div>

      {/* System & Global Map Changes Box */}
      {currentPatch.systemChanges && currentPatch.systemChanges.length > 0 && (
        <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-dota font-bold text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Global Game, Map & Objective Adjustments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentPatch.systemChanges.map((sys, idx) => (
              <div key={idx} className="bg-dota-bg/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold uppercase">
                    {sys.category}
                  </span>
                  <h3 className="font-dota font-bold text-xs sm:text-sm text-slate-200 mt-1.5">
                    {sys.title}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {sys.changes.map((c, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
                  Impact: {sys.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-dota-panel border border-dota-border rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Change Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Filter:</span>
          {(['all', 'buff', 'nerf', 'fix', 'rework'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                filterType === t
                  ? 'bg-cyan-600 text-white shadow font-black'
                  : 'bg-dota-bg border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {t === 'all' ? 'All Updates' : t === 'fix' ? 'Bug Fixes' : `${t}s`}
            </button>
          ))}
        </div>

        {/* Role Filter & Hero Search */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="bg-dota-bg border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Roles</option>
            <option value="Carry">Carry</option>
            <option value="Mid">Mid</option>
            <option value="Offlane">Offlane</option>
            <option value="Soft Support">Soft Support</option>
            <option value="Hard Support">Hard Support</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hero, spell, bugfix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-dota-bg border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

        </div>

      </div>

      {/* Hero Changes List */}
      <div className="space-y-4">
        {filteredChanges.length > 0 ? (
          filteredChanges.map((change, idx) => {
            const typeBadge = getChangeTypeBadge(change.changeType);

            return (
              <div
                key={`${change.heroId}-${idx}`}
                className="bg-dota-panel border-2 border-dota-border hover:border-slate-600 rounded-2xl p-4 sm:p-6 shadow-xl transition-all space-y-4"
              >
                {/* Header: Hero Avatar, Name, Change Badge, Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  
                  <div className="flex items-center gap-3">
                    <img
                      src={change.avatarUrl}
                      alt={change.heroName}
                      onClick={() => handleHeroClick(change.heroId)}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 hover:border-cyan-400 cursor-pointer transition-transform hover:scale-105"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h2
                          onClick={() => handleHeroClick(change.heroId)}
                          className="font-dota font-black text-lg text-white hover:text-cyan-300 cursor-pointer transition-colors"
                        >
                          {change.heroName}
                        </h2>
                        <span className="text-xs text-slate-400 font-sans">
                          ({change.primaryRole})
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {change.targetName}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeBadge.style}`}>
                      {typeBadge.icon}
                      <span>{typeBadge.label}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                      {change.category}
                    </span>

                    <button
                      onClick={() => handleHeroClick(change.heroId)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Inspect Hero Build Guide"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Change Details */}
                <div className="space-y-2.5">
                  <div className="font-semibold text-xs sm:text-sm text-slate-200">
                    {change.summary}
                  </div>

                  {/* Bulleted exact numbers / changes */}
                  <div className="bg-dota-bg/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    {change.details.map((detail, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-start gap-2 font-mono">
                        <span className="text-cyan-400 mt-0.5">▸</span>
                        <span className="font-sans">{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bug Fix Context Alert Box (if present) */}
                  {change.bugfixContext && (
                    <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-2.5">
                      <Bug className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                          Resolved Bug Context:
                        </span>
                        <span className="text-xs text-slate-300 font-sans">
                          {change.bugfixContext}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tactical Meta Impact & Verdict */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                    <div className="md:col-span-3 bg-dota-bg/50 border border-slate-800/80 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                        Tactical Meta Impact & Gameplay Takeaway:
                      </span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {change.metaImpact}
                      </p>
                    </div>

                    <div className="bg-dota-bg/50 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Patch Verdict
                      </span>
                      <span className="text-xs font-dota font-black text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        {change.verdict}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-dota-panel border border-dota-border rounded-2xl p-10 text-center space-y-2">
            <Wrench className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="font-dota font-bold text-slate-300">No Patch Notes Found</div>
            <p className="text-xs text-slate-500">No hero changes match your current filters or search query.</p>
          </div>
        )}
      </div>

    </div>
  );
};
