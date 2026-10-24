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
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-hud-surface border border-white/[0.08] flex items-center justify-center text-hud-cyan shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-100 tracking-tight uppercase">
                  Tactical Match Notes & Saved Comps
                </h2>
                <span className="font-mono text-[10px] text-slate-400 bg-hud-surface px-2 py-0.5 rounded border border-white/[0.08]">
                  LOCAL CACHE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
                Review your hero-specific match notes, bookmarked favorites, and saved draft compositions stored locally in browser storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Hero Notes */}
        <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-hud-cyan" />
              Hero Match Notes
            </h3>
            <span className="font-mono text-xs text-hud-cyan">
              {noteHeroIds.length} {noteHeroIds.length === 1 ? 'RECORD' : 'RECORDS'}
            </span>
          </div>

          {noteHeroIds.length > 0 ? (
            <div className="space-y-3">
              {noteHeroIds.map((heroId) => {
                const hero = HERO_MAP.get(heroId);
                const note = notes[heroId];
                if (!hero) return null;

                return (
                  <div
                    key={heroId}
                    className="bg-hud-surface border border-white/[0.06] rounded-xl p-3.5 space-y-2.5 shadow-hud-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => onSelectHero(hero)}
                        className="flex items-center gap-2.5 text-left min-h-[44px] group focus-hud rounded-lg p-1"
                      >
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          loading="lazy"
                          decoding="async"
                          className="w-8 h-8 rounded-lg object-cover border border-white/[0.1] shrink-0"
                        />
                        <div>
                          <span className="font-display font-semibold text-sm text-slate-200 group-hover:text-hud-cyan transition-colors block">
                            {hero.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {hero.roles.slice(0, 2).join(' / ')}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteNote(heroId)}
                        className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-target p-2 rounded-lg bg-white/[0.04] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-white/[0.06] hover:border-red-500/30 transition-colors focus-hud shrink-0"
                        title="Delete note"
                        aria-label={`Delete note for ${hero.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap bg-hud-bg p-3 rounded-lg border border-white/[0.04] leading-relaxed font-sans">
                      {note}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-sans border border-dashed border-white/[0.06] rounded-xl">
              No personal hero notes recorded yet. Select any hero in the Hero Builds view and add tactical notes in the "My Match Notes" panel.
            </div>
          )}
        </div>

        {/* Right Column: Saved Drafts & Favorites */}
        <div className="space-y-6">
          
          {/* Saved Drafts */}
          <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" />
                Saved Draft Scenarios
              </h3>
              <span className="font-mono text-xs text-slate-400">
                {drafts.length} {drafts.length === 1 ? 'SCENARIO' : 'SCENARIOS'}
              </span>
            </div>

            {drafts.length > 0 ? (
              <div className="space-y-3">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className="bg-hud-surface border border-white/[0.06] rounded-xl p-3.5 space-y-2.5 shadow-hud-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-display font-semibold text-xs sm:text-sm text-slate-200">
                        {d.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onLoadDraftScenario(d.enemyHeroIds)}
                          className="min-h-[44px] sm:min-h-0 touch-target px-3 py-1.5 rounded-lg bg-hud-cyan hover:bg-sky-300 text-slate-950 text-xs font-mono font-bold transition-colors shadow-hud-sm focus-hud"
                        >
                          LOAD IN DRAFT ➔
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(d.id)}
                          className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-target p-2 rounded-lg bg-white/[0.04] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-white/[0.06] hover:border-red-500/30 transition-colors focus-hud"
                          aria-label={`Delete draft scenario ${d.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Enemy Portraits */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {d.enemyHeroIds.map((id) => {
                        const hero = HERO_MAP.get(id);
                        if (!hero) return null;
                        return (
                          <img
                            key={id}
                            src={hero.avatarUrl}
                            alt={hero.name}
                            title={hero.name}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded-md object-cover border border-red-500/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-sans border border-dashed border-white/[0.06] rounded-xl">
                No saved drafts found. Use the "Save Scenario" button in the Draft Counter Studio.
              </div>
            )}
          </div>

          {/* Bookmarked Favorites */}
          <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-2">
                <Star className="w-4 h-4 text-hud-gold fill-hud-gold" />
                Bookmarked Roster
              </h3>
              <span className="font-mono text-xs text-hud-gold">
                {favorites.length} HEROES
              </span>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {favorites.map((heroId) => {
                  const hero = HERO_MAP.get(heroId);
                  if (!hero) return null;
                  return (
                    <div
                      key={heroId}
                      onClick={() => onSelectHero(hero)}
                      className="min-h-[44px] touch-target bg-hud-surface border border-white/[0.08] hover:border-hud-gold/50 rounded-lg p-2 flex items-center gap-2.5 cursor-pointer transition-colors focus-hud"
                    >
                      <img
                        src={hero.avatarUrl}
                        alt={hero.name}
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-md object-cover border border-white/[0.1] shrink-0"
                      />
                      <span className="font-display font-medium text-xs text-slate-200 truncate">
                        {hero.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-sans border border-dashed border-white/[0.06] rounded-xl">
                Bookmark heroes with the star button in Hero Arsenal to quickly access your priority roster.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
