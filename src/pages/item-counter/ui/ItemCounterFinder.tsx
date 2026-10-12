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
      <div className="bg-gradient-to-r from-blue-950/80 via-dota-panel to-slate-900 border border-dota-int/40 rounded-2xl p-5 sm:p-6 shadow-dota-mana">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-dota-int" />
              <h2 className="font-dota font-black text-xl sm:text-2xl text-white">
                Item & Threat Counter Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Understand exact mechanics, item counters, and counterplay strategies against every game-breaking mechanic in Dota 2. Inspect key threat hero profile pictures (PFP) and counter items.
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
              className="w-full pl-9 pr-3 py-2 bg-dota-bg border border-dota-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-int"
            />
          </div>
        </div>
      </div>

      {/* Threat Category Tabs & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Threat Problems */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Common Threat Mechanics:
          </h3>
          {filteredThreats.map((threat) => {
            const Icon = ICON_MAP[threat.icon] || ShieldAlert;
            const isSelected = threat.id === selectedThreatId;

            return (
              <button
                key={threat.id}
                onClick={() => setSelectedThreatId(threat.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-blue-950/70 border-dota-int text-white shadow-dota-mana'
                    : 'bg-dota-panel hover:bg-slate-800/80 border-dota-border text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-dota-int text-slate-950' : 'bg-slate-800 text-dota-int'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm truncate">{threat.title}</div>
                  
                  {/* Hero PFP Avatars Row instead of plain text names */}
                  <div className="flex items-center -space-x-1.5 mt-1.5 overflow-hidden">
                    {threat.heroExamples.slice(0, 4).map((h, i) => {
                      const heroInfo = getHeroAvatar(h);
                      return (
                        <img
                          key={i}
                          src={heroInfo.avatarUrl}
                          alt={heroInfo.displayName}
                          title={heroInfo.displayName}
                          className="w-5 h-5 rounded-full object-cover border border-slate-700 shadow-sm"
                        />
                      );
                    })}
                    {threat.heroExamples.length > 4 && (
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400 flex items-center justify-center border border-slate-700 z-10">
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
          
          <div className="bg-dota-panel border border-dota-border rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
            
            {/* Title Header */}
            <div className="flex items-start gap-4 border-b border-dota-border pb-4">
              <div className="p-3 rounded-xl bg-dota-int/20 border border-dota-int/50 text-dota-int shadow-dota-mana">
                <ThreatIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-dota font-black text-lg sm:text-xl text-white">
                  {currentThreat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {currentThreat.description}
                </p>

                {/* Hero PFPs instead of plain text tags */}
                <div className="mt-3.5 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Key Threat Heroes (PFP):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {currentThreat.heroExamples.map((hero, idx) => {
                      const heroInfo = getHeroAvatar(hero);
                      return (
                        <div
                          key={idx}
                          className="bg-slate-900/90 border border-slate-800 hover:border-dota-int/60 rounded-xl p-2 flex items-center gap-2.5 shadow transition-all group"
                        >
                          <img
                            src={heroInfo.avatarUrl}
                            alt={heroInfo.displayName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700 group-hover:border-dota-int flex-shrink-0 shadow-sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-white group-hover:text-cyan-300 truncate">
                              {heroInfo.displayName}
                            </div>
                            {heroInfo.note && (
                              <div className="text-[10px] text-amber-300/90 truncate font-mono">
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
              <h4 className="font-dota font-bold text-sm text-dota-gold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dota-gold" />
                Definitive Counter Items
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentThreat.counterItems.map((item, idx) => (
                  <div key={idx} className="bg-dota-bg border border-dota-border rounded-xl p-3.5 space-y-1.5 shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-amber-200">{item.name}</span>
                      {item.cost > 0 && <span className="text-xs font-bold text-dota-gold">{item.cost}g</span>}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {item.why}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Advice & Playstyle Rules */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-dota font-bold text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tactical Playstyle & Map Strategy
              </h4>
              <ul className="space-y-1.5">
                {currentThreat.tacticalAdvice.map((advice, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
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
