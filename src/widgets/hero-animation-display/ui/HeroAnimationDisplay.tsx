import React, { useState, useEffect, useRef } from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { getDistinguishablePortraitCandidates } from '../../../entities/hero/bi/heroVisuals';
import { HeroAnimationService } from '../../../shared/bi/api/heroAnimationService';
import { HeroAnimationLoading } from '../../../shared/ui/loading/HeroAnimationLoading';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';

interface HeroAnimationDisplayProps {
  hero: HeroData;
  isActive?: boolean;
  onSelectHero?: (hero: HeroData) => void;
  className?: string;
}

export const HeroAnimationDisplay: React.FC<HeroAnimationDisplayProps> = ({
  hero,
  isActive = true,
  onSelectHero,
  className = ''
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Fetch & Cache official Valve hero animation using Axios
  useEffect(() => {
    // When section is inactive, purge from localStorage and revoke memory
    if (!isActive) {
      setVideoUrl(null);
      setIsLoading(false);
      HeroAnimationService.clearHeroAnimationStorage();
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setProgress(5);
    setHasError(false);

    HeroAnimationService.fetchHeroAnimation(hero, (percent) => {
      if (isMounted) {
        setProgress(percent);
      }
    })
      .then((result) => {
        if (!isMounted) return;
        setVideoUrl(result.url);
        setIsLoading(false);
        setProgress(100);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[HeroAnimationDisplay] Error loading animation:', err);
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hero, isActive]);

  // 2. Resource Friendly Cleanup on unmount or tab switch
  useEffect(() => {
    return () => {
      HeroAnimationService.clearHeroAnimationStorage();
    };
  }, []);

  const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);

  const attrBorderColor =
    hero.attribute === 'str'
      ? 'border-red-500/40 shadow-[0_0_40px_rgba(220,38,38,0.35)]'
      : hero.attribute === 'agi'
      ? 'border-emerald-500/40 shadow-[0_0_40px_rgba(34,197,94,0.35)]'
      : hero.attribute === 'int'
      ? 'border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.35)]'
      : 'border-purple-500/40 shadow-[0_0_40px_rgba(217,70,239,0.35)]';

  return (
    <div
      onClick={() => {
        if (onSelectHero) {
          SoundEngine.playPick();
          onSelectHero(hero);
        }
      }}
      className={`w-full aspect-square max-w-[280px] sm:max-w-[340px] relative hover:scale-105 transition-transform duration-500 ease-out cursor-pointer group rounded-3xl overflow-hidden border ${attrBorderColor} bg-slate-950/70 backdrop-blur-sm ${className}`}
      title={`View ${hero.name} Details`}
    >
      {/* Underlying High-Res Portrait Layer (always ready) */}
      <img
        src={candidates[0]}
        alt={hero.name}
        className={`w-full h-full object-cover transition-opacity duration-700 filter brightness-105 contrast-115 ${
          videoUrl && !isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          const currentIndex = candidates.indexOf(img.src);
          if (currentIndex < candidates.length - 1) {
            img.src = candidates[currentIndex + 1];
          }
        }}
      />

      {/* Official Valve Animated WebM Render */}
      {videoUrl && !hasError && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            console.warn('[HeroAnimationDisplay] Video playback error, falling back to portrait');
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}

      {/* Custom Dota-themed Loading Screen */}
      {isLoading && (
        <HeroAnimationLoading hero={hero} progress={progress} />
      )}

      {/* Hero Badge Overlay */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-md">
        <span
          className={`w-2 h-2 rounded-full ${
            hero.attribute === 'str'
              ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
              : hero.attribute === 'agi'
              ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
              : hero.attribute === 'int'
              ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
              : 'bg-purple-500 shadow-[0_0_8px_#d946ef]'
          }`}
        />
        <span className="text-[11px] font-mono font-bold text-white tracking-wider uppercase">
          {hero.name}
        </span>
      </div>

      {/* Live Video Indicator Badge */}
      {videoUrl && !isLoading && !hasError && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-red-600/80 backdrop-blur-md border border-red-400/30 flex items-center gap-1 shadow-sm animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase">
            VALVE LIVE
          </span>
        </div>
      )}

      {/* Atmospheric Holographic Sheen */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default HeroAnimationDisplay;
