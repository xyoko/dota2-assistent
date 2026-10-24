import React, { useState, useMemo } from 'react';
import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
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
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-hud-surface border border-white/[0.08] flex items-center justify-center text-hud-cyan shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-100 tracking-tight uppercase">
                  1v1 Matchup Arena & Curve Simulator
                </h2>
                <span className="font-mono text-[10px] text-slate-400 bg-hud-surface px-2 py-0.5 rounded border border-white/[0.08]">
                  PATCH 7.37d
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
                Simulate head-to-head duels across different game minutes (0 to 60m) to inspect power spikes, item timings, and tactical win conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Duel Selector Arena */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-md space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-start">
          
          {/* HERO A (YOUR PICK) */}
          <div className="md:col-span-3 bg-hud-surface border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-3 relative shadow-hud-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Hero A (Your Pick)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.1] text-slate-300 uppercase tracking-wider">
                {heroA.attribute}
              </span>
            </div>

            {/* Search Bar for Hero A */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Hero A (e.g. Anti-Mage, Axe)..."
                value={searchQueryA}
                onFocus={() => setIsPickerOpenA(true)}
                onChange={(e) => {
                  setSearchQueryA(e.target.value);
                  setIsPickerOpenA(true);
                }}
                className="w-full pl-9 pr-8 py-2 min-h-[44px] bg-hud-bg border border-white/[0.1] focus:border-emerald-500 focus-hud rounded-lg text-xs text-slate-200 placeholder-slate-400 transition-colors"
              />
              {searchQueryA && (
                <button
                  onClick={() => setSearchQueryA('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown / Results for Hero A */}
            {isPickerOpenA && (
              <div className="bg-hud-bg/95 border border-white/[0.12] rounded-xl p-2 max-h-56 overflow-y-auto space-y-1 shadow-hud-lg z-20">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400 font-mono border-b border-white/[0.06]">
                  <span>MATCHING HEROES ({filteredHeroesA.length})</span>
                  <button 
                    onClick={() => setIsPickerOpenA(false)}
                    className="text-slate-400 hover:text-white text-[11px] font-mono"
                  >
                    CLOSE
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
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors min-h-[44px] ${
                        h.id === heroA.id
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                          : 'hover:bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-md object-cover border border-white/[0.1] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{h.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{h.roles.join(', ')}</div>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-emerald-400 shrink-0">{h.winRate}%</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 font-mono">NO HEROES FOUND</div>
                )}
              </div>
            )}

            {/* Current Selected Hero A Display */}
            <div className="flex items-center gap-3 pt-1">
              <img
                src={heroA.avatarUrl}
                alt={heroA.name}
                decoding="async"
                className="w-16 h-16 rounded-lg object-cover border border-emerald-500/40 shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm sm:text-base text-slate-100 truncate block">
                    {heroA.name}
                  </span>
                  <button
                    onClick={() => setIsPickerOpenA(!isPickerOpenA)}
                    className="min-h-[44px] sm:min-h-0 touch-target px-2.5 py-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-md transition-colors focus-hud"
                  >
                    CHANGE
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans truncate">{heroA.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Role: <span className="text-slate-300 font-sans">{heroA.roles.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-sans">
              <span className="text-slate-400">
                Win Rate: <strong className="font-mono tabular-nums text-emerald-400">{heroA.winRate}%</strong>
              </span>
              <button
                onClick={() => onSelectHero(heroA)}
                className="min-h-[44px] sm:min-h-0 flex items-center text-xs font-mono text-hud-cyan hover:text-sky-300 transition-colors focus-hud"
              >
                VIEW BUILD ➔
              </button>
            </div>
          </div>

          {/* VS Center Clasher */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center my-auto py-4 gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-hud-surface border border-white/[0.15] flex items-center justify-center font-mono font-bold text-xs text-hud-gold shadow-hud-sm">
              VS
            </div>
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">1V1 DUEL</span>
          </div>

          {/* HERO B (OPPONENT) */}
          <div className="md:col-span-3 bg-hud-surface border border-red-500/30 rounded-xl p-4 sm:p-5 space-y-3 relative shadow-hud-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Hero B (Opponent)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.1] text-slate-300 uppercase tracking-wider">
                {heroB.attribute}
              </span>
            </div>

            {/* Search Bar for Hero B */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Hero B (e.g. Storm, Windranger)..."
                value={searchQueryB}
                onFocus={() => setIsPickerOpenB(true)}
                onChange={(e) => {
                  setSearchQueryB(e.target.value);
                  setIsPickerOpenB(true);
                }}
                className="w-full pl-9 pr-8 py-2 min-h-[44px] bg-hud-bg border border-white/[0.1] focus:border-red-500 focus-hud rounded-lg text-xs text-slate-200 placeholder-slate-400 transition-colors"
              />
              {searchQueryB && (
                <button
                  onClick={() => setSearchQueryB('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown / Results for Hero B */}
            {isPickerOpenB && (
              <div className="bg-hud-bg/95 border border-white/[0.12] rounded-xl p-2 max-h-56 overflow-y-auto space-y-1 shadow-hud-lg z-20">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400 font-mono border-b border-white/[0.06]">
                  <span>MATCHING HEROES ({filteredHeroesB.length})</span>
                  <button 
                    onClick={() => setIsPickerOpenB(false)}
                    className="text-slate-400 hover:text-white text-[11px] font-mono"
                  >
                    CLOSE
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
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors min-h-[44px] ${
                        h.id === heroB.id
                          ? 'bg-red-500/15 border border-red-500/40 text-red-300'
                          : 'hover:bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-md object-cover border border-white/[0.1] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{h.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{h.roles.join(', ')}</div>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-red-400 shrink-0">{h.winRate}%</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 font-mono">NO HEROES FOUND</div>
                )}
              </div>
            )}

            {/* Current Selected Hero B Display */}
            <div className="flex items-center gap-3 pt-1">
              <img
                src={heroB.avatarUrl}
                alt={heroB.name}
                decoding="async"
                className="w-16 h-16 rounded-lg object-cover border border-red-500/40 shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm sm:text-base text-slate-100 truncate block">
                    {heroB.name}
                  </span>
                  <button
                    onClick={() => setIsPickerOpenB(!isPickerOpenB)}
                    className="min-h-[44px] sm:min-h-0 touch-target px-2.5 py-1 text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30 rounded-md transition-colors focus-hud"
                  >
                    CHANGE
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans truncate">{heroB.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Role: <span className="text-slate-300 font-sans">{heroB.roles.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-sans">
              <span className="text-slate-400">
                Win Rate: <strong className="font-mono tabular-nums text-emerald-400">{heroB.winRate}%</strong>
              </span>
              <button
                onClick={() => onSelectHero(heroB)}
                className="min-h-[44px] sm:min-h-0 flex items-center text-xs font-mono text-hud-cyan hover:text-sky-300 transition-colors focus-hud"
              >
                VIEW BUILD ➔
              </button>
            </div>
          </div>

        </div>

        {/* TIMELINE SLIDER (0 TO 60 MINS) */}
        <div className="bg-hud-surface border border-white/[0.08] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-hud-gold" />
              <span className="font-display font-semibold text-xs sm:text-sm text-slate-200">
                Game Timeline Simulator: <strong className="font-mono tabular-nums text-hud-gold">{gameMinute}m</strong>
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {gameMinute <= 12 ? 'LANING PHASE (0–12m)' :
               gameMinute <= 30 ? 'MID GAME & CORE TIMINGS (12–30m)' :
               'LATE GAME & FULL ITEMS (30m+)'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={gameMinute}
            aria-label="Game Minute Timeline"
            onChange={(e) => {
              setGameMinute(Number(e.target.value));
              SoundEngine.playHover();
            }}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-hud-bg rounded-lg touch-target"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1">
            <span>0m (LANING)</span>
            <span>15m (1ST CORE)</span>
            <span>30m (BKB PEAK)</span>
            <span>45m (ROSHAN/HG)</span>
            <span>60m (6-SLOT)</span>
          </div>
        </div>

        {/* LIVE ADVANTAGE GAUGE */}
        <div className="bg-hud-surface border border-white/[0.08] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {heroA.name} Advantage: <span className="tabular-nums">{advantageA}%</span>
            </span>
            <span className="text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {heroB.name} Advantage: <span className="tabular-nums">{advantageB}%</span>
            </span>
          </div>

          <div className="w-full bg-hud-bg rounded-full h-3 overflow-hidden border border-white/[0.1] relative">
            <div
              className="absolute inset-y-0 left-0 w-full bg-emerald-500 origin-left transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${advantageA / 100})` }}
            />
            <div
              className="absolute inset-y-0 right-0 w-full bg-red-500 origin-right transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${advantageB / 100})` }}
            />
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 z-10 -translate-x-1/2" />
          </div>

          <div className="text-center pt-2">
            <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-md border inline-flex items-center gap-2 ${
              winningHero === 'A'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : winningHero === 'B'
                ? 'bg-red-950/60 text-red-300 border-red-500/40'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.12]'
            }`}>
              {winningHero === 'A' ? `[FAVORED: ${heroA.name.toUpperCase()}]` :
               winningHero === 'B' ? `[FAVORED: ${heroB.name.toUpperCase()}]` :
               '[EVEN MATCHUP]'}
            </span>
          </div>
        </div>

        {/* TACTICAL ANALYSIS BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          <div className="bg-hud-bg border border-emerald-500/20 rounded-xl p-4 space-y-2">
            <h4 className="font-display font-semibold text-xs sm:text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              How {heroA.name} Wins This Matchup:
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {reasonA || `${heroA.name} must hit their core item timings (${heroA.build.core.map((i) => i.name).join(', ')}) before engaging ${heroB.name}.`}
            </p>
          </div>

          <div className="bg-hud-bg border border-red-500/20 rounded-xl p-4 space-y-2">
            <h4 className="font-display font-semibold text-xs sm:text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
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
