import React from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { HeroFilterBar } from '../../../features/hero-filters';
import { VirtualizedHeroGrid } from '../../../entities/hero/ui/VirtualizedHeroGrid';
import { HeroFiltersState } from '../../../features/hero-filters/model/useHeroFilters';
import { Crown } from 'lucide-react';

interface HeroesArsenalViewProps {
  filters: HeroFiltersState;
  favoritesSet: Set<string>;
  onToggleFavorite: (heroId: string) => void;
  onSelectHero: (hero: HeroData) => void;
  onOpenPip?: (hero: HeroData) => void;
}

export const HeroesArsenalView: React.FC<HeroesArsenalViewProps> = React.memo(({
  filters,
  favoritesSet,
  onToggleFavorite,
  onSelectHero,
  onOpenPip
}) => {
  const {
    selectedAttr,
    setSelectedAttr,
    selectedRole,
    setSelectedRole,
    selectedAttack,
    setSelectedAttack,
    showFavoritesOnly,
    setShowFavoritesOnly,
    sortBy,
    setSortBy,
    filteredHeroes,
    resetFilters
  } = filters;

  return (
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

      {/* Heroes Grid — Virtualized High-Density 16:10 Grid */}
      {filteredHeroes.length > 0 ? (
        <VirtualizedHeroGrid
          heroes={filteredHeroes}
          favoritesSet={favoritesSet}
          onToggleFavorite={onToggleFavorite}
          onSelectHero={onSelectHero}
          onOpenPip={onOpenPip}
        />
      ) : (
        <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-12 text-center space-y-3 shadow-hud-sm">
          <Crown className="w-10 h-10 text-hud-gold mx-auto" />
          <h3 className="font-display font-semibold text-base text-slate-200">
            No Heroes Found
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
            No heroes match your active search and filter criteria. Try clearing some filters.
          </p>
          <button
            onClick={resetFilters}
            className="min-h-[44px] touch-target px-4 py-2 rounded-lg bg-hud-surface hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-hud-cyan transition-colors focus-hud"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
});
