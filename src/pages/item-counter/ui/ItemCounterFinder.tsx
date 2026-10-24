import React, { useState } from 'react';
import { COUNTER_MATRIX } from '../../../entities/counter/bi/counterMatrix';
import { 
  Sparkles, 
  Search, 
  ShieldAlert, 
  EyeOff, 
  Crosshair, 
  HeartPulse, 
  Zap, 
  Target, 
  Wind, 
  Users,
  CheckCircle2
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  EyeOff,
  ShieldAlert,
  Crosshair,
  HeartPulse,
  Zap,
  Target,
  Wind,
  Users
};

// Helper function to resolve hero name to their profile picture (pfp) URL
const getHeroAvatar = (rawName: string) => {
  const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
  const noteMatch = rawName.match(/\(([^)]+)\)/);
  const note = noteMatch ? noteMatch[1] : undefined;

  const slugOverrides: Record<string, string> = {
    'anti-mage': 'antimage',
    'am': 'antimage',
    'centaur': 'centaur',
    'centaur warrunner': 'centaur',
    'doom': 'doom_bringer',
    'nature’s prophet': 'furion',
    "nature's prophet": 'furion',
    'necrophos': 'necrolyte',
    'outworld destroyer': 'obsidian_destroyer',
    'queen of pain': 'queenofpain',
    'shadow fiend': 'nevermore',
    'timbersaw': 'shredder',
    'treant protector': 'treant',
    'underlord': 'abyssal_underlord',
    'vengeful spirit': 'vengefulspirit',
    'windranger': 'windrunner',
    'wraith king': 'skeleton_king',
    'zeus': 'zuus',
    'clockwerk': 'rattletrap',
    'magnus': 'magnataur',
    'io': 'wisp',
    'butterfly carriers': 'terrorblade',
    'skywrath mage': 'skywrath_mage',
    'shadow demon': 'shadow_demon',
    'bounty hunter': 'bounty_hunter',
    'nyx assassin': 'nyx_assassin',
    'sand king': 'sand_king',
    'phantom assassin': 'phantom_assassin',
    'troll warlord': 'troll_warlord',
    'spirit breaker': 'spirit_breaker',
    'storm spirit': 'storm_spirit',
    'ember spirit': 'ember_spirit',
    'void spirit': 'void_spirit',
    'phantom lancer': 'phantom_lancer',
    'chaos knight': 'chaos_knight',
    'naga siren': 'naga_siren',
    'legion commander': 'legion_commander',
    'witch doctor': 'witch_doctor',
    'faceless void': 'faceless_void'
  };

  const lower = cleanName.toLowerCase();
  const slug = slugOverrides[lower] || lower.replace(/[^a-z0-9]/g, '_');
  const avatarUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;

  return {
    displayName: cleanName,
    avatarUrl,
    note
  };
};

