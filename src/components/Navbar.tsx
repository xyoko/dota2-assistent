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
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
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
    <header className="sticky top-0 z-40 bg-dota-panel/95 backdrop-blur-md border-b-2 border-dota-border shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div 
            onClick={() => handleNavClick('heroes')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-dota-red via-red-950 to-slate-900 border-2 border-dota-gold/60 shadow-dota-crimson group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-dota-gold drop-shadow-md" />
              <div className="absolute -inset-0.5 bg-dota-gold/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-dota tracking-wider font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow">
                  AEGIS FORGE
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-dota-red/30 border border-dota-red/60 text-red-300">
                  7.37d
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide hidden sm:block">
                Dota 2 Tactical Build & Counter Assistant
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative w-60 xl:w-72 mx-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hero, item, counter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dota-bg/90 border border-dota-border rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold/70 focus:ring-1 focus:ring-dota-gold/40 transition-all shadow-inner"
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
            {/* Picture-in-Picture Mini HUD Trigger Button — Only available in Hero view */}
            {activeTab === 'heroes' && (
              <button
                onClick={() => {
                  SoundEngine.playPick();
                  onOpenPip();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-dota-gold/15 hover:bg-dota-gold/25 border border-dota-gold/50 text-dota-gold shadow-dota-glow transition-all whitespace-nowrap group"
                title="Open Picture-in-Picture Mini HUD (Keyboard shortcut: Alt+P)"
              >
                <PictureInPicture className="w-4 h-4 text-dota-gold" />
                <span className="hidden sm:inline font-mono">PiP HUD</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-black/60 rounded border border-dota-gold/40 text-amber-300">
                  Alt+P
                </kbd>
              </button>
            )}

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-dota-glow'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hero, item, counter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-dota-bg/90 border border-dota-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold/70"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
