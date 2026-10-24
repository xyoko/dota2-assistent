import React from 'react';

interface DurvesCurvesProps {
  className?: string;
  variant?: 'tactical' | 'subtle' | 'radiant' | 'dire';
  interactive?: boolean;
}

export const DurvesCurves: React.FC<DurvesCurvesProps> = ({
  className = '',
  variant = 'tactical'
}) => {
  const opacityClass = variant === 'subtle' ? 'opacity-35' : variant === 'dire' ? 'opacity-70 saturate-150' : 'opacity-60';

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`w-full h-full object-cover ${opacityClass}`}
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradients inspired by dark.design and durves.com */}
          <linearGradient id="durve-tactical-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#a855f7" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="durve-tactical-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="durve-tactical-3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.0" />
            <stop offset="35%" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#ec4899" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>

          <filter id="durve-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Primary Harmonic Curve 1 (Upper Arc) */}
        <path
          d="M-100,180 C260,80 520,380 940,220 C1240,110 1420,290 1600,240"
          stroke="url(#durve-tactical-1)"
          strokeWidth="1.75"
          fill="none"
          strokeLinecap="round"
        />

        {/* Secondary Harmonic Curve (Echo wave) */}
        <path
          d="M-80,210 C280,110 540,410 960,250 C1260,140 1440,320 1620,270"
          stroke="url(#durve-tactical-1)"
          strokeWidth="1"
          strokeDasharray="4 8"
          fill="none"
          opacity="0.65"
        />

        {/* Primary Dynamic Curve 2 (Diagonal Swoop) */}
        <path
          d="M-60,780 C220,640 480,820 860,560 C1180,360 1340,540 1580,420"
          stroke="url(#durve-tactical-2)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          filter="url(#durve-glow)"
        />

        {/* Secondary Echo of Swoop */}
        <path
          d="M-40,810 C240,670 500,850 880,590 C1200,390 1360,570 1600,450"
          stroke="url(#durve-tactical-2)"
          strokeWidth="0.8"
          strokeDasharray="8 12"
          fill="none"
          opacity="0.5"
        />

        {/* Subtle Horizontal Mid-Frequency Strands */}
        <path
          d="M0,450 C380,390 740,540 1100,430 C1300,380 1400,460 1500,440"
          stroke="url(#durve-tactical-3)"
          strokeWidth="1.25"
          fill="none"
        />
        <path
          d="M0,470 C380,410 740,560 1100,450 C1300,400 1400,480 1500,460"
          stroke="url(#durve-tactical-3)"
          strokeWidth="0.75"
          strokeDasharray="2 6"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};
export default DurvesCurves;