export const ItemCounterFinder: React.FC = () => {
  const [selectedThreatId, setSelectedThreatId] = useState<string>(COUNTER_MATRIX[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentThreat = COUNTER_MATRIX.find((t) => t.id === selectedThreatId) || COUNTER_MATRIX[0];

  const filteredThreats = COUNTER_MATRIX.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.heroExamples.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const ThreatIcon = ICON_MAP[currentThreat.icon] || ShieldAlert;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-hud-surface border border-white/[0.08] flex items-center justify-center text-hud-cyan shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-tight">
                Item & Threat Counter Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
              Understand exact mechanics, item counters, and counterplay strategies against every game-breaking mechanic in Dota 2. Inspect key threat hero profiles and item counters.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search threat or hero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 min-h-[44px] bg-hud-bg border border-white/[0.1] rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-hud-cyan focus-hud transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Threat Category Tabs & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Threat Problems */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1">
            Common Threat Mechanics:
          </h3>
          {filteredThreats.map((threat) => {
            const Icon = ICON_MAP[threat.icon] || ShieldAlert;
            const isSelected = threat.id === selectedThreatId;

            return (
              <button
                key={threat.id}
                onClick={() => setSelectedThreatId(threat.id)}
                className={`w-full text-left p-3 min-h-[44px] touch-target rounded-lg border transition-colors flex items-center gap-3 focus-hud ${
                  isSelected
                    ? 'bg-hud-surface border-hud-cyan/40 text-slate-100 shadow-hud-sm'
                    : 'bg-hud-panel hover:bg-white/[0.04] border-white/[0.06] text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-hud-cyan text-slate-950' : 'bg-hud-bg text-hud-cyan border border-white/[0.06]'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-xs sm:text-sm truncate">{threat.title}</div>
                  
                  {/* Hero PFP Avatars Row */}
                  <div className="flex items-center -space-x-1.5 mt-1.5 overflow-hidden">
                    {threat.heroExamples.slice(0, 4).map((h, i) => {
                      const heroInfo = getHeroAvatar(h);
                      return (
                        <img
                          key={i}
                          src={heroInfo.avatarUrl}
                          alt={heroInfo.displayName}
                          title={heroInfo.displayName}
                          loading="lazy"
                          decoding="async"
                          className="w-5 h-5 rounded-full object-cover border border-white/[0.1] shadow-sm"
                        />
                      );
                    })}
                    {threat.heroExamples.length > 4 && (
                      <span className="w-5 h-5 rounded-full bg-hud-bg text-[9px] font-mono font-bold text-slate-400 flex items-center justify-center border border-white/[0.1] z-10">
                        +{threat.heroExamples.length - 4}
                      </span>
                    )}
                  </div>

                </div>
              </button>
            );
          })}
        </div>

        {/* Right 2 Columns: Solutions & Tactical Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-sm space-y-5">
            
            {/* Title Header */}
            <div className="flex items-start gap-4 border-b border-white/[0.06] pb-4">
              <div className="p-3 rounded-xl bg-hud-surface border border-white/[0.08] text-hud-cyan shrink-0">
                <ThreatIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-tight">
                  {currentThreat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-sans">
                  {currentThreat.description}
                </p>

                {/* Hero PFPs */}
                <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Key Threat Heroes:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {currentThreat.heroExamples.map((hero, idx) => {
                      const heroInfo = getHeroAvatar(hero);
                      return (
                        <div
                          key={idx}
                          className="bg-hud-surface border border-white/[0.08] rounded-lg p-2 flex items-center gap-2.5 transition-colors group"
                        >
                          <img
                            src={heroInfo.avatarUrl}
                            alt={heroInfo.displayName}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded-lg object-cover border border-white/[0.1] shrink-0 shadow-sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-display font-medium text-xs text-slate-200 group-hover:text-hud-cyan transition-colors truncate">
                              {heroInfo.displayName}
                            </div>
                            {heroInfo.note && (
                              <div className="text-[10px] text-hud-gold truncate font-mono">
                                {heroInfo.note}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Counter Items */}
            <div>
              <h4 className="font-display font-semibold text-xs sm:text-sm text-hud-gold mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-hud-gold" />
                Definitive Counter Items
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentThreat.counterItems.map((item, idx) => (
                  <div key={idx} className="bg-hud-surface border border-white/[0.08] rounded-lg p-3.5 space-y-1.5 shadow-hud-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-xs sm:text-sm text-slate-100">{item.name}</span>
                      {item.cost > 0 && <span className="font-mono tabular-nums text-xs font-bold text-hud-gold">{item.cost}g</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-snug font-sans">
                      {item.why}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Advice & Playstyle Rules */}
            <div className="bg-hud-bg border border-white/[0.06] rounded-lg p-4 space-y-2">
              <h4 className="font-display font-semibold text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tactical Playstyle & Map Strategy
              </h4>
              <ul className="space-y-1.5">
                {currentThreat.tacticalAdvice.map((advice, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed font-sans">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
