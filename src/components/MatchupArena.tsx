import React, { useState, useMemo } from 'react';
import { HEROES_DATA, HERO_MAP } from '../data/heroes';
import { HeroData } from '../types/hero';
import { SoundEngine } from '../services/soundFx';
import { 
  Swords, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  X
} from 'lucide-react';

interface MatchupArenaProps {
  onSelectHero: (hero: HeroData) => void;
}

export const MatchupArena: React.FC<MatchupArenaProps> = ({ onSelectHero }) => {
  const [heroAId, setHeroAId] = useState<string>('anti_mage');
  const [heroBId, setHeroBId] = useState<string>('storm_spirit');
  const [gameMinute, setGameMinute] = useState<number>(20);

  // Search states for both hero pickers
  const [searchQueryA, setSearchQueryA] = useState<string>('');
  const [searchQueryB, setSearchQueryB] = useState<string>('');
  const [isPickerOpenA, setIsPickerOpenA] = useState<boolean>(false);
  const [isPickerOpenB, setIsPickerOpenB] = useState<boolean>(false);

  const heroA = HERO_MAP.get(heroAId) || HEROES_DATA[0];
  const heroB = HERO_MAP.get(heroBId) || HEROES_DATA[1];

  // Filtered heroes for Hero A search
  const filteredHeroesA = useMemo(() => {
    if (!searchQueryA.trim()) return HEROES_DATA;
    const q = searchQueryA.toLowerCase().trim();
    return HEROES_DATA.filter((h) => 
      h.name.toLowerCase().includes(q) ||
      h.title.toLowerCase().includes(q) ||
      h.aliases.some((a) => a.toLowerCase().includes(q)) ||
      h.roles.some((r) => r.toLowerCase().includes(q))
    );
  }, [searchQueryA]);

  // Filtered heroes for Hero B search
  const filteredHeroesB = useMemo(() => {
    if (!searchQueryB.trim()) return HEROES_DATA;
    const q = searchQueryB.toLowerCase().trim();
    return HEROES_DATA.filter((h) => 
      h.name.toLowerCase().includes(q) ||
      h.title.toLowerCase().includes(q) ||
      h.aliases.some((a) => a.toLowerCase().includes(q)) ||
      h.roles.some((r) => r.toLowerCase().includes(q))
    );
  }, [searchQueryB]);

  // Dynamic advantage evaluation based on matchup & game minute
  let advantageA = 50;
  let reasonA = '';
  let reasonB = '';
  let winningHero: 'A' | 'B' | 'EVEN' = 'EVEN';

  // Check direct counter matches
  const aDirectCounter = heroA.strongAgainst.find((s) => s.heroId === heroB.id);
  const bDirectCounter = heroB.strongAgainst.find((s) => s.heroId === heroA.id);

  if (aDirectCounter) {
    advantageA += 25;
    reasonA = aDirectCounter.reason;
  }
  if (bDirectCounter) {
    advantageA -= 25;
    reasonB = bDirectCounter.reason;
  }

  // Game minute modifier
  if (gameMinute <= 10) {
    // Early game: Hero with better laning dominance wins
    if (heroA.attribute === 'str' || heroA.id === 'axe' || heroA.id === 'witch_doctor') advantageA += 15;
    if (heroB.attribute === 'str' || heroB.id === 'axe' || heroB.id === 'witch_doctor') advantageA -= 15;
  } else if (gameMinute >= 35) {
    // Late game: Hard carries (AM, PA, Void, Spectre, Sven) scale harder
    if (heroA.roles.includes('Carry')) advantageA += 20;
    if (heroB.roles.includes('Carry')) advantageA -= 20;
  }

  advantageA = Math.max(10, Math.min(90, advantageA));
  const advantageB = 100 - advantageA;

  if (advantageA > 55) winningHero = 'A';
  else if (advantageA < 45) winningHero = 'B';
  else winningHero = 'EVEN';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-dota-panel to-slate-900 border border-dota-red/50 rounded-2xl p-5 sm:p-6 shadow-dota-crimson">
        <div className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-red-400" />
          <h2 className="font-dota font-black text-xl sm:text-2xl text-white">
            1v1 Matchup Arena & Power Curve Simulator
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
          Simulate head-to-head duels between any 2 heroes across different game minutes (0 to 60 min) to understand when power spikes shift, key item timings, and tactical win conditions.
        </p>
      </div>

      {/* Hero Duel Selector Arena */}
      <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-start">
          
          {/* HERO A (YOUR PICK) */}
          <div className="md:col-span-3 bg-dota-bg/90 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">HERO A (YOUR PICK)</span>
              <span className="text-xs font-bold text-slate-400">{heroA.attribute.toUpperCase()}</span>
            </div>

            {/* Search Bar for Hero A */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Hero A (e.g. Anti-Mage, Axe)..."
                value={searchQueryA}
                onFocus={() => setIsPickerOpenA(true)}
                onChange={(e) => {
                  setSearchQueryA(e.target.value);
                  setIsPickerOpenA(true);
                }}
                className="w-full pl-8 pr-8 py-1.5 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQueryA && (
                <button
                  onClick={() => setSearchQueryA('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown / Results for Hero A */}
            {isPickerOpenA && (
              <div className="bg-slate-900/95 border border-emerald-500/50 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1 shadow-2xl z-20">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <span>Matching Heroes ({filteredHeroesA.length})</span>
                  <button 
                    onClick={() => setIsPickerOpenA(false)}
                    className="text-slate-400 hover:text-white text-[10px]"
                  >
                    Close
                  </button>
                </div>
                {filteredHeroesA.length > 0 ? (
                  filteredHeroesA.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        setHeroAId(h.id);
                        setIsPickerOpenA(false);
                        setSearchQueryA('');
                        SoundEngine.playPick();
                      }}
                      className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all ${
                        h.id === heroA.id
                          ? 'bg-emerald-600/30 border border-emerald-500/60 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        className="w-7 h-7 rounded-md object-cover border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{h.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{h.roles.join(', ')}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">{h.winRate}%</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">No heroes found</div>
                )}
              </div>
            )}

            {/* Current Selected Hero A Display */}
            <div className="flex items-center gap-3 pt-1">
              <img
                src={heroA.avatarUrl}
                alt={heroA.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/60 shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-dota font-bold text-sm text-white truncate block">
                    {heroA.name}
                  </span>
                  <button
                    onClick={() => setIsPickerOpenA(!isPickerOpenA)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30"
                  >
                    Change
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans truncate">{heroA.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">Role: <span className="text-slate-200">{heroA.roles.join(', ')}</span></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-400">Win Rate: <strong className="text-emerald-400">{heroA.winRate}%</strong></span>
              <button
                onClick={() => onSelectHero(heroA)}
                className="text-dota-gold font-bold hover:underline"
              >
                View Full Build ➔
              </button>
            </div>
          </div>

          {/* VS Center Clasher */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center my-auto py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-amber-600 border-2 border-amber-300 flex items-center justify-center font-dota font-black text-sm text-white shadow-dota-crimson animate-pulse">
              VS
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">DUEL</span>
          </div>

          {/* HERO B (OPPONENT) */}
          <div className="md:col-span-3 bg-dota-bg/90 border border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">HERO B (OPPONENT)</span>
              <span className="text-xs font-bold text-slate-400">{heroB.attribute.toUpperCase()}</span>
            </div>

            {/* Search Bar for Hero B */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Hero B (e.g. Storm, Windranger)..."
                value={searchQueryB}
                onFocus={() => setIsPickerOpenB(true)}
                onChange={(e) => {
                  setSearchQueryB(e.target.value);
                  setIsPickerOpenB(true);
                }}
                className="w-full pl-8 pr-8 py-1.5 bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQueryB && (
                <button
                  onClick={() => setSearchQueryB('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown / Results for Hero B */}
            {isPickerOpenB && (
              <div className="bg-slate-900/95 border border-red-500/50 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1 shadow-2xl z-20">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <span>Matching Heroes ({filteredHeroesB.length})</span>
                  <button 
                    onClick={() => setIsPickerOpenB(false)}
                    className="text-slate-400 hover:text-white text-[10px]"
                  >
                    Close
                  </button>
                </div>
                {filteredHeroesB.length > 0 ? (
                  filteredHeroesB.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        setHeroBId(h.id);
                        setIsPickerOpenB(false);
                        setSearchQueryB('');
                        SoundEngine.playPick();
                      }}
                      className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer transition-all ${
                        h.id === heroB.id
                          ? 'bg-red-600/30 border border-red-500/60 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        className="w-7 h-7 rounded-md object-cover border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{h.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{h.roles.join(', ')}</div>
                      </div>
                      <span className="text-[10px] font-mono text-red-400">{h.winRate}%</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">No heroes found</div>
                )}
              </div>
            )}

            {/* Current Selected Hero B Display */}
            <div className="flex items-center gap-3 pt-1">
              <img
                src={heroB.avatarUrl}
                alt={heroB.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-red-500/60 shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-dota font-bold text-sm text-white truncate block">
                    {heroB.name}
                  </span>
                  <button
                    onClick={() => setIsPickerOpenB(!isPickerOpenB)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30"
                  >
                    Change
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans truncate">{heroB.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">Role: <span className="text-slate-200">{heroB.roles.join(', ')}</span></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-400">Win Rate: <strong className="text-emerald-400">{heroB.winRate}%</strong></span>
              <button
                onClick={() => onSelectHero(heroB)}
                className="text-dota-gold font-bold hover:underline"
              >
                View Full Build ➔
              </button>
            </div>
          </div>

        </div>

        {/* TIMELINE SLIDER (0 TO 60 MINS) */}
        <div className="bg-dota-bg/80 border border-dota-border rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dota-border pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="font-dota font-bold text-sm text-white">
                Game Timeline Simulator: <strong className="text-dota-gold">{gameMinute} Minutes</strong>
              </span>
            </div>
            <span className="text-xs text-slate-400 font-sans">
              {gameMinute <= 12 ? 'Laning Phase (0–12m)' :
               gameMinute <= 30 ? 'Mid Game & Core Timings (12–30m)' :
               'Late Game & Full Items (30m+)'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={gameMinute}
            onChange={(e) => {
              setGameMinute(Number(e.target.value));
              SoundEngine.playHover();
            }}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase px-1">
            <span>0m (Laning)</span>
            <span>15m (First Major Item)</span>
            <span>30m (BKB Timings)</span>
            <span>45m (Roshan / HG)</span>
            <span>60m (6-Slot War)</span>
          </div>
        </div>

        {/* LIVE ADVANTAGE GAUGE */}
        <div className="bg-dota-bg/90 border border-dota-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold font-sans">
            <span className="text-emerald-400 flex items-center gap-1">
              {heroA.name} Advantage: {advantageA}%
            </span>
            <span className="text-red-400 flex items-center gap-1">
              {heroB.name} Advantage: {advantageB}%
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-700 flex">
            <div
              className="bg-gradient-to-r from-emerald-600 to-green-400 h-full transition-all duration-500"
              style={{ width: `${advantageA}%` }}
            />
            <div
              className="bg-gradient-to-r from-red-500 to-rose-700 h-full transition-all duration-500"
              style={{ width: `${advantageB}%` }}
            />
          </div>

          <div className="text-center pt-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border font-sans ${
              winningHero === 'A'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-dota-glow'
                : winningHero === 'B'
                ? 'bg-red-950 text-red-300 border-red-600 shadow-dota-crimson'
                : 'bg-slate-800 text-slate-300 border-slate-600'
            }`}>
              {winningHero === 'A' ? `🏆 Favored: ${heroA.name}` :
               winningHero === 'B' ? `🏆 Favored: ${heroB.name}` :
               '⚖️ Even Matchup'}
            </span>
          </div>
        </div>

        {/* TACTICAL ANALYSIS BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="bg-dota-bg border border-emerald-900/40 rounded-xl p-4 space-y-2">
            <h4 className="font-dota font-bold text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              How {heroA.name} Wins This Matchup:
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {reasonA || `${heroA.name} must hit their core item timings (${heroA.build.core.map((i) => i.name).join(', ')}) before engaging ${heroB.name}.`}
            </p>
          </div>

          <div className="bg-dota-bg border border-red-900/40 rounded-xl p-4 space-y-2">
            <h4 className="font-dota font-bold text-xs sm:text-sm text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              How {heroB.name} Can Counter:
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {reasonB || `${heroB.name} must itemize with ${heroA.counterStrategy.keyCounterItems.map((k) => k.name).join(' or ')} to shut down ${heroA.name}.`}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
