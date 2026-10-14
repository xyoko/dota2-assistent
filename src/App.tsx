import React, { useState, useCallback, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { HERO_MAP } from './entities/hero';
import { HeroData } from './entities/hero';
import { Navbar } from './widgets/navbar';
import { AmbientParticles } from './widgets/ambient-particles';
import { Loader2, PictureInPicture } from 'lucide-react';

// Modular Architecture Hooks
import { useNavigationTab } from './features/navigation';
import { useFavorites } from './features/favorites';
import { useHeroFilters } from './features/hero-filters';
import { usePipHud } from './features/pip-hud';
import { HeroesArsenalView } from './pages/heroes';

// Lazy-loaded heavy views for sub-100ms instant initial page load
const PredictiveDraft5v5 = lazy(() => import('./pages/predictive').then(m => ({ default: m.PredictiveDraft5v5 })));
const DraftCounterPicker = lazy(() => import('./pages/draft').then(m => ({ default: m.DraftCounterPicker })));
const MatchupArena = lazy(() => import('./pages/arena').then(m => ({ default: m.MatchupArena })));
const BuildSandbox = lazy(() => import('./pages/sandbox').then(m => ({ default: m.BuildSandbox })));
const HeroItemInteractions = lazy(() => import('./pages/interactions').then(m => ({ default: m.HeroItemInteractions })));
const ItemCounterFinder = lazy(() => import('./pages/item-counter').then(m => ({ default: m.ItemCounterFinder })));
const MetaTierList = lazy(() => import('./pages/meta').then(m => ({ default: m.MetaTierList })));
const PatchNewsView = lazy(() => import('./pages/patches').then(m => ({ default: m.PatchNewsView })));
const CustomNotesView = lazy(() => import('./pages/notes').then(m => ({ default: m.CustomNotesView })));
import { Home } from './pages/home';
import { HeroBuildView } from './features/hero-build';
import { PictureInPictureHUD } from './features/pip-hud';
import { CookieConsentBanner } from './widgets/legal-compliance-modal';
import { LegalComplianceModal, LegalTabType } from './widgets/legal-compliance-modal';

const ViewLoadingFallback = () => (
  <div className="w-full min-h-[420px] flex flex-col items-center justify-center p-12 bg-dota-panel/60 border border-dota-gold/30 rounded-3xl shadow-dota-glow space-y-4">
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dota-red via-red-950 to-slate-900 border border-dota-gold/50 flex items-center justify-center shadow-dota-crimson animate-pulse">
        <Loader2 className="w-7 h-7 text-dota-gold animate-spin" />
      </div>
    </div>
    <div className="text-center space-y-1">
      <div className="font-dota font-bold text-sm tracking-widest text-amber-200 uppercase">
        Forging Tactical Knowledge...
      </div>
      <div className="text-xs text-slate-400 font-sans">
        Loading module data for optimal performance
      </div>
    </div>
  </div>
);

export const App: React.FC = () => {
  // Navigation / Tab Routing State
  const { activeTab, setActiveTab } = useNavigationTab();

  // Favorites State
  const { favorites, favoritesSet, toggleFavorite } = useFavorites();

  // Hero Filtering, Sorting, and Search State
  const heroFilters = useHeroFilters(favoritesSet);

  // Selected Hero for Detail Modal
  const [selectedHero, setSelectedHero] = useState<HeroData | null>(null);

  // Picture-in-Picture & Mini HUD State & Global Shortcuts (Alt+P)
  const {
    pipHero,
    isPipOpen,
    isNativePipActive,
    pipContainer,
    handleOpenPip,
    handleClosePip
  } = usePipHud(selectedHero);

  // Loaded draft scenario to pass to Draft Picker
  const [loadedEnemyDraft, setLoadedEnemyDraft] = useState<string[] | null>(null);

  // Legal Compliance Center Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabType>('overview');

  const handleOpenLegalModal = useCallback((tab: LegalTabType = 'overview') => {
    setLegalInitialTab(tab);
    setIsLegalModalOpen(true);
  }, []);

  const handleCloseHeroModal = useCallback(() => setSelectedHero(null), []);
  const handleSelectOtherHero = useCallback((id: string) => {
    const nextHero = HERO_MAP.get(id);
    if (nextHero) setSelectedHero(nextHero);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-dota-red selection:text-white overflow-x-hidden">
      
      {/* Floating Ambient Particles Engine (paused on Home to eliminate background redraw lag) */}
      {activeTab !== 'home' && <AmbientParticles />}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={heroFilters.searchQuery}
        setSearchQuery={heroFilters.setSearchQuery}
        onOpenPip={handleOpenPip}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl xl:max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 0: HOME / COMMAND CENTER */}
        <div className={activeTab === 'home' ? 'contents' : 'hidden'} aria-hidden={activeTab !== 'home'}>
          <Home 
            isActive={activeTab === 'home'}
            onNavigateTab={setActiveTab} 
            onSelectHero={setSelectedHero}
          />
        </div>

        {/* VIEW 1: HERO BUILDS & GUIDE (Virtualized High-Performance Arsenal) */}
        {activeTab === 'heroes' && (
          <HeroesArsenalView
            filters={heroFilters}
            favoritesSet={favoritesSet}
            onToggleFavorite={toggleFavorite}
            onSelectHero={setSelectedHero}
            onOpenPip={handleOpenPip}
          />
        )}

        {/* VIEW: 5v5 PREDICTIVE DRAFT ORACLE */}
        {activeTab === 'predictive' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <PredictiveDraft5v5
              onSelectHero={setSelectedHero}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </Suspense>
        )}

        {/* VIEW 2: DRAFT STUDIO */}
        {activeTab === 'draft' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <DraftCounterPicker
              onSelectHero={setSelectedHero}
              initialEnemyHeroIds={loadedEnemyDraft}
            />
          </Suspense>
        )}

        {/* VIEW 3: 1V1 MATCHUP ARENA */}
        {activeTab === 'arena' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <MatchupArena
              onSelectHero={setSelectedHero}
            />
          </Suspense>
        )}

        {/* VIEW 4: BUILD LAB & SHOP SANDBOX */}
        {activeTab === 'sandbox' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <BuildSandbox
              onSelectHero={setSelectedHero}
            />
          </Suspense>
        )}

        {/* VIEW 5: HERO ↔ ITEM COUNTERS */}
        {activeTab === 'interactions' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <HeroItemInteractions
              onSelectHero={setSelectedHero}
            />
          </Suspense>
        )}

        {/* VIEW 6: ITEM & THREAT COUNTERS */}
        {activeTab === 'counters' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <ItemCounterFinder />
          </Suspense>
        )}

        {/* VIEW 7: META & TIER LIST */}
        {activeTab === 'meta' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <MetaTierList
              onSelectHero={setSelectedHero}
            />
          </Suspense>
        )}

        {/* VIEW 8: PATCH NEWS & HERO FIXES */}
        {activeTab === 'patches' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <PatchNewsView
              onSelectHero={setSelectedHero}
            />
          </Suspense>
        )}

        {/* VIEW 9: MY NOTES & DRAFTS */}
        {activeTab === 'notes' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <CustomNotesView
              onSelectHero={setSelectedHero}
              onLoadDraftScenario={(enemyIds) => {
                setLoadedEnemyDraft(enemyIds);
                setActiveTab('draft');
              }}
            />
          </Suspense>
        )}

      </main>

      {/* Selected Hero Full Detail Modal */}
      {selectedHero && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <HeroBuildView
            hero={selectedHero}
            onClose={handleCloseHeroModal}
            isFavorite={favoritesSet.has(selectedHero.id)}
            onToggleFavorite={toggleFavorite}
            onOpenPip={handleOpenPip}
            onSelectOtherHero={handleSelectOtherHero}
          />
        </Suspense>
      )}

      {/* Native Document Picture-in-Picture Portal */}
      {isNativePipActive && pipContainer && createPortal(
        <Suspense fallback={<div className="p-4 text-xs text-amber-300">Loading PiP HUD...</div>}>
          <PictureInPictureHUD
            initialHero={pipHero}
            onClose={handleClosePip}
            isNativePip={true}
          />
        </Suspense>,
        pipContainer
      )}

      {/* Floating In-App Mini HUD Overlay (Fallback or on-screen mode) */}
      {isPipOpen && !isNativePipActive && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <Suspense fallback={<ViewLoadingFallback />}>
            <PictureInPictureHUD
              initialHero={pipHero}
              onClose={handleClosePip}
              isNativePip={false}
            />
          </Suspense>
        </div>
      )}

      {/* Floating PiP Quick Trigger Button when PiP is closed — strictly available in Hero view */}
      {activeTab === 'heroes' && !isPipOpen && (
        <button
          onClick={() => handleOpenPip()}
          className="fixed bottom-5 right-5 z-40 p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-dota-gold to-yellow-600 text-slate-950 font-black shadow-dota-glow hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border-2 border-amber-200 select-none group"
          title="Open Picture-in-Picture Mini HUD (Always on top)"
        >
          <PictureInPicture className="w-5 h-5 text-slate-950" />
          <span className="hidden sm:inline text-xs font-dota uppercase tracking-wider">Mini HUD</span>
        </button>
      )}

      {/* Enhanced Footer with Legal Compliance, Business Details & Disclaimers */}
      <footer className="mt-16 bg-slate-950/95 border-t border-purple-500/20 py-10 text-xs text-slate-400 relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Brand & Mission Statement with Emojis & Em Dashes */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-100 font-bold font-grotesk text-base">
                <span>🔮</span>
                <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent font-extrabold">
                  AEGIS FORGE
                </span>
                <span className="text-purple-400">—</span>
                <span className="text-slate-300 font-normal">Autonomous Dota 2 Tactical Companion</span>
              </div>
              <p className="text-[12px] text-slate-400 font-sans mt-1 max-w-xl">
                Deterministic counter-drafting algorithms, real-time threat telemetry, and situational builds — 100% free, client-side, and privacy-first.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenLegalModal('overview')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all btn-fade shadow-sm"
              >
                <span>⚖️</span>
                <span>20-Point Compliance & Audit Hub</span>
              </button>
            </div>
          </div>

          {/* Legal Navigation Links (Items 1, 2, 3, 4, 13, 20) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs">
            <button
              onClick={() => handleOpenLegalModal('privacy')}
              className="text-slate-300 hover:text-purple-300 underline underline-offset-4 transition-colors btn-fade flex items-center gap-1"
            >
              <span>🔒</span>
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => handleOpenLegalModal('terms')}
              className="text-slate-300 hover:text-purple-300 underline underline-offset-4 transition-colors btn-fade flex items-center gap-1"
            >
              <span>📜</span>
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => handleOpenLegalModal('cookies')}
              className="text-slate-300 hover:text-purple-300 underline underline-offset-4 transition-colors btn-fade flex items-center gap-1"
            >
              <span>🍪</span>
              <span>Cookie Policy</span>
            </button>
            <button
              onClick={() => handleOpenLegalModal('refunds')}
              className="text-slate-300 hover:text-purple-300 underline underline-offset-4 transition-colors btn-fade flex items-center gap-1"
            >
              <span>💳</span>
              <span>100% Free & Refund Policy</span>
            </button>
            <button
              onClick={() => handleOpenLegalModal('accessibility')}
              className="text-slate-300 hover:text-purple-300 underline underline-offset-4 transition-colors btn-fade flex items-center gap-1"
            >
              <span>♿</span>
              <span>Accessibility & Licenses</span>
            </button>
            <button
              onClick={() => handleOpenLegalModal('privacy')}
              className="text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors btn-fade flex items-center gap-1"
            >
              <span>🗑️</span>
              <span>Data Deletion Request</span>
            </button>
          </div>

          {/* Business Details & Official Disclaimers (Items 10, 11, 12, 16, 17, 19) */}
          <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-500 space-y-1.5 leading-relaxed text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400">
              <p>
                <strong>Entity:</strong> AegisForge Tactical Open Source Collective • Wilmington, DE, USA • Inquiries: <a href="mailto:support@aegisforge.gg" className="text-purple-400 hover:underline">support@aegisforge.gg</a>
              </p>
              <p className="font-mono text-[10px]">
                Audited: Zero Third-Party Trackers • 100% Client-Side Storage
              </p>
            </div>
            <p>
              Dota 2 and the Dota logo are registered trademarks of Valve Corporation. AegisForge is an unofficial tactical companion tool developed under the Valve Fan Content Policy.
            </p>
            <p className="text-[10px] text-slate-600">
              Statistical Disclaimer: Matchup rankings and predictive counter win rates are heuristic models derived from Patch 7.37d high-bracket match statistics and do not constitute guaranteed in-game MMR performance.
            </p>
          </div>

        </div>
      </footer>

      {/* Floating Cookie Consent Banner (GDPR / ePrivacy) */}
      <CookieConsentBanner 
        onOpenLegalTab={handleOpenLegalModal as (tab: string) => void}
      />

      {/* 20-Point Legal Compliance & Consumer Protection Modal */}
      <LegalComplianceModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />

    </div>
  );
};
