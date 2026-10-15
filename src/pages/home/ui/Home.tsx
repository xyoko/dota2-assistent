import React, { useState, useMemo } from 'react';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { getDistinguishablePortraitCandidates } from '../../../entities/hero/bi/heroVisuals';
import { ChevronRight } from 'lucide-react';
import DomeGallery from '../../../widgets/dome-gallery/ui/DomeGallery';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { ShapeWaves } from '../../../shared/ui/effects/ShapeWaves';
import { HeroAnimationDisplay } from '../../../widgets/hero-animation-display';
import { ErrorBoundary } from '../../../shared/ui/error/ErrorBoundary';

import { ActiveTab } from '../../../widgets/navbar/ui/Navbar';

interface HomeProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectHero?: (hero: HeroData) => void;
  isActive?: boolean;
}

export const Home: React.FC<HomeProps> = React.memo(({ onNavigateTab, onSelectHero, isActive = true }) => {
  // Main hero array (user can change, must contain only one hero)
  const [mainHero, setMainHero] = useState<HeroData>(HEROES_DATA[0]);

  const domeImages = useMemo(() => {
    return HEROES_DATA.map(hero => {
      const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
      return {
        src: candidates[0],
        alt: hero.name,
        hero: hero
      };
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#120f17] overflow-hidden w-full">
      {/* Background WebGPU ShapeWaves Animation (Optimized & Freeze-Safe) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <ErrorBoundary silent title="Background Animation">
          <ShapeWaves
            maskImage={`${import.meta.env.BASE_URL}dota2.svg`}
            fontFamily={'Geist, "Geist Sans", system-ui, sans-serif'}
            fontWeight={500}
            textSize={0.6}
            shapes="mixed"
            cellSize={28}
            dotSize={0.7}
            color="#880808"
            hoverColor="#ffffff"
            backgroundColor="#120f17"
            speed={0.8}
            scale={1}
            contrast={1}
            brightness={0.4}
            flow={0}
            direction={0}
            fade={0.25}
            interactive={false}
            splashRadius={40}
            splashStrength={0.4}
            glow={0}
            intro={false}
            introDuration={1.6}
            paused={!isActive}
            onError={(error: unknown) => console.warn('ShapeWaves background fallback notice:', error)}
          />
        </ErrorBoundary>
        {/* Soft atmospheric gradient vignettes for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120f17]/50 via-transparent to-[#120f17]/70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#120f17]/20 to-[#120f17]/60 pointer-events-none" />
      </div>
      <div className="relative z-10 w-full pt-16 lg:pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content Area */}
        <div className="flex-1 space-y-8 animate-fadeInLeft">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-dota font-black text-white leading-tight drop-shadow-lg">
              PREDICTIVE <span className="text-red-500">DYNAMICS</span>
            </h1>
            <p className="text-xl text-slate-300 font-sans leading-relaxed max-w-2xl bg-slate-950/20 p-2 rounded-lg">
              AegisForge is the ultimate tactical oracle. Harness the power of real-time predictive drafts and dynamic build creation to dominate your opponents before the horn even sounds.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                SoundEngine.playPick();
                onNavigateTab('predictive');
              }}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex items-center gap-2 group btn-fade"
            >
              Enter Predictive Oracle
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                SoundEngine.playHover();
                onNavigateTab('heroes');
              }}
              className="px-8 py-4 bg-slate-900/90 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-white font-bold rounded-xl transition-all btn-fade"
            >
              Hero Arsenal
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full flex justify-center items-center perspective-1000">
          <ErrorBoundary compact title="Selected Hero Animation">
            <HeroAnimationDisplay
              hero={mainHero}
              isActive={isActive}
              onSelectHero={onSelectHero}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* React Bits Flex Carousel for Hero Selection */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-36 mb-36 lg:mt-44 lg:mb-44">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-dota font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-8 bg-red-500 rounded" />
            Featured Arsenal
          </h2>
          <span className="text-sm text-slate-400 font-mono uppercase tracking-widest">
            Select Main Avatar
          </span>
        </div>
        
        <div className="relative w-full h-[880px] rounded-3xl overflow-hidden bg-slate-950/40 border border-red-500/10 shadow-2xl">
          <ErrorBoundary compact title="Featured Arsenal Dome Gallery">
            <DomeGallery 
              images={domeImages}
              onSelectHero={setMainHero} 
              onOpenHeroDetails={onSelectHero}
              segments={20}
              fit={0.50}
              minRadius={620}
              tileInset="24px"
              maxVerticalRotationDeg={28}
              dragDampening={0.7}
              grayscale={false}
              autoRotate={isActive}
              autoRotationSpeed={3.5}
              pauseOnHover={true}
              overlayBlurColor="#120f17"
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Predictive Drafts", desc: "Our algorithm isolates roles and predicts the enemy's next move, providing perfect counter-picks." },
            { title: "Dynamic Builds", desc: "Item suggestions evolve based on enemy draft, current game time, and meta tier lists." },
            { title: "Tactical HUD", desc: "Picture-in-Picture global HUD keeps critical timers and counters floating above your game." }
          ].map((vp, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-red-950 hover:border-red-500/50 transition-all shadow-xl">
              <div className="w-12 h-12 bg-red-950/80 text-red-500 rounded-xl flex items-center justify-center font-black text-xl mb-4 border border-red-900">
                0{i + 1}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{vp.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{vp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

