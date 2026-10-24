import React, { useEffect, useRef, Suspense } from 'react';
import gsap from 'gsap';
import { DurvesCurves } from './DurvesCurves';

export const StaticShaderGradient: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`absolute inset-0 bg-[#07090e] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(127,29,29,0.3),rgba(59,7,100,0.25),rgba(7,9,14,0.95))] pointer-events-none ${className}`}
    aria-hidden="true"
  />
);

const LazyShaderGradient = React.lazy(() => import('./ShaderGradient'));

interface DotaGSAPBackgroundProps {
  isActive?: boolean;
  isHome?: boolean;
  isModalOpen?: boolean;
}

export const DotaGSAPBackground: React.FC<DotaGSAPBackgroundProps> = ({
  isActive = true,
  isHome = true,
  isModalOpen = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const ringsRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const ringsTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!containerRef.current || !logoRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Respect prefers-reduced-motion: no animation
      return;
    }

    // Create GSAP Timeline for organic ambient motion
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    timelineRef.current = tl;

    // 1. Logo breathing and floating (transform only: y, scale, rotation)
    tl.to(logoRef.current, {
      y: -20,
      scale: 1.04,
      rotation: 1.2,
      duration: 5.5,
      ease: 'sine.inOut'
    }, 0);

    // 2. Subtle opacity breathing (GPU-composited, avoids filter repainting)
    tl.to(logoRef.current, {
      opacity: 0.22,
      duration: 3.5,
      ease: 'sine.inOut'
    }, 0);

    // 3. Ambient rings rotation - stored in ref so it can be killed in cleanup
    if (ringsRef.current) {
      ringsTweenRef.current = gsap.to(ringsRef.current, {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 90,
        ease: 'none',
        repeat: -1
      });
    }

    let isIntersecting = true;

    const syncPlayback = () => {
      const shouldPlay = isActive && !document.hidden && isIntersecting;
      if (shouldPlay) {
        tl.play();
        ringsTweenRef.current?.play();
      } else {
        tl.pause();
        ringsTweenRef.current?.pause();
      }
    };

    // Initial play/pause state
    syncPlayback();

    // Pause offscreen with IntersectionObserver
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncPlayback();
      }, { threshold: 0.01 });
      observer.observe(containerRef.current);
    }

    const handleVisibility = () => {
      syncPlayback();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();
      tl.kill();
      ringsTweenRef.current?.kill();
      timelineRef.current = null;
      ringsTweenRef.current = null;
    };
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#07090e]"
      aria-hidden="true"
    >
      {/* 1. Underlying WebGL Shader Gradient - mounted only on Home tab, unmounted on other tabs */}
      {isHome ? (
        <Suspense fallback={<StaticShaderGradient />}>
          <LazyShaderGradient paused={!isActive || isModalOpen} speed={0.9} intensity={0.85} />
        </Suspense>
      ) : (
        <StaticShaderGradient />
      )}

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

        {/* Floating Dota 2 Logo - static drop-shadow with hardware-accelerated transform/opacity animation */}
        <div className="absolute">
          <img
            ref={logoRef}
            src={`${import.meta.env.BASE_URL}dota2.svg`}
            alt="Dota 2 Emblem"
            className="w-[280px] sm:w-[380px] lg:w-[460px] opacity-[0.14] object-contain will-change-transform"
            style={{
              filter: 'drop-shadow(0 0 50px rgba(220, 38, 38, 0.45)) drop-shadow(0 0 100px rgba(168, 85, 247, 0.25))'
            }}
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
