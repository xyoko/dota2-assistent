import React, { useState, useEffect } from 'react';
import { StorageService, SavedDraft } from '../../../shared/bi/storage/storageService';
import { HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData } from '../../../entities/hero/bi/types';
import { BookOpen, Star, Trash2, Crosshair, Edit3 } from 'lucide-react';

interface CustomNotesViewProps {
  onSelectHero: (hero: HeroData) => void;
  onLoadDraftScenario: (enemyHeroIds: string[]) => void;
}

export const CustomNotesView: React.FC<CustomNotesViewProps> = ({
  onSelectHero,
  onLoadDraftScenario
}) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);

  useEffect(() => {
    setNotes(StorageService.getAllHeroNotes());
    setFavorites(StorageService.getFavorites());
    setDrafts(StorageService.getSavedDrafts());
  }, []);

  const handleDeleteNote = (heroId: string) => {
    StorageService.saveHeroNote(heroId, '');
    setNotes(StorageService.getAllHeroNotes());
  };

  const handleDeleteDraft = (draftId: string) => {
    StorageService.deleteDraft(draftId);
    setDrafts(StorageService.getSavedDrafts());
  };

  const noteHeroIds = Object.keys(notes);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/80 via-dota-panel to-slate-900 border border-dota-uni/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-dota-uni" />
          <h2 className="font-dota font-black text-xl sm:text-2xl text-white">
            My Match Notes & Saved Drafts
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Review your personal build notes, favorite heroes, and saved draft compositions stored in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Hero Notes */}
        <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-dota font-bold text-base text-purple-300 flex items-center gap-2 border-b border-dota-border pb-2.5">
            <Edit3 className="w-4 h-4 text-purple-400" />
            Hero Match Notes ({noteHeroIds.length})
          </h3>

          {noteHeroIds.length > 0 ? (
            <div className="space-y-3">
              {noteHeroIds.map((heroId) => {
                const hero = HERO_MAP.get(heroId);
                const note = notes[heroId];
                if (!hero) return null;

                return (
                  <div
                    key={heroId}
                    className="bg-dota-bg border border-dota-border rounded-xl p-3.5 space-y-2 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => onSelectHero(hero)}
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          className="w-8 h-8 rounded-lg object-cover border border-purple-500/50"
                        />
                        <span className="font-dota font-bold text-sm text-white hover:text-purple-300">
                          {hero.name}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteNote(heroId)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap bg-dota-panel p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
                      {note}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No personal hero notes yet. Click on any hero in the Hero Builds tab and write notes in the "My Match Notes" tab.
            </div>
          )}
        </div>

        {/* Right Column: Saved Drafts & Favorites */}
        <div className="space-y-6">
          
          {/* Saved Drafts */}
          <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-dota font-bold text-base text-red-300 flex items-center gap-2 border-b border-dota-border pb-2.5">
              <Crosshair className="w-4 h-4 text-red-400" />
              Saved Draft Scenarios ({drafts.length})
            </h3>

            {drafts.length > 0 ? (
              <div className="space-y-3">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className="bg-dota-bg border border-dota-border rounded-xl p-3.5 space-y-2 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-white">
                        {d.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onLoadDraftScenario(d.enemyHeroIds)}
                          className="px-2.5 py-1 rounded bg-dota-red hover:bg-red-600 text-white text-xs font-bold transition-all shadow"
                        >
                          Load in Draft Tool
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(d.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Enemy Portraits */}
                    <div className="flex items-center gap-2 pt-1">
                      {d.enemyHeroIds.map((id) => {
                        const hero = HERO_MAP.get(id);
                        if (!hero) return null;
                        return (
                          <img
                            key={id}
                            src={hero.avatarUrl}
                            alt={hero.name}
                            title={hero.name}
                            className="w-7 h-7 rounded object-cover border border-red-500/40"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No saved drafts. Use the "Save Scenario" button in the Draft & Counters tab.
              </div>
            )}
          </div>

          {/* Bookmarked Favorites */}
          <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-dota font-bold text-base text-amber-300 flex items-center gap-2 border-b border-dota-border pb-2.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Favorite Heroes ({favorites.length})
            </h3>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {favorites.map((heroId) => {
                  const hero = HERO_MAP.get(heroId);
                  if (!hero) return null;
                  return (
                    <div
                      key={heroId}
                      onClick={() => onSelectHero(hero)}
                      className="bg-dota-bg border border-amber-500/30 hover:border-amber-400 rounded-xl p-2 flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-800"
                    >
                      <img
                        src={hero.avatarUrl}
                        alt={hero.name}
                        className="w-8 h-8 rounded-lg object-cover border border-amber-500/40"
                      />
                      <span className="font-bold text-xs text-slate-200 truncate">
                        {hero.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Star heroes to quickly access them in your favorites list.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
