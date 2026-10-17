import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShaderGradient } from './ShaderGradient';
import { DurvesCurves } from './DurvesCurves';

interface DotaGSAPBackgroundProps {
  isActive?: boolean;
}

export const DotaGSAPBackground: React.FC<DotaGSAPBackgroundProps> = ({ isActive = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const ringsRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !logoRef.current) return;

    // Create GSAP Timeline for organic ambient motion
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    timelineRef.current = tl;

    // 1. Logo breathing and floating
    tl.to(logoRef.current, {
      y: -20,
      scale: 1.04,
      rotation: 1.2,
      duration: 5.5,
      ease: 'sine.inOut'
    }, 0);

    // 2. Ambient glow pulsing
    tl.to(logoRef.current, {
      filter: 'drop-shadow(0 0 50px rgba(220, 38, 38, 0.45)) drop-shadow(0 0 100px rgba(168, 85, 247, 0.25))',
      duration: 3.5,
      ease: 'power1.inOut'
    }, 0);

    // 3. Ambient rings rotation
    if (ringsRef.current) {
      gsap.to(ringsRef.current, {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 90,
        ease: 'none',
        repeat: -1
      });
    }

    // Lifecycle: pause on inactive tab to conserve battery and CPU
    if (!isActive) {
      tl.pause();
    } else {
      tl.play();
    }

    const handleVisibility = () => {
      if (document.hidden || !isActive) {
        tl.pause();
      } else {
        tl.play();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      tl.kill();
    };
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#07090e]"
      aria-hidden="true"
    >
      {/* 1. Underlying WebGL Shader Gradient */}
      <ShaderGradient paused={!isActive} speed={0.9} intensity={0.85} />

      {/* 2. Generative Durves Bezier Streamlines */}
      <DurvesCurves variant="tactical" />

      {/* 3. Centerpiece Official Dota 2 Logo with GSAP Floating Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Orbital Ring SVG */}
        <svg
          ref={ringsRef}
          className="w-[850px] h-[850px] max-w-[90vw] max-h-[90vh] opacity-25"
          viewBox="0 0 800 800"
          fill="none"
        >
          <circle
            cx="400"
            cy="400"
            r="380"
            stroke="url(#dota-ring-grad)"
            strokeWidth="1.5"
            strokeDasharray="6 14"
          />
          <circle
            cx="400"
            cy="400"
            r="290"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray="12 24"
          />
          <circle
            cx="400"
            cy="400"
            r="190"
            stroke="rgba(239, 68, 68, 0.15)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="dota-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Dota 2 Logo */}
        <div className="absolute">
          <img
            ref={logoRef}
            src={`${import.meta.env.BASE_URL}dota2.svg`}
            alt="Dota 2 Emblem"
            className="w-[280px] sm:w-[380px] lg:w-[460px] opacity-[0.14] transition-all object-contain will-change-transform"
            onError={(e) => {
              // Graceful fallback if relative path differs
              (e.currentTarget as HTMLImageElement).src = '/dota2.svg';
            }}
          />
        </div>
      </div>

      {/* 4. Atmospheric Vignettes for dark.design Contrast & Readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,9,14,0.65)_55%,rgba(7,9,14,0.98)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090e]/50 to-[#07090e] pointer-events-none" />
    </div>
  );
};
export default DotaGSAPBackground;
