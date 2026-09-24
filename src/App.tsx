import React, { useState, useMemo, Suspense, lazy } from 'react';
import { HEROES_DATA, HERO_MAP } from './data/heroes';
import { HeroData, AttributeType, RoleType, AttackType } from './types/hero';
import { StorageService } from './services/storageService';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroFilterBar } from './components/HeroFilterBar';
import { HeroCard } from './components/HeroCard';
import { AmbientParticles } from './components/AmbientParticles';
import { Shield, Loader2 } from 'lucide-react';

// Lazy-loaded heavy views for sub-100ms instant initial page load
const DraftCounterPicker = lazy(() => import('./components/DraftCounterPicker').then(m => ({ default: m.DraftCounterPicker })));
const MatchupArena = lazy(() => import('./components/MatchupArena').then(m => ({ default: m.MatchupArena })));
const BuildSandbox = lazy(() => import('./components/BuildSandbox').then(m => ({ default: m.BuildSandbox })));
const HeroItemInteractions = lazy(() => import('./components/HeroItemInteractions').then(m => ({ default: m.HeroItemInteractions })));
const ItemCounterFinder = lazy(() => import('./components/ItemCounterFinder').then(m => ({ default: m.ItemCounterFinder })));
const MetaTierList = lazy(() => import('./components/MetaTierList').then(m => ({ default: m.MetaTierList })));
const PatchNewsView = lazy(() => import('./components/PatchNewsView').then(m => ({ default: m.PatchNewsView })));
const CustomNotesView = lazy(() => import('./components/CustomNotesView').then(m => ({ default: m.CustomNotesView })));
const HeroBuildView = lazy(() => import('./components/HeroBuildView').then(m => ({ default: m.HeroBuildView })));

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('heroes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hero filters
  const [selectedAttr, setSelectedAttr] = useState<AttributeType | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<RoleType | 'all'>('all');
  const [selectedAttack, setSelectedAttack] = useState<AttackType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'winRate' | 'name' | 'complexity'>('winRate');

  // Selected Hero for Detail Modal
  const [selectedHero, setSelectedHero] = useState<HeroData | null>(null);
  
  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());

  // Loaded draft scenario to pass to Draft Picker
  const [loadedEnemyDraft, setLoadedEnemyDraft] = useState<string[] | null>(null);

  const handleToggleFavorite = (heroId: string) => {
    StorageService.toggleFavorite(heroId);
    setFavorites(StorageService.getFavorites());
  };

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
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: HERO BUILDS & GUIDE */}
        {activeTab === 'heroes' && (
          <div className="space-y-6">
            
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

            {/* Heroes Grid */}
            {filteredHeroes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredHeroes.map((hero) => (
                  <HeroCard
                    key={hero.id}
                    hero={hero}
                    isFavorite={favorites.includes(hero.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectHero={setSelectedHero}
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
            onSelectOtherHero={(id) => {
              const nextHero = HERO_MAP.get(id);
              if (nextHero) setSelectedHero(nextHero);
            }}
          />
        </Suspense>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-dota-panel/95 border-t-2 border-dota-border py-8 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-bold font-dota text-sm">
            <span className="text-dota-gold">AEGIS FORGE</span> • Dota 2 Build & Counter Assistant
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Optimized for Patch 7.37d • Fast, Zero-Config Cloudflare Pages Hosting • 100% Client-Side Offline Ready
          </p>
          <p className="text-[10px] text-slate-600">
            Dota 2 is a registered trademark of Valve Corporation. This assistant is an unofficial tactical companion tool.
          </p>
        </div>
      </footer>

    </div>
  );
};
