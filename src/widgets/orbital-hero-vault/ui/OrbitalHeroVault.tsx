import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';
import { HeroData, AttributeType } from '../../../entities/hero/bi/types';
import { getDistinguishablePortraitCandidates } from '../../../entities/hero/bi/heroVisuals';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  Crown, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  ArrowUpRight,
  Layers,
  Compass,
  Play,
  Pause,
  Globe
} from 'lucide-react';
import DomeGallery from '../../dome-gallery/ui/DomeGallery';

interface OrbitalHeroVaultProps {
  onSelectHero: (hero: HeroData) => void;
  onOpenHeroDetails?: (hero: HeroData) => void;
}

export const OrbitalHeroVault: React.FC<OrbitalHeroVaultProps> = ({
  onSelectHero,
  onOpenHeroDetails
}) => {
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [vaultViewMode, setVaultViewMode] = useState<'dome' | 'sphere' | 'cards'>('dome');

  // Auto-scroll engine state
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
  const [scrollSpeed, setScrollSpeed] = useState<1 | 2>(1);

  // References for container, mouse drag, inertia, and wheel scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftStartRef = useRef<number>(0);
  const lastClientXRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const momentumRafRef = useRef<number | null>(null);

  // Mouse tilt tracking for spotlight card
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Filtered heroes list
  const filteredHeroes = useMemo(() => {
    return HEROES_DATA.filter((hero) => {
      const matchesAttr = selectedAttribute === 'all' || hero.attribute === selectedAttribute;
      const matchesSearch =
        !searchQuery.trim() ||
        hero.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        hero.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchesAttr && matchesSearch;
    });
  }, [selectedAttribute, searchQuery]);

  const activeHero = filteredHeroes[activeHeroIndex] || filteredHeroes[0] || HEROES_DATA[0];

  // Triplicated array for seamless infinite looping across all heroes
  const infiniteHeroes = useMemo(() => {
    if (filteredHeroes.length === 0) return [];
    const repeatFactor = filteredHeroes.length < 15 ? 6 : 3;
    const result: { hero: HeroData; originalIndex: number; keyId: string }[] = [];
    for (let r = 0; r < repeatFactor; r++) {
      filteredHeroes.forEach((hero, idx) => {
        result.push({
          hero,
          originalIndex: idx,
          keyId: `loop-${r}-${hero.id}`
        });
      });
    }
    return result;
  }, [filteredHeroes]);

  // Seamless infinite wrapping check
  const checkInfiniteWrap = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || filteredHeroes.length === 0) return;
    const repeatFactor = filteredHeroes.length < 15 ? 6 : 3;
    const singleSetWidth = el.scrollWidth / repeatFactor;
    if (singleSetWidth <= 0) return;

    // Scrolled past the middle segment to the right -> wrap seamlessly
    if (el.scrollLeft >= singleSetWidth * 2) {
      el.scrollLeft -= singleSetWidth;
    }
    // Scrolled past the middle segment to the left -> wrap seamlessly
    else if (el.scrollLeft <= singleSetWidth * 0.25) {
      el.scrollLeft += singleSetWidth;
    }
  }, [filteredHeroes.length]);

  // Initialize scroll position in the center segment on mount or filter change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || filteredHeroes.length === 0) return;

    const timer = setTimeout(() => {
      const repeatFactor = filteredHeroes.length < 15 ? 6 : 3;
      const singleSetWidth = el.scrollWidth / repeatFactor;
      if (singleSetWidth > 0) {
        el.scrollLeft = singleSetWidth;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [filteredHeroes]);

  // 1. Dedicated Wheel Listener (Stops page scroll, translates wheel to horizontal dome rotation)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || vaultViewMode !== 'dome') return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser / Lenis from scrolling the document
      e.preventDefault();
      e.stopPropagation();

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      el.scrollLeft += delta * 1.35;
      checkInfiniteWrap();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [vaultViewMode, checkInfiniteWrap]);

  // 2. Auto-Scroll Loop (Runs at 60fps, continuously loops over all heroes)
  useEffect(() => {
    if (!isAutoScrolling || vaultViewMode !== 'dome') return;
    const el = scrollContainerRef.current;
    if (!el) return;

    let rafId: number;
    let lastTime = performance.now();
    const baseSpeed = scrollSpeed === 2 ? 2.4 : 1.2;

    const step = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2.5);
      lastTime = time;

      if (
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        scrollContainerRef.current
      ) {
        scrollContainerRef.current.scrollLeft += baseSpeed * dt;
        checkInfiniteWrap();
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isAutoScrolling, scrollSpeed, vaultViewMode, checkInfiniteWrap]);

  // 3. Pointer Drag-to-Scroll Mechanics (with smooth inertia)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    lastClientXRef.current = e.clientX;
    scrollLeftStartRef.current = el.scrollLeft;
    velocityRef.current = 0;

    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true;
    }

    const stepDelta = e.clientX - lastClientXRef.current;
    velocityRef.current = stepDelta;
    lastClientXRef.current = e.clientX;

    el.scrollLeft = scrollLeftStartRef.current - dx;
    checkInfiniteWrap();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Apply inertia if flicked
    if (Math.abs(velocityRef.current) > 3) {
      let vel = -velocityRef.current * 1.4;
      const stepInertia = () => {
        const el = scrollContainerRef.current;
        if (!el || Math.abs(vel) < 0.4 || isDraggingRef.current) return;
        el.scrollLeft += vel;
        checkInfiniteWrap();
        vel *= 0.94;
        momentumRafRef.current = requestAnimationFrame(stepInertia);
      };
      momentumRafRef.current = requestAnimationFrame(stepInertia);
    }
  };

  const handleCardClick = (hero: HeroData, originalIndex: number) => {
    if (hasMovedRef.current) return; // Ignore drag release
    setActiveHeroIndex(originalIndex);
    onSelectHero(hero);
    SoundEngine.playPick();
  };

  const handleInspect = (e: React.MouseEvent, hero: HeroData) => {
    e.stopPropagation();
    SoundEngine.playHover();
    if (onOpenHeroDetails) {
      onOpenHeroDetails(hero);
    }
  };

  const scrollLeftNav = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollBy({ left: -360, behavior: 'smooth' });
      checkInfiniteWrap();
      SoundEngine.playHover();
    }
  };

  const scrollRightNav = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollBy({ left: 360, behavior: 'smooth' });
      checkInfiniteWrap();
      SoundEngine.playHover();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Attribute styling dictionary
  const attrStyles = {
    str: { 
      label: 'Strength', 
      text: 'text-red-400', 
      border: 'border-red-500/50', 
      bg: 'bg-red-950/40', 
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.3)]',
      gradient: 'from-red-600/30 via-orange-600/20 to-transparent',
      ring: 'ring-red-500/40'
    },
    agi: { 
      label: 'Agility', 
      text: 'text-emerald-400', 
      border: 'border-emerald-500/50', 
      bg: 'bg-emerald-950/40', 
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
      gradient: 'from-emerald-600/30 via-teal-600/20 to-transparent',
      ring: 'ring-emerald-500/40'
    },
    int: { 
      label: 'Intelligence', 
      text: 'text-cyan-400', 
      border: 'border-cyan-500/50', 
      bg: 'bg-cyan-950/40', 
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
      gradient: 'from-cyan-600/30 via-blue-600/20 to-transparent',
      ring: 'ring-cyan-500/40'
    },
    all: { 
      label: 'Universal', 
      text: 'text-purple-300', 
      border: 'border-purple-500/50', 
      bg: 'bg-purple-950/40', 
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
      gradient: 'from-purple-600/30 via-pink-600/20 to-transparent',
      ring: 'ring-purple-500/40'
    }
  }[activeHero.attribute];

  // Prepare images for 3D Sphere mode
  const sphereImages = useMemo(() => {
    return filteredHeroes.map((hero) => {
      const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
      return {
        src: candidates[1] || candidates[0],
        alt: hero.name,
        hero
      };
    });
  }, [filteredHeroes]);

  return (
    <div className="relative w-full rounded-3xl bg-slate-950/85 border border-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden p-4 sm:p-7">
      
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================ */}
      {/* 1. VAULT CONTROLS & ATTRIBUTE SELECTOR                       */}
      {/* ============================================================ */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 via-red-500/10 to-transparent border border-amber-500/40 flex items-center justify-center shadow-inner">
            <Crown className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-dota font-bold text-white tracking-wide">
                ORBITAL HERO VAULT
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-white/[0.08] text-amber-300">
                124 CHAMPIONS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Autonomous 3D orbital loop • Infinite conveyor • No-scrollbar direct wheel scroll
            </p>
          </div>
        </div>

        {/* Filter Bar: Mode Switcher, Attributes & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* View Mode Switcher (3D Dome vs 3D Sphere vs Card Deck) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/[0.08]">
            <button
              onClick={() => {
                setVaultViewMode('dome');
                SoundEngine.playHover();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-100 flex items-center gap-1.5 ${
                vaultViewMode === 'dome'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3D Orbital Looping Dome"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Dome</span>
            </button>

            <button
              onClick={() => {
                setVaultViewMode('sphere');
                SoundEngine.playHover();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-100 flex items-center gap-1.5 ${
                vaultViewMode === 'sphere'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full 3D Celestial Sphere"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Sphere</span>
            </button>

            <button
              onClick={() => {
                setVaultViewMode('cards');
                SoundEngine.playHover();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-100 flex items-center gap-1.5 ${
                vaultViewMode === 'cards'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="High Density Card Matrix"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Card Deck</span>
            </button>
          </div>

          {/* Attribute Segmented Chips */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/[0.08]">
            {(['all', 'str', 'agi', 'int'] as const).map((attr) => (
              <button
                key={attr}
                onClick={() => {
                  setSelectedAttribute(attr);
                  setActiveHeroIndex(0);
                  SoundEngine.playHover();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-100 ${
                  selectedAttribute === attr
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {attr === 'all' ? 'All' : attr}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-40 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter hero..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveHeroIndex(0);
              }}
              className="w-full bg-slate-900/90 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. SPOTLIGHT HERO DECK & TELEMETRY DISPLAY                   */}
      {/* ============================================================ */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Spotlight Showcase (Left 5 Cols) with Specular Hologram Tilt */}
        <div 
          onMouseMove={handleMouseMove}
          className={`lg:col-span-5 relative rounded-2xl bg-slate-900/40 border ${attrStyles.border} p-5 backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-2xl overflow-hidden specular-card`}
        >
          {/* Specular Light Reflection Glint */}
          <div 
            className="specular-glint" 
            style={{ 
              transform: `translate3d(${mousePos.x * 2 - 100}%, ${mousePos.y * 2 - 100}%, 0) skewX(-20deg)` 
            }} 
          />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${attrStyles.border} ${attrStyles.bg} ${attrStyles.text}`}>
                  {attrStyles.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Attack: <strong className="text-white capitalize">{activeHero.attackType}</strong>
                </span>
              </div>
              <h3 className="text-3xl font-dota font-black text-white tracking-tight mt-1.5 drop-shadow-md">
                {activeHero.name}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-1">
                Roles: {activeHero.roles.join(' • ')}
              </p>
            </div>

            {/* Winrate Metric Badge */}
            <div className="flex flex-col items-end">
              <span className="text-xl font-mono font-black text-emerald-400">
                {activeHero.winRate}%
              </span>
              <span className="text-[9px] font-mono uppercase text-slate-500">
                Patch 7.37d WR
              </span>
            </div>
          </div>

          {/* Hero Strategic Overview */}
          <div className="relative z-10 p-3 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs text-slate-300 leading-relaxed font-sans">
            <span className="text-amber-300 font-bold block mb-1 text-[11px] font-mono uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Core Identity & Tactical Spikes
            </span>
            {activeHero.summary || activeHero.playstyle || `${activeHero.name} is a versatile ${activeHero.roles[0]} powerhouse with strong lane influence and scalable item timings.`}
          </div>

          {/* Action Row */}
          <div className="relative z-10 flex items-center gap-3 pt-2">
            <button
              onClick={(e) => handleInspect(e, activeHero)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-red-500/20 to-transparent hover:from-amber-500/30 hover:to-red-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Inspect Full Build</span>
              <ArrowUpRight className="w-4 h-4 text-amber-300" />
            </button>
            <button
              onClick={() => {
                onSelectHero(activeHero);
                SoundEngine.playPick();
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-white text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Set Main
            </button>
          </div>
        </div>

        {/* Dynamic Display (Right 7 Cols) */}
        <div className="lg:col-span-7 relative">
          
          {vaultViewMode === 'dome' ? (
            /* 3D PERSPECTIVE ORBITAL CAROUSEL (Infinite Looping + Own Scroll) */
            <div className="relative flex flex-col space-y-3">
              
              {/* Carousel Sub-Toolbar: Auto-Orbit Toggle, Speed, Jump & Wheel Indicator */}
              <div className="flex items-center justify-between text-xs font-mono px-1">
                <div className="flex items-center gap-2">
                  {/* Auto-Scroll Play/Pause Button */}
                  <button
                    onClick={() => {
                      setIsAutoScrolling(!isAutoScrolling);
                      SoundEngine.playHover();
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                      isAutoScrolling
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    }`}
                    title="Toggle Continuous Auto-Orbit"
                  >
                    <span className="relative flex h-2 w-2">
                      {isAutoScrolling && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoScrolling ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </span>
                    {isAutoScrolling ? (
                      <>
                        <Pause className="w-3 h-3 ml-0.5" />
                        <span className="font-bold">Auto-Orbit: ON</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 ml-0.5" />
                        <span className="font-bold">Auto-Orbit: OFF</span>
                      </>
                    )}
                  </button>

                  {/* Speed Selector */}
                  <div className="flex items-center rounded-lg bg-slate-900 border border-white/[0.08] p-0.5">
                    <button
                      onClick={() => setScrollSpeed(1)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scrollSpeed === 1 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => setScrollSpeed(2)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scrollSpeed === 2 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      2x
                    </button>
                  </div>
                </div>

                {/* Gesture Guidance & Hero Count */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-white/[0.06]">
                    Wheel / Drag to Rotate
                  </span>
                  <span className="text-amber-400/90 font-bold">
                    Looping {filteredHeroes.length} Heroes
                  </span>
                </div>
              </div>

              {/* 3D PERSPECTIVE STAGE */}
              <div className="relative perspective-1200 py-1">
                
                {/* Left/Right Vignette Depth Masks */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950/90 via-slate-950/40 to-transparent z-10" />

                {/* Step Navigation Arrows */}
                <button
                  onClick={scrollLeftNav}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/95 border border-white/[0.12] text-white hover:border-amber-500 flex items-center justify-center shadow-2xl active:scale-90 transition-all backdrop-blur-md"
                  title="Rotate Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollRightNav}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/95 border border-white/[0.12] text-white hover:border-amber-500 flex items-center justify-center shadow-2xl active:scale-90 transition-all backdrop-blur-md"
                  title="Rotate Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Seamless Looping 3D Carousel Track (Has its own direct scroll, no scrollbar) */}
                <div
                  ref={scrollContainerRef}
                  data-lenis-prevent="true"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onMouseEnter={() => { isHoveredRef.current = true; }}
                  onMouseLeave={() => { 
                    isHoveredRef.current = false; 
                    handlePointerUp();
                  }}
                  className="flex items-center gap-3.5 overflow-x-scroll py-4 px-3 no-scrollbar preserve-3d select-none cursor-grab active:cursor-grabbing"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'auto'
                  }}
                >
                  {infiniteHeroes.map(({ hero, originalIndex, keyId }) => {
                    const isActive = hero.id === activeHero.id;
                    return (
                      <div
                        key={keyId}
                        onClick={() => handleCardClick(hero, originalIndex)}
                        className={`group relative flex-shrink-0 w-36 sm:w-40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 select-none specular-card ${
                          isActive
                            ? 'border-2 border-amber-400 ring-4 ring-amber-400/25 scale-105 shadow-[0_12px_35px_rgba(200,155,60,0.5)] z-10'
                            : 'border border-white/[0.08] hover:border-white/[0.3] hover:-translate-y-1.5 opacity-70 hover:opacity-100 bg-slate-900/80'
                        }`}
                      >
                        {/* Specular Shimmer Sweep Effect */}
                        <div className="specular-glint" />

                        {/* Hero Portrait */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                          <img
                            src={hero.avatarUrl}
                            alt={hero.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                            }}
                          />
                          {/* Dynamic Gradient Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          
                          {/* Attribute Gem Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/80 border text-white ${
                              hero.attribute === 'str' ? 'border-red-500/60 text-red-300' :
                              hero.attribute === 'agi' ? 'border-emerald-500/60 text-emerald-300' :
                              hero.attribute === 'int' ? 'border-cyan-500/60 text-cyan-300' :
                              'border-purple-500/60 text-purple-300'
                            }`}>
                              {hero.attribute}
                            </span>
                          </div>

                          {/* Win Rate Tag */}
                          <div className="absolute top-2 right-2">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/85 border border-emerald-500/50 text-emerald-300">
                              {hero.winRate}%
                            </span>
                          </div>

                          {/* Bottom Hero Name & Role */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="font-dota font-bold text-xs text-white truncate drop-shadow group-hover:text-amber-300 transition-colors">
                              {hero.name}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate font-mono">
                              {hero.roles[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : vaultViewMode === 'sphere' ? (
            /* 3D CELESTIAL SPHERE (Interactive DomeGallery with Wheel Support & No Scrollbar) */
            <div className="relative w-full h-[410px] rounded-2xl overflow-hidden bg-slate-950/60 border border-white/[0.08] shadow-inner p-1">
              <DomeGallery
                images={sphereImages}
                onSelectHero={(h: HeroData) => {
                  if (h) {
                    const idx = filteredHeroes.findIndex(item => item.id === h.id);
                    if (idx >= 0) setActiveHeroIndex(idx);
                    onSelectHero(h);
                  }
                }}
                onOpenHeroDetails={onOpenHeroDetails}
                segments={24}
                fit={0.52}
                minRadius={380}
                autoRotate={isAutoScrolling}
                autoRotationSpeed={3.5}
                pauseOnHover={true}
                overlayBlurColor="#0d111a"
              />
            </div>
          ) : (
            /* HIGH DENSITY SPECULAR CARD MATRIX */
            <div className="max-h-[390px] overflow-y-auto custom-scrollbar p-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filteredHeroes.map((hero, index) => {
                const isActive = hero.id === activeHero.id;
                return (
                  <div
                    key={`vault-card-${hero.id}`}
                    onClick={() => {
                      setActiveHeroIndex(index);
                      onSelectHero(hero);
                      SoundEngine.playPick();
                    }}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 specular-card ${
                      isActive
                        ? 'border-2 border-amber-400 ring-2 ring-amber-400/30 scale-[1.03] shadow-lg'
                        : 'border border-white/[0.08] hover:border-white/[0.25] hover:scale-[1.02] opacity-80 hover:opacity-100 bg-slate-900/90'
                    }`}
                  >
                    <div className="specular-glint" />
                    <div className="relative aspect-[3/4] w-full bg-slate-950">
                      <img
                        src={hero.avatarUrl}
                        alt={hero.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="absolute bottom-1 left-1.5 right-1.5">
                        <div className="font-dota font-bold text-[11px] text-white truncate leading-tight group-hover:text-amber-200">
                          {hero.name}
                        </div>
                        <div className="text-[8px] font-mono text-emerald-400">
                          {hero.winRate}% WR
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default OrbitalHeroVault;
