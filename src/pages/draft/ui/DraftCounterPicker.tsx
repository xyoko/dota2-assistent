import React, { useState, useEffect, useMemo } from 'react';
import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData, AttributeType } from '../../../entities/hero/bi/types';
import { analyzeDraft } from '../../../features/predictive-draft/bi/draftEngine';
import { StorageService } from '../../../shared/bi/storage/storageService';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  Crosshair, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  Save, 
  Check, 
  Search, 
  CheckCircle2, 
  ChevronRight,
  X
} from 'lucide-react';

interface DraftCounterPickerProps {
  onSelectHero: (hero: HeroData) => void;
  initialEnemyHeroIds?: string[] | null;
}

export const DraftCounterPicker: React.FC<DraftCounterPickerProps> = ({ 
  onSelectHero,
  initialEnemyHeroIds 
}) => {
  const [enemyHeroIds, setEnemyHeroIds] = useState<string[]>(['phantom_assassin', 'storm_spirit']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);

  // Modal for clicking draft slot box with '+'
  const [activeSlotTarget, setActiveSlotTarget] = useState<number | null>(null);
  const [slotPickerSearch, setSlotPickerSearch] = useState<string>('');
  const [slotPickerAttr, setSlotPickerAttr] = useState<AttributeType | 'all'>('all');

  useEffect(() => {
    if (initialEnemyHeroIds && initialEnemyHeroIds.length > 0) {
      setEnemyHeroIds(initialEnemyHeroIds);
    }
  }, [initialEnemyHeroIds]);

  const analysis = analyzeDraft(enemyHeroIds);

  const handleOpenSlotModal = (slotIndex: number) => {
    setActiveSlotTarget(slotIndex);
    setSlotPickerSearch('');
    setSlotPickerAttr('all');
    SoundEngine.playHover();
  };

  const handleAssignHeroToSlot = (heroId: string, slotIndex: number) => {
    const next = [...enemyHeroIds];
    const existingIndex = next.indexOf(heroId);

    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      // Swap or reposition
      if (slotIndex < next.length) {
        next[existingIndex] = next[slotIndex];
        next[slotIndex] = heroId;
      } else {
        next.splice(existingIndex, 1);
        next.push(heroId);
      }
    } else {
      if (slotIndex < next.length) {
        next[slotIndex] = heroId;
      } else {
        next.push(heroId);
      }
    }

    setEnemyHeroIds(next);
    setActiveSlotTarget(null);
    setSlotPickerSearch('');
    SoundEngine.playPick();
  };

  const handleAddEnemy = (heroId: string) => {
    if (enemyHeroIds.includes(heroId)) return;
    if (enemyHeroIds.length >= 5) return;
    setEnemyHeroIds([...enemyHeroIds, heroId]);
    SoundEngine.playPick();
  };

  const handleRemoveEnemy = (heroId: string) => {
    setEnemyHeroIds(enemyHeroIds.filter((id) => id !== heroId));
    SoundEngine.playHover();
  };

  const handleClearDraft = () => {
    setEnemyHeroIds([]);
    SoundEngine.playHover();
  };

  const handleSaveDraft = () => {
    if (enemyHeroIds.length === 0) return;
    StorageService.saveDraft(draftTitle || `Draft vs ${enemyHeroIds.length} Heroes`, enemyHeroIds);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const availableHeroes = HEROES_DATA.filter((h) => 
    !enemyHeroIds.includes(h.id) &&
    (h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     h.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredModalHeroes = useMemo(() => {
    return HEROES_DATA.filter((h) => {
      if (slotPickerAttr !== 'all' && h.attribute !== slotPickerAttr) {
        return false;
      }
      if (slotPickerSearch.trim()) {
        const q = slotPickerSearch.toLowerCase().trim();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchesAlias = h.aliases.some((a) => a.toLowerCase().includes(q));
        const matchesRole = h.roles.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesAlias && !matchesRole) return false;
      }
      return true;
    });
  }, [slotPickerSearch, slotPickerAttr]);

  const filteredRecommendedHeroes = selectedRoleFilter === 'all'
    ? analysis.recommendedHeroes
    : analysis.recommendedHeroes.filter((r) => {
        const hero = HERO_MAP.get(r.heroId);
        return hero?.roles.some((role) => role.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
      });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-dota-panel to-slate-900 border border-dota-red/50 rounded-2xl p-5 sm:p-6 shadow-dota-crimson">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-6 h-6 text-red-400" />
              <h2 className="font-dota font-black text-xl sm:text-2xl text-white">
                Draft Analysis & Counter Assistant
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Select up to 5 enemy heroes. Aegis Forge calculates the collective threat profile, essential counter items, enemy vulnerabilities, and optimal counter-picks for each role.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Scenario Name (Optional)..."
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="px-3 py-1.5 bg-dota-bg/80 border border-dota-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 w-44"
            />
            {enemyHeroIds.length > 0 && (
              <>
                <button
                  onClick={handleClearDraft}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all border border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-dota-red hover:bg-red-600 text-xs font-bold text-white transition-all shadow-dota-crimson"
                >
                  {draftSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{draftSaved ? 'Saved!' : 'Save Scenario'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 5 Enemy Draft Slots with Onclick Select/Search Hero */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[0, 1, 2, 3, 4].map((index) => {
            const heroId = enemyHeroIds[index];
            const hero = heroId ? HERO_MAP.get(heroId) : null;

            return (
              <div
                key={index}
                onClick={() => handleOpenSlotModal(index)}
                className={`group relative h-32 rounded-xl border flex flex-col items-center justify-between p-2.5 text-center transition-all cursor-pointer select-none ${
                  hero
                    ? 'bg-red-950/40 border-red-500/70 shadow-dota-crimson hover:border-red-400 hover:scale-[1.02]'
                    : 'bg-dota-bg/60 border-dashed border-slate-700 hover:border-red-500 hover:bg-red-500/10 hover:shadow-dota-crimson text-slate-500'
                }`}
                title={hero ? `${hero.name} (Enemy #${index + 1}) - Click to change hero` : `Enemy #${index + 1} - Click to search and select hero`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">
                    Enemy #{index + 1}
                  </span>
                  {hero && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEnemy(hero.id);
                      }}
                      className="p-1 rounded-full bg-black/70 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                      title="Remove hero"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {hero ? (
                  <>
                    <img
                      src={hero.avatarUrl}
                      alt={hero.name}
                      className="w-12 h-12 rounded-lg object-cover border border-red-500/60 shadow group-hover:scale-105 transition-transform"
                    />
                    <div className="w-full">
                      <span className="font-bold text-xs text-white truncate block">
                        {hero.name}
                      </span>
                      <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to change
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 gap-1.5 py-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-red-500 group-hover:bg-red-500/20 flex items-center justify-center transition-all group-hover:scale-110 shadow">
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-red-300 transition-colors block">
                        Add Enemy
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                        Click to search
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Hero Selection Pool (Quick Add) */}
      <div className="bg-dota-panel border border-dota-border rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
              Add Enemy Pick:
            </h3>
            <span className="text-xs text-slate-500">
              ({enemyHeroIds.length}/5 Selected)
            </span>
            <button
              onClick={() => handleOpenSlotModal(enemyHeroIds.length < 5 ? enemyHeroIds.length : 0)}
              className="ml-2 px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800/80 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-red-400" />
              <span>Search Modal</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hero to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-dota-bg border border-dota-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Hero Pool Grid */}
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
          {availableHeroes.map((hero) => (
            <button
              key={hero.id}
              onClick={() => handleAddEnemy(hero.id)}
              disabled={enemyHeroIds.length >= 5}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                enemyHeroIds.length >= 5
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800'
                  : 'bg-dota-panelAlt hover:bg-red-950/60 border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-white'
              }`}
            >
              <img
                src={hero.avatarUrl}
                alt={hero.name}
                className="w-5 h-5 rounded object-cover"
              />
              <span>{hero.name}</span>
              <Plus className="w-3 h-3 text-red-400 ml-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results Display (Only if at least 1 hero picked) */}
      {enemyHeroIds.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Counter Items & Top Counter Heroes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* MUST HAVE COUNTER ITEMS */}
            <div className="bg-dota-panel border border-dota-gold/40 rounded-xl p-5 shadow-dota-glow">
              <div className="flex items-center justify-between mb-4 border-b border-dota-gold/30 pb-2.5">
                <h3 className="font-dota font-bold text-base text-dota-gold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-dota-gold" />
                  Essential Counter Items Needed
                </h3>
                <span className="text-xs text-amber-300 font-semibold">Team Itemization Blueprint</span>
              </div>

              {analysis.mustHaveItems.length > 0 ? (
                <div className="space-y-3">
                  {analysis.mustHaveItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-dota-bg/90 border border-dota-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-amber-200">{item.item}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            item.priority === 'CRITICAL'
                              ? 'bg-red-950 text-red-400 border-red-700'
                              : 'bg-amber-950 text-amber-400 border-amber-700'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="text-xs font-bold text-dota-gold">{item.cost}g</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.reason}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Target Enemies:</strong> {item.targets.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Add more enemy heroes to reveal key counter item priorities.</p>
              )}
            </div>

            {/* TOP RECOMMENDED COUNTER HEROES */}
            <div className="bg-dota-panel border border-dota-border rounded-xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-dota-border pb-3">
                <div>
                  <h3 className="font-dota font-bold text-base text-white flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-red-400" />
                    Top Recommended Counter Heroes
                  </h3>
                  <p className="text-xs text-slate-400">Ranked by tactical advantage & matchup synergy</p>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-1 bg-dota-bg p-1 rounded-lg border border-dota-border text-xs">
                  {(['all', 'Carry', 'Mid', 'Offlane', 'Support'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoleFilter(r)}
                      className={`px-2 py-1 rounded font-medium transition-all ${
                        selectedRoleFilter === r
                          ? 'bg-dota-red text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r === 'all' ? 'All' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Heroes List */}
              <div className="space-y-3">
                {filteredRecommendedHeroes.map((rec) => {
                  const hero = HERO_MAP.get(rec.heroId);
                  if (!hero) return null;

                  return (
                    <div
                      key={rec.heroId}
                      onClick={() => onSelectHero(hero)}
                      className="group bg-dota-bg/80 hover:bg-slate-800/90 border border-dota-border hover:border-dota-gold/60 rounded-xl p-3.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 group-hover:border-dota-gold transition-colors flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-dota font-bold text-sm text-white group-hover:text-dota-gold transition-colors">
                              {hero.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {rec.role}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              {rec.score}% Counter Rating
                            </span>
                          </div>

                          {/* Reasons list */}
                          <div className="mt-1.5 space-y-0.5">
                            {rec.reasons.map((reason, i) => (
                              <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-tight">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button className="flex items-center gap-1 text-xs font-bold text-dota-gold group-hover:translate-x-1 transition-transform">
                          <span>View Guide</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Right Column: Threat Profile & Identified Weaknesses */}
          <div className="space-y-6">
            
            {/* Enemy Threat Breakdown Radar */}
            <div className="bg-dota-panel border border-dota-border rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="font-dota font-bold text-base text-slate-200 flex items-center gap-2 border-b border-dota-border pb-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Enemy Threat Breakdown
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Magic Burst</span>
                    <span className="text-blue-400">{analysis.threatScores.magicDamage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.threatScores.magicDamage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Physical Damage</span>
                    <span className="text-red-400">{analysis.threatScores.physicalDamage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.threatScores.physicalDamage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Crowd Control & Stuns</span>
                    <span className="text-amber-400">{analysis.threatScores.crowdControl}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.threatScores.crowdControl}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Mobility & Elusiveness</span>
                    <span className="text-cyan-400">{analysis.threatScores.mobility}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.threatScores.mobility}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Healing & Sustain</span>
                    <span className="text-emerald-400">{analysis.threatScores.healingSustain}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.threatScores.healingSustain}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Identified Enemy Weaknesses */}
            <div className="bg-dota-panel border border-dota-border rounded-xl p-5 shadow-xl space-y-3">
              <h3 className="font-dota font-bold text-base text-emerald-300 flex items-center gap-2 border-b border-dota-border pb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Exploitable Enemy Weaknesses
              </h3>

              <div className="space-y-2">
                {analysis.keyWeaknesses.map((w, idx) => (
                  <div key={idx} className="bg-dota-bg/80 border border-emerald-900/30 rounded-lg p-2.5 text-xs text-slate-300 leading-snug">
                    • {w}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-dota-panel border border-dota-border rounded-xl p-12 text-center space-y-3">
          <Crosshair className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-dota font-bold text-lg text-slate-300">
            No Enemy Heroes Selected
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click on any hero in the quick pool above to begin analyzing enemy draft counters, itemization recommendations, and team vulnerabilities.
          </p>
        </div>
      )}

      {/* ONCLICK HERO SEARCH & SELECTION MODAL (JUST LIKE IN BUILD LAB) */}
      {activeSlotTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-red-500/70 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-b border-red-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crosshair className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-dota font-bold text-base text-white flex items-center gap-2">
                    <span>Select Hero for Enemy #{activeSlotTarget + 1}</span>
                    {enemyHeroIds[activeSlotTarget] && (
                      <span className="text-xs font-sans px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        Replacing: {HERO_MAP.get(enemyHeroIds[activeSlotTarget])?.name}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search by hero name, alias, or role to assign into this draft slot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filter Controls: Search Bar + Attribute Filters */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search heroes by name, title, alias, or role (e.g. Anti-Mage, Magina, Carry, Stun)..."
                  value={slotPickerSearch}
                  onChange={(e) => setSlotPickerSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 shadow-inner"
                />
                {slotPickerSearch && (
                  <button
                    onClick={() => setSlotPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Attribute Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Heroes' },
                  { id: 'str', label: 'Strength' },
                  { id: 'agi', label: 'Agility' },
                  { id: 'int', label: 'Intelligence' },
                  { id: 'all_attr', label: 'Universal' },
                ].map((attr) => (
                  <button
                    key={attr.id}
                    onClick={() => setSlotPickerAttr(attr.id === 'all_attr' ? 'all' : attr.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      (slotPickerAttr === attr.id || (attr.id === 'all_attr' && slotPickerAttr === 'all'))
                        ? 'bg-dota-red text-white font-black shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Heroes Grid */}
            <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredModalHeroes.length > 0 ? (
                filteredModalHeroes.map((h) => {
                  const isCurrentSlotHero = enemyHeroIds[activeSlotTarget] === h.id;
                  const isOtherSlotHero = enemyHeroIds.includes(h.id) && !isCurrentSlotHero;

                  return (
                    <div
                      key={h.id}
                      onClick={() => handleAssignHeroToSlot(h.id, activeSlotTarget)}
                      className={`group bg-dota-bg/90 hover:bg-slate-850 border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01] shadow ${
                        isCurrentSlotHero
                          ? 'border-red-500 bg-red-950/30'
                          : isOtherSlotHero
                          ? 'border-slate-800 hover:border-amber-500'
                          : 'border-slate-800 hover:border-red-500/70'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 group-hover:border-red-500 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-red-300 truncate">
                            {h.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">
                            {h.attribute}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 truncate">
                            {h.roles.slice(0, 2).join(', ')}
                          </span>
                        </div>
                        {isOtherSlotHero && (
                          <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                            Swap from other slot
                          </span>
                        )}
                        {isCurrentSlotHero && (
                          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                            Currently assigned
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Pick ➔
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-slate-500">
                  No heroes match your search.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Clicking a hero assigns them directly to Enemy Slot #{activeSlotTarget + 1}.</span>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
