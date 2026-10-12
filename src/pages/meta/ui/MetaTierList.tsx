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
        return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black border-amber-300 shadow-dota-glow';
      case 'S':
        return 'bg-gradient-to-r from-rose-500 to-red-600 text-white font-black border-red-400 shadow-dota-crimson';
      case 'A':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold border-cyan-400';
      case 'B':
        return 'bg-slate-700 text-slate-200 font-semibold border-slate-600';
    }
  };

  const getAttributeColor = (attr: string) => {
    switch (attr) {
      case 'str': return 'text-dota-str';
      case 'agi': return 'text-dota-agi';
      case 'int': return 'text-dota-int';
      case 'all': return 'text-dota-uni';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-dota-panel to-green-950/40 border-2 border-dota-border rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                {SEASON_META_DATA.patchVersion} • {SEASON_META_DATA.seasonTitle}
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                {SEASON_META_DATA.lastUpdated}
              </span>
            </div>
            
            <h1 className="font-dota font-black text-2xl sm:text-3xl text-white tracking-wide flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
              <span>Season Meta & Hero Dominance</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              {SEASON_META_DATA.metaSummary}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-dota-bg/80 border border-dota-border p-3 rounded-xl flex-shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-lg font-black font-dota text-amber-400">11</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Tracked Meta Heroes</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-lg font-black font-dota text-emerald-400">53.8%</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Peak Win Rate</div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-black font-dota text-cyan-400">7.37d</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Active Balance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Meta Drivers & Insights */}
      <div className="bg-dota-panel border border-dota-border rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowThemes(!showThemes)}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="font-dota font-bold text-sm sm:text-base text-slate-200 uppercase tracking-wider">
              Season 7.37d Macro Meta Pillars: What Makes a Hero Meta Right Now?
            </h2>
          </div>
          <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <span>{showThemes ? 'Hide Insights' : 'Show Insights'}</span>
            {showThemes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showThemes && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800">
            {SEASON_META_DATA.themes.map((theme, i) => (
              <div key={i} className="bg-dota-bg/90 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold uppercase">
                      {theme.badge}
                    </span>
                  </div>
                  <h3 className="font-dota font-bold text-xs sm:text-sm text-slate-200">
                    {theme.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                    {theme.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-amber-400/90 font-bold block mb-0.5">Tactical Takeaway:</span>
                  <span className="text-[10px] text-slate-300 italic">{theme.tacticalAdvice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-dota-panel border border-dota-border rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Role:</span>
          {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === r
                  ? 'bg-dota-gold text-slate-950 shadow-dota-glow font-black'
                  : 'bg-dota-bg border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
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
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meta heroes, facets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-dota-bg border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold"
            />
          </div>

          {/* Tier Select */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as any)}
            className="bg-dota-bg border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-dota-gold"
          >
            <option value="all">All Tiers</option>
            <option value="S+">S+ Tier (Broken/Priority)</option>
            <option value="S">S Tier (Meta Defining)</option>
            <option value="A">A Tier (Solid Performers)</option>
            <option value="B">B Tier (Situational)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-dota-bg border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('deep')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                viewMode === 'deep'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Deep tactical breakdown with Why Meta, Facets, and Spikes"
            >
              Deep Analysis
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Tier List Grid"
            >
              Tier Grid
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
                  className="bg-dota-panel border-2 border-dota-border hover:border-slate-600 rounded-2xl p-4 sm:p-6 shadow-xl transition-all relative overflow-hidden"
                >
                  {/* Top Bar: Hero Basic Info, Tier, Win/Pick/Ban Rates */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    
                    {/* Left: Avatar, Name, Title, Roles */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative group cursor-pointer" onClick={() => handleHeroClick(hero.heroId)}>
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-dota-border shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[10px] font-black border ${getTierBadgeStyle(hero.tier)}`}>
                          {hero.tier}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            onClick={() => handleHeroClick(hero.heroId)}
                            className="font-dota font-black text-lg sm:text-xl text-white hover:text-dota-gold cursor-pointer transition-colors"
                          >
                            {hero.name}
                          </h2>
                          <span className={`text-xs font-bold uppercase ${getAttributeColor(hero.attribute)}`}>
                            • {hero.primaryRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          {hero.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {hero.roles.map((r) => (
                            <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Performance Stats & Trend */}
                    <div className="flex items-center gap-3 sm:gap-5 self-start lg:self-center bg-dota-bg/90 border border-slate-800 px-4 py-2.5 rounded-xl">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 font-dota font-black text-sm sm:text-base text-emerald-400">
                          <span>{hero.winRate}%</span>
                          {hero.trendDirection === 'up' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Win Rate ({hero.trend})</div>
                      </div>

                      <div className="w-px h-7 bg-slate-800" />

                      <div className="text-center">
                        <div className="font-dota font-bold text-sm sm:text-base text-slate-200">
                          {hero.pickRate}%
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Pick Rate</div>
                      </div>

                      <div className="w-px h-7 bg-slate-800" />

                      <div className="text-center">
                        <div className="font-dota font-bold text-sm sm:text-base text-amber-400">
                          {hero.banRate}%
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Ban Rate</div>
                      </div>

                      <button
                        onClick={() => handleHeroClick(hero.heroId)}
                        className="ml-2 p-2 rounded-lg bg-dota-red hover:bg-red-600 text-white transition-all shadow-dota-crimson"
                        title="View Full Arsenal Build & Matchups"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* CORE SECTION: WHY IS THIS HERO META THIS SEASON? */}
                  <div className="pt-4 space-y-4">
                    
                    {/* Headline Banner */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-dota-bg to-transparent border-l-4 border-amber-500 pl-3.5 py-1.5">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block mb-0.5 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Why This Hero is Meta This Season:
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-100">
                        {hero.whyMeta.headline}
                      </p>
                    </div>

                    {/* Bulleted Core Tactical Reasons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {hero.whyMeta.coreReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-dota-bg/60 p-2.5 rounded-xl border border-slate-800/80">
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
                      <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Key Facet: {hero.whyMeta.facetSynergy.facetName}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {hero.whyMeta.facetSynergy.description}
                        </p>
                        <div className="text-[11px] text-purple-200/90 font-medium italic pt-1 border-t border-purple-500/20">
                          Impact: {hero.whyMeta.facetSynergy.metaImpact}
                        </div>
                      </div>

                      {/* Innate Factor */}
                      <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Innate Ability: {hero.whyMeta.innateFactor.innateName}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {hero.whyMeta.innateFactor.description}
                        </p>
                        <div className="text-[11px] text-cyan-200/90 font-medium italic pt-1 border-t border-cyan-500/20">
                          Pro Tip: {hero.whyMeta.proTip}
                        </div>
                      </div>

                    </div>

                    {/* Toggleable Details: Item Timing Spikes, Synergies, Counters */}
                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedHeroId(isExpanded ? null : hero.heroId)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Timing Spikes & Matchups' : 'View Item Timing Spikes, Synergies & Counters'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                          
                          {/* Timing Spikes */}
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              Peak Item Timing Spikes This Season
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {hero.whyMeta.timingSpikes.map((spike, i) => (
                                <div key={i} className="bg-dota-bg border border-slate-800 p-2.5 rounded-lg space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                      {spike.timing}
                                    </span>
                                    <span className="text-xs font-bold text-slate-200">{spike.item}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-tight">
                                    {spike.impact}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Synergies and Counters */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="bg-dota-bg/80 border border-slate-800 p-3 rounded-xl space-y-1">
                              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Swords className="w-3 h-3 text-emerald-400" />
                                Strong Synergies This Season
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {hero.whyMeta.bestWith.map((ally, idx) => (
                                  <span key={idx} className="text-xs px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                                    {ally}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-dota-bg/80 border border-slate-800 p-3 rounded-xl space-y-1">
                              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-red-400" />
                                Hard Counters in Current Meta
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {hero.whyMeta.counteredBy.map((counter, idx) => (
                                  <span key={idx} className="text-xs px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30 text-red-200">
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
            <div className="bg-dota-panel border border-dota-border rounded-2xl p-10 text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="font-dota font-bold text-slate-300">No Meta Heroes Match Criteria</div>
              <p className="text-xs text-slate-500">Try changing role filters or clearing your search term.</p>
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
              <div key={tierKey} className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className={`px-3 py-1 rounded-xl text-base font-dota font-black border ${getTierBadgeStyle(tierKey)}`}>
                    {tierKey} TIER
                  </div>
                  <div>
                    <h3 className="font-dota font-bold text-sm text-slate-200">
                      {tierKey === 'S+' && 'God Tier • Must Pick or Ban'}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((hero) => (
                    <div
                      key={hero.heroId}
                      onClick={() => handleHeroClick(hero.heroId)}
                      className="group bg-dota-bg border border-slate-800 hover:border-dota-gold/70 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 shadow"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-700 group-hover:border-dota-gold/70"
                        />
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white group-hover:text-dota-gold transition-colors">
                            {hero.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {hero.primaryRole} • {hero.whyMeta.facetSynergy.facetName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-emerald-400 flex items-center justify-end gap-0.5">
                          <span>{hero.winRate}%</span>
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="text-[10px] text-slate-500">{hero.pickRate}% Pick</div>
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
