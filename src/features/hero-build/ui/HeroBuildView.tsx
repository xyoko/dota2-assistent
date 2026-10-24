import React, { useState, useEffect, useRef } from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { StorageService } from '../../../shared/bi/storage/storageService';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { DotaComplexity, DotaRoleBadge, getItemImageUrl, getHeroFullBodyRenderUrl } from '../../../shared/ui/dota/DotaUIComponents';
import { SEASON_META_DATA } from '../../../entities/meta/bi/seasonMetaData';
import { getNumberedSkillPriority, getSkillNumberFromKey } from '../../../shared/bi/utils/skillUtils';
import { 
  X, 
  Star, 
  Zap, 
  Sparkles, 
  Crosshair, 
  Clock, 
  Layers, 
  Sword, 
  ShieldAlert, 
  Save, 
  Check, 
  AlertTriangle,
  Lightbulb,
  Coins,
  Flame,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PictureInPicture
} from 'lucide-react';

interface HeroBuildViewProps {
  hero: HeroData;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (heroId: string) => void;
  onSelectOtherHero?: (heroId: string) => void;
  onOpenPip?: (hero: HeroData) => void;
}

export const HeroBuildView: React.FC<HeroBuildViewProps> = ({
  hero,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectOtherHero,
  onOpenPip
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'skills' | 'matchups' | 'strategy' | 'notes'>('build');
  const [userNote, setUserNote] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const metaEntry = SEASON_META_DATA.heroes.find((m) => m.heroId === hero.id);

  // Skills identified with numbers (1 to 4)
  const numberedSkillPriority = React.useMemo(() => {
    return getNumberedSkillPriority(hero.skillOrder.maxPriority, hero.abilities);
  }, [hero.skillOrder.maxPriority, hero.abilities]);

  useEffect(() => {
    setUserNote(StorageService.getHeroNote(hero.id));
  }, [hero.id]);

  const handleSaveNote = () => {
    StorageService.saveHeroNote(hero.id, userNote);
    setNoteSaved(true);
    SoundEngine.playGold();
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const [isDoctrineExpanded, setIsDoctrineExpanded] = useState<boolean>(false);

  // Bulletproof Background Scroll Locking & Focus Trap
  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Focus modal container on mount
    const timer = setTimeout(() => {
      modalRef.current?.focus();
    }, 10);

    // 1. Lock standard browser scroll on html and body
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;

    // Compensate for scrollbar disappearance on desktop to avoid layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    // 2. Prevent touch propagation on mobile when touching backdrop or non-scrollable areas
    const preventBackdropTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Allow scrolling inside elements with overflow-y-auto, overflow-x-auto, or form controls
      const scrollable = target.closest('.overflow-y-auto, .overflow-x-auto, textarea, input, select');
      if (!scrollable) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('touchmove', preventBackdropTouch, { passive: false });

    // 3. Keyboard ESC to close & Tab Focus Trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const focusables = Array.from(focusableElements).filter(el => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
      document.removeEventListener('touchmove', preventBackdropTouch);
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose]);

  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hero-build-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn overscroll-contain outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          SoundEngine.playHover();
          onClose();
        }
      }}
    >
      
      {/* Modal Container: Fullscreen on mobile, elevated tactical card on desktop */}
      <div 
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] max-w-5xl bg-hud-surface border-0 sm:border border-white/[0.14] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col overscroll-contain"
      >
        
        {/* Header Hero Showcase Banner (Responsive mobile banner + full desktop portrait showcase) */}
        <div className="relative bg-hud-panel border-b border-white/[0.1] overflow-hidden p-4 sm:p-5 md:p-6 flex-shrink-0">
          
          {/* Subtle attribute accent tint */}
          <div className={`absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 filter blur-3xl pointer-events-none ${
            hero.attribute === 'str' ? 'bg-red-500' :
            hero.attribute === 'agi' ? 'bg-emerald-500' :
            hero.attribute === 'int' ? 'bg-sky-500' :
            'bg-purple-500'
          }`} />

          {/* Desktop Showcase (md: and above) */}
          <div className="relative z-10 hidden md:flex items-start gap-6">
            
            {/* 1. PROPER HERO FULL-BODY PORTRAIT SHOWCASE (Head-to-toe render on desktop) */}
            <div className={`relative w-52 md:w-60 h-72 md:h-80 rounded-xl overflow-hidden border ${
              hero.attribute === 'str' ? 'border-red-500/40' :
              hero.attribute === 'agi' ? 'border-emerald-500/40' :
              hero.attribute === 'int' ? 'border-cyan-500/40' :
              'border-purple-500/40'
            } flex-shrink-0 bg-[#07090e] shadow-xl group select-none flex flex-col justify-start`}>
              
              <div className="absolute inset-0 bg-gradient-to-b from-[#0e121a] via-[#07090e] to-black" />

              {/* Floating Attribute Badge */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 border border-white/10 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${
                  hero.attribute === 'str' ? 'bg-red-500' :
                  hero.attribute === 'agi' ? 'bg-emerald-500' :
                  hero.attribute === 'int' ? 'bg-sky-400' :
                  'bg-purple-400'
                }`} />
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                  {hero.attribute === 'str' ? 'Strength' :
                   hero.attribute === 'agi' ? 'Agility' :
                   hero.attribute === 'int' ? 'Intelligence' : 'Universal'}
                </span>
              </div>

              {/* Floating Attack Type Badge */}
              <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded bg-black/85 border border-white/10 shadow-sm text-[11px] font-mono font-bold text-slate-300 uppercase">
                {hero.attackType}
              </div>

              {/* Full-Body Hero Render */}
              <div className="relative z-10 w-full h-full flex items-start justify-center overflow-hidden pt-4">
                <img
                  src={getHeroFullBodyRenderUrl(hero.avatarUrl)}
                  alt={hero.name}
                  decoding="async"
                  className="w-full h-full object-contain object-top filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out group-hover:scale-105 p-1"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== hero.avatarUrl) {
                      target.src = hero.avatarUrl;
                      target.className = "w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105";
                    }
                  }}
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-15" />
            </div>

            {/* 2. HERO INFORMATION PANEL (Desktop) */}
            <div className="flex-1 min-w-0 flex flex-col justify-between space-y-4">
              
              {/* Top Row: Hero Title & Right Controls */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 id="hero-build-title" className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                      {hero.name}
                    </h1>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      hero.attribute === 'str' ? 'bg-red-950/80 text-red-300 border-red-800/80' :
                      hero.attribute === 'agi' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' :
                      hero.attribute === 'int' ? 'bg-sky-950/80 text-sky-300 border-sky-800/80' :
                      'bg-purple-950/80 text-purple-300 border-purple-800/80'
                    }`}>
                      {hero.attribute.toUpperCase()} • {hero.attackType}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium font-sans mt-0.5 italic">
                    "{hero.title}"
                  </p>
                </div>

                {/* Right: PiP, Favorite & Close Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onOpenPip && (
                    <button
                      onClick={() => {
                        SoundEngine.playPick();
                        onOpenPip(hero);
                      }}
                      className="px-3 py-2 rounded-lg bg-hud-surface hover:bg-hud-surfaceAlt border border-white/[0.14] hover:border-hud-cyan/50 text-hud-cyan text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 group active:scale-[0.98] focus-hud touch-target"
                      title="Open in Picture-in-Picture Mini HUD (Shortcut: Alt+P)"
                    >
                      <PictureInPicture className="w-4 h-4 text-hud-cyan" />
                      <span className="hidden sm:inline">PiP HUD</span>
                      <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-mono bg-black/60 rounded border border-white/10 text-hud-cyan">
                        Alt+P
                      </kbd>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onToggleFavorite(hero.id);
                      SoundEngine.playHover();
                    }}
                    className={`p-2 rounded-lg border transition-colors active:scale-[0.98] focus-hud touch-target ${
                      isFavorite
                        ? 'bg-hud-gold/15 border-hud-gold/60 text-hud-gold'
                        : 'bg-hud-surface border-white/[0.12] text-slate-400 hover:text-white hover:border-white/[0.24]'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-hud-gold text-hud-gold' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      SoundEngine.playHover();
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-hud-surface hover:bg-red-950/60 border border-white/[0.12] hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-colors active:scale-[0.98] focus-hud touch-target"
                    title="Close (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Official Role Badges, Metrics & Season Meta */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {hero.roles.map((r) => (
                    <DotaRoleBadge key={r} role={r} />
                  ))}
                </div>

                <div className="h-4 w-px bg-white/[0.1] mx-1 hidden sm:block" />

                <span className="font-mono tabular-nums text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60 text-xs">
                  {hero.winRate}% WR
                </span>

                <span className="font-mono tabular-nums text-hud-cyan font-bold bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-800/60 text-xs">
                  {hero.pickRate}% Pick
                </span>

                <DotaComplexity complexity={hero.complexity} size="md" />

                {metaEntry ? (
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${
                    metaEntry.tier === 'S+' || metaEntry.tier === 'S'
                      ? 'bg-hud-gold/15 text-hud-gold border-hud-gold/60'
                      : 'bg-hud-surface border-white/[0.1] text-slate-300'
                  }`}>
                    <Flame className="w-3.5 h-3.5 text-hud-gold" />
                    <span>Patch 7.37d: Tier {metaEntry.tier} {metaEntry.tier === 'S+' || metaEntry.tier === 'S' ? '(Dominant Pick)' : '(Viable)'}</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-hud-surface text-slate-400 border border-white/[0.08]">
                    Non-Meta
                  </span>
                )}
              </div>

              {/* Row 3: Tactical Summary & Core Playstyle */}
              <div className="bg-hud-surface/90 border border-white/[0.08] rounded-xl p-3 space-y-1.5">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {hero.summary}
                </p>
                <div className="text-[11px] text-slate-400 leading-relaxed font-sans border-t border-white/[0.06] pt-1.5 flex items-start gap-1.5">
                  <span className="text-hud-gold font-mono font-bold uppercase tracking-wider flex-shrink-0">Doctrine:</span>
                  <span>{hero.playstyle}</span>
                </div>
              </div>

              {/* Row 4: Power Spikes Roadmap Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-hud-panelAlt border border-white/[0.08] rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-mono font-bold text-hud-gold uppercase tracking-wider block">Early Spike (0-12m)</span>
                  <span className="text-[11px] text-slate-300 truncate block font-sans">{hero.powerSpikes.early}</span>
                </div>
                <div className="bg-hud-panelAlt border border-white/[0.08] rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-mono font-bold text-hud-cyan uppercase tracking-wider block">Mid Spike (12-25m)</span>
                  <span className="text-[11px] text-slate-300 truncate block font-sans">{hero.powerSpikes.mid}</span>
                </div>
                <div className="bg-hud-panelAlt border border-white/[0.08] rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-mono font-bold text-hud-gold uppercase tracking-wider block">Late Spike (25m+)</span>
                  <span className="text-[11px] text-slate-300 truncate block font-sans">{hero.powerSpikes.late}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Mobile Showcase Header (< md) */}
          <div className="relative z-10 flex flex-col md:hidden space-y-3">
            
            {/* Mobile Top Controls Bar */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  SoundEngine.playHover();
                  onClose();
                }}
                className="px-3 py-2 min-h-[44px] rounded-lg bg-hud-surface border border-white/[0.14] text-slate-200 hover:text-white flex items-center gap-1.5 active:scale-[0.98] focus-hud touch-target"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Back</span>
              </button>

              <div className="flex items-center gap-2">
                {onOpenPip && (
                  <button
                    onClick={() => {
                      SoundEngine.playPick();
                      onOpenPip(hero);
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-lg bg-hud-surface hover:bg-hud-surfaceAlt border border-white/[0.14] text-hud-cyan flex items-center justify-center active:scale-[0.98] focus-hud touch-target"
                    title="Open in Picture-in-Picture Mini HUD"
                  >
                    <PictureInPicture className="w-4 h-4 text-hud-cyan" />
                  </button>
                )}

                <button
                  onClick={() => {
                    onToggleFavorite(hero.id);
                    SoundEngine.playHover();
                  }}
                  className={`p-2 min-h-[44px] min-w-[44px] rounded-lg border flex items-center justify-center active:scale-[0.98] focus-hud touch-target ${
                    isFavorite
                      ? 'bg-hud-gold/15 border-hud-gold/60 text-hud-gold'
                      : 'bg-hud-surface border-white/[0.14] text-slate-400 hover:text-white'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-hud-gold text-hud-gold' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile Hero Identity Row: Compact Portrait + Essential Stats */}
            <div className="flex items-center gap-3.5 pt-1">
              {/* Compact 80x96px Hero Portrait with Official Render */}
              <div className={`relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border ${
                hero.attribute === 'str' ? 'border-red-500/40' :
                hero.attribute === 'agi' ? 'border-emerald-500/40' :
                hero.attribute === 'int' ? 'border-cyan-500/40' :
                'border-purple-500/40'
              } flex-shrink-0 bg-[#07090e] shadow-md`}>
                <img
                  src={getHeroFullBodyRenderUrl(hero.avatarUrl)}
                  alt={hero.name}
                  decoding="async"
                  className="w-full h-full object-contain object-top pt-1 drop-shadow"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== hero.avatarUrl) {
                      target.src = hero.avatarUrl;
                      target.className = "w-full h-full object-cover object-top";
                    }
                  }}
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-[8px] font-mono font-bold uppercase tracking-wider text-white">
                  {hero.attribute}
                </div>
              </div>

              {/* Title & Quick Badges */}
              <div className="flex-1 min-w-0 space-y-1">
                <h1 className="font-display font-bold text-2xl text-white truncate">
                  {hero.name}
                </h1>
                <p className="text-xs text-slate-400 truncate italic">
                  "{hero.title}"
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="font-mono tabular-nums text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded text-[11px] border border-emerald-800/60">
                    {hero.winRate}% WR
                  </span>
                  <span className="text-slate-300 font-mono font-semibold bg-hud-surface px-2 py-0.5 rounded text-[11px] border border-white/[0.08] uppercase">
                    {hero.attackType}
                  </span>
                  {metaEntry && (
                    <span className="font-mono text-hud-gold font-bold bg-hud-gold/10 px-2 py-0.5 rounded text-[11px] border border-hud-gold/40">
                      Tier {metaEntry.tier}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Collapsible Doctrine & Power Spikes Drawer Toggle */}
            <div className="pt-1">
              <button
                onClick={() => {
                  SoundEngine.playHover();
                  setIsDoctrineExpanded(prev => !prev);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-hud-surface border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors active:scale-[0.99] focus-hud"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-hud-gold font-mono font-bold uppercase tracking-wider">Tactical Summary & Spikes</span>
                  <span className="text-[11px] text-slate-400 font-mono">({isDoctrineExpanded ? 'Hide' : 'Expand'})</span>
                </div>
                {isDoctrineExpanded ? (
                  <ChevronUp className="w-4 h-4 text-hud-gold" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isDoctrineExpanded && (
                <div className="mt-2 space-y-2 animate-fadeIn">
                  <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-3 space-y-1.5 text-xs">
                    <p className="text-slate-300 font-sans leading-relaxed">{hero.summary}</p>
                    <div className="text-[11px] text-slate-400 pt-1.5 border-t border-white/[0.06]">
                      <strong className="text-hud-gold font-mono uppercase tracking-wider">Doctrine:</strong> {hero.playstyle}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                    <div className="bg-hud-panelAlt border border-white/[0.08] rounded-lg p-2">
                      <span className="text-[11px] font-mono font-bold text-hud-gold block uppercase">Early (0-12m)</span>
                      <span className="text-[11px] text-slate-300">{hero.powerSpikes.early}</span>
                    </div>
                    <div className="bg-hud-panelAlt border border-white/[0.08] rounded-lg p-2">
                      <span className="text-[11px] font-mono font-bold text-hud-cyan block uppercase">Mid (12-25m)</span>
                      <span className="text-[11px] text-slate-300">{hero.powerSpikes.mid}</span>
                    </div>
                    <div className="bg-hud-panelAlt border border-white/[0.08] rounded-lg p-2">
                      <span className="text-[11px] font-mono font-bold text-hud-gold block uppercase">Late (25m+)</span>
                      <span className="text-[11px] text-slate-300">{hero.powerSpikes.late}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Sticky Sub Navigation Tabs (Directly beneath header for fast switching) */}
        <div className="relative z-20 flex border-y border-white/[0.1] bg-hud-surface overflow-x-auto no-scrollbar px-2 sm:px-4 py-2 gap-1.5 flex-shrink-0 shadow-sm touch-pan-x">
          <button
            onClick={() => {
              setActiveTab('build');
              SoundEngine.playHover();
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] focus-hud touch-target ${
              activeTab === 'build'
                ? 'border border-hud-cyan/50 text-hud-cyan bg-hud-cyan/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Sword className="w-4 h-4" />
            <span>Item Progression</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('skills');
              SoundEngine.playHover();
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] focus-hud touch-target ${
              activeTab === 'skills'
                ? 'border border-hud-cyan/50 text-hud-cyan bg-hud-cyan/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Skills & Talents</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('matchups');
              SoundEngine.playHover();
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] focus-hud touch-target ${
              activeTab === 'matchups'
                ? 'border border-red-500/50 text-red-300 bg-red-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Counters & Matchups</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('strategy');
              SoundEngine.playHover();
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] focus-hud touch-target ${
              activeTab === 'strategy'
                ? 'border border-emerald-500/50 text-emerald-300 bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Strategy & Spikes</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notes');
              SoundEngine.playHover();
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap active:scale-[0.98] focus-hud touch-target ${
              activeTab === 'notes'
                ? 'border border-hud-gold/50 text-hud-gold bg-hud-gold/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Match Notes</span>
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain"
        >
          
          {/* TAB 1: ITEM PROGRESSION */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              
              {/* Starting Items */}
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-hud-gold inline-block" />
                    Starting Items (600 Gold Budget)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Laning Phase Sustain</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.build.starting.map((item, idx) => (
                    <div key={idx} className="bg-hud-surface/90 border border-white/[0.08] hover:border-white/[0.2] rounded-lg p-2.5 flex items-start gap-3 transition-colors shadow-sm">
                      <img
                        src={getItemImageUrl(item.id)}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-8 rounded object-contain border border-white/[0.1] flex-shrink-0 bg-black/60 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                          <span className="text-xs font-mono font-bold tabular-nums text-hud-gold flex items-center gap-0.5"><Coins className="w-3 h-3" />{item.cost}g</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early Game */}
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-cyan uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-hud-cyan inline-block" />
                    Early Game (Minute 0 – 12)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Boots, Wand & Core Components</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.build.early.map((item, idx) => (
                    <div key={idx} className="bg-hud-surface/90 border border-white/[0.08] hover:border-white/[0.2] rounded-lg p-2.5 flex items-start gap-3 transition-colors shadow-sm">
                      <img
                        src={getItemImageUrl(item.id)}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-8 rounded object-contain border border-white/[0.1] flex-shrink-0 bg-black/60 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                          <span className="text-xs font-mono font-bold tabular-nums text-hud-gold flex items-center gap-0.5"><Coins className="w-3 h-3" />{item.cost}g</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Items */}
              <div className="bg-hud-panel border border-hud-gold/40 rounded-xl p-4 sm:p-5 shadow-md relative">
                <div className="flex items-center justify-between mb-3 border-b border-hud-gold/25 pb-2">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-hud-gold" />
                    Core Build (Primary Power Spike)
                  </h3>
                  <span className="text-[11px] font-mono text-hud-gold/90 font-semibold">Essential Win-Condition Items</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.build.core.map((item, idx) => (
                    <div key={idx} className="bg-hud-surface border border-hud-gold/30 hover:border-hud-gold/60 rounded-lg p-2.5 flex items-start gap-3 transition-colors shadow-sm">
                      <img
                        src={getItemImageUrl(item.id)}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-9 rounded object-contain border border-hud-gold/30 flex-shrink-0 bg-black/60 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-200 truncate">{item.name}</span>
                          <span className="text-xs font-mono font-bold tabular-nums text-hud-gold flex items-center gap-0.5"><Coins className="w-3 h-3" />{item.cost}g</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug font-sans">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BRIEFLY DETAILED SECTION FOR COUNTERS & THREAT MATRIX */}
              <div className="bg-hud-panel border border-red-500/30 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/40 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <h3 className="font-mono font-bold text-xs sm:text-sm text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Brief Counter Guide & Matchup Threats</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('matchups');
                      SoundEngine.playHover();
                    }}
                    className="text-xs font-mono font-bold text-hud-cyan hover:text-white flex items-center gap-1 transition-colors self-start sm:self-center focus-hud"
                  >
                    <span>Inspect Full Matchups Tab</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  
                  {/* 1. Hard Hero Counters (Weak Against) */}
                  <div className="bg-hud-surface border border-red-900/40 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        Hard Hero Counters
                      </span>
                      <span className="text-[11px] font-mono text-red-400 font-bold uppercase">Threats</span>
                    </div>
                    <div className="space-y-2">
                      {hero.weakAgainst.slice(0, 3).map((w, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            SoundEngine.playPick();
                            onSelectOtherHero && onSelectOtherHero(w.heroId);
                          }}
                          className="group flex items-start gap-2.5 p-2 rounded-lg bg-hud-panel hover:bg-hud-panelAlt border border-white/[0.08] hover:border-red-500/60 transition-colors cursor-pointer focus-hud"
                          title={`Click to inspect ${w.heroName}`}
                        >
                          <img
                            src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${w.heroId}.png`}
                            alt={w.heroName}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded object-cover border border-red-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white group-hover:text-red-300 truncate">
                                {w.heroName}
                              </span>
                              <span className="text-[11px] font-mono text-red-400 font-bold uppercase">Danger</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {w.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Key Counter Items (What shuts them down) */}
                  <div className="bg-hud-surface border border-hud-gold/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-hud-gold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-hud-gold" />
                        Must-Buy Counter Items
                      </span>
                      <span className="text-[11px] font-mono text-hud-gold font-bold uppercase">Item Locks</span>
                    </div>
                    <div className="space-y-2">
                      {hero.counterStrategy.keyCounterItems.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-hud-panel border border-white/[0.08]"
                        >
                          <img
                            src={getItemImageUrl(item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-6 rounded object-contain border border-hud-gold/40 bg-black flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-amber-200 block truncate">
                              {item.name}
                            </span>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Favorable Matchups (Heroes this hero preys on) */}
                  <div className="bg-hud-surface border border-emerald-900/40 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Favored Matchups
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Preys On</span>
                    </div>
                    <div className="space-y-2">
                      {hero.strongAgainst.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            SoundEngine.playPick();
                            onSelectOtherHero && onSelectOtherHero(s.heroId);
                          }}
                          className="group flex items-start gap-2.5 p-2 rounded-lg bg-hud-panel hover:bg-hud-panelAlt border border-white/[0.08] hover:border-emerald-500/60 transition-colors cursor-pointer focus-hud"
                          title={`Click to inspect ${s.heroName}`}
                        >
                          <img
                            src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${s.heroId}.png`}
                            alt={s.heroName}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded object-cover border border-emerald-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white group-hover:text-emerald-300 truncate">
                                {s.heroName}
                              </span>
                              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Favored</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {s.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Tactical Vulnerability Windows */}
                <div className="p-3 bg-hud-surfaceAlt rounded-lg border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-300 block mb-0.5 uppercase tracking-wider text-[11px]">Laning Vulnerability:</span>
                    <p className="text-slate-400 font-sans leading-relaxed">{hero.counterStrategy.laningAdvice}</p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-300 block mb-0.5 uppercase tracking-wider text-[11px]">Teamfight Exploitation:</span>
                    <p className="text-slate-400 font-sans leading-relaxed">{hero.counterStrategy.teamfightAdvice}</p>
                  </div>
                </div>
              </div>

              {/* Situational Item Branches */}
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-cyan uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-hud-cyan" />
                    Situational & Counter Items (Adapt to Enemy Lineup)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Matchup Adaptations</span>
                </div>
                <div className="space-y-4">
                  {hero.build.situational.map((sit, idx) => (
                    <div key={idx} className="bg-hud-surface border border-white/[0.08] rounded-lg p-3">
                      <h4 className="text-xs font-mono font-bold text-hud-cyan uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-hud-cyan" />
                        {sit.category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {sit.items.map((item, i) => (
                          <div key={i} className="bg-hud-panel p-2.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-start gap-2.5 shadow-sm transition-colors">
                            <img
                              src={getItemImageUrl(item.id)}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-9 h-7 rounded object-contain border border-white/[0.1] flex-shrink-0 bg-black shadow-sm"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                                <span className="text-xs font-mono font-bold tabular-nums text-hud-gold flex items-center gap-0.5">{item.cost}g</span>
                              </div>
                              {item.reason && (
                                <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{item.reason}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Late Game & Neutral Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Late Game */}
                <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold uppercase tracking-wider mb-3 border-b border-white/[0.08] pb-2">
                    Late Game & Luxury
                  </h3>
                  <div className="space-y-2">
                    {hero.build.late.map((item, idx) => (
                      <div key={idx} className="bg-hud-surface p-2.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-between gap-2 shadow-sm transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getItemImageUrl(item.id)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-6 rounded object-contain border border-white/[0.1] flex-shrink-0 bg-black shadow-sm"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                            }}
                          />
                          <div className="truncate">
                            <div className="font-bold text-xs text-slate-200 truncate">{item.name}</div>
                            {item.reason && <p className="text-[11px] text-slate-400 truncate">{item.reason}</p>}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold tabular-nums text-hud-gold flex-shrink-0">{item.cost}g</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neutral Items */}
                <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-emerald-400 uppercase tracking-wider mb-3 border-b border-white/[0.08] pb-2">
                    Recommended Neutral Items (Tier 1-5)
                  </h3>
                  <div className="space-y-1.5">
                    {hero.build.neutrals.map((n, idx) => (
                      <div key={idx} className="bg-hud-surface p-2 rounded-lg border border-white/[0.06] flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-emerald-400 min-w-[55px] text-[11px] uppercase">Tier {n.tier}:</span>
                        <span className="text-slate-300 font-medium font-sans truncate">{n.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SKILLS & TALENTS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              
              {/* Skill Maxing Priority Roadmap */}
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-cyan uppercase tracking-wider mb-2">
                  Recommended Skill Leveling Order
                </h3>
                <div className="text-xs text-slate-400 mb-3 font-sans flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 touch-pan-x">
                  <span className="font-mono text-slate-300 flex-shrink-0 text-[11px] uppercase tracking-wider">Priority:</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {numberedSkillPriority.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 flex-shrink-0">
                        <span className="bg-hud-surface text-hud-cyan px-2 py-0.5 rounded border border-hud-cyan/30 text-[11px] font-mono flex items-center gap-1 shadow-sm whitespace-nowrap">
                          <span className="text-[9px] font-mono text-hud-cyan font-bold">#{idx + 1}</span>
                          <span className="font-bold text-hud-gold bg-black/60 px-1 rounded border border-hud-gold/30 text-[11px]">
                            Skill {s.skillNumber}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">({s.key})</span>
                          <span className="font-semibold text-slate-200">{s.name}</span>
                        </span>
                        {idx < numberedSkillPriority.length - 1 && (
                          <span className="text-slate-600 font-bold text-xs select-none">➔</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar py-1 touch-pan-x">
                  <div className="flex gap-1.5 min-w-max">
                    {hero.skillOrder.levelGuide.map((skill, index) => {
                      const skillNum = getSkillNumberFromKey(skill);
                      const isUlt = skill === 'R';
                      const isTalent = skill === 'Talent';
                      return (
                        <div
                          key={index}
                          className={`flex flex-col items-center justify-center min-w-[36px] h-11 px-1 rounded border text-xs font-mono font-bold transition-transform hover:scale-105 flex-shrink-0 ${
                            isUlt
                              ? 'bg-red-950/80 border-red-500/60 text-red-300 shadow-sm'
                              : isTalent
                              ? 'bg-hud-gold/15 border-hud-gold/60 text-hud-gold text-[11px] shadow-sm'
                              : 'bg-hud-surface border-white/[0.08] text-slate-200'
                          }`}
                          title={isTalent ? `Hero Level ${index + 1}: Talent Tree Node` : `Hero Level ${index + 1}: Skill ${skillNum} (${skill})`}
                        >
                          <span className="text-[8px] text-slate-400 font-mono leading-none">Lv {index + 1}</span>
                          {!isTalent ? (
                            <>
                              <span className="text-[11px] font-black text-white leading-tight mt-0.5">Skill {skillNum}</span>
                              <span className="text-[8px] text-hud-gold font-mono font-bold leading-none">({skill})</span>
                            </>
                          ) : (
                            <span className="text-[9px] font-bold text-hud-gold leading-tight mt-0.5">★ Talent</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hero Abilities Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hero.abilities.map((ab, idx) => (
                  <div key={idx} className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between space-y-2 shadow-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Skill Number Badge */}
                          <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center bg-hud-surface border border-white/[0.12] text-hud-gold font-mono shadow-sm flex-shrink-0">
                            <span className="text-[7px] text-slate-400 uppercase leading-none font-bold">SKILL</span>
                            <span className="text-xs font-black leading-none mt-0.5">{idx + 1}</span>
                          </div>

                          {/* Hotkey Key */}
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border ${
                            ab.isUltimate 
                              ? 'bg-red-950/90 text-red-300 border-red-500/70 shadow-sm' 
                              : 'bg-hud-surface text-hud-gold border-white/[0.12]'
                          }`}>
                            {ab.key}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-slate-100 truncate">{ab.name}</span>
                              <span className="text-[9px] text-hud-gold font-mono font-semibold bg-hud-gold/10 px-1.5 py-0.2 rounded border border-hud-gold/30">
                                Skill #{idx + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                        {ab.isUltimate && (
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800 flex-shrink-0">
                            Ultimate
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
                        {ab.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Glowing Talent Tree */}
              <div className="bg-hud-panel border border-white/[0.12] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold tracking-wider uppercase">
                    Talent Tree Guide
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Highlighted nodes indicate recommended meta talent choices.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
                  {hero.talents.map((t) => (
                    <div key={t.level} className="flex items-center gap-1.5 sm:gap-3">
                      
                      {/* Left Option */}
                      <div className={`flex-1 p-2 sm:p-2.5 rounded-lg border text-right text-[11px] sm:text-xs transition-colors leading-snug ${
                        t.recommended === 'left'
                          ? 'bg-hud-gold/15 border-hud-gold/60 text-hud-gold font-bold shadow-sm'
                          : 'bg-hud-surface border-white/[0.08] text-slate-400 font-medium'
                      }`}>
                        {t.left}
                      </div>

                      {/* Level Circle Center */}
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-hud-surface border border-white/[0.2] flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs tabular-nums text-hud-gold shadow flex-shrink-0">
                        {t.level}
                      </div>

                      {/* Right Option */}
                      <div className={`flex-1 p-2 sm:p-2.5 rounded-lg border text-left text-[11px] sm:text-xs transition-colors leading-snug ${
                        t.recommended === 'right'
                          ? 'bg-hud-gold/15 border-hud-gold/60 text-hud-gold font-bold shadow-sm'
                          : 'bg-hud-surface border-white/[0.08] text-slate-400 font-medium'
                      }`}>
                        {t.right}
                      </div>

                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.08] text-center text-xs text-slate-400 space-y-1 font-sans">
                  {hero.talents.map((t) => t.reason ? (
                    <p key={t.level} className="text-[11px] text-slate-300">
                      <strong className="text-hud-gold font-mono">Lvl {t.level}:</strong> {t.reason}
                    </p>
                  ) : null)}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: COUNTERS & MATCHUPS */}
          {activeTab === 'matchups' && (
            <div className="space-y-6">
              
              {/* Strong Against */}
              <div className="bg-hud-panel border border-emerald-500/30 rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Strong Against (Favorable Matchups)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hero.strongAgainst.map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectOtherHero && onSelectOtherHero(m.heroId);
                      }}
                      className="group bg-hud-surface hover:bg-hud-surfaceAlt border border-emerald-500/30 hover:border-emerald-500/70 rounded-lg p-3 cursor-pointer transition-colors shadow-sm flex items-start gap-3 focus-hud"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${m.heroId}.png`}
                        alt={m.heroName}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded object-cover border border-emerald-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-emerald-300 mb-1 flex items-center justify-between">
                          <span className="group-hover:text-emerald-200 transition-colors">{m.heroName}</span>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Favored</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {m.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Against */}
              <div className="bg-hud-panel border border-red-500/30 rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Weak Against / Hard Counters (Threats to Avoid)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hero.weakAgainst.map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectOtherHero && onSelectOtherHero(m.heroId);
                      }}
                      className="group bg-hud-surface hover:bg-hud-surfaceAlt border border-red-500/30 hover:border-red-500/70 rounded-lg p-3 cursor-pointer transition-colors shadow-sm flex items-start gap-3 focus-hud"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${m.heroId}.png`}
                        alt={m.heroName}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded object-cover border border-red-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-red-300 mb-1 flex items-center justify-between">
                          <span className="group-hover:text-red-200 transition-colors">{m.heroName}</span>
                          <span className="text-[11px] font-mono text-red-400 font-bold uppercase">Counters You</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {m.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Lane & Team Synergies */}
              <div className="bg-hud-panel border border-hud-cyan/30 rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-cyan mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-hud-cyan" />
                  Best Lane Partners & Team Synergies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hero.synergies.map((s, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectOtherHero && onSelectOtherHero(s.heroId);
                      }}
                      className="group bg-hud-surface hover:bg-hud-surfaceAlt border border-hud-cyan/30 hover:border-hud-cyan/70 rounded-lg p-3 cursor-pointer transition-colors shadow-sm flex items-start gap-3 focus-hud"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${s.heroId}.png`}
                        alt={s.heroName}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded object-cover border border-hud-cyan/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-hud-cyan mb-1">
                          {s.heroName}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {s.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enemy Counter Strategy & Items */}
              <div className="bg-hud-panel border border-white/[0.1] rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-hud-gold" />
                  Enemy Items That Counter You (Watch Out For)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.counterStrategy.keyCounterItems.map((c, idx) => (
                    <div key={idx} className="bg-hud-surface p-3 rounded-lg border border-white/[0.08] shadow-sm flex items-start gap-3">
                      <img
                        src={getItemImageUrl(c.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                        alt={c.name}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-8 rounded object-contain border border-white/[0.1] bg-black flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-amber-200 mb-1">{c.name}</div>
                        <p className="text-[11px] text-slate-400 leading-snug font-sans">{c.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: STRATEGY & POWER SPIKES */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              
              {/* Playstyle Summary */}
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-hud-gold" />
                  Hero Playstyle & Core Mechanics
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {hero.playstyle}
                </p>
              </div>

              {/* Power Spikes Timeline */}
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-gold mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-hud-gold" />
                  Power Spikes Timeline
                </h3>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-hud-surface border-l-2 border-l-hud-gold border border-white/[0.06] shadow-sm">
                    <span className="font-mono font-bold text-xs text-hud-gold uppercase tracking-wider">Early Game Spike:</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{hero.powerSpikes.early}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-hud-surface border-l-2 border-l-hud-cyan border border-white/[0.06] shadow-sm">
                    <span className="font-mono font-bold text-xs text-hud-cyan uppercase tracking-wider">Mid Game Spike:</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{hero.powerSpikes.mid}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-hud-surface border-l-2 border-l-amber-500 border border-white/[0.06] shadow-sm">
                    <span className="font-mono font-bold text-xs text-hud-gold uppercase tracking-wider">Late Game Spike:</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{hero.powerSpikes.late}</p>
                  </div>
                </div>
              </div>

              {/* Laning & Teamfighting Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                  <h4 className="font-mono font-bold text-xs sm:text-sm text-emerald-400 mb-2 uppercase tracking-wider">
                    Laning Phase Tactics
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {hero.counterStrategy.laningAdvice}
                  </p>
                </div>

                <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                  <h4 className="font-mono font-bold text-xs sm:text-sm text-rose-400 mb-2 uppercase tracking-wider">
                    Teamfighting & Objective Priorities
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {hero.counterStrategy.teamfightAdvice}
                  </p>
                </div>
              </div>

              {/* Weaknesses to Watch Out For */}
              <div className="bg-hud-panel border border-red-900/30 rounded-xl p-4 sm:p-5 shadow-sm">
                <h4 className="font-mono font-bold text-xs text-red-400 mb-2 uppercase tracking-wider">
                  Hero Vulnerabilities:
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-sans">
                  {hero.counterStrategy.weaknessSummary.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {/* TAB 5: MY NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono font-bold text-xs sm:text-sm text-hud-cyan uppercase tracking-wider">
                    Personal Matchup & Build Notes
                  </h3>
                  {noteSaved && (
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3 font-sans">
                  Jot down your custom timings, specific enemy matchups, player notes, or experimental item builds. Saved locally in your browser.
                </p>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder={`Write your personal notes for ${hero.name}... (e.g. Always rush BKB before min 22 vs Lion, avoid picking into Slardar)`}
                  rows={8}
                  className="w-full bg-hud-surface border border-white/[0.12] focus:border-hud-cyan focus:ring-1 focus:ring-hud-cyan rounded-lg p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-400 font-sans focus-hud transition-colors"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 min-h-[44px] rounded-lg bg-hud-cyan hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-sm active:scale-[0.98] focus-hud touch-target"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
