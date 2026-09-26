import React, { useState, useEffect, useRef } from 'react';
import { HeroData } from '../types/hero';
import { HEROES_DATA, HERO_MAP } from '../data/heroes';
import { DOTA_ITEMS } from '../data/items';
import { SoundEngine } from '../services/soundFx';
import { 
  Swords, 
  ShieldAlert, 
  ChevronRight, 
  Coins, 
  X, 
  Search,
  Sparkles,
  Zap,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface PictureInPictureHUDProps {
  initialHero: HeroData;
  onClose: () => void;
  isNativePip?: boolean;
}

type BuildStage = 'early' | 'mid' | 'late' | 'starting';

export const PictureInPictureHUD: React.FC<PictureInPictureHUDProps> = ({
  initialHero,
  onClose,
  isNativePip = false
}) => {
  const [selectedHero, setSelectedHero] = useState<HeroData>(initialHero);
  const [activeStage, setActiveStage] = useState<BuildStage>('early');
  const [isCounterMode, setIsCounterMode] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Click timing for double-click vs single-click detection
  const clickTimeoutRef = useRef<number | null>(null);

  // Sync if initialHero changes
  useEffect(() => {
    setSelectedHero(initialHero);
  }, [initialHero.id]);

  // Stage progression sequence for single click
  const stages: { key: BuildStage; label: string; short: string; badge: string }[] = [
    { key: 'early', label: 'Early Game', short: 'Early', badge: '0-12m' },
    { key: 'mid', label: 'Core / Mid Game', short: 'Mid (Core)', badge: '12-25m' },
    { key: 'late', label: 'Late Game / Luxury', short: 'Late', badge: '25m+' },
    { key: 'starting', label: 'Starting Items', short: 'Starting', badge: 'Lane' }
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === activeStage);

  // Advance to next build stage
  const advanceStage = () => {
    const nextIndex = (currentStageIndex + 1) % stages.length;
    setActiveStage(stages[nextIndex].key);
    SoundEngine.playHover();
  };

  // Toggle between Build Mode and Counters Mode
  const toggleCounterMode = () => {
    setIsCounterMode((prev) => !prev);
    SoundEngine.playPick();
  };

  // Handle single click vs two fast clicks (double-click)
  const handleContainerClick = (e: React.MouseEvent) => {
    // If clicking on a button, select, input, or inside scroll area, let user interact/scroll without accidental stage/mode changes
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('.pip-scroll-area')
    ) {
      return;
    }

    if (clickTimeoutRef.current) {
      // Second click within 250ms -> Two fast clicks (Double Click): Toggle Counter Mode
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      toggleCounterMode();
    } else {
      // First click: Schedule single click action (Advance Build Stage)
      clickTimeoutRef.current = window.setTimeout(() => {
        clickTimeoutRef.current = null;
        if (!isCounterMode) {
          advanceStage();
        }
      }, 250);
    }
  };

  // Resolve item image
  const getItemImg = (itemId: string, itemName: string) => {
    if (DOTA_ITEMS[itemId]?.img) return DOTA_ITEMS[itemId].img;
    const clean = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${clean}.png`;
  };

  // Items for current active stage
  const currentItems = React.useMemo(() => {
    if (activeStage === 'starting') return selectedHero.build.starting;
    if (activeStage === 'early') return selectedHero.build.early;
    if (activeStage === 'mid') return selectedHero.build.core;
    if (activeStage === 'late') return selectedHero.build.late;
    return selectedHero.build.early;
  }, [activeStage, selectedHero]);

  // Attribute styling
  const attrColor = {
    str: 'text-red-400 border-red-500/50 bg-red-950/80',
    agi: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/80',
    int: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/80',
    all: 'text-purple-300 border-purple-500/50 bg-purple-950/80'
  }[selectedHero.attribute];

  // Filtered heroes for quick search across full hero roster
  const filteredHeroes = HEROES_DATA.filter((h) => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      onClick={handleContainerClick}
      className={`select-none flex flex-col min-h-0 overflow-hidden bg-gradient-to-b from-[#10141d] to-[#0a0d14] text-slate-100 font-sans shadow-2xl ${
        isNativePip
          ? 'w-full h-full'
          : `${isCompact ? 'h-[280px]' : 'h-[520px]'} w-[360px] rounded-2xl border-2 border-dota-gold/60 shadow-[0_0_40px_rgba(0,0,0,0.9)] resize-y min-h-[200px] max-h-[85vh]`
      }`}
    >
      {/* ============================================================ */}
      {/* COMPACT TOP HEADER */}
      {/* ============================================================ */}
      <div className="relative bg-slate-950/95 border-b border-dota-border p-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          
          {/* Hero Avatar & Quick Switcher */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-dota-gold/60 flex-shrink-0 shadow">
              <img
                src={selectedHero.avatarUrl}
                alt={selectedHero.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-dota font-black text-xs text-white truncate">
                  {selectedHero.name}
                </span>
                <span className={`text-[8px] font-bold px-1 py-0.2 rounded border uppercase ${attrColor}`}>
                  {selectedHero.attribute.toUpperCase()}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                <span>{selectedHero.roles[0]}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{selectedHero.winRate}% WR</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Search/Switch Hero Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen((prev) => !prev);
                SoundEngine.playHover();
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                isSearchOpen ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Search and change hero"
            >
              <Search className="w-3 h-3" />
            </button>

            {/* Mode Switcher Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCounterMode();
              }}
              className={`px-1.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                isCounterMode 
                  ? 'bg-red-600/30 text-red-300 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                  : 'bg-dota-gold/20 text-dota-gold border-dota-gold/60 shadow-dota-glow'
              }`}
              title="Double click window or tap here to switch between Build and Counters"
            >
              {isCounterMode ? <ShieldAlert className="w-3 h-3 text-red-400" /> : <Swords className="w-3 h-3 text-amber-400" />}
              <span className="hidden xs:inline">{isCounterMode ? 'Counters' : 'Build'}</span>
            </button>

            {/* Compact / Shorten Toggle (Floating mode only) */}
            {!isNativePip && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCompact((prev) => !prev);
                  SoundEngine.playHover();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isCompact ? 'Expand HUD to full height' : 'Compact HUD (shortened view)'}
              >
                {isCompact ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 border border-slate-700 hover:border-red-600 text-slate-400 hover:text-red-300 transition-colors"
              title="Close PiP HUD"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* MIDDLE BODY CONTENT: HERO SEARCH OR BUILD PATH OR COUNTERS */}
      {/* ============================================================ */}
      {isSearchOpen ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950/95 overflow-hidden">
          {/* Hero Search Input Bar */}
          <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex items-center gap-1.5 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search 124+ heroes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-dota-gold/40 rounded-lg pl-8 pr-7 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dota-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
            >
              Done
            </button>
          </div>

          {/* Full Scrollable Hero Grid (Smooth scrolling even when window is shortened) */}
          <div className="pip-scroll-area flex-1 min-h-0 overflow-y-auto p-2 grid grid-cols-2 gap-1.5 custom-scrollbar overscroll-contain">
            {filteredHeroes.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                No heroes match "{searchQuery}"
              </div>
            ) : (
              filteredHeroes.map((h) => {
                const isSelected = h.id === selectedHero.id;
                return (
                  <button
                    key={h.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHero(h);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      SoundEngine.playPick();
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-dota-gold/20 border-dota-gold text-amber-200 shadow-dota-glow'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <img
                      src={h.avatarUrl}
                      alt={h.name}
                      className="w-7 h-7 rounded object-cover flex-shrink-0 border border-slate-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold truncate leading-tight">
                        {h.name}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                        {h.attribute} • {h.winRate}%
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : !isCounterMode ? (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Phase Selector Tabs */}
          <div className="bg-slate-900/90 border-b border-dota-border px-2 py-1.5 flex items-center justify-between gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto">
              {stages.map((stage) => {
                const isActive = stage.key === activeStage;
                return (
                  <button
                    key={stage.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStage(stage.key);
                      SoundEngine.playHover();
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-dota-gold text-slate-950 shadow-dota-glow font-black scale-105'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {stage.short}
                  </button>
                );
              })}
            </div>

            {/* Next stage hint button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                advanceStage();
              }}
              className="flex items-center gap-0.5 text-[9px] font-bold text-dota-gold hover:text-amber-200 uppercase bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-700/60 flex-shrink-0"
              title="Click anywhere on header/footer to advance stage"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Active Phase Items List (Scrollable) */}
          <div className="pip-scroll-area flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 custom-scrollbar overscroll-contain">
            
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-amber-300">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-dota-gold" />
                {stages.find((s) => s.key === activeStage)?.label}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentItems.length} Items
              </span>
            </div>

            <div className="space-y-1.5">
              {currentItems.map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-dota-gold/60 rounded-xl p-2 flex items-center gap-2.5 transition-all shadow"
                >
                  <img
                    src={getItemImg(item.id, item.name)}
                    alt={item.name}
                    className="w-10 h-7 rounded object-contain border border-slate-700 group-hover:border-dota-gold/80 flex-shrink-0 bg-black/60 shadow"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-100 group-hover:text-amber-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-bold text-dota-gold flex items-center gap-0.5 flex-shrink-0">
                        <Coins className="w-2.5 h-2.5" />
                        {item.cost}g
                      </span>
                    </div>

                    {item.reason && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 group-hover:line-clamp-2 leading-tight mt-0.5">
                        {item.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Skill Maxing Roadmap */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-2 border border-slate-800">
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Skill Priority:</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-300">
                {selectedHero.skillOrder.maxPriority.join(' ➔ ')}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ============================================================ */
        /* MODE B: FAST TWO-CLICK COUNTERS (CHARACTER & ITEM PICS ONLY) */
        /* ============================================================ */
        <div className="flex-1 flex flex-col min-h-0">
          
          <div className="bg-red-950/40 border-b border-red-900/60 px-3 py-1.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-300 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Counter Threat Matrix</span>
            </div>
            <span className="text-[9px] text-red-400 font-bold bg-red-950 px-1.5 py-0.5 rounded border border-red-800">
              Double-click to return
            </span>
          </div>

          <div className="pip-scroll-area flex-1 min-h-0 overflow-y-auto p-2.5 space-y-3 custom-scrollbar overscroll-contain">
            
            {/* 1. ENEMY HERO COUNTERS (CHARACTER PICTURES ONLY) */}
            <div>
              <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Enemy Hard Counters (Avoid / Ban):</span>
                <span className="text-slate-500 font-normal">Who destroys you</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {selectedHero.weakAgainst.map((w, idx) => {
                  const enemyHero = HERO_MAP.get(w.heroId);
                  const avatar = enemyHero?.avatarUrl || `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${w.heroId}.png`;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-red-900/50 hover:border-red-500 rounded-xl p-1.5 flex items-center gap-2 shadow"
                      title={`${w.heroName}: ${w.reason}`}
                    >
                      <img
                        src={avatar}
                        alt={w.heroName}
                        className="w-9 h-9 rounded-lg object-cover border border-red-700/60 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[11px] text-red-200 truncate">
                          {w.heroName}
                        </div>
                        <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight">
                          {w.reason}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. KEY COUNTER ITEMS TO BUY (ITEM PICTURES ONLY) */}
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Counter Items To Fear & Buy:</span>
                <span className="text-slate-500 font-normal">Key tactical items</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {selectedHero.counterStrategy.keyCounterItems.map((c, idx) => {
                  const clean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  const itemImg = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${clean}.png`;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-amber-900/50 hover:border-amber-500 rounded-xl p-1.5 flex items-center gap-2 shadow"
                      title={`${c.name}: ${c.reason}`}
                    >
                      <img
                        src={itemImg}
                        alt={c.name}
                        className="w-9 h-7 rounded object-contain border border-amber-700/60 flex-shrink-0 bg-black/60"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[11px] text-amber-200 truncate">
                          {c.name}
                        </div>
                        <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight">
                          {c.reason}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. HEROES YOU HARD COUNTER */}
            {selectedHero.strongAgainst.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Heroes You Counter (Free Win):</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {selectedHero.strongAgainst.map((s, idx) => {
                    const preyHero = HERO_MAP.get(s.heroId);
                    const avatar = preyHero?.avatarUrl || `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${s.heroId}.png`;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border border-emerald-900/50 hover:border-emerald-500 rounded-xl p-1.5 flex items-center gap-2 shadow"
                        title={`${s.heroName}: ${s.reason}`}
                      >
                        <img
                          src={avatar}
                          alt={s.heroName}
                          className="w-9 h-9 rounded-lg object-cover border border-emerald-700/60 flex-shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[11px] text-emerald-200 truncate">
                            {s.heroName}
                          </div>
                          <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight">
                            {s.reason}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TACTICAL FOOTER HUD & GESTURE INSTRUCTION BAR */}
      {/* ============================================================ */}
      <div 
        className="bg-slate-950/95 border-t border-dota-border px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0 cursor-pointer hover:bg-slate-900 transition-colors"
        title="1-Click: Advance item build phase | 2-Clicks: Toggle Counters Matrix"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-dota-gold">🖱️ 1-Click:</span>
          <span>Next Phase</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-red-400">⚡ 2-Click:</span>
          <span>Counters</span>
          <span className="text-slate-600">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 font-mono text-[9px] text-amber-300 font-bold">
            Alt+P
          </kbd>
        </div>

        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-dota">
          PiP HUD
        </div>
      </div>

    </div>
  );
};
