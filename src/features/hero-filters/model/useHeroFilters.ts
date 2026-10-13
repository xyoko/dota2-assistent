import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { HeroData, AttributeType, RoleType, AttackType } from '../../../entities/hero/bi/types';
import { HEROES_DATA } from '../../../entities/hero/bi/heroes';

/**
 * Pre-computed lowercase search index for all 127 heroes.
 * Executed once at bundle load to eliminate repeated allocations and .toLowerCase() calls during searches.
 */
interface PrecomputedHeroSearchEntry {
  hero: HeroData;
  searchTokens: string;
}

const HERO_SEARCH_INDEX: PrecomputedHeroSearchEntry[] = HEROES_DATA.map((hero) => {
  const tokens = [
    hero.name,
    hero.title,
    hero.id,
    ...hero.aliases,
    ...hero.roles,
    ...hero.build.core.map((i) => i.name),
    ...hero.counterStrategy.keyCounterItems.map((k) => k.name)
  ]
    .join(' ')
    .toLowerCase();

  return {
    hero,
    searchTokens: tokens
  };
});

export interface HeroFiltersState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAttr: AttributeType | 'all';
  setSelectedAttr: (attr: AttributeType | 'all') => void;
  selectedRole: RoleType | 'all';
  setSelectedRole: (role: RoleType | 'all') => void;
  selectedAttack: AttackType | 'all';
  setSelectedAttack: (attack: AttackType | 'all') => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (fav: boolean) => void;
  sortBy: 'winRate' | 'name' | 'complexity';
  setSortBy: (sort: 'winRate' | 'name' | 'complexity') => void;
  filteredHeroes: HeroData[];
  resetFilters: () => void;
}

/**
 * High-performance hook managing hero filtering, sorting, and debounced/deferred search
 */
export function useHeroFilters(favoritesSet: Set<string>): HeroFiltersState {
  const [searchQuery, setSearchQuery] = useState('');
  // React 18 Concurrent Deferred Value keeps typing 100% responsive and lag-free
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [selectedAttr, setSelectedAttr] = useState<AttributeType | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<RoleType | 'all'>('all');
  const [selectedAttack, setSelectedAttack] = useState<AttackType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'winRate' | 'name' | 'complexity'>('winRate');

  const resetFilters = useCallback(() => {
    setSelectedAttr('all');
    setSelectedRole('all');
    setSelectedAttack('all');
    setShowFavoritesOnly(false);
    setSearchQuery('');
  }, []);

  const filteredHeroes = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    const matchedEntries = HERO_SEARCH_INDEX.filter(({ hero, searchTokens }) => {
      // Attribute filter
      if (selectedAttr !== 'all' && hero.attribute !== selectedAttr) return false;
      // Role filter
      if (selectedRole !== 'all' && !hero.roles.includes(selectedRole)) return false;
      // Attack filter
      if (selectedAttack !== 'all' && hero.attackType !== selectedAttack) return false;
      // Favorites filter
      if (showFavoritesOnly && !favoritesSet.has(hero.id)) return false;
      // Search query using precomputed index
      if (query && !searchTokens.includes(query)) return false;

      return true;
    });

    // Extract heroes
    const list = matchedEntries.map((e) => e.hero);

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'complexity') return a.complexity - b.complexity;
      return 0;
    });

    return list;
  }, [
    deferredSearchQuery,
    selectedAttr,
    selectedRole,
    selectedAttack,
    showFavoritesOnly,
    sortBy,
    favoritesSet
  ]);

  return {
    searchQuery,
    setSearchQuery,
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
  };
}
