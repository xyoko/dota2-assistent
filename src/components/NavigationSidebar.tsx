'use client';

import React, { useEffect, useCallback } from 'react';
import { ActiveTab } from './Navbar';
import { LineSidebar } from './LineSidebar';
import { SoundEngine } from '../services/soundFx';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  X, 
  Compass, 
  Shield, 
  Sparkles 
} from 'lucide-react';

interface NavigationSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface TabMapping {
  tab: ActiveTab;
  label: string;
  badge?: string;
  description: string;
}

const TAB_MAPPINGS: TabMapping[] = [
  { tab: 'heroes', label: 'Hero Arsenal', badge: 'Official', description: 'Interactive 3D foil portraits & tactical HUD' },
  { tab: 'predictive', label: '5v5 Predictive Oracle', badge: 'AI', description: 'Real-time lineup win predictor & ban engine' },
  { tab: 'draft', label: 'Draft Studio', badge: 'Live', description: 'Counter-pick matrix & threat analyzer' },
  { tab: 'arena', label: '1v1 Matchup Arena', description: 'Head-to-head combat telemetry' },
  { tab: 'sandbox', label: 'Build Lab & Sandbox', description: 'Custom theorycrafting item engine' },
  { tab: 'interactions', label: 'Hero ↔ Item Synergies', description: 'Counter & synergy breakdowns' },
  { tab: 'counters', label: 'Item Matrix', description: 'Situational active item response' },
  { tab: 'meta', label: 'Season Meta Tier List', badge: '7.37d', description: 'High-MMR win rate tiers & shifts' },
  { tab: 'patches', label: 'Patch News & Fixes', badge: '7.37d', description: 'Recent updates & balance notes' },
  { tab: 'notes', label: 'Tactical Notes & Drafts', description: 'Saved lineups and player notes' }
];

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const activeIndex = Math.max(0, TAB_MAPPINGS.findIndex((m) => m.tab === activeTab));

  // Escape key handler to close drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen, setIsOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleItemClick = (index: number) => {
    const target = TAB_MAPPINGS[index];
    if (target) {
      SoundEngine.playHover();
      setActiveTab(target.tab);
      // Auto close drawer after selection on mobile, or keep open if desktop
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating Edge Toggle Button (when drawer is closed) */}
      <button
        onClick={() => {
          SoundEngine.playHover();
          setIsOpen(!isOpen);
        }}
        className={`fixed left-3 top-20 sm:top-24 z-40 p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 group backdrop-blur-xl shadow-xl ${
          isOpen
            ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
            : 'bg-slate-950/80 border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-400 hover:bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.6)]'
        }`}
        title={isOpen ? 'Close Navigator (Esc)' : 'Open Interactive Line Navigator'}
        aria-label="Toggle navigation drawer"
      >
        {isOpen ? (
          <PanelLeftClose className="w-5 h-5 text-purple-400 transition-transform group-hover:scale-110" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-purple-400 transition-transform group-hover:scale-110" />
        )}
        <span className="hidden md:inline font-mono text-[11px] font-bold uppercase tracking-wider text-purple-300">
          {isOpen ? 'Close' : 'Nav'}
        </span>
      </button>

      {/* Backdrop Dimmer */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Glassmorphic Navigation Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-96 max-w-[90vw] bg-slate-950/95 backdrop-blur-2xl border-r border-purple-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Application Navigator"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-purple-500/20 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-950/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 border border-purple-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Compass className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-dota font-bold text-sm tracking-wide bg-gradient-to-r from-purple-300 via-pink-200 to-cyan-300 bg-clip-text text-transparent">
                  NAVIGATOR
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Interactive Line Proximity Engine
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-900/30 border border-transparent hover:border-purple-500/30 transition-all"
            title="Close Navigator"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Middle Content with React Bits <LineSidebar /> */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>Views & Modules</span>
            <span className="text-purple-400 font-bold">{TAB_MAPPINGS.length} Sections</span>
          </div>

          <LineSidebar
            items={TAB_MAPPINGS.map((m) => m.label)}
            accentColor="#C084FC"
            textColor="#94a3b8"
            markerColor="#64748b"
            showIndex={true}
            showMarker={true}
            proximityRadius={90}
            maxShift={26}
            falloff="smooth"
            markerLength={46}
            markerGap={4}
            tickScale={0.45}
            scaleTick={true}
            itemGap={18}
            fontSize={0.98}
            smoothing={90}
            activeIndex={activeIndex}
            onItemClick={handleItemClick}
            className="w-full"
          />

          {/* Current Selection Information Card */}
          <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/60 border border-purple-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold font-sans">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Active View:</span>
              <span className="text-white font-dota ml-1">{TAB_MAPPINGS[activeIndex]?.label}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              {TAB_MAPPINGS[activeIndex]?.description}
            </p>
          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Patch 7.37d</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[10px] uppercase font-bold transition-all"
          >
            Hide Drawer
          </button>
        </div>
      </aside>
    </>
  );
};
