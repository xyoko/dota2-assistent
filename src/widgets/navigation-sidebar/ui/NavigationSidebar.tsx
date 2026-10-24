'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ActiveTab } from '../../navbar/ui/Navbar';
import { LineSidebar, LineSidebarItem } from './LineSidebar';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  DotaOfficialLogoIcon,
  DotaAegisIcon,
  DotaCrossedBladesIcon,
  DotaDuelArenaIcon,
  DotaAghanimScepterIcon,
  DotaSynergyVortexIcon,
  DotaDivineRapierIcon,
  DotaImmortalRankIcon,
  DotaPatchScrollIcon,
  DotaTacticalNotesIcon
} from '../../../shared/bi/utils/dotaIcons';
import { 
  Sparkles
} from 'lucide-react';

interface NavigationSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

interface NavSectionDef {
  tab: ActiveTab;
  label: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
}

const NAV_SECTIONS: NavSectionDef[] = [
  {
    tab: 'home',
    label: 'Command Center',
    badge: 'Home',
    description: 'AegisForge Overview & Featured Avatar',
    icon: <Sparkles size={20} />
  },
  { 
    tab: 'heroes', 
    label: 'Hero Arsenal', 
    badge: 'Official', 
    description: 'Interactive 3D foil portraits & tactical HUD',
    icon: <DotaOfficialLogoIcon size={20} />
  },
  { 
    tab: 'predictive', 
    label: '5v5 Predictive Oracle', 
    badge: 'Oracle', 
    description: 'Role-isolated counter picks, targeted bans & win probability',
    icon: <DotaAegisIcon size={20} />
  },
  { 
    tab: 'draft', 
    label: 'Draft Studio', 
    badge: 'Live', 
    description: 'Counter-pick matrix & threat analyzer',
    icon: <DotaCrossedBladesIcon size={20} />
  },
  { 
    tab: 'arena', 
    label: '1v1 Matchup Arena', 
    description: 'Head-to-head combat telemetry & armor stats',
    icon: <DotaDuelArenaIcon size={20} />
  },
  { 
    tab: 'sandbox', 
    label: 'Build Lab & Sandbox', 
    description: 'Custom theorycrafting item engine & inventory simulator',
    icon: <DotaAghanimScepterIcon size={20} />
  },
  { 
    tab: 'interactions', 
    label: 'Hero ↔ Item Synergies', 
    description: 'Counter & synergy breakdowns with item cooldowns',
    icon: <DotaSynergyVortexIcon size={20} />
  },
  { 
    tab: 'counters', 
    label: 'Item Matrix', 
    description: 'Situational active item response & dispel timing',
    icon: <DotaDivineRapierIcon size={20} />
  },
  { 
    tab: 'meta', 
    label: 'Season Meta Tier List', 
    badge: '7.37d', 
    description: 'High-MMR win rate tiers & lane dominance shifts',
    icon: <DotaImmortalRankIcon size={20} />
  },
  { 
    tab: 'patches', 
    label: 'Patch News & Fixes', 
    badge: '7.37d', 
    description: 'Recent balance notes, changes & bug patches',
    icon: <DotaPatchScrollIcon size={20} />
  },
  { 
    tab: 'notes', 
    label: 'Tactical Notes & Drafts', 
    description: 'Saved lineups, player notes & team strategies',
    icon: <DotaTacticalNotesIcon size={20} />
  }
];

export const NavigationSidebar: React.FC<NavigationSidebarProps> = React.memo(({
  activeTab,
  setActiveTab
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = Math.max(0, NAV_SECTIONS.findIndex((s) => s.tab === activeTab));
  const activeSection = NAV_SECTIONS[activeIndex] || NAV_SECTIONS[0];

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleItemClick = (index: number) => {
    const target = NAV_SECTIONS[index];
    if (target) {
      SoundEngine.playPick();
      setActiveTab(target.tab);
    }
  };

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHovered(false);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const lineSidebarItems: LineSidebarItem[] = React.useMemo(() => NAV_SECTIONS.map((s) => ({
    label: s.label,
    icon: s.icon,
    badge: s.badge,
    description: s.description
  })), []);

  return (
    <>
      {/* 1. Left Edge Trigger Zone: Auto pops up nav when cursor approaches left side */}
      <div
        className="fixed left-0 top-16 bottom-0 w-8 z-40 pointer-events-auto"
        onMouseEnter={handleMouseEnter}
        aria-hidden="true"
      />

      {/* 2. Docked Left Line Navigator Panel */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-2 sm:left-4 top-20 sm:top-24 z-40 transition-transform duration-300 ease-out flex flex-col justify-between ${
          isHovered
            ? 'w-80 sm:w-88 max-w-[92vw] bg-slate-950 border-2 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.3)] rounded-2xl py-4 px-4 translate-x-0 opacity-100 pointer-events-auto'
            : 'w-80 sm:w-88 max-w-[92vw] bg-slate-950/90 border border-purple-500/25 shadow-lg rounded-2xl py-4 px-4 -translate-x-[110%] opacity-0 pointer-events-none'
        }`}
        aria-label="Tactical Navigation Dock"
      >
        {/* Subtle Background Shimmer Gradient */}
        <div
          className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 bg-gradient-to-br from-purple-900/15 via-transparent to-blue-900/15 ${
            isHovered ? 'opacity-100' : 'opacity-40'
          }`}
        />

        {/* Top Header Card */}
        <div className="relative z-10 pb-3 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-950 border border-purple-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <span className="text-sm">🧭</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-dota font-bold text-xs tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                  NAVIGATOR
                </span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Dota HUD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-none mt-0.5">
                {isHovered ? 'Interactive Proximity Rail' : 'Hover to expand all views'}
              </p>
            </div>
          </div>

          <div className="text-[9px] font-mono text-purple-400/80 font-bold">
            {isHovered ? '10 Views' : `Active: 0${activeIndex + 1}`}
          </div>
        </div>

        {/* Middle Line Navigation with Official Dota Icons & Fixed Layout Slots */}
        <div className="relative z-10 py-2">
          <LineSidebar
            items={lineSidebarItems}
            accentColor="#C084FC"
            textColor="#94a3b8"
            markerColor="#64748b"
            showIndex={true}
            proximityRadius={35}
            maxShift={0}
            falloff="smooth"
            markerLength={32}
            markerGap={8}
            itemGap={14}
            fontSize={0.92}
            smoothing={85}
            activeIndex={activeIndex}
            isHovered={isHovered}
            onItemClick={handleItemClick}
            className="w-full"
          />
        </div>

        {/* Bottom Status Card */}
        <div
          className={`relative z-10 pt-3 border-t border-purple-500/20 transition-opacity duration-300 text-xs ${
            isHovered ? 'opacity-100 max-h-24' : 'opacity-80 max-h-16'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-purple-300 font-bold">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-white font-dota">{activeSection.label}</span>
              </div>
              <span className="text-[9px] font-mono text-purple-300/80">Patch 7.37d</span>
            </div>
            {isHovered && (
              <p className="text-[10px] text-slate-400 font-sans leading-tight">
                {activeSection.description}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
});

export default NavigationSidebar;
