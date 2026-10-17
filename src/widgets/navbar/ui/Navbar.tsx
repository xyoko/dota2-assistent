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
    // 1. Immediate visual response in navbar (0ms latency)
    setLocalTab(tab);
    // 2. Play sound asynchronously to avoid main thread AudioContext block
    setTimeout(() => {
      SoundEngine.playHover();
    }, 0);
    // 3. Transition parent view concurrently
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const currentTab = localTab ?? activeTab;
  const activeSecondaryTab = SECONDARY_TABS.find(t => t.id === currentTab);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title — Static Layout with Snap Glow on Hover */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-all duration-75">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-75" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-grotesk tracking-tight font-black text-xl sm:text-2xl text-slate-200 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)] transition-all duration-75">
                  AEGIS FORGE
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all duration-75 uppercase">
                  7.37d
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide hidden sm:block group-hover:text-slate-200 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] transition-all duration-75">
                Dota 2 <span className="font-serif italic font-normal text-slate-400 group-hover:text-slate-200">tactical</span> assistant
              </p>
            </div>
          </div>

          {/* Quick Responsive Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 mx-2">
            {PRIMARY_TABS.map((tab) => {
              const isActive = currentTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-grotesk font-semibold whitespace-nowrap transition-all duration-75 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] bg-slate-900 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 opacity-80" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Secondary Modules 'More' Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(prev => !prev)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-grotesk font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-75 ${
                  activeSecondaryTab
                    ? 'text-amber-300 bg-amber-950/40 border border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : isMoreOpen
                    ? 'text-white bg-slate-900 border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                }`}
                title="Explore additional tactical modules"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{activeSecondaryTab ? activeSecondaryTab.label : 'Tools'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-950/98 border border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn backdrop-blur-xl">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono border-b border-slate-900 mb-1">
                    Tactical Modules
                  </div>
                  {SECONDARY_TABS.map((tab) => {
                    const isTabActive = currentTab === tab.id;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNavClick(tab.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                          isTabActive
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                            : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="p-1 rounded-md bg-slate-900 border border-white/5 flex-shrink-0">
                          <TabIcon className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold">{tab.label}</span>
                          <span className="text-[10px] text-slate-500 font-sans truncate">{tab.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Spotlight Search Trigger (Emil Kowalski style Cmd+K) */}
          <div className="hidden lg:flex items-center gap-1.5 mx-2">
            <button
              onClick={() => {
                SoundEngine.playHover();
                onOpenCommandPalette?.();
              }}
              className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.08] hover:border-white/[0.15] text-xs text-slate-400 hover:text-slate-200 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] active:scale-[0.98] w-52 xl:w-60 group cursor-pointer"
              title="Quick Search & Navigation (Shortcut: Cmd+K)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                <span className="truncate text-slate-500 group-hover:text-slate-300 font-sans">Search or jump to...</span>
              </div>
              <div className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-950 rounded border border-slate-800 text-slate-400 group-hover:text-amber-300">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Active View Quick Indicator & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Picture-in-Picture Mini HUD Trigger Button */}
            <button
              onClick={() => {
                setTimeout(() => SoundEngine.playPick(), 0);
                onOpenPip();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-grotesk font-semibold tracking-wide bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 whitespace-nowrap group transition-all duration-75 active:scale-[0.98]"
              title="Open Picture-in-Picture Mini HUD (Keyboard shortcut: Alt+P)"
            >
              <PictureInPicture className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
              <span className="hidden sm:inline group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] transition-all duration-75">PiP HUD</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-950 rounded border border-slate-800 text-slate-500 group-hover:text-slate-300 transition-all duration-75">
                Alt+P
              </kbd>
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white transition-colors duration-75 active:scale-[0.96]"
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Spotlight Trigger */}
        <div className="lg:hidden pb-2 pt-1">
          <button
            onClick={() => onOpenCommandPalette?.()}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-white/[0.08] rounded-xl text-xs text-slate-400 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Search modules, 124+ heroes...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-950 rounded border border-slate-800 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Mobile Navigation Strip (All 11 tactical modules horizontally swipeable) */}
        <div className="md:hidden pb-2.5 overflow-x-auto flex items-center gap-1.5 custom-scrollbar text-xs">
          {[...PRIMARY_TABS, ...SECONDARY_TABS].map((tab) => {
            const isActive = currentTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-grotesk font-semibold whitespace-nowrap transition-all duration-75 flex items-center gap-1.5 flex-shrink-0 ${
                  isActive
                    ? 'text-amber-200 bg-amber-950/40 border border-amber-600/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                <TabIcon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
});
