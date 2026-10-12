import React, { useState } from 'react';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  Shield, 
  Search,
  Volume2,
  VolumeX,
  PictureInPicture
} from 'lucide-react';

export type ActiveTab = 'home' | 'heroes' | 'predictive' | 'draft' | 'arena' | 'sandbox' | 'interactions' | 'counters' | 'meta' | 'patches' | 'notes';

interface NavbarProps {
  activeTab?: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPip: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenPip
}) => {
  const [localTab, setLocalTab] = useState<ActiveTab | undefined>(activeTab);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    setLocalTab(activeTab);
  }, [activeTab]);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => SoundEngine.isEnabled());

  const handleToggleSound = () => {
    const newState = SoundEngine.toggleSound();
    setSoundEnabled(newState);
  };

  const handleNavClick = (tab: ActiveTab) => {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    startTransition(() => {
      setSearchQuery(val);
    });
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    startTransition(() => {
      setSearchQuery('');
    });
  };

  const currentTab = localTab ?? activeTab;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title — Static Layout with Snap Glow on Hover */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-all duration-75">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-75" />
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
          <nav className="hidden md:flex items-center gap-1 xl:gap-2 mx-3">
            {[
              { id: 'home', label: 'Command' },
              { id: 'heroes', label: 'Arsenal' },
              { id: 'predictive', label: 'Oracle 5v5' },
              { id: 'draft', label: 'Draft' },
              { id: 'arena', label: 'Arena' },
              { id: 'meta', label: 'Meta' }
            ].map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.id as ActiveTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-grotesk font-semibold whitespace-nowrap transition-all duration-75 ${
                    isActive
                      ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] bg-slate-900 border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative w-56 xl:w-64 mx-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hero, item, counter..."
              value={localSearch}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all duration-75 shadow-inner"
            />
            {localSearch && (
              <button 
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-75"
              >
                ✕
              </button>
            )}
          </div>

          {/* Active View Quick Indicator & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Picture-in-Picture Mini HUD Trigger Button */}
            <button
              onClick={() => {
                setTimeout(() => SoundEngine.playPick(), 0);
                onOpenPip();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-grotesk font-semibold tracking-wide bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 whitespace-nowrap group transition-all duration-75"
              title="Open Picture-in-Picture Mini HUD (Keyboard shortcut: Alt+P)"
            >
              <PictureInPicture className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] transition-all duration-75">PiP HUD</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-950 rounded border border-slate-800 text-slate-500 group-hover:text-slate-300 transition-all duration-75">
                Alt+P
              </kbd>
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white transition-colors duration-75"
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

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hero, item, counter..."
              value={localSearch}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all duration-75"
            />
          </div>
        </div>

      </div>
    </header>
  );
});
