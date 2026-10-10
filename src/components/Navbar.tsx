import React, { useState } from 'react';
import { SoundEngine } from '../services/soundFx';
import { 
  Shield, 
  Search,
  Volume2,
  VolumeX,
  PictureInPicture
} from 'lucide-react';

export type ActiveTab = 'heroes' | 'predictive' | 'draft' | 'arena' | 'sandbox' | 'interactions' | 'counters' | 'meta' | 'patches' | 'notes';

interface NavbarProps {
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenPip
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => SoundEngine.isEnabled());

  const handleToggleSound = () => {
    const newState = SoundEngine.toggleSound();
    setSoundEnabled(newState);
  };

  const handleNavClick = (tab: ActiveTab) => {
    SoundEngine.playHover();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-purple-500/20 shadow-lg shadow-purple-900/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div 
            onClick={() => handleNavClick('heroes')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0 btn-fade"
          >
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all">
              <Shield className="w-6 h-6 text-white drop-shadow-md" />
              <div className="absolute -inset-0.5 bg-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-grotesk tracking-tight font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300">
                  AEGIS FORGE
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase">
                  7.37d
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide hidden sm:block">
                Dota 2 <span className="font-serif italic font-normal text-purple-300 text-[13px]">tactical</span> assistant
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative w-60 xl:w-72 mx-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
            <input
              type="text"
              placeholder="Search hero, item, counter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Active View Quick Indicator & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Picture-in-Picture Mini HUD Trigger Button — Available globally */}
            <button
              onClick={() => {
                SoundEngine.playPick();
                onOpenPip();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-grotesk font-bold tracking-wide bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all whitespace-nowrap group btn-fade"
              title="Open Picture-in-Picture Mini HUD (Keyboard shortcut: Alt+P)"
            >
              <PictureInPicture className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">PiP HUD</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-950/80 rounded border border-purple-500/40 text-purple-300">
                Alt+P
              </kbd>
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-all btn-fade ${
                soundEnabled
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
            <input
              type="text"
              placeholder="Search hero, item, counter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-purple-500/30 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
