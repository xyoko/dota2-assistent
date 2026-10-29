import React, { useState, useRef, useEffect } from 'react';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  Compass,
  Crown,
  BrainCircuit,
  Swords,
  Flame,
  TrendingUp,
  FlaskConical,
  GitFork,
  Target,
  FileCode2,
  Bookmark,
  Search, 
  Volume2, 
  VolumeX, 
  PictureInPicture,
  ChevronDown,
  Layers
} from 'lucide-react';

export type ActiveTab = 'home' | 'heroes' | 'predictive' | 'draft' | 'arena' | 'sandbox' | 'interactions' | 'counters' | 'meta' | 'patches' | 'notes';

interface NavbarProps {
  activeTab?: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPip: () => void;
  onOpenCommandPalette?: () => void;
}

const PRIMARY_TABS: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: 'Command', icon: Compass },
  { id: 'heroes', label: 'Arsenal', icon: Crown },
  { id: 'predictive', label: 'Oracle 5v5', icon: BrainCircuit },
  { id: 'draft', label: 'Draft', icon: Swords },
  { id: 'arena', label: 'Arena', icon: Flame },
  { id: 'meta', label: 'Meta', icon: TrendingUp }
];

const SECONDARY_TABS: { id: ActiveTab; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'sandbox', label: 'Build Sandbox', desc: 'Item builds & DPS testing', icon: FlaskConical },
  { id: 'interactions', label: 'Item Interactions', desc: 'Hero synergies & combos', icon: GitFork },
  { id: 'counters', label: 'Threat Counters', desc: 'Item-based hero counters', icon: Target },
  { id: 'patches', label: 'Patch 7.37d', desc: 'Latest balance changelog', icon: FileCode2 },
  { id: 'notes', label: 'Tactical Notes', desc: 'Custom drafts & strategy notes', icon: Bookmark }
];

