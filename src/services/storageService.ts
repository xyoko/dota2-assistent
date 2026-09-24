export interface HeroNote {
  heroId: string;
  note: string;
  updatedAt: string;
}

export interface SavedDraft {
  id: string;
  title: string;
  enemyHeroIds: string[];
  notes?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  NOTES: 'dota2_assistant_hero_notes',
  FAVORITES: 'dota2_assistant_favorites',
  SAVED_DRAFTS: 'dota2_assistant_saved_drafts'
};

export const StorageService = {
  // Hero Notes
  getHeroNote(heroId: string): string {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) return '';
      const notes: Record<string, string> = JSON.parse(data);
      return notes[heroId] || '';
    } catch {
      return '';
    }
  },

  getAllHeroNotes(): Record<string, string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveHeroNote(heroId: string, note: string): void {
    try {
      const notes = this.getAllHeroNotes();
      if (!note.trim()) {
        delete notes[heroId];
      } else {
        notes[heroId] = note;
      }
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save hero note', e);
    }
  },

  // Favorites
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(heroId: string): boolean {
    try {
      const favs = this.getFavorites();
      const index = favs.indexOf(heroId);
      let isFav = false;
      if (index >= 0) {
        favs.splice(index, 1);
      } else {
        favs.push(heroId);
        isFav = true;
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
      return isFav;
    } catch {
      return false;
    }
  },

  isFavorite(heroId: string): boolean {
    const favs = this.getFavorites();
    return favs.includes(heroId);
  },

  // Saved Drafts
  getSavedDrafts(): SavedDraft[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_DRAFTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDraft(title: string, enemyHeroIds: string[], notes?: string): SavedDraft {
    const newDraft: SavedDraft = {
      id: Date.now().toString(),
      title: title || `Draft vs ${enemyHeroIds.length} Heroes`,
      enemyHeroIds,
      notes,
      createdAt: new Date().toISOString()
    };
    try {
      const drafts = this.getSavedDrafts();
      drafts.unshift(newDraft);
      localStorage.setItem(STORAGE_KEYS.SAVED_DRAFTS, JSON.stringify(drafts.slice(0, 30)));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
    return newDraft;
  },

  deleteDraft(draftId: string): void {
    try {
      const drafts = this.getSavedDrafts().filter((d) => d.id !== draftId);
      localStorage.setItem(STORAGE_KEYS.SAVED_DRAFTS, JSON.stringify(drafts));
    } catch (e) {
      console.error('Failed to delete draft', e);
    }
  }
};
