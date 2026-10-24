import React, { useState, useMemo } from 'react';
import { HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData, RoleType } from '../../../entities/hero/bi/types';
import { SEASON_META_DATA } from '../../../entities/meta/bi/seasonMetaData';
import { MetaTier } from '../../../entities/meta/bi/types';
import { 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  Clock, 
  Swords, 
  Zap, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';

interface MetaTierListProps {
  onSelectHero: (hero: HeroData) => void;
}

export const MetaTierList: React.FC<MetaTierListProps> = ({ onSelectHero }) => {
  const [selectedRole, setSelectedRole] = useState<RoleType | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<MetaTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'deep' | 'compact'>('deep');
  const [showThemes, setShowThemes] = useState(true);
  const [expandedHeroId, setExpandedHeroId] = useState<string | null>(null);

  // Filter heroes
  const filteredProfiles = useMemo(() => {
    return SEASON_META_DATA.heroes.filter((profile) => {
      // Role filter
      if (selectedRole !== 'all' && !profile.roles.includes(selectedRole)) {
        return false;
      }
      // Tier filter
      if (selectedTier !== 'all' && profile.tier !== selectedTier) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = profile.name.toLowerCase().includes(q);
        const matchesRole = profile.roles.some((r) => r.toLowerCase().includes(q));
        const matchesHeadline = profile.whyMeta.headline.toLowerCase().includes(q);
        const matchesReasons = profile.whyMeta.coreReasons.some((r) => r.toLowerCase().includes(q));
        const matchesFacet = profile.whyMeta.facetSynergy.facetName.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesHeadline && !matchesReasons && !matchesFacet) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRole, selectedTier, searchQuery]);

  // Tier groupings for compact view
  const tierGroups = useMemo(() => {
    return {
      'S+': filteredProfiles.filter((p) => p.tier === 'S+'),
      'S': filteredProfiles.filter((p) => p.tier === 'S'),
      'A': filteredProfiles.filter((p) => p.tier === 'A'),
      'B': filteredProfiles.filter((p) => p.tier === 'B')
    };
  }, [filteredProfiles]);

  const handleHeroClick = (heroId: string) => {
    const hero = HERO_MAP.get(heroId);
    if (hero) {
      onSelectHero(hero);
    }
  };

  const getTierBadgeStyle = (tier: MetaTier) => {
    switch (tier) {
      case 'S+':
        return 'bg-hud-gold/15 text-hud-gold border-hud-gold/60 font-mono font-bold';
      case 'S':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/40 font-mono font-bold';
      case 'A':
        return 'bg-hud-cyan/10 text-hud-cyan border-hud-cyan/40 font-mono font-semibold';
      case 'B':
        return 'bg-white/[0.04] text-slate-300 border-white/[0.12] font-mono';
    }
  };

  const getAttributeColor = (attr: string) => {
    switch (attr) {
      case 'str': return 'text-red-400';
      case 'agi': return 'text-emerald-400';
      case 'int': return 'text-sky-400';
      case 'all': return 'text-purple-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-hud-panel border border-white/[0.1] rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-hud-gold/10 border border-hud-gold/30 text-hud-gold text-xs font-mono font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-hud-gold" />
                {SEASON_META_DATA.patchVersion} • {SEASON_META_DATA.seasonTitle}
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-hud-surface px-2.5 py-0.5 rounded border border-white/[0.08]">
                {SEASON_META_DATA.lastUpdated}
              </span>
            </div>
            
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>Season Meta & Hero Dominance</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              {SEASON_META_DATA.metaSummary}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-hud-surface border border-white/[0.08] p-3 rounded-lg flex-shrink-0">
            <div className="text-center px-3 border-r border-white/[0.08]">
              <div className="text-base font-mono font-bold tabular-nums text-hud-gold">11</div>
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400">Tracked Meta Heroes</div>
            </div>
            <div className="text-center px-3 border-r border-white/[0.08]">
              <div className="text-base font-mono font-bold tabular-nums text-emerald-400">53.8%</div>
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400">Peak Win Rate</div>
            </div>
            <div className="text-center px-3">
              <div className="text-base font-mono font-bold tabular-nums text-hud-cyan">7.37d</div>
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400">Active Balance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Meta Drivers & Insights */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowThemes(!showThemes)}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-hud-gold" />
            <h2 className="font-mono font-bold text-xs sm:text-sm text-slate-200 uppercase tracking-wider">
              Season 7.37d Macro Meta Pillars
            </h2>
          </div>
          <button className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 focus-hud">
            <span>{showThemes ? 'Hide Insights' : 'Show Insights'}</span>
            {showThemes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showThemes && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/[0.08]">
            {SEASON_META_DATA.themes.map((theme, i) => (
              <div key={i} className="bg-hud-surface border border-white/[0.06] rounded-lg p-3 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-hud-cyan/10 border border-hud-cyan/30 text-hud-cyan font-bold uppercase">
                      {theme.badge}
                    </span>
                  </div>
                  <h3 className="font-mono font-bold text-xs text-slate-200">
                    {theme.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                    {theme.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] font-mono text-hud-gold font-bold block mb-0.5 uppercase tracking-wider">Tactical Takeaway:</span>
                  <span className="text-[11px] text-slate-300 italic">{theme.tacticalAdvice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Role:</span>
          {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors active:scale-[0.98] focus-hud touch-target ${
                selectedRole === r
                  ? 'bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/50 shadow-sm'
                  : 'bg-hud-surface border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.2]'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>

        {/* Search, Tier & View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search meta heroes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 min-h-[44px] bg-hud-surface border border-white/[0.1] focus:border-hud-cyan rounded-lg text-xs font-sans text-slate-200 placeholder-slate-400 focus-hud transition-colors"
            />
          </div>

          {/* Tier Select */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as any)}
            className="bg-hud-surface border border-white/[0.1] focus:border-hud-cyan rounded-lg px-2.5 py-1.5 min-h-[44px] text-xs font-mono text-slate-200 focus-hud transition-colors"
          >
            <option value="all">All Tiers</option>
            <option value="S+">S+ Tier (Priority)</option>
            <option value="S">S Tier (Meta Defining)</option>
            <option value="A">A Tier (Solid)</option>
            <option value="B">B Tier (Situational)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-hud-surface border border-white/[0.1] p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('deep')}
              className={`px-3 py-1.5 min-h-[40px] text-xs font-mono font-bold rounded uppercase tracking-wider transition-colors focus-hud ${
                viewMode === 'deep'
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Deep tactical breakdown with Why Meta, Facets, and Spikes"
            >
              Deep
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 min-h-[40px] text-xs font-mono font-bold rounded uppercase tracking-wider transition-colors focus-hud ${
                viewMode === 'compact'
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Tier List Grid"
            >
              Grid
            </button>
          </div>

        </div>

      </div>

      {/* MAIN VIEW: DEEP META ANALYSIS (Detailed Why Meta Cards) */}
      {viewMode === 'deep' ? (
        <div className="space-y-4">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((hero) => {
              const isExpanded = expandedHeroId === hero.heroId;

              return (
                <div
                  key={hero.heroId}
                  className="bg-hud-panel border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-4 sm:p-5 shadow-sm transition-colors relative overflow-hidden"
                >
                  {/* Top Bar: Hero Basic Info, Tier, Win/Pick/Ban Rates */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    
                    {/* Left: Avatar, Name, Title, Roles */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative group cursor-pointer" onClick={() => handleHeroClick(hero.heroId)}>
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/[0.12] shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-bold border ${getTierBadgeStyle(hero.tier)}`}>
                          {hero.tier}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            onClick={() => handleHeroClick(hero.heroId)}
                            className="font-display font-bold text-lg sm:text-xl text-white hover:text-hud-cyan cursor-pointer transition-colors"
                          >
                            {hero.name}
                          </h2>
                          <span className={`text-xs font-mono font-semibold uppercase ${getAttributeColor(hero.attribute)}`}>
                            • {hero.primaryRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          {hero.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {hero.roles.map((r) => (
                            <span key={r} className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-hud-surface text-slate-300 border border-white/[0.08]">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Performance Stats & Trend */}
                    <div className="flex items-center gap-3 sm:gap-5 self-start lg:self-center bg-hud-surface border border-white/[0.08] px-4 py-2 rounded-lg font-mono">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 font-bold tabular-nums text-sm sm:text-base text-emerald-400">
                          <span>{hero.winRate}%</span>
                          {hero.trendDirection === 'up' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Win Rate ({hero.trend})</div>
                      </div>

                      <div className="w-px h-7 bg-white/[0.08]" />

                      <div className="text-center">
                        <div className="font-bold tabular-nums text-sm sm:text-base text-slate-200">
                          {hero.pickRate}%
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Pick Rate</div>
                      </div>

                      <div className="w-px h-7 bg-white/[0.08]" />

                      <div className="text-center">
                        <div className="font-bold tabular-nums text-sm sm:text-base text-hud-gold">
                          {hero.banRate}%
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Ban Rate</div>
                      </div>

                      <button
                        onClick={() => handleHeroClick(hero.heroId)}
                        className="ml-2 p-2 min-h-[44px] min-w-[44px] rounded-lg bg-hud-surface hover:bg-hud-surfaceAlt border border-white/[0.12] hover:border-hud-cyan/50 text-hud-cyan transition-colors flex items-center justify-center focus-hud touch-target"
                        title="View Full Arsenal Build & Matchups"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* CORE SECTION: WHY IS THIS HERO META THIS SEASON? */}
                  <div className="pt-4 space-y-4">
                    
                    {/* Headline Banner */}
                    <div className="bg-hud-surface border-l-2 border-l-hud-gold pl-3.5 py-2 rounded-r-lg">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-hud-gold block mb-0.5 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-hud-gold" />
                        Why This Hero is Meta This Season:
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-100">
                        {hero.whyMeta.headline}
                      </p>
                    </div>

                    {/* Bulleted Core Tactical Reasons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {hero.whyMeta.coreReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-hud-surface p-2.5 rounded-lg border border-white/[0.06]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 font-sans leading-relaxed">
                            {reason}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Facet & Innate Factor Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      
                      {/* Facet Synergy */}
                      <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-hud-cyan font-mono font-bold text-xs uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-hud-cyan" />
                          <span>Key Facet: {hero.whyMeta.facetSynergy.facetName}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {hero.whyMeta.facetSynergy.description}
                        </p>
                        <div className="text-[11px] text-slate-400 font-medium italic pt-1 border-t border-white/[0.06]">
                          Impact: {hero.whyMeta.facetSynergy.metaImpact}
                        </div>
                      </div>

                      {/* Innate Factor */}
                      <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-hud-gold font-mono font-bold text-xs uppercase tracking-wider">
                          <Zap className="w-3.5 h-3.5 text-hud-gold" />
                          <span>Innate Ability: {hero.whyMeta.innateFactor.innateName}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {hero.whyMeta.innateFactor.description}
                        </p>
                        <div className="text-[11px] text-slate-400 font-medium italic pt-1 border-t border-white/[0.06]">
                          Pro Tip: {hero.whyMeta.proTip}
                        </div>
                      </div>

                    </div>

                    {/* Toggleable Details: Item Timing Spikes, Synergies, Counters */}
                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedHeroId(isExpanded ? null : hero.heroId)}
                        className="text-xs font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors focus-hud"
                      >
                        <span>{isExpanded ? 'Hide Timing Spikes & Matchups' : 'View Item Timing Spikes, Synergies & Counters'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-3">
                          
                          {/* Timing Spikes */}
                          <div>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
                              <Clock className="w-3.5 h-3.5 text-hud-gold" />
                              Peak Item Timing Spikes This Season
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {hero.whyMeta.timingSpikes.map((spike, i) => (
                                <div key={i} className="bg-hud-surface border border-white/[0.06] p-2.5 rounded-lg space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm bg-hud-gold/15 text-hud-gold font-bold">
                                      {spike.timing}
                                    </span>
                                    <span className="text-xs font-bold text-slate-200">{spike.item}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-tight">
                                    {spike.impact}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Synergies and Counters */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="bg-hud-surface border border-emerald-500/20 p-3 rounded-lg space-y-1">
                              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                                Strong Synergies This Season
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {hero.whyMeta.bestWith.map((ally, idx) => (
                                  <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                                    {ally}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-hud-surface border border-red-500/20 p-3 rounded-lg space-y-1">
                              <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                Hard Counters in Current Meta
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {hero.whyMeta.counteredBy.map((counter, idx) => (
                                  <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30 text-red-200">
                                    {counter}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })
          ) : (
            <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-8 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-mono font-bold text-slate-300">No Meta Heroes Match Criteria</div>
              <p className="text-xs text-slate-400">Try changing role filters or clearing your search term.</p>
            </div>
          )}
        </div>
      ) : (
        /* COMPACT TIER GRID VIEW */
        <div className="space-y-6">
          {(['S+', 'S', 'A', 'B'] as const).map((tierKey) => {
            const list = tierGroups[tierKey];
            if (list.length === 0) return null;

            return (
              <div key={tierKey} className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3">
                  <div className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getTierBadgeStyle(tierKey)}`}>
                    {tierKey} TIER
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-xs sm:text-sm text-slate-200 uppercase tracking-wider">
                      {tierKey === 'S+' && 'God Tier • Priority Pick or Ban'}
                      {tierKey === 'S' && 'Dominant Meta Staples • First Phase Viable'}
                      {tierKey === 'A' && 'Strong & Reliable Performers'}
                      {tierKey === 'B' && 'Situational & Niche Counterpicks'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      {tierKey === 'S+' && 'Heroes with runaway win rates and game-defining facet mechanics.'}
                      {tierKey === 'S' && 'Consistent high-tempo picks that dictate macro teamfights.'}
                      {tierKey === 'A' && 'Solid, reliable heroes with clear strengths in the current patch.'}
                      {tierKey === 'B' && 'Excels when drafted into specific favorable matchups.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {list.map((hero) => (
                    <div
                      key={hero.heroId}
                      onClick={() => handleHeroClick(hero.heroId)}
                      style={{ contentVisibility: 'auto', containIntrinsicSize: '68px' }}
                      className="group bg-hud-surface border border-white/[0.08] hover:border-hud-cyan/50 rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-sm focus-hud touch-target"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded object-cover border border-white/[0.1] group-hover:border-hud-cyan/50 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-white group-hover:text-hud-cyan transition-colors truncate">
                            {hero.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {hero.primaryRole} • {hero.whyMeta.facetSynergy.facetName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="font-mono font-bold tabular-nums text-xs text-emerald-400 flex items-center justify-end gap-0.5">
                          <span>{hero.winRate}%</span>
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-400">{hero.pickRate}% Pick</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
