import { useState, useMemo, useCallback } from 'react';
import { StorageService } from '../../../shared/bi';

/**
 * Hook for managing favorited hero IDs with local storage persistence
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = useCallback((heroId: string) => {
    StorageService.toggleFavorite(heroId);
    setFavorites(StorageService.getFavorites());
  }, []);

  const isFavorite = useCallback((heroId: string) => favoritesSet.has(heroId), [favoritesSet]);

  return {
    favorites,
    favoritesSet,
    toggleFavorite,
    isFavorite
  };
}
