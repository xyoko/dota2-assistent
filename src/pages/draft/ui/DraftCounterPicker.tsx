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
      
      {/* Top Tactical Command Header */}
      <div className="bg-hud-surface border border-white/[0.10] rounded-xl p-4 sm:p-5 shadow-hud-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 uppercase tracking-wider">
                DIRE ENEMY TARGETS
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">COUNTER MATRIX</span>
            </div>
            <h2 className="font-dota font-bold text-lg sm:text-xl text-white">
              Draft Analysis & Counter Blueprint
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl font-sans leading-relaxed">
              Assign up to 5 opponent heroes. AegisForge calculates collective damage profiles, critical itemization timings, and optimal counter-picks for each position.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Scenario name..."
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="h-9 px-3 bg-hud-raised border border-white/[0.12] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 w-44 transition-colors"
            />
            {enemyHeroIds.length > 0 && (
              <>
                <button
                  onClick={handleClearDraft}
                  className="h-9 flex items-center gap-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-xs font-medium text-slate-300 transition-colors border border-white/[0.08] active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="h-9 flex items-center gap-1.5 px-3.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-slate-950 transition-colors active:scale-[0.98]"
                >
                  {draftSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{draftSaved ? 'Saved' : 'Save'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 5 Enemy Draft Slots (Dire Tactical Roster) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {[0, 1, 2, 3, 4].map((index) => {
            const heroId = enemyHeroIds[index];
            const hero = heroId ? HERO_MAP.get(heroId) : null;

            return (
              <div
                key={index}
                onClick={() => handleOpenSlotModal(index)}
                className={`group relative h-28 rounded-lg border flex flex-col items-center justify-between p-2 text-center transition-colors cursor-pointer select-none ${
                  hero
                    ? 'bg-red-950/20 border-red-500/50 hover:border-red-400'
                    : 'bg-hud-surface/40 border-dashed border-white/[0.14] hover:border-red-500/60 hover:bg-red-950/10 text-slate-400'
                }`}
                title={hero ? `${hero.name} (Enemy #${index + 1}) - Click to change` : `Enemy #${index + 1} - Click to select hero`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[11px] text-red-400/90 font-mono font-bold uppercase tracking-wider">
                    Enemy 0{index + 1}
                  </span>
                  {hero && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEnemy(hero.id);
                      }}
                      className="p-1 rounded bg-black/60 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
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
                      decoding="async"
                      className="w-11 h-11 rounded object-cover border border-red-500/50 shadow-sm"
                    />
                    <div className="w-full">
                      <span className="font-medium text-xs text-slate-100 truncate block">
                        {hero.name}
                      </span>
                      <span className="text-[11px] text-red-300/80 font-mono">
                        {hero.attribute.toUpperCase()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 gap-1 py-1">
                    <div className="w-8 h-8 rounded-md bg-hud-raised border border-white/[0.08] group-hover:border-red-500/60 group-hover:bg-red-950/30 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                      + Add Enemy
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Hero Selection Pool (Quick Add) */}
      <div className="bg-hud-surface border border-white/[0.10] rounded-xl p-3.5 shadow-hud-card space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-bold text-xs text-slate-200 uppercase tracking-wider">
              Quick Pick:
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({enemyHeroIds.length}/5)
            </span>
            <button
              onClick={() => handleOpenSlotModal(enemyHeroIds.length < 5 ? enemyHeroIds.length : 0)}
              className="ml-2 px-2.5 py-1 rounded bg-hud-raised hover:bg-hud-elevated border border-white/[0.12] text-xs font-medium text-sky-400 flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse All 124</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-hud-raised border border-white/[0.10] rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>
        </div>

        {/* Hero Pool Grid */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-0.5 custom-scrollbar">
          {availableHeroes.map((hero) => (
            <button
              key={hero.id}
              onClick={() => handleAddEnemy(hero.id)}
              disabled={enemyHeroIds.length >= 5}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium transition-colors ${
                enemyHeroIds.length >= 5
                  ? 'opacity-40 cursor-not-allowed bg-hud-surface border-white/[0.04]'
                  : 'bg-hud-raised hover:bg-red-950/30 border-white/[0.08] hover:border-red-500/50 text-slate-300 hover:text-white'
              }`}
            >
              <img
                src={hero.avatarUrl}
                alt={hero.name}
                loading="lazy"
                decoding="async"
                className="w-4 h-4 rounded object-cover"
              />
              <span className="truncate max-w-[100px]">{hero.name}</span>
              <Plus className="w-3 h-3 text-red-400/80 ml-0.5" />
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
            <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
                <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text-secondary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Essential Counter Items
                </h3>
                <span className="text-[11px] font-mono text-amber-400/90 uppercase tracking-wide">Itemization Blueprint</span>
              </div>

              {analysis.mustHaveItems.length > 0 ? (
                <div className="space-y-2.5">
                  {analysis.mustHaveItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-hud-bg/70 border border-white/[0.06] hover:border-amber-500/30 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-hud-text">{item.item}</span>
                          <span className={`text-[11px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            item.priority === 'CRITICAL'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30 font-semibold'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="font-mono text-xs font-semibold text-amber-400 tabular-nums">{item.cost}g</span>
                        </div>
                        <p className="text-xs text-hud-text-muted leading-relaxed">
                          {item.reason}
                        </p>
                        <div className="text-[11px] text-hud-text-muted">
                          <span className="text-hud-text-secondary font-medium">Targets:</span> {item.targets.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-hud-text-muted py-2">Add more enemy heroes to reveal key counter item priorities.</p>
              )}
            </div>

            {/* TOP RECOMMENDED COUNTER HEROES */}
            <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text-secondary flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-hud-accent" />
                    Recommended Counter Heroes
                  </h3>
                  <p className="text-xs text-hud-text-muted mt-0.5">Ranked by tactical advantage & matchup synergy</p>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-0.5 bg-hud-bg p-0.5 rounded-md border border-white/[0.08] text-xs">
                  {(['all', 'Carry', 'Mid', 'Offlane', 'Support'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoleFilter(r)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        selectedRoleFilter === r
                          ? 'bg-hud-surface-raised text-hud-text font-medium shadow-sm'
                          : 'text-hud-text-muted hover:text-hud-text'
                      }`}
                    >
                      {r === 'all' ? 'All' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Heroes List */}
              <div className="space-y-2.5">
                {filteredRecommendedHeroes.map((rec) => {
                  const hero = HERO_MAP.get(rec.heroId);
                  if (!hero) return null;

                  return (
                    <div
                      key={rec.heroId}
                      onClick={() => onSelectHero(hero)}
                      className="group bg-hud-bg/70 hover:bg-hud-surface-raised border border-white/[0.06] hover:border-hud-accent/40 rounded-md p-3 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={hero.avatarUrl}
                          alt={hero.name}
                          loading="lazy"
                          decoding="async"
                          className="w-11 h-11 rounded object-cover border border-white/[0.1] group-hover:border-hud-accent/70 transition-colors flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-hud-text group-hover:text-hud-accent transition-colors">
                              {hero.name}
                            </span>
                            <span className="font-mono text-[11px] uppercase px-1.5 py-0.5 rounded-sm bg-hud-surface text-hud-text-muted border border-white/[0.08]">
                              {rec.role}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 tabular-nums">
                              {rec.score}% Rating
                            </span>
                          </div>

                          {/* Reasons list */}
                          <div className="mt-1.5 space-y-0.5">
                            {rec.reasons.map((reason, i) => (
                              <p key={i} className="text-xs text-hud-text-muted flex items-start gap-1.5 leading-tight">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button className="flex items-center gap-1 text-xs font-mono text-hud-accent group-hover:translate-x-0.5 transition-transform touch-target">
                          <span>View Guide</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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
            
            {/* Enemy Threat Breakdown */}
            <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-4 sm:p-5 space-y-4">
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text-secondary flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Enemy Threat Breakdown
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Magic Burst', value: analysis.threatScores.magicDamage, color: 'bg-cyan-500', text: 'text-cyan-400' },
                  { label: 'Physical Damage', value: analysis.threatScores.physicalDamage, color: 'bg-red-500', text: 'text-red-400' },
                  { label: 'Crowd Control', value: analysis.threatScores.crowdControl, color: 'bg-amber-500', text: 'text-amber-400' },
                  { label: 'Mobility', value: analysis.threatScores.mobility, color: 'bg-sky-400', text: 'text-sky-300' },
                  { label: 'Sustain & Healing', value: analysis.threatScores.healingSustain, color: 'bg-emerald-500', text: 'text-emerald-400' },
                ].map((threat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-hud-text-muted">{threat.label}</span>
                      <span className={`font-mono font-medium tabular-nums ${threat.text}`}>{threat.value}%</span>
                    </div>
                    <div className="w-full bg-hud-bg rounded-sm h-1.5 overflow-hidden border border-white/[0.06] relative">
                      <div
                        className={`${threat.color} absolute inset-y-0 left-0 w-full rounded-sm origin-left transition-transform duration-200 ease-out`}
                        style={{ transform: `scaleX(${Math.max(0, Math.min(100, threat.value)) / 100})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Enemy Weaknesses */}
            <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-4 sm:p-5 space-y-3">
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text-secondary flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Zap className="w-4 h-4 text-emerald-400" />
                Exploitable Weaknesses
              </h3>

              <div className="space-y-2">
                {analysis.keyWeaknesses.map((w, idx) => (
                  <div key={idx} className="bg-hud-bg/60 border border-emerald-500/20 rounded-md p-2.5 text-xs text-hud-text-secondary leading-snug">
                    • {w}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-12 text-center space-y-3">
          <Crosshair className="w-10 h-10 text-hud-text-muted/40 mx-auto" />
          <h3 className="font-semibold text-sm text-hud-text">
            No Enemy Heroes Selected
          </h3>
          <p className="text-xs text-hud-text-muted max-w-md mx-auto">
            Click on any hero in the quick pool above or click a draft slot to analyze enemy counters, team itemization, and vulnerabilities.
          </p>
        </div>
      )}

      {/* ONCLICK HERO SEARCH & SELECTION MODAL */}
      {activeSlotTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
          <div className="bg-hud-surface border border-white/[0.14] rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-hud-surface-raised border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crosshair className="w-4 h-4 text-red-400" />
                <div>
                  <h3 className="font-semibold text-sm text-hud-text flex items-center gap-2">
                    <span>Select Enemy #{activeSlotTarget + 1}</span>
                    {enemyHeroIds[activeSlotTarget] && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm bg-red-500/10 text-red-400 border border-red-500/30">
                        Replacing: {HERO_MAP.get(enemyHeroIds[activeSlotTarget])?.name}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-hud-text-muted">
                    Assign a hero into this enemy draft position
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="p-1.5 rounded-md hover:bg-white/[0.08] text-hud-text-muted hover:text-hud-text transition-colors touch-target"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Filter Controls: Search Bar + Attribute Filters */}
            <div className="p-4 bg-hud-surface border-b border-white/[0.08] space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hud-text-muted" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by name, role, or alias..."
                  value={slotPickerSearch}
                  onChange={(e) => setSlotPickerSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-hud-bg border border-white/[0.1] rounded-md text-xs sm:text-sm text-hud-text placeholder-hud-text-muted focus-hud"
                />
                {slotPickerSearch && (
                  <button
                    onClick={() => setSlotPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-hud-text-muted hover:text-hud-text text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Attribute Filter Pills */}
              <div className="flex flex-wrap gap-1">
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
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      (slotPickerAttr === attr.id || (attr.id === 'all_attr' && slotPickerAttr === 'all'))
                        ? 'bg-hud-surface-raised text-hud-text font-medium border border-white/[0.12]'
                        : 'text-hud-text-muted hover:text-hud-text'
                    }`}
                  >
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Heroes Grid */}
            <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredModalHeroes.length > 0 ? (
                filteredModalHeroes.map((h) => {
                  const isCurrentSlotHero = enemyHeroIds[activeSlotTarget] === h.id;
                  const isOtherSlotHero = enemyHeroIds.includes(h.id) && !isCurrentSlotHero;

                  return (
                    <div
                      key={h.id}
                      onClick={() => handleAssignHeroToSlot(h.id, activeSlotTarget)}
                      style={{ contentVisibility: 'auto', containIntrinsicSize: '64px' }}
                      className={`group bg-hud-bg/80 hover:bg-hud-surface-raised border rounded-md p-2.5 flex items-center gap-2.5 cursor-pointer transition-colors ${
                        isCurrentSlotHero
                          ? 'border-red-500/60 bg-red-500/10'
                          : isOtherSlotHero
                          ? 'border-white/[0.08] hover:border-amber-500/50'
                          : 'border-white/[0.08] hover:border-hud-accent/60'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded object-cover border border-white/[0.08] group-hover:border-hud-accent/60 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-xs text-hud-text group-hover:text-hud-accent truncate">
                            {h.name}
                          </span>
                          <span className="font-mono text-[9px] uppercase font-semibold text-hud-text-muted bg-hud-surface px-1 py-0.5 rounded flex-shrink-0 border border-white/[0.06]">
                            {h.attribute}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-hud-text-muted truncate">
                            {h.roles.slice(0, 2).join(', ')}
                          </span>
                        </div>
                        {isOtherSlotHero && (
                          <span className="text-[11px] text-amber-400 font-medium block mt-0.5">
                            Swap from other slot
                          </span>
                        )}
                        {isCurrentSlotHero && (
                          <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
                            Currently assigned
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono font-medium text-hud-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        Pick
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-hud-text-muted">
                  No heroes match your search.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-hud-surface-raised border-t border-white/[0.08] flex justify-between items-center text-xs text-hud-text-muted">
              <span>Clicking a hero assigns them directly to Enemy Slot #{activeSlotTarget + 1}.</span>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="px-3 py-1.5 rounded-md bg-hud-surface hover:bg-white/[0.08] text-hud-text font-medium border border-white/[0.1] transition-colors touch-target"
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