export const Navbar: React.FC<NavbarProps> = React.memo(({
  activeTab,
  setActiveTab,
  onOpenPip,
  onOpenCommandPalette
}) => {
  const [localTab, setLocalTab] = useState<ActiveTab | undefined>(activeTab);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    setLocalTab(activeTab);
  }, [activeTab]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => SoundEngine.isEnabled());

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const newState = SoundEngine.toggleSound();
    setSoundEnabled(newState);
  };

  const handleNavClick = (tab: ActiveTab) => {
    setIsMoreOpen(false);
    setLocalTab(tab);
    setTimeout(() => {
      SoundEngine.playHover();
    }, 0);
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const currentTab = localTab ?? activeTab;
  const activeSecondaryTab = SECONDARY_TABS.find(t => t.id === currentTab);

  return (
    <header className="sticky top-0 z-40 bg-hud-bg/98 border-b border-white/[0.08] shadow-hud-sm overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-hud-surface border border-white/[0.08] group-hover:border-hud-cyan/50 transition-colors">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-hud-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display tracking-tight font-bold text-base sm:text-xl text-slate-100 group-hover:text-hud-cyan transition-colors uppercase">
                  Aegis Forge
                </span>
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-hud-surface border border-white/[0.08] text-hud-gold uppercase">
                  7.37d
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide hidden sm:block">
                Tactical War-Room Analytics
              </p>
            </div>
          </div>

          {/* Quick Responsive Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 mx-1 xl:mx-2 shrink min-w-0">
            {PRIMARY_TABS.map((tab) => {
              const isActive = currentTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.id)}
                  className={`min-h-[44px] sm:min-h-0 touch-target px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 focus-hud shrink-0 ${
                    isActive
                      ? 'text-slate-100 bg-hud-surface border border-white/[0.12] shadow-hud-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 opacity-80" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Secondary Modules 'More' Dropdown */}
            <div className="relative shrink-0" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(prev => !prev)}
                className={`min-h-[44px] sm:min-h-0 touch-target px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-colors focus-hud shrink-0 ${
                  activeSecondaryTab
                    ? 'text-hud-gold bg-hud-surface border border-hud-gold/40'
                    : isMoreOpen
                    ? 'text-slate-100 bg-hud-surface border border-white/[0.12]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
                title="Explore additional tactical modules"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{activeSecondaryTab ? activeSecondaryTab.label : 'Tools'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-hud-panel border border-white/[0.12] shadow-hud-lg p-1.5 z-50 animate-fadeIn">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-white/[0.06] mb-1">
                    Tactical Modules
                  </div>
                  {SECONDARY_TABS.map((tab) => {
                    const isTabActive = currentTab === tab.id;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNavClick(tab.id)}
                        className={`w-full text-left px-2.5 py-2 min-h-[44px] rounded-lg text-xs transition-colors flex items-center gap-2.5 focus-hud ${
                          isTabActive
                            ? 'bg-hud-surface border border-hud-cyan/40 text-hud-cyan'
                            : 'hover:bg-white/[0.04] text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="p-1 rounded-md bg-hud-surface border border-white/[0.08] shrink-0">
                          <TabIcon className="w-3.5 h-3.5 text-hud-cyan" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-200">{tab.label}</span>
                          <span className="text-[10px] text-slate-400 font-sans truncate">{tab.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Spotlight Search Trigger */}
          <div className="hidden xl:flex items-center gap-1.5 mx-1 xl:mx-2 shrink min-w-0">
            <button
              onClick={() => {
                SoundEngine.playHover();
                onOpenCommandPalette?.();
              }}
              className="flex items-center justify-between gap-2 px-2.5 xl:px-3 py-2 rounded-lg bg-hud-surface hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-xs text-slate-400 hover:text-slate-200 transition-colors w-40 xl:w-48 2xl:w-60 group cursor-pointer focus-hud min-h-[40px] shrink"
              title="Quick Search & Navigation (Shortcut: Cmd+K)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-hud-cyan transition-colors shrink-0" />
                <span className="truncate text-slate-400 group-hover:text-slate-300 font-sans">Search or jump to...</span>
              </div>
              <div className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-hud-bg rounded-sm border border-white/[0.08] text-slate-400 group-hover:text-hud-cyan">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Active View Quick Indicator & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Picture-in-Picture Mini HUD Trigger Button */}
            <button
              onClick={() => {
                setTimeout(() => SoundEngine.playPick(), 0);
                onOpenPip();
              }}
              className="min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold tracking-wider bg-hud-surface hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-slate-100 whitespace-nowrap transition-colors active:scale-[0.98] focus-hud"
              title="Open Picture-in-Picture Mini HUD (Keyboard shortcut: Alt+P)"
            >
              <PictureInPicture className="w-4 h-4 text-hud-cyan" />
              <span className="hidden sm:inline">PiP HUD</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-hud-bg rounded border border-white/[0.08] text-slate-400">
                Alt+P
              </kbd>
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-target p-2.5 rounded-lg border border-white/[0.08] bg-hud-surface hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors active:scale-[0.96] focus-hud flex items-center justify-center"
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Spotlight Trigger */}
        <div className="lg:hidden pb-2.5 pt-1">
          <button
            onClick={() => onOpenCommandPalette?.()}
            className="w-full min-h-[44px] touch-target flex items-center justify-between px-3 py-2 bg-hud-surface border border-white/[0.08] rounded-lg text-xs text-slate-400 active:scale-[0.99] transition-colors focus-hud"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Search modules, 124+ heroes...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-hud-bg rounded border border-white/[0.08] text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Mobile Navigation Strip (All 11 tactical modules horizontally swipeable) */}
        <div className="md:hidden pb-2.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar text-xs touch-pan-x">
          {[...PRIMARY_TABS, ...SECONDARY_TABS].map((tab) => {
            const isActive = currentTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`min-h-[44px] px-3 py-2 touch-target rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 active:scale-[0.95] focus-hud ${
                  isActive
                    ? 'text-hud-cyan bg-hud-surface border border-hud-cyan/40 shadow-hud-sm'
                    : 'text-slate-400 hover:text-white bg-hud-panel border border-white/[0.06]'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
});
