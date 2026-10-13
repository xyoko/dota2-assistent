import React from 'react';
import { HeroData } from '../../../entities/hero/bi/types';
import { HeroFilterBar } from '../../../features/hero-filters';
import { VirtualizedHeroGrid } from '../../../entities/hero/ui/VirtualizedHeroGrid';
import { HeroFiltersState } from '../../../features/hero-filters/model/useHeroFilters';
import { Shield } from 'lucide-react';

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
        <div className="bg-dota-panel border-2 border-dota-border rounded-2xl p-12 text-center space-y-3 shadow-2xl">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-dota font-bold text-lg text-slate-300">
            No Heroes Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
            No heroes match your active search and filter criteria. Try clearing some filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-dota-red hover:bg-red-600 text-xs font-bold text-white transition-all shadow-dota-crimson"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
});
