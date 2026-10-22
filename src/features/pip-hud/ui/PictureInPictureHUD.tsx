import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HeroData, AttributeType } from '../../../entities/hero/bi/types';
import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { getItemIconUrl, getNeutralItemIconUrl, getItemFallbackSvg } from '../../../entities/item/bi/itemImages';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { getNumberedSkillPriority } from '../../../shared/bi/utils/skillUtils';
import { 
  Swords, 
  ShieldAlert, 
  ChevronRight, 
  Coins, 
  X, 
  Search, 
  Sparkles, 
  Zap, 
  Clock, 
  Minimize2, 
  Maximize2,
  MousePointerClick,
  Award,
  TrendingUp
} from 'lucide-react';

const QUICK_HERO_IDS = [
  'antimage', 
  'pudge', 
  'invoker', 
  'juggernaut', 
  'phantom_assassin', 
  'axe', 
  'crystal_maiden', 
  'lion'
];

interface PictureInPictureHUDProps {
  initialHero: HeroData;
  onClose: () => void;
  isNativePip?: boolean;
}

type BuildStage = 'starting' | 'early' | 'mid' | 'late' | 'neutrals';

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
  const [quickAttrFilter, setQuickAttrFilter] = useState<AttributeType | 'all'>('all');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [showTalents, setShowTalents] = useState<boolean>(false);

  // Responsive container observer for adaptive design on shrink (e.g. 320x240)
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: isCompact ? 320 : 370,
    height: isCompact ? 240 : 540
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width || (isNativePip ? window.innerWidth : (isCompact ? 320 : 370));
      const h = rect.height || (isNativePip ? window.innerHeight : (isCompact ? 240 : 540));
      setContainerSize({ width: w, height: h });
    };

    updateSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setContainerSize({ width, height });
          }
        }
      });
      ro.observe(el);
    }

    const handleResize = () => updateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isNativePip, isCompact]);

  // Adaptive shrink mode (e.g. 320x240, or container width <= 335px or height <= 265px)
  const isShrunk = isCompact || containerSize.width <= 335 || containerSize.height <= 265;

  // Click timing for double-click vs single-click detection
  const clickTimeoutRef = useRef<number | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Sync if initialHero changes
  useEffect(() => {
    setSelectedHero(initialHero);
  }, [initialHero.id]);

  // Stage progression sequence
  const stages: { key: BuildStage; label: string; short: string; badge: string; timing: string }[] = [
    { key: 'starting', label: 'Starting Items', short: 'Starting', badge: 'Lane', timing: '0:00' },
    { key: 'early', label: 'Early Game', short: 'Early', badge: '0-12m', timing: '0 - 12m' },
    { key: 'mid', label: 'Core / Mid Game', short: 'Mid (Core)', badge: '12-25m', timing: '12 - 25m' },
    { key: 'late', label: 'Late Luxury', short: 'Late', badge: '25m+', timing: '25m+' },
    { key: 'neutrals', label: 'Neutral Items', short: 'Neutrals', badge: 'T1-T5', timing: '7m - 60m' }
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

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  // Double-click vs single-click screen handler
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('select') ||
      target.closest('input')
    ) {
      return;
    }

    if (pointerDownPosRef.current) {
      const distance = Math.hypot(
        e.clientX - pointerDownPosRef.current.x,
        e.clientY - pointerDownPosRef.current.y
      );
      if (distance > 7) return;
    }

    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    if (clickTimeoutRef.current) {
      // 2 Fast Clicks: Toggle Counter Mode
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      toggleCounterMode();
    } else {
      // 1 Click: Schedule Single-Click (Advance Stage)
      clickTimeoutRef.current = window.setTimeout(() => {
        clickTimeoutRef.current = null;
        if (!isCounterMode) {
          advanceStage();
        }
      }, 250);
    }
  };

  // Hero neutral items with verified defaults
  const heroNeutrals = useMemo(() => {
    if (selectedHero.build?.neutrals && selectedHero.build.neutrals.length > 0) {
      return selectedHero.build.neutrals;
    }
    return [
      { tier: 1, items: ['Duelist Gloves', 'Arcane Ring', 'Safety Bubble'] },
      { tier: 2, items: ['Dragon Scale', 'Vampire Fangs', 'Grove Bow'] },
      { tier: 3, items: ['Paladin Sword', 'Nemesis Curse', 'Enchanted Quiver'] },
      { tier: 4, items: ['Mind Breaker', 'Ninja Gear', "Aviana's Feather"] },
      { tier: 5, items: ['Apex', 'Pirate Hat', 'Mirror Shield'] }
    ];
  }, [selectedHero]);

  // Current build items for the active stage
  const currentItems = useMemo(() => {
    if (activeStage === 'starting') return selectedHero.build.starting || [];
    if (activeStage === 'early') return selectedHero.build.early || [];
    if (activeStage === 'mid') return selectedHero.build.core || [];
    if (activeStage === 'late') return selectedHero.build.late || [];
    return [];
  }, [activeStage, selectedHero]);

  // Total stage cost calculation (BI Net Worth Target)
  const currentStageCost = useMemo(() => {
    return currentItems.reduce((acc, it) => acc + (it.cost || 0), 0);
  }, [currentItems]);

  // Attribute styling & radiance
  const attrStyles = {
    str: {
      text: 'text-red-400',
      badge: 'border-red-500/50 bg-red-950/80 text-red-300',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.25)]',
      border: 'border-red-500/40'
    },
    agi: {
      text: 'text-emerald-400',
      badge: 'border-emerald-500/50 bg-emerald-950/80 text-emerald-300',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      border: 'border-emerald-500/40'
    },
    int: {
      text: 'text-cyan-400',
      badge: 'border-cyan-500/50 bg-cyan-950/80 text-cyan-300',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      border: 'border-cyan-500/40'
    },
    all: {
      text: 'text-purple-300',
      badge: 'border-purple-500/50 bg-purple-950/80 text-purple-200',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]',
      border: 'border-purple-500/40'
    }
  }[selectedHero.attribute];

  // Filtered heroes for quick search drawer
  const filteredHeroes = useMemo(() => {
    return HEROES_DATA.filter((h) => {
      const matchAttr = quickAttrFilter === 'all' || h.attribute === quickAttrFilter;
      const matchQuery = !searchQuery.trim() || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchAttr && matchQuery;
    });
  }, [searchQuery, quickAttrFilter]);

  // Numbered skill priority guide
  const numberedSkills = useMemo(() => {
    return getNumberedSkillPriority(
      selectedHero.skillOrder.maxPriority,
      selectedHero.abilities
    );
  }, [selectedHero.id, selectedHero.skillOrder.maxPriority, selectedHero.abilities]);

  // Current power spike window
  const currentSpikeText = useMemo(() => {
    if (activeStage === 'starting') return 'Lane Dominance & CS Priority';
    if (activeStage === 'early') return selectedHero.powerSpikes.early || 'First core item timing';
    if (activeStage === 'mid') return selectedHero.powerSpikes.mid || 'BKB / Core fight viability';
    if (activeStage === 'late') return selectedHero.powerSpikes.late || 'Luxury items & Roshan control';
    return 'Neutral Tier Power Breakpoints';
  }, [activeStage, selectedHero]);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onPointerDown={handlePointerDown}
      className={`select-none flex flex-col min-h-0 overflow-hidden bg-slate-950/95 text-slate-100 font-sans backdrop-blur-2xl transition-all duration-200 ${
        isNativePip
          ? 'w-full h-full'
          : `${isCompact ? 'h-[240px] w-[320px]' : 'h-[540px] w-[370px]'} rounded-2xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.95)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] resize min-h-[200px] min-w-[280px] max-h-[85vh]`
      }`}
    >
      {/* ============================================================ */}
      {/* 1. ESPORTS BROADCAST TELEMETRY HEADER                         */}
      {/* ============================================================ */}
      <div className={`relative bg-gradient-to-r from-slate-900/90 via-slate-950/95 to-slate-900/90 border-b border-white/[0.08] ${isShrunk ? 'px-2 py-1' : 'p-2.5'} flex-shrink-0`}>
        <div className="flex items-center justify-between gap-1.5">
          
          {/* Hero Avatar & Identity */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className={`relative ${isShrunk ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'} overflow-hidden border ${attrStyles.border} ${attrStyles.glow} flex-shrink-0 shadow`}>
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
              <div className="flex items-center gap-1">
                <span className={`font-dota font-black ${isShrunk ? 'text-[11px]' : 'text-xs'} text-white truncate drop-shadow-sm`}>
                  {selectedHero.name}
                </span>
                <span className={`text-[7px] font-mono font-bold px-1 py-0.1 rounded border uppercase ${attrStyles.badge}`}>
                  {selectedHero.attribute.toUpperCase()}
                </span>
              </div>
              <div className="text-[8px] text-slate-400 truncate flex items-center gap-1 mt-0.5 font-mono">
                {!isShrunk && (
                  <>
                    <span>{selectedHero.roles[0]}</span>
                    <span className="text-slate-600">•</span>
                  </>
                )}
                <span className="text-emerald-400 font-bold">{selectedHero.winRate}% WR</span>
                {!isShrunk && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400 capitalize">{selectedHero.attackType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Controls (Watermelon UI Micro-Press Buttons) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Search / Hero Picker Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen((prev) => !prev);
                SoundEngine.playHover();
              }}
              className={`p-1 rounded-lg border active:scale-[0.97] transition-all ${
                isSearchOpen 
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-900 border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.2]'
              }`}
              title="Search and change hero"
            >
              <Search className="w-3 h-3" />
            </button>

            {/* Mode Switcher Button (Build vs Counters) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCounterMode();
              }}
              className={`px-1.5 py-0.5 rounded-lg text-[8px] font-mono font-black uppercase tracking-wider border flex items-center gap-1 active:scale-[0.97] transition-all ${
                isCounterMode 
                  ? 'bg-red-600/30 text-red-200 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                  : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              }`}
              title="Double-click screen or click here to toggle Counters"
            >
              {isCounterMode ? <ShieldAlert className="w-2.5 h-2.5 text-red-400" /> : <Swords className="w-2.5 h-2.5 text-amber-400" />}
              <span>{isCounterMode ? 'Counters' : 'Build'}</span>
            </button>

            {/* Compact Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCompact((prev) => !prev);
                SoundEngine.playHover();
              }}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white active:scale-[0.97] transition-all"
              title={isCompact ? 'Expand HUD (370x540)' : 'Compact HUD (320x240)'}
            >
              {isCompact ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-lg bg-slate-900 hover:bg-red-950/80 border border-white/[0.08] hover:border-red-500/60 text-slate-400 hover:text-red-300 active:scale-[0.97] transition-all"
              title="Close PiP HUD"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Quick Hero Switcher Strip (Hidden on shrink to conserve vertical space) */}
        {!isSearchOpen && !isShrunk && (
          <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 font-bold flex-shrink-0">
              Hotkeys:
            </span>
            {QUICK_HERO_IDS.map((heroId) => {
              const h = HERO_MAP.get(heroId);
              if (!h) return null;
              const isCurrent = h.id === selectedHero.id;
              return (
                <button
                  key={h.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHero(h);
                    SoundEngine.playHover();
                  }}
                  className={`relative w-6 h-6 rounded-lg overflow-hidden border transition-all flex-shrink-0 active:scale-90 ${
                    isCurrent
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-105'
                      : 'border-white/[0.08] hover:border-white/[0.3] opacity-60 hover:opacity-100'
                  }`}
                  title={`Switch to ${h.name}`}
                >
                  <img
                    src={h.avatarUrl}
                    alt={h.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. BODY CONTENT: HERO PICKER OR BUILD PATH OR COUNTER MATRIX  */}
      {/* ============================================================ */}
      {isSearchOpen ? (
        /* HERO SEARCH & ATTRIBUTE FILTER OVERLAY */
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950/95 overflow-hidden">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-white/[0.08] bg-slate-900/80 flex flex-col gap-1.5 flex-shrink-0">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search 124+ heroes by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-white/[0.12] focus:border-amber-500/60 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
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

            {/* Attribute Chips */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['all', 'str', 'agi', 'int'] as const).map((attr) => (
                  <button
                    key={attr}
                    onClick={() => setQuickAttrFilter(attr)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                      quickAttrFilter === attr
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'text-slate-400 hover:text-white bg-slate-900 border border-white/[0.06]'
                    }`}
                  >
                    {attr === 'all' ? 'All' : attr}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="px-2 py-0.5 text-[9px] font-mono font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-white/[0.08]"
              >
                Done
              </button>
            </div>
          </div>

          {/* Hero Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 grid grid-cols-2 gap-1.5 custom-scrollbar overscroll-contain">
            {filteredHeroes.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400 font-mono">
                No champions match "{searchQuery}"
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
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 shadow-md'
                        : 'bg-slate-900/60 border-white/[0.06] hover:border-white/[0.2] hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <img
                      src={h.avatarUrl}
                      alt={h.name}
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-white/[0.1]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold truncate leading-tight">
                        {h.name}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
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
        /* MODE A: TACTICAL BUILD MATRIX & ITEM PROGRESSION */
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Phase Switcher Tabs (Watermelon UI Segmented Pill) */}
          <div className={`bg-slate-900/70 border-b border-white/[0.06] ${isShrunk ? 'px-2 py-0.5' : 'px-2 py-1.5'} flex items-center justify-between gap-1 flex-shrink-0`}>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
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
                    className={`${isShrunk ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'} rounded-lg font-mono font-bold tracking-wide uppercase transition-all whitespace-nowrap active:scale-[0.97] ${
                      isActive
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {stage.short}
                  </button>
                );
              })}
            </div>

            {/* Next Stage Micro-Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                advanceStage();
              }}
              className={`flex items-center gap-0.5 ${isShrunk ? 'text-[8px] px-1 py-0.5' : 'text-[9px] px-1.5 py-1'} font-mono font-bold text-amber-300 hover:text-white uppercase bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 flex-shrink-0 active:scale-[0.97]`}
              title="Click anywhere on screen to advance stage"
            >
              <span>Next</span>
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Active Phase Items & Telemetry Stream */}
          <div className={`pip-scroll-area flex-1 min-h-0 overflow-y-auto ${isShrunk ? 'p-1.5 space-y-1.5' : 'p-2.5 space-y-2'} custom-scrollbar overscroll-contain`}>
            
            {activeStage === 'neutrals' ? (
              /* NEUTRAL ITEMS BREAKDOWN (TIERS 1 - 5) */
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Recommended Neutral Items
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">
                    Tiers 1 - 5
                  </span>
                </div>

                {heroNeutrals.map((tierData) => {
                  const tierMeta = {
                    1: { label: 'Tier 1', time: '7:00+', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
                    2: { label: 'Tier 2', time: '17:00+', color: 'text-teal-400 border-teal-500/40 bg-teal-950/40' },
                    3: { label: 'Tier 3', time: '27:00+', color: 'text-sky-400 border-sky-500/40 bg-sky-950/40' },
                    4: { label: 'Tier 4', time: '37:00+', color: 'text-purple-300 border-purple-500/40 bg-purple-950/40' },
                    5: { label: 'Tier 5', time: '60:00+', color: 'text-amber-300 border-amber-500/50 bg-amber-950/40' }
                  }[tierData.tier] || { label: `Tier ${tierData.tier}`, time: '', color: 'text-slate-300 border-slate-700 bg-slate-900' };

                  return (
                    <div key={tierData.tier} className={`bg-slate-900/50 border border-white/[0.08] rounded-xl ${isShrunk ? 'p-1.5 space-y-1' : 'p-2 space-y-1.5'} shadow-sm`}>
                      <div className="flex items-center justify-between px-1">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1 py-0.1 rounded border ${tierMeta.color}`}>
                          {tierMeta.label}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>Unlocks:</span>
                          <span className="text-white font-bold">{tierMeta.time}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {tierData.items.map((itemName, i) => (
                          <div
                            key={i}
                            className={`bg-slate-950/80 hover:bg-slate-900 border border-white/[0.06] hover:border-amber-500/60 rounded-lg ${isShrunk ? 'p-1' : 'p-1.5'} flex flex-col items-center text-center transition-all group shadow-sm`}
                            title={`${itemName} (Tier ${tierData.tier} Neutral • ${tierMeta.time})`}
                          >
                            <img
                              src={getNeutralItemIconUrl(itemName)}
                              alt={itemName}
                              className={`${isShrunk ? 'w-8 h-5' : 'w-10 h-7'} rounded object-contain border border-white/[0.08] group-hover:border-amber-500/80 bg-black/60 shadow flex-shrink-0`}
                              onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.onerror = null;
                                el.src = getItemFallbackSvg(itemName);
                              }}
                            />
                            <span className="text-[9px] font-semibold text-slate-300 group-hover:text-amber-200 mt-0.5 line-clamp-1 leading-tight w-full">
                              {itemName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* STANDARD ITEMS PROGRESSION WITH BI METRICS */
              <>
                {/* Stage Telemetry Header: Phase Cost & Spike Window */}
                <div className="flex items-center justify-between px-1 text-[10px] font-mono font-bold">
                  <div className="flex items-center gap-1 text-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="uppercase tracking-wider">
                      {stages.find((s) => s.key === activeStage)?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentStageCost > 0 && (
                      <span className="text-[9px] text-amber-400/90 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5 font-mono">
                        <Coins className="w-2.5 h-2.5 text-amber-400" />
                        <span>Σ {currentStageCost.toLocaleString()}g</span>
                      </span>
                    )}
                    {!isShrunk && (
                      <span className="text-[9px] text-slate-500 font-mono">
                        {currentItems.length} items
                      </span>
                    )}
                  </div>
                </div>

                {/* Power Spike Window Directive (Hidden when shrunk to conserve vertical room) */}
                {!isShrunk && (
                  <div className="px-2 py-1 rounded-lg bg-slate-900/40 border border-white/[0.06] text-[10px] text-slate-300 font-sans flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-400 font-mono text-[9px] uppercase">Goal:</span>
                      <span className="truncate text-slate-200 font-medium">{currentSpikeText}</span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-300/80 bg-slate-950 px-1 rounded flex-shrink-0">
                      {stages.find((s) => s.key === activeStage)?.timing}
                    </span>
                  </div>
                )}

                {/* Item List: On 320x240, leave only item name (and cost badge) */}
                <div className={isShrunk ? 'space-y-1' : 'space-y-1.5'}>
                  {currentItems.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`group bg-slate-900/60 hover:bg-slate-900/95 border border-white/[0.08] hover:border-amber-500/50 rounded-xl ${
                        isShrunk ? 'p-1.5 gap-2' : 'p-2 gap-2.5'
                      } flex items-center transition-all shadow-sm`}
                    >
                      {/* Item Thumbnail */}
                      <img
                        src={getItemIconUrl(item.id, item.name)}
                        alt={item.name}
                        className={`${isShrunk ? 'w-8 h-6' : 'w-10 h-7'} rounded object-contain border border-white/[0.1] group-hover:border-amber-400/80 flex-shrink-0 bg-black/60 shadow`}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.onerror = null;
                          el.src = getItemFallbackSvg(item.name);
                        }}
                      />

                      {/* Item Title, Cost & Rationale */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold ${isShrunk ? 'text-[11px]' : 'text-xs'} text-white group-hover:text-amber-200 truncate`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-0.5 flex-shrink-0">
                            <Coins className="w-2.5 h-2.5 text-amber-400" />
                            {item.cost ? `${item.cost}g` : 'Recipe'}
                          </span>
                        </div>

                        {/* On 320x240: Item reason/description is removed, leaving only item name */}
                        {!isShrunk && item.reason && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 group-hover:line-clamp-2 leading-tight mt-0.5 font-sans">
                            {item.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contextual Quick Neutral Item Switcher (Hidden when shrunk to conserve vertical room) */}
                {!isShrunk && activeStage === 'early' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStage('neutrals');
                      SoundEngine.playPick();
                    }}
                    className="p-1.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between cursor-pointer transition-all text-[10px] shadow-sm"
                    title="Click to view all Tier 1-5 Neutral Items"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40 text-[9px] uppercase flex-shrink-0">
                        7m+ Neutrals
                      </span>
                      <span className="text-slate-300 truncate text-[10px]">
                        {heroNeutrals.find((n) => n.tier === 1)?.items.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center flex-shrink-0">
                      T1-T5 <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                )}

                {!isShrunk && activeStage === 'mid' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStage('neutrals');
                      SoundEngine.playPick();
                    }}
                    className="p-1.5 rounded-xl bg-teal-950/30 hover:bg-teal-950/60 border border-teal-500/30 hover:border-teal-500/60 flex items-center justify-between cursor-pointer transition-all text-[10px] shadow-sm"
                    title="Click to view all Tier 1-5 Neutral Items"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/40 text-[9px] uppercase flex-shrink-0">
                        17m+ Neutrals
                      </span>
                      <span className="text-slate-300 truncate text-[10px]">
                        {heroNeutrals.find((n) => n.tier === 2)?.items.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-teal-400 flex items-center flex-shrink-0">
                      T1-T5 <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Quick Skill Maxing Roadmap */}
            <div className={`${isShrunk ? 'mt-1.5 p-1.5' : 'mt-2.5 p-2'} pt-1.5 border-t border-white/[0.08] bg-slate-900/40 rounded-xl border border-white/[0.06] shadow-sm`}>
              <div className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Skill Max Priority:</span>
                </div>
                {!isShrunk && <span className="text-[8px] text-slate-500 font-normal">Max order 1st ➔ 4th</span>}
              </div>

              <div className="flex items-center gap-2">
                {numberedSkills.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center font-mono font-black ${
                        isShrunk ? 'w-6 h-6 text-sm rounded-lg' : 'w-7 h-7 text-base rounded-xl'
                      } border transition-all active:scale-95 shadow-sm ${
                        s.isUlt
                          ? 'bg-gradient-to-b from-red-950/90 to-red-900/70 text-red-300 border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                          : 'bg-gradient-to-b from-amber-950/80 to-slate-900/90 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      }`}
                      title={`${s.name || `Skill ${s.skillNumber}`}: Max Priority #${idx + 1}`}
                    >
                      {s.skillNumber}
                    </div>
                    {idx < numberedSkills.length - 1 && (
                      <span className="text-slate-500 text-xs font-bold select-none">➔</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Key Talents Spikes (Collapsible BI Drawer) - Hidden when shrunk */}
              {!isShrunk && (
                <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTalents(!showTalents);
                    }}
                    className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300 hover:text-white"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>{showTalents ? 'Hide Talent Spikes' : 'View Key Talent Tree (10-25)'}</span>
                  </button>
                  <span className="text-[8px] font-mono text-slate-500">Patch 7.37d</span>
                </div>
              )}

              {showTalents && !isShrunk && selectedHero.talents && selectedHero.talents.length > 0 && (
                <div className="mt-2 space-y-1 animate-fadeIn">
                  {selectedHero.talents.map((t) => (
                    <div key={t.level} className="flex items-center justify-between text-[9px] bg-slate-950 p-1.5 rounded-lg border border-white/[0.06]">
                      <span className="font-mono font-bold text-amber-400 w-8">Lvl {t.level}:</span>
                      <span className="text-slate-200 font-medium truncate flex-1 text-right">
                        {t.recommended === 'left' ? t.left : t.right}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* MODE B: FAST TWO-CLICK COUNTER MATRIX (HERO & ITEM PICS) */
        <div className="flex-1 flex flex-col min-h-0">
          
          <div className="bg-red-950/40 border-b border-red-900/60 px-2.5 py-1 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-red-300 uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span>Counter Threat Matrix</span>
            </div>
            <span className="text-[8px] font-mono text-red-400 font-bold bg-red-950 px-1 py-0.2 rounded border border-red-800">
              2-Click: Return
            </span>
          </div>

          <div className={`pip-scroll-area flex-1 min-h-0 overflow-y-auto ${isShrunk ? 'p-1.5 space-y-2' : 'p-2.5 space-y-3'} custom-scrollbar overscroll-contain`}>
            
            {/* 1. ENEMY HERO COUNTERS */}
            <div>
              <div className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Enemy Hard Counters (Ban / Watch):</span>
                {!isShrunk && <span className="text-slate-500 font-normal">Mortal Nemesis</span>}
              </div>

              <div className="grid grid-cols-2 gap-1">
                {selectedHero.weakAgainst.map((w, idx) => {
                  const enemyHero = HERO_MAP.get(w.heroId);
                  const avatar = enemyHero?.avatarUrl || `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${w.heroId}.png`;

                  return (
                    <div
                      key={idx}
                      className={`bg-slate-900/70 border border-red-900/50 hover:border-red-500 rounded-xl ${isShrunk ? 'p-1' : 'p-1.5'} flex items-center gap-1.5 shadow-sm`}
                      title={`${w.heroName}: ${w.reason}`}
                    >
                      <img
                        src={avatar}
                        alt={w.heroName}
                        className={`${isShrunk ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg object-cover border border-red-700/60 flex-shrink-0`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[10px] text-red-200 truncate">
                          {w.heroName}
                        </div>
                        {/* On shrink: hide reason, leave only name */}
                        {!isShrunk && (
                          <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight font-sans">
                            {w.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. KEY COUNTER ITEMS TO BUY & RESPECT */}
            <div>
              <div className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Key Counter Items:</span>
                {!isShrunk && <span className="text-slate-500 font-normal font-sans">Tactical responses</span>}
              </div>

              <div className="grid grid-cols-2 gap-1">
                {selectedHero.counterStrategy.keyCounterItems.map((c, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`bg-slate-900/70 border border-amber-900/50 hover:border-amber-500 rounded-xl ${isShrunk ? 'p-1' : 'p-1.5'} flex items-center gap-1.5 shadow-sm`}
                      title={`${c.name}: ${c.reason}`}
                    >
                      <img
                        src={getItemIconUrl('', c.name)}
                        alt={c.name}
                        className={`${isShrunk ? 'w-7 h-5' : 'w-9 h-7'} rounded object-contain border border-amber-700/60 flex-shrink-0 bg-black/60 shadow`}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.onerror = null;
                          el.src = getItemFallbackSvg(c.name);
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[10px] text-amber-200 truncate">
                          {c.name}
                        </div>
                        {/* On shrink: hide reason, leave only item name */}
                        {!isShrunk && (
                          <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight font-sans">
                            {c.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. HEROES YOU COUNTER (ADVANTAGES) */}
            {selectedHero.strongAgainst.length > 0 && (
              <div>
                <div className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Heroes You Counter:</span>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {selectedHero.strongAgainst.map((s, idx) => {
                    const preyHero = HERO_MAP.get(s.heroId);
                    const avatar = preyHero?.avatarUrl || `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${s.heroId}.png`;

                    return (
                      <div
                        key={idx}
                        className={`bg-slate-900/70 border border-emerald-900/50 hover:border-emerald-500 rounded-xl ${isShrunk ? 'p-1' : 'p-1.5'} flex items-center gap-1.5 shadow-sm`}
                        title={`${s.heroName}: ${s.reason}`}
                      >
                        <img
                          src={avatar}
                          alt={s.heroName}
                          className={`${isShrunk ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg object-cover border border-emerald-700/60 flex-shrink-0`}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/storm_spirit.png';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[10px] text-emerald-200 truncate">
                            {s.heroName}
                          </div>
                          {!isShrunk && (
                            <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight font-sans">
                              {s.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. LANING & TEAMFIGHT DIRECTIVES (Hidden on shrink) */}
            {!isShrunk && (
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                {selectedHero.counterStrategy.laningAdvice && (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/[0.06] text-[10px] text-slate-300 font-sans leading-relaxed">
                    <span className="font-mono font-bold text-amber-300 block mb-0.5 text-[9px] uppercase">
                      Laning Phase Directive:
                    </span>
                    {selectedHero.counterStrategy.laningAdvice}
                  </div>
                )}
                {selectedHero.counterStrategy.teamfightAdvice && (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/[0.06] text-[10px] text-slate-300 font-sans leading-relaxed">
                    <span className="font-mono font-bold text-red-300 block mb-0.5 text-[9px] uppercase">
                      Teamfight Protocol:
                    </span>
                    {selectedHero.counterStrategy.teamfightAdvice}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TACTICAL FOOTER HUD & GESTURE STATUS BAR                   */}
      {/* ============================================================ */}
      <div 
        className={`bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-white/[0.08] ${isShrunk ? 'px-2 py-1' : 'px-3 py-1.5'} flex items-center justify-between text-[9px] text-slate-400 flex-shrink-0 cursor-pointer hover:text-slate-200 transition-colors`}
        title="1-Click: Advance phase | 2-Clicks: Toggle Counters Matrix"
      >
        <div className="flex items-center gap-1.5 flex-wrap font-mono text-[8px]">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <MousePointerClick className="w-2.5 h-2.5 text-amber-400" />
            <span>1-Tap:</span>
          </div>
          <span>{isShrunk ? 'Phase' : 'Next Phase'}</span>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1 text-red-400 font-bold">
            <Zap className="w-2.5 h-2.5 text-red-400" />
            <span>2-Tap:</span>
          </div>
          <span>Counters</span>
          <span className="text-slate-700">•</span>
          <kbd className="px-1 py-0.1 rounded bg-slate-900 border border-white/[0.1] font-mono text-[8px] text-amber-300 font-bold">
            Alt+P
          </kbd>
        </div>
      </div>

    </div>
  );
};

export default PictureInPictureHUD;
