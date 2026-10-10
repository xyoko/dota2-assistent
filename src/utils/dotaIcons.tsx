import React from 'react';
import { DOTA_LOGO_PATH } from './heroVisuals';

export interface DotaIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * 1. Official Dota 2 Logo (Map / Ancient emblem)
 */
export const DotaOfficialLogoIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    <path d={DOTA_LOGO_PATH} />
  </svg>
);

/**
 * 2. Official Dota Aegis of Champions / Immortal Shield (5v5 Predictive Oracle)
 */
export const DotaAegisIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Outer Aegis Shield Contour */}
    <path d="M12 2L4 5v6.5C4 17.5 7.5 21 12 22.5C16.5 21 20 17.5 20 11.5V5L12 2z" />
    {/* Inner Aegis Ring & Core Crystal */}
    <circle cx="12" cy="11.5" r="4.2" strokeWidth="1.4" />
    <polygon points="12,8.5 14.5,12 12,14.5 9.5,12" fill="currentColor" fillOpacity="0.3" strokeWidth="1.2" />
    <path d="M12 2.5v3M12 18v4" strokeWidth="1.2" />
  </svg>
);

/**
 * 3. Official Dota Crossed Warblades (Draft Studio)
 */
export const DotaCrossedBladesIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* First Blade */}
    <path d="M19 3l-8 8m-2 2l-4 4-2-2 4-4m2-2l2-2" />
    <path d="M18 2l4 4-2.5 2.5-4-4L18 2z" fill="currentColor" fillOpacity="0.25" />
    <path d="M4 18l-2 4 4-2" />
    {/* Second Blade */}
    <path d="M5 3l8 8m2 2l4 4 2-2-4-4m-2-2l-2-2" />
    <path d="M6 2L2 6l2.5 2.5 4-4L6 2z" fill="currentColor" fillOpacity="0.25" />
    <path d="M20 18l2 4-4-2" />
  </svg>
);

/**
 * 4. Official Dota Matchup Arena / Duel Glaives (1v1 Arena)
 */
export const DotaDuelArenaIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Spiked Combat Ring */}
    <circle cx="12" cy="12" r="8.5" strokeWidth="1.4" />
    {/* Opposing Axes / Glaives */}
    <path d="M8 8l8 8M16 8l-8 8" strokeWidth="1.6" />
    <polygon points="12,5 14,8 10,8" fill="currentColor" />
    <polygon points="12,19 14,16 10,16" fill="currentColor" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

/**
 * 5. Official Dota Aghanim's Scepter / Secret Shop (Build Lab & Sandbox)
 */
export const DotaAghanimScepterIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Scepter Shaft */}
    <path d="M5 21l9-9" strokeWidth="2" />
    {/* Crown of Aghanim with Triple Gems */}
    <path d="M12 10l-2-2 4-4 2 2-4 4z" fill="currentColor" fillOpacity="0.2" />
    <circle cx="17.5" cy="6.5" r="3.2" strokeWidth="1.5" />
    <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
    <path d="M19.5 4.5l2-2M15.5 8.5l-2 2M21.5 8.5l-2-2" strokeWidth="1.2" />
  </svg>
);

/**
 * 6. Official Dota Refresher Orb / Synergy Vortex (Hero ↔ Item Synergies)
 */
export const DotaSynergyVortexIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Dual Harmonic Rings */}
    <circle cx="9" cy="12" r="5.5" strokeWidth="1.4" />
    <circle cx="15" cy="12" r="5.5" strokeWidth="1.4" />
    {/* Overlapping Arc / Resonance Core */}
    <path d="M12 7.8c1.2 1.2 1.8 2.6 1.8 4.2s-.6 3-1.8 4.2c-1.2-1.2-1.8-2.6-1.8-4.2s.6-3 1.8-4.2z" fill="currentColor" fillOpacity="0.35" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * 7. Official Dota Divine Rapier / BKB Broadsword (Item Matrix)
 */
export const DotaDivineRapierIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Rapier Blade */}
    <path d="M19 5L9 15" strokeWidth="2" />
    <path d="M21 3l-3 1-1 3 3-1 1-3z" fill="currentColor" />
    {/* Golden Crossguard & Pommel */}
    <path d="M7 13l4 4" strokeWidth="2" />
    <circle cx="5" cy="19" r="2" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" />
    <path d="M4 20l-1.5 1.5" strokeWidth="2" />
    {/* Divine Rays */}
    <path d="M18 9l2-2M15 6l2-2" strokeWidth="1.2" strokeDasharray="1 1" />
  </svg>
);

/**
 * 8. Official Dota Immortal Rank Crest (Season Meta Tier List)
 */
export const DotaImmortalRankIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Immortal Wings */}
    <path d="M12 3l-4 6 4 2 4-2-4-6z" fill="currentColor" fillOpacity="0.3" />
    <path d="M3 9l5 1-2 5-4-3 1-3z" />
    <path d="M21 9l-5 1 2 5 4-3-1-3z" />
    {/* Apex Crown Gem */}
    <circle cx="12" cy="16" r="3.5" strokeWidth="1.5" />
    <polygon points="12,14 13.5,16.5 10.5,16.5" fill="currentColor" />
    <path d="M12 19.5v2M9.5 18.5l-1.5 2M14.5 18.5l1.5 2" strokeWidth="1.3" />
  </svg>
);

/**
 * 9. Official Dota Tome of Knowledge / Patch Notes (Patch News & Fixes)
 */
export const DotaPatchScrollIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Scroll / Parchment */}
    <path d="M19 4H8a4 4 0 0 0-4 4v9a3 3 0 0 0 3 3h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <path d="M8 4v12a2 2 0 0 0 2 2h11" />
    {/* Balance Lines */}
    <path d="M12 9h5M12 13h3" strokeWidth="1.4" />
    <circle cx="18" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * 10. Official Dota Tactical Codex / Notes (Tactical Notes & Drafts)
 */
export const DotaTacticalNotesIcon: React.FC<DotaIconProps> = ({
  className = '',
  size = 20,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Book / Strategy Codex */}
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    {/* Quill Pen Writing */}
    <path d="M14 6l4 4-7 7H7v-4l7-7z" fill="currentColor" fillOpacity="0.25" />
    <path d="M16 4l2 2" strokeWidth="1.5" />
  </svg>
);

/**
 * Mapping of each ActiveTab to its official Dota icon component
 */
export const TAB_DOTA_ICONS: Record<string, React.FC<DotaIconProps>> = {
  heroes: DotaOfficialLogoIcon,
  predictive: DotaAegisIcon,
  draft: DotaCrossedBladesIcon,
  arena: DotaDuelArenaIcon,
  sandbox: DotaAghanimScepterIcon,
  interactions: DotaSynergyVortexIcon,
  counters: DotaDivineRapierIcon,
  meta: DotaImmortalRankIcon,
  patches: DotaPatchScrollIcon,
  notes: DotaTacticalNotesIcon
};
