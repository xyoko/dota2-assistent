import React, { useState, useMemo, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { HEROES_DATA, HERO_MAP } from './data/heroes';
import { HeroData, AttributeType, RoleType, AttackType } from './types/hero';
import { StorageService } from './services/storageService';
import { PipManager } from './services/pipManager';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroFilterBar } from './components/HeroFilterBar';
import { HeroCard } from './components/HeroCard';
import { NavigationSidebar } from './components/NavigationSidebar';
import { AmbientParticles } from './components/AmbientParticles';
import { Shield, Loader2, PictureInPicture } from 'lucide-react';

// Lazy-loaded heavy views for sub-100ms instant initial page load
const PredictiveDraft5v5 = lazy(() => import('./components/PredictiveDraft5v5').then(m => ({ default: m.PredictiveDraft5v5 })));
const DraftCounterPicker = lazy(() => import('./components/DraftCounterPicker').then(m => ({ default: m.DraftCounterPicker })));
const MatchupArena = lazy(() => import('./components/MatchupArena').then(m => ({ default: m.MatchupArena })));
const BuildSandbox = lazy(() => import('./components/BuildSandbox').then(m => ({ default: m.BuildSandbox })));
const HeroItemInteractions = lazy(() => import('./components/HeroItemInteractions').then(m => ({ default: m.HeroItemInteractions })));
const ItemCounterFinder = lazy(() => import('./components/ItemCounterFinder').then(m => ({ default: m.ItemCounterFinder })));
const MetaTierList = lazy(() => import('./components/MetaTierList').then(m => ({ default: m.MetaTierList })));
const PatchNewsView = lazy(() => import('./components/PatchNewsView').then(m => ({ default: m.PatchNewsView })));
const CustomNotesView = lazy(() => import('./components/CustomNotesView').then(m => ({ default: m.CustomNotesView })));
import { HeroBuildView } from './components/HeroBuildView';
import { PictureInPictureHUD } from './components/PictureInPictureHUD';
import { SaaSHeroSection } from './components/SaaSHeroSection';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LegalComplianceModal, LegalTabType } from './components/LegalComplianceModal';

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
  const getInitialTab = (): ActiveTab => {
    try {
      const hash = window.location.hash.replace('#', '');
      const validTabs: ActiveTab[] = ['heroes', 'predictive', 'draft', 'arena', 'sandbox', 'interactions', 'counters', 'meta', 'patches', 'notes'];
      if (validTabs.includes(hash as ActiveTab)) {
        return hash as ActiveTab;
      }
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && validTabs.includes(tabParam as ActiveTab)) {
        return tabParam as ActiveTab;
      }
    } catch {}
    return 'heroes';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    try {
      window.location.hash = tab;
    } catch {}
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: ActiveTab[] = ['heroes', 'predictive', 'draft', 'arena', 'sandbox', 'interactions', 'counters', 'meta', 'patches', 'notes'];
      if (validTabs.includes(hash as ActiveTab)) {
        setActiveTabState(hash as ActiveTab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Hero filters
  const [selectedAttr, setSelectedAttr] = useState<AttributeType | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<RoleType | 'all'>('all');
  const [selectedAttack, setSelectedAttack] = useState<AttackType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'winRate' | 'name' | 'complexity'>('winRate');

  // Selected Hero for Detail Modal
  const [selectedHero, setSelectedHero] = useState<HeroData | null>(null);

  // Navigation Drawer Sidebar State (<LineSidebar /> from React Bits)
  const [isNavSidebarOpen, setIsNavSidebarOpen] = useState<boolean>(false);

  // Picture-in-Picture & Mini HUD State (Strictly limited to Hero Arsenal view)
  const [pipHero, setPipHero] = useState<HeroData>(HEROES_DATA[0]);
  const [isPipOpen, setIsPipOpen] = useState<boolean>(false);
  const [isNativePipActive, setIsNativePipActive] = useState<boolean>(false);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);

  // Restrict in-app floating PiP to Hero view only: auto-close floating overlay when navigating away
  React.useEffect(() => {
    if (activeTab !== 'heroes' && isPipOpen && !isNativePipActive) {
      setIsPipOpen(false);
    }
  }, [activeTab, isPipOpen, isNativePipActive]);
  
  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());

  // Loaded draft scenario to pass to Draft Picker
  const [loadedEnemyDraft, setLoadedEnemyDraft] = useState<string[] | null>(null);

  // Legal Compliance Center Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabType>('overview');

  const handleOpenLegalModal = (tab: LegalTabType = 'overview') => {
    setLegalInitialTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleToggleFavorite = (heroId: string) => {
    StorageService.toggleFavorite(heroId);
    setFavorites(StorageService.getFavorites());
  };

  // Launch Picture-in-Picture (Native Document PiP or In-App Floating Overlay)
  const handleOpenPip = async (targetHero?: HeroData) => {
    const heroToUse = targetHero || selectedHero || HEROES_DATA[0];
    setPipHero(heroToUse);

    if (PipManager.isSupported()) {
      const containerDiv = document.createElement('div');
      containerDiv.style.width = '100%';
      containerDiv.style.height = '100%';

      const success = await PipManager.openDocumentPip(containerDiv, () => {
        setIsNativePipActive(false);
        setIsPipOpen(false);
        setPipContainer(null);
      });

      if (success) {
        setPipContainer(containerDiv);
        setIsNativePipActive(true);
        setIsPipOpen(true);
        return;
      }
    }

    // Fallback: Floating overlay inside the main web page
    setIsNativePipActive(false);
    setIsPipOpen(true);
  };

  const handleClosePip = () => {
    if (isNativePipActive) {
      PipManager.closeDocumentPip();
    }
    setIsNativePipActive(false);
    setIsPipOpen(false);
    setPipContainer(null);
  };

  // Global Keyboard Shortcut: Alt+P (or Option+P) to toggle Picture-in-Picture Mini HUD
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
        e.preventDefault();
        if (isPipOpen || isNativePipActive) {
          handleClosePip();
        } else {
          handleOpenPip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPipOpen, isNativePipActive, selectedHero, pipHero]);

  // Filtered & Sorted Heroes
  const filteredHeroes = useMemo(() => {
    let list = HEROES_DATA.filter((hero) => {
      // Attribute filter
      if (selectedAttr !== 'all' && hero.attribute !== selectedAttr) return false;
      // Role filter
      if (selectedRole !== 'all' && !hero.roles.includes(selectedRole)) return false;
      // Attack filter
      if (selectedAttack !== 'all' && hero.attackType !== selectedAttack) return false;
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(hero.id)) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = hero.name.toLowerCase().includes(q);
        const matchesTitle = hero.title.toLowerCase().includes(q);
        const matchesAlias = hero.aliases.some((a) => a.toLowerCase().includes(q));
        const matchesRole = hero.roles.some((r) => r.toLowerCase().includes(q));
        const matchesItem = hero.build.core.some((i) => i.name.toLowerCase().includes(q)) ||
                            hero.counterStrategy.keyCounterItems.some((k) => k.name.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesAlias && !matchesRole && !matchesItem) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'complexity') return a.complexity - b.complexity;
      return 0;
    });

    return list;
  }, [selectedAttr, selectedRole, selectedAttack, showFavoritesOnly, searchQuery, sortBy, favorites]);

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-dota-red selection:text-white overflow-x-hidden">
      
      {/* Floating Ambient Particles Engine */}
      <AmbientParticles />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenPip={() => handleOpenPip()}
      />

      {/* Interactive Line Navigator Sidebar Drawer (React Bits <LineSidebar />) */}
      <NavigationSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isNavSidebarOpen}
        setIsOpen={setIsNavSidebarOpen}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: HERO BUILDS & GUIDE */}
        {activeTab === 'heroes' && (
          <div className="space-y-6">
            
            {/* Modern SaaS Showcase Section (Purple-to-Blue Gradient, Grain, 3 Icon Boxes, Emojis, Buzzwords, Em Dashes) */}
            <SaaSHeroSection
              onNavigateTab={setActiveTab}
              onOpenLegal={() => handleOpenLegalModal('overview')}
            />

            {/* Hero Filter Bar */}
            <HeroFilterBar
              selectedAttr={selectedAttr}
              setSelectedAttr={setSelectedAttr}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedAttack={selectedAttack}
              setSelectedAttack={setSelectedAttack}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Heroes Grid — Official Dota 2 Portrait Card Layout */}
            {filteredHeroes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
                {filteredHeroes.map((hero) => (
                  <HeroCard
                    key={hero.id}
                    hero={hero}
                    isFavorite={favorites.includes(hero.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectHero={setSelectedHero}
                    onOpenPip={(h) => handleOpenPip(h)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-dota-panel border-2 border-dota-border rounded-2xl p-12 text-center space-y-3 shadow-2xl">
                <Shield className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="font-dota font-bold text-lg text-slate-300">
                  No Heroes Found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                  No heroes match your active search and filter criteria. Try clearing some filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedAttr('all');
                    setSelectedRole('all');
                    setSelectedAttack('all');
                    setShowFavoritesOnly(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-dota-red hover:bg-red-600 text-xs font-bold text-white transition-all shadow-dota-crimson"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* VIEW: 5v5 PREDICTIVE DRAFT ORACLE */}
        {activeTab === 'predictive' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <PredictiveDraft5v5
              onSelectHero={setSelectedHero}
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
            onClose={() => setSelectedHero(null)}
            isFavorite={favorites.includes(selectedHero.id)}
            onToggleFavorite={handleToggleFavorite}
            onOpenPip={(hero) => handleOpenPip(hero)}
            onSelectOtherHero={(id) => {
              const nextHero = HERO_MAP.get(id);
              if (nextHero) setSelectedHero(nextHero);
            }}
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
        onOpenLegalTab={(tab) => handleOpenLegalModal(tab as LegalTabType)}
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
