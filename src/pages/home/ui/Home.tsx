import React, { useState, useMemo } from 'react';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { getDistinguishablePortraitCandidates } from '../../../entities/hero/bi/heroVisuals';
import { ChevronRight } from 'lucide-react';
import DomeGallery from '../../../widgets/dome-gallery/ui/DomeGallery';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';

import { ActiveTab } from '../../../widgets/navbar/ui/Navbar';

interface HomeProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectHero?: (hero: HeroData) => void;
}

export const Home: React.FC<HomeProps> = React.memo(({ onNavigateTab, onSelectHero }) => {
  // Main hero array (user can change, must contain only one hero)
  const [mainHero, setMainHero] = useState<HeroData>(HEROES_DATA[0]);

  const domeImages = useMemo(() => {
    return HEROES_DATA.map(hero => {
      const candidates = getDistinguishablePortraitCandidates(hero.avatarUrl);
      return {
        src: (candidates[1] || candidates[0]),
        alt: hero.name,
        hero: hero
      };
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden w-full">
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
          <div 
            onClick={() => {
              if (onSelectHero) {
                SoundEngine.playPick();
                onSelectHero(mainHero);
              }
            }}
            className="w-full aspect-square max-w-[280px] sm:max-w-[320px] relative hover:scale-105 transition-transform duration-500 ease-out cursor-pointer group"
            title={`View ${mainHero.name} Details`}
          >
            {(() => {
              const candidates = getDistinguishablePortraitCandidates(mainHero.avatarUrl);
              return (
                <img 
                  src={candidates[0]} 
                  alt={mainHero.name}
                  className="w-full h-full object-cover rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)] filter brightness-110 contrast-125 border border-red-500/20"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const currentIndex = candidates.indexOf(img.src);
                    if (currentIndex < candidates.length - 1) {
                      img.src = candidates[currentIndex + 1];
                    }
                  }}
                />
              );
            })()}
            {/* Holographic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent to-transparent mix-blend-overlay rounded-3xl" />
          </div>
        </div>
      </div>

      {/* React Bits Flex Carousel for Hero Selection */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 mb-28">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-dota font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-8 bg-red-500 rounded" />
            Featured Arsenal
          </h2>
          <span className="text-sm text-slate-400 font-mono uppercase tracking-widest">
            Select Main Avatar
          </span>
        </div>
        
        <div style={{ width: '100%', height: '806px', position: 'relative', marginTop: '2rem' }}>
          <DomeGallery 
            images={domeImages}
            onSelectHero={setMainHero} 
            onOpenHeroDetails={onSelectHero}
            segments={26}
            fit={0.62}
            minRadius={780}
            tileInset="22px"
            maxVerticalRotationDeg={40}
            dragDampening={0.7}
            grayscale={false}
          />
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

