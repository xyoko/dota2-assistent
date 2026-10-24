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
          style: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'nerf':
        return {
          label: 'Nerf',
          style: 'bg-red-950/60 text-red-400 border-red-500/40',
          icon: <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
        };
      case 'fix':
        return {
          label: 'Bug Fix',
          style: 'bg-sky-950/60 text-sky-400 border-sky-500/40',
          icon: <Bug className="w-3.5 h-3.5 text-sky-400" />
        };
      case 'rework':
        return {
          label: 'Rework',
          style: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-hud-surface border border-white/[0.08] text-hud-cyan text-xs font-mono font-bold uppercase tracking-wider">
                <Newspaper className="w-3.5 h-3.5 text-hud-cyan" />
                Patch Changelog
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-hud-surface px-2.5 py-1 rounded-md border border-white/[0.08] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {currentPatch.releaseDate}
              </span>
            </div>
            
            <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-100 tracking-tight uppercase flex items-center gap-3">
              <span>Patch {currentPatch.version}: {currentPatch.title}</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              {currentPatch.overview}
            </p>
          </div>

          {/* Patch Version Selector Tabs */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Select Patch:
            </span>
            <div className="flex gap-1.5 bg-hud-surface p-1.5 rounded-lg border border-white/[0.08]">
              {PATCH_NOTES_DATA.map((p) => (
                <button
                  key={p.version}
                  onClick={() => setSelectedPatchVersion(p.version)}
                  className={`min-h-[44px] sm:min-h-0 touch-target px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors focus-hud ${
                    selectedPatchVersion === p.version
                      ? 'bg-hud-cyan text-slate-950 shadow-hud-sm font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Patch {p.version}
                  {p.isLatest && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-slate-950 text-hud-cyan font-mono font-bold uppercase">
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
        <div className="bg-hud-panel border border-white/[0.08] p-3.5 rounded-xl text-center shadow-hud-sm">
          <div className="text-xl font-bold font-mono tabular-nums text-slate-200">{stats.total}</div>
          <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Total Updates</div>
        </div>

        <div className="bg-hud-panel border border-emerald-500/20 p-3.5 rounded-xl text-center shadow-hud-sm">
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 flex items-center justify-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>{stats.buffs}</span>
          </div>
          <div className="text-[10px] uppercase font-mono text-emerald-400/80 mt-0.5">Buffed Heroes</div>
        </div>

        <div className="bg-hud-panel border border-red-500/20 p-3.5 rounded-xl text-center shadow-hud-sm">
          <div className="text-xl font-bold font-mono tabular-nums text-red-400 flex items-center justify-center gap-1">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <span>{stats.nerfs}</span>
          </div>
          <div className="text-[10px] uppercase font-mono text-red-400/80 mt-0.5">Nerfed Heroes</div>
        </div>

        <div className="bg-hud-panel border border-sky-500/20 p-3.5 rounded-xl text-center shadow-hud-sm">
          <div className="text-xl font-bold font-mono tabular-nums text-sky-400 flex items-center justify-center gap-1">
            <Bug className="w-4 h-4 text-sky-400" />
            <span>{stats.fixes}</span>
          </div>
          <div className="text-[10px] uppercase font-mono text-sky-400/80 mt-0.5">Bug Fixes</div>
        </div>

        <div className="bg-hud-panel border border-amber-500/20 p-3.5 rounded-xl text-center shadow-hud-sm col-span-2 sm:col-span-1">
          <div className="text-xl font-bold font-mono tabular-nums text-hud-gold flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-hud-gold" />
            <span>{stats.facetChanges}</span>
          </div>
          <div className="text-[10px] uppercase font-mono text-hud-gold/80 mt-0.5">Facet / Innate</div>
        </div>
      </div>

      {/* System & Global Map Changes Box */}
      {currentPatch.systemChanges && currentPatch.systemChanges.length > 0 && (
        <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-sm space-y-3">
          <div className="flex items-center gap-2 text-hud-gold font-display font-semibold text-xs sm:text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 text-hud-gold" />
            <span>Global Game, Map & Objective Adjustments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentPatch.systemChanges.map((sys, idx) => (
              <div key={idx} className="bg-hud-surface border border-white/[0.06] rounded-lg p-3.5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-hud-bg text-hud-gold font-bold uppercase">
                    {sys.category}
                  </span>
                  <h3 className="font-display font-semibold text-xs sm:text-sm text-slate-100 mt-1.5">
                    {sys.title}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {sys.changes.map((c, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 font-sans leading-relaxed">
                        <span className="text-hud-cyan font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 font-mono">
                  Impact: {sys.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 shadow-hud-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Change Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1 hidden sm:inline">Filter:</span>
          {(['all', 'buff', 'nerf', 'fix', 'rework'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`min-h-[44px] sm:min-h-0 touch-target px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors focus-hud ${
                filterType === t
                  ? 'bg-hud-cyan text-slate-950 font-bold shadow-hud-sm'
                  : 'bg-hud-surface border border-white/[0.06] text-slate-400 hover:text-slate-200'
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
            aria-label="Filter by hero role"
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="min-h-[44px] sm:min-h-0 bg-hud-surface border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-mono uppercase text-slate-200 focus:outline-none focus:border-hud-cyan focus-hud"
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
              className="w-full pl-8 pr-3 py-2 min-h-[44px] bg-hud-surface border border-white/[0.08] rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-hud-cyan focus-hud transition-colors"
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
                className="bg-hud-panel border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 sm:p-6 shadow-hud-sm transition-colors space-y-4"
              >
                {/* Header: Hero Avatar, Name, Change Badge, Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  
                  <div className="flex items-center gap-3">
                    <img
                      src={change.avatarUrl}
                      alt={change.heroName}
                      loading="lazy"
                      decoding="async"
                      onClick={() => handleHeroClick(change.heroId)}
                      className="w-12 h-12 rounded-lg object-cover border border-white/[0.1] hover:border-hud-cyan cursor-pointer transition-colors shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h2
                          onClick={() => handleHeroClick(change.heroId)}
                          className="font-display font-semibold text-base sm:text-lg text-slate-100 hover:text-hud-cyan cursor-pointer transition-colors"
                        >
                          {change.heroName}
                        </h2>
                        <span className="text-xs text-slate-400 font-mono">
                          ({change.primaryRole})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {change.targetName}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border ${typeBadge.style}`}>
                      {typeBadge.icon}
                      <span>{typeBadge.label}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-hud-surface text-slate-300 border border-white/[0.08] uppercase">
                      {change.category}
                    </span>

                    <button
                      onClick={() => handleHeroClick(change.heroId)}
                      className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-target p-2 rounded-lg bg-hud-surface hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-colors focus-hud flex items-center justify-center"
                      title="Inspect Hero Build Guide"
                      aria-label={`Inspect ${change.heroName} Build Guide`}
                    >
                      <ExternalLink className="w-4 h-4 text-hud-cyan" />
                    </button>
                  </div>

                </div>

                {/* Change Details */}
                <div className="space-y-2.5">
                  <div className="font-sans font-medium text-xs sm:text-sm text-slate-200">
                    {change.summary}
                  </div>

                  {/* Bulleted exact numbers / changes */}
                  <div className="bg-hud-surface border border-white/[0.06] rounded-lg p-3.5 space-y-1.5">
                    {change.details.map((detail, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-start gap-2 font-sans leading-relaxed">
                        <span className="text-hud-cyan font-bold mt-0.5">▸</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bug Fix Context Alert Box (if present) */}
                  {change.bugfixContext && (
                    <div className="bg-sky-950/20 border border-sky-500/30 rounded-lg p-3 flex items-start gap-2.5">
                      <Bug className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
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
                    <div className="md:col-span-3 bg-hud-surface border border-white/[0.06] rounded-lg p-3">
                      <span className="text-[10px] font-mono font-bold text-hud-gold uppercase tracking-wider block mb-0.5">
                        Tactical Meta Impact & Gameplay Takeaway:
                      </span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {change.metaImpact}
                      </p>
                    </div>

                    <div className="bg-hud-surface border border-white/[0.06] rounded-lg p-3 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Patch Verdict
                      </span>
                      <span className="text-xs font-mono font-bold text-hud-cyan bg-hud-bg px-2.5 py-1 rounded-md border border-hud-cyan/30 uppercase">
                        {change.verdict}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-10 text-center space-y-2">
            <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="font-display font-semibold text-slate-200">No Patch Notes Found</div>
            <p className="text-xs text-slate-400 font-sans">No hero changes match your current filters or search query.</p>
          </div>
        )}
      </div>

    </div>
  );
};
