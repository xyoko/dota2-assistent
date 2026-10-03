import React, { useState } from 'react';
import { SoundEngine } from '../services/soundFx';
import { 
  Shield, 
  Swords, 
  Crosshair, 
  TrendingUp, 
  BookOpen, 
  Search,
  Sparkles,
  ArrowRightLeft,
  Volume2,
  VolumeX,
  FlaskConical,
  Newspaper,
  PictureInPicture,
  BrainCircuit
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

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => handleNavClick('heroes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'heroes'
                  ? 'bg-dota-gold/20 text-dota-gold border border-dota-gold/60 shadow-dota-glow font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Hero Arsenal</span>
            </button>

            <button
              onClick={() => handleNavClick('predictive')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                activeTab === 'predictive'
                  ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 text-amber-300 border border-amber-500/70 shadow-dota-glow font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              <span>5v5 Predictive</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-gradient-to-r from-indigo-500/50 to-purple-500/50 text-indigo-200 border border-indigo-400/50 shadow-sm animate-pulse">
                Oracle
              </span>
            </button>

            <button
              onClick={() => handleNavClick('draft')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                activeTab === 'draft'
                  ? 'bg-dota-red/25 text-red-300 border border-dota-red/60 shadow-dota-crimson font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>Draft Studio</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>

            <button
              onClick={() => handleNavClick('arena')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'arena'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-dota-crimson font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Swords className="w-4 h-4 text-rose-400" />
              <span>1v1 Arena</span>
            </button>

            <button
              onClick={() => handleNavClick('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'sandbox'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-dota-glow font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Build Lab</span>
            </button>

            <button
              onClick={() => handleNavClick('interactions')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'interactions'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-dota-glow font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              <span>Hero ↔ Item</span>
            </button>

            <button
              onClick={() => handleNavClick('counters')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'counters'
                  ? 'bg-blue-500/20 text-dota-int border border-dota-int/60 shadow-dota-mana font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Item Matrix</span>
            </button>

            <button
              onClick={() => handleNavClick('meta')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'meta'
                  ? 'bg-green-500/20 text-dota-agi border border-dota-agi/60 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Season Meta</span>
            </button>

            <button
              onClick={() => handleNavClick('patches')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap relative ${
                activeTab === 'patches'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <span>Patch & Fixes</span>
              <span className="text-[9px] font-mono px-1 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-500/40">
                7.37d
              </span>
            </button>

            <button
              onClick={() => handleNavClick('notes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-purple-500/20 text-dota-uni border border-dota-uni/60 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Notes</span>
            </button>

            {/* Picture-in-Picture Mini HUD Trigger Button */}
            <button
              onClick={() => {
                SoundEngine.playPick();
                onOpenPip();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-dota-gold/15 hover:bg-dota-gold/25 border border-dota-gold/50 text-dota-gold shadow-dota-glow transition-all whitespace-nowrap group"
              title="Open Picture-in-Picture Mini HUD (Keyboard shortcut: Alt+P)"
            >
              <PictureInPicture className="w-4 h-4 text-dota-gold" />
              <span className="hidden xl:inline">PiP HUD</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-black/60 rounded border border-dota-gold/40 text-amber-300">
                Alt+P
              </kbd>
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-dota-glow'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </nav>
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
