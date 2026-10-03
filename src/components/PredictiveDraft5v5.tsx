import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HEROES_DATA, HERO_MAP } from '../data/heroes';
import { HeroData, AttributeType } from '../types/hero';
import { 
  runPredictive5v5Analysis, 
  suggestPicks,
  POSITION_DEFINITIONS, 
  PositionNumber, 
  Predictive5v5Analysis 
} from '../services/predictiveDraftEngine';
import { SoundEngine } from '../services/soundFx';
import { 
  BrainCircuit, 
  Sparkles, 
  Shield, 
  Swords, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  X, 
  Plus, 
  RotateCcw, 
  Eye, 
  Search, 
  Crown, 
  Lock, 
  Trash2,
  Crosshair,
  Star
} from 'lucide-react';

interface PredictiveDraft5v5Props {
  onSelectHero?: (hero: HeroData) => void;
}

// Dedicated 5-slot array: index 0 = Pos 1, 1 = Pos 2, 2 = Pos 3, 3 = Pos 4, 4 = Pos 5
export type DedicatedSlots = [string | null, string | null, string | null, string | null, string | null];

// Preset drafts with dedicated slot assignments
interface PresetScenario {
  id: string;
  name: string;
  description: string;
  radiantSlots: DedicatedSlots;
  direSlots: DedicatedSlots;
  radiantBanIds: string[];
  direBanIds: string[];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'ban_telegraph_am',
    name: 'AM & Nyx Banned',
    description: 'Dire banned Anti-Mage and Nyx. Oracle decrypts incoming Medusa / Storm Spirit mana-shield core.',
    radiantSlots: ['sven', 'storm_spirit', 'lion', null, null],
    direSlots: ['faceless_void', null, null, null, 'witch_doctor'],
    radiantBanIds: ['pudge'],
    direBanIds: ['anti_mage', 'nyx_assassin']
  },
  {
    id: 'teamfight_clash',
    name: 'TI Wombo Combo',
    description: 'Classic 5v5 teamfight clash: Void + Witch Doctor vs Sven + Lion + Windranger.',
    radiantSlots: ['sven', 'storm_spirit', 'lion', 'windranger', null],
    direSlots: ['faceless_void', null, 'axe', null, 'witch_doctor'],
    radiantBanIds: ['drow_ranger', 'pudge'],
    direBanIds: ['anti_mage', 'legion_commander']
  },
  {
    id: 'sustain_ban_aa',
    name: 'AA Banned (Sustain)',
    description: 'Dire banned Ancient Apparition. Oracle predicts high-regen Morphling / Huskar.',
    radiantSlots: ['drow_ranger', null, null, null, 'witch_doctor'],
    direSlots: [null, null, 'axe', null, null],
    radiantBanIds: ['storm_spirit'],
    direBanIds: ['ancient_apparition', 'drow_ranger']
  },
  {
    id: 'blank_canvas',
    name: 'Clean Draft',
    description: 'Empty board for customized Captains Mode and ranked predictive analysis.',
    radiantSlots: [null, null, null, null, null],
    direSlots: [null, null, null, null, null],
    radiantBanIds: [],
    direBanIds: []
  }
];

export const PredictiveDraft5v5: React.FC<PredictiveDraft5v5Props> = ({ onSelectHero }) => {
  // Dedicated 5 slots per team (Pos 1 = Safe Carry, Pos 2 = Mid, Pos 3 = Offlane, Pos 4 = Soft Support, Pos 5 = Hard Support)
  const [radiantSlots, setRadiantSlots] = useState<DedicatedSlots>(['sven', 'storm_spirit', 'lion', null, null]);
  const [direSlots, setDireSlots] = useState<DedicatedSlots>(['faceless_void', null, null, null, 'witch_doctor']);

  // Bans (up to 7 bans each)
  const [radiantBanIds, setRadiantBanIds] = useState<string[]>(['pudge']);
  const [direBanIds, setDireBanIds] = useState<string[]>(['anti_mage', 'nyx_assassin']);

  // Active Perspective: 'radiant' or 'dire'
  const [userTeam, setUserTeam] = useState<'radiant' | 'dire'>('radiant');

  // Currently targeted dedicated slot for hero assignment
  const [activeTargetSlot, setActiveTargetSlot] = useState<{
    team: 'radiant' | 'dire';
    pos: PositionNumber;
  }>({ team: 'radiant', pos: 4 });

  // Mode for the inline selection pool: 'pick' or 'ban'
  const [activeTargetMode, setActiveTargetMode] = useState<'pick' | 'ban'>('pick');

  // Role filtering mode in hero pool: 'dedicated' (shows corresponding heroes first) or 'all'
  const [heroPoolRoleFilter, setHeroPoolRoleFilter] = useState<'dedicated' | 'all'>('dedicated');

  // Inline Hero Pool search & filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [heroPoolAttr, setHeroPoolAttr] = useState<AttributeType | 'all'>('all');

  // Sub-tab view for analysis: 'picks' | 'bans' | 'lanes'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'picks' | 'bans' | 'lanes'>('picks');

  // Pick suggestions filter by position
  const [suggestionRoleFilter, setSuggestionRoleFilter] = useState<PositionNumber | 'all'>('all');

  // Search Modal state
  const [modalTarget, setModalTarget] = useState<{
    team: 'radiant' | 'dire';
    type: 'pick' | 'ban';
    pos?: PositionNumber;
  } | null>(null);

  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalAttr, setModalAttr] = useState<AttributeType | 'all'>('all');
  const [modalRoleFilter, setModalRoleFilter] = useState<'dedicated' | 'all'>('dedicated');

  const containerRef = useRef<HTMLDivElement>(null);

  // Dedicated role for active target slot
  const targetDef = POSITION_DEFINITIONS[activeTargetSlot.pos];
  const targetRole = targetDef.role;

  // Run the Predictive Engine using dedicated slots
  const analysis: Predictive5v5Analysis = useMemo(() => {
    return runPredictive5v5Analysis(
      radiantSlots,
      direSlots,
      radiantBanIds,
      direBanIds
    );
  }, [radiantSlots, direSlots, radiantBanIds, direBanIds]);

  // Set of all selected hero IDs (picks and bans across both teams)
  const allSelectedIds = useMemo(() => {
    const picks = [...radiantSlots, ...direSlots].filter((id): id is string => Boolean(id));
    return new Set([...picks, ...radiantBanIds, ...direBanIds]);
  }, [radiantSlots, direSlots, radiantBanIds, direBanIds]);

  // AI-recommended counter & synergy picks specifically for the targeted dedicated slot
  const slotRecommendations = useMemo(() => {
    if (activeTargetMode === 'ban') return [];

    const myPicks = (activeTargetSlot.team === 'radiant' ? radiantSlots : direSlots)
      .map((id) => (id ? HERO_MAP.get(id) : null))
      .filter((h): h is HeroData => Boolean(h));

    const enemyPicks = (activeTargetSlot.team === 'radiant' ? direSlots : radiantSlots)
      .map((id) => (id ? HERO_MAP.get(id) : null))
      .filter((h): h is HeroData => Boolean(h));

    const allBans = [...radiantBanIds, ...direBanIds]
      .map((id) => HERO_MAP.get(id))
      .filter((h): h is HeroData => Boolean(h));

    return suggestPicks(myPicks, enemyPicks, allBans, activeTargetSlot.pos);
  }, [radiantSlots, direSlots, radiantBanIds, direBanIds, activeTargetSlot, activeTargetMode]);

  // Recommendation score lookup map
  const slotRecScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    slotRecommendations.forEach((s) => map.set(s.hero.id, s.score));
    return map;
  }, [slotRecommendations]);

  // Recommendations for the modal target slot
  const modalTargetPos = modalTarget?.pos || activeTargetSlot.pos;
  const modalTargetDef = POSITION_DEFINITIONS[modalTargetPos];
  const modalTargetRole = modalTargetDef.role;

  const modalRecommendations = useMemo(() => {
    if (!modalTarget || modalTarget.type === 'ban') return [];

    const myPicks = (modalTarget.team === 'radiant' ? radiantSlots : direSlots)
      .map((id) => (id ? HERO_MAP.get(id) : null))
      .filter((h): h is HeroData => Boolean(h));

    const enemyPicks = (modalTarget.team === 'radiant' ? direSlots : radiantSlots)
      .map((id) => (id ? HERO_MAP.get(id) : null))
      .filter((h): h is HeroData => Boolean(h));

    const allBans = [...radiantBanIds, ...direBanIds]
      .map((id) => HERO_MAP.get(id))
      .filter((h): h is HeroData => Boolean(h));

    return suggestPicks(myPicks, enemyPicks, allBans, modalTargetPos);
  }, [modalTarget, radiantSlots, direSlots, radiantBanIds, direBanIds, modalTargetPos]);

  const modalRecScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    modalRecommendations.forEach((s) => map.set(s.hero.id, s.score));
    return map;
  }, [modalRecommendations]);

  // Preset loading
  const handleLoadPreset = (preset: PresetScenario) => {
    SoundEngine.playPick();
    setRadiantSlots([...preset.radiantSlots]);
    setDireSlots([...preset.direSlots]);
    setRadiantBanIds([...preset.radiantBanIds]);
    setDireBanIds([...preset.direBanIds]);

    // Focus on first vacant Radiant slot
    const firstEmpty = ([1, 2, 3, 4, 5] as PositionNumber[]).find((p) => preset.radiantSlots[p - 1] === null) || 1;
    setActiveTargetSlot({ team: 'radiant', pos: firstEmpty });
    setActiveTargetMode('pick');
    setHeroPoolRoleFilter('dedicated');
  };

  // Clear draft
  const handleClearDraft = () => {
    SoundEngine.playHover();
    setRadiantSlots([null, null, null, null, null]);
    setDireSlots([null, null, null, null, null]);
    setRadiantBanIds([]);
    setDireBanIds([]);
    setActiveTargetSlot({ team: 'radiant', pos: 1 });
    setActiveTargetMode('pick');
    setHeroPoolRoleFilter('dedicated');
  };

  // Open Search Modal (Draft Studio style)
  const handleOpenSlotModal = (team: 'radiant' | 'dire', type: 'pick' | 'ban', pos?: PositionNumber) => {
    SoundEngine.playHover();
    if (pos) {
      setActiveTargetSlot({ team, pos });
      setActiveTargetMode('pick');
    } else if (type === 'ban') {
      setActiveTargetMode('ban');
    }
    setModalTarget({ team, type, pos });
    setModalSearch('');
    setModalAttr('all');
    setModalRoleFilter('dedicated');
  };

  // Assign hero into dedicated slot (maintains fixed slot positions, no shifting!)
  const handleAssignHero = (
    team: 'radiant' | 'dire', 
    type: 'pick' | 'ban', 
    heroId: string, 
    pos?: PositionNumber
  ) => {
    SoundEngine.playPick();

    if (type === 'ban') {
      if (team === 'radiant') {
        if (!radiantBanIds.includes(heroId) && radiantBanIds.length < 7) {
          setRadiantBanIds([...radiantBanIds, heroId]);
        }
      } else {
        if (!direBanIds.includes(heroId) && direBanIds.length < 7) {
          setDireBanIds([...direBanIds, heroId]);
        }
      }
      setModalTarget(null);
      return;
    }

    // Pick into dedicated slot pos (1-5)
    const targetPos = pos || activeTargetSlot.pos;
    const slotIdx = targetPos - 1;

    if (team === 'radiant') {
      const next: DedicatedSlots = [...radiantSlots];
      // If hero already in another radiant slot, clear that slot
      const existingIdx = next.indexOf(heroId);
      if (existingIdx !== -1 && existingIdx !== slotIdx) {
        next[existingIdx] = null;
      }
      next[slotIdx] = heroId;
      setRadiantSlots(next);

      // Auto-advance to next empty dedicated position
      const nextEmptyPos = ([1, 2, 3, 4, 5] as PositionNumber[]).find((p) => next[p - 1] === null);
      if (nextEmptyPos) {
        setActiveTargetSlot({ team: 'radiant', pos: nextEmptyPos });
      }
    } else {
      const next: DedicatedSlots = [...direSlots];
      const existingIdx = next.indexOf(heroId);
      if (existingIdx !== -1 && existingIdx !== slotIdx) {
        next[existingIdx] = null;
      }
      next[slotIdx] = heroId;
      setDireSlots(next);

      const nextEmptyPos = ([1, 2, 3, 4, 5] as PositionNumber[]).find((p) => next[p - 1] === null);
      if (nextEmptyPos) {
        setActiveTargetSlot({ team: 'dire', pos: nextEmptyPos });
      }
    }

    setModalTarget(null);
  };

  // Remove hero from dedicated slot or ban (does NOT shift other slots!)
  const handleRemoveHero = (team: 'radiant' | 'dire', type: 'pick' | 'ban', posOrBanIdx: number) => {
    SoundEngine.playHover();
    if (type === 'pick') {
      // posOrBanIdx is 1 to 5
      const slotIdx = posOrBanIdx - 1;
      if (team === 'radiant') {
        const next: DedicatedSlots = [...radiantSlots];
        next[slotIdx] = null;
        setRadiantSlots(next);
        setActiveTargetSlot({ team: 'radiant', pos: posOrBanIdx as PositionNumber });
      } else {
        const next: DedicatedSlots = [...direSlots];
        next[slotIdx] = null;
        setDireSlots(next);
        setActiveTargetSlot({ team: 'dire', pos: posOrBanIdx as PositionNumber });
      }
      setActiveTargetMode('pick');
      setHeroPoolRoleFilter('dedicated');
    } else {
      // ban removal
      if (team === 'radiant') {
        const next = [...radiantBanIds];
        next.splice(posOrBanIdx, 1);
        setRadiantBanIds(next);
      } else {
        const next = [...direBanIds];
        next.splice(posOrBanIdx, 1);
        setDireBanIds(next);
      }
    }
  };

  // 1-Click Quick Select from the Inline Hero Pool
  const handleQuickSelectHero = (heroId: string) => {
    if (activeTargetMode === 'ban') {
      handleAssignHero(activeTargetSlot.team, 'ban', heroId);
    } else {
      handleAssignHero(activeTargetSlot.team, 'pick', heroId, activeTargetSlot.pos);
    }
  };

  // 1-Click Pick from Suggested Picks
  const handlePickSuggested = (heroId: string, rolePos?: PositionNumber) => {
    const targetPos = rolePos || activeTargetSlot.pos;
    handleAssignHero(userTeam, 'pick', heroId, targetPos);
  };

  // 1-Click Ban from Suggested Bans
  const handleBanSuggested = (heroId: string) => {
    handleAssignHero(userTeam, 'ban', heroId);
  };

  // Available Heroes for Inline Hero Pool:
  // Prioritizes and suggests corresponding heroes for the dedicated slot first!
  const availablePoolHeroes = useMemo(() => {
    const filtered = HEROES_DATA.filter((hero) => {
      // Attribute filter
      if (heroPoolAttr !== 'all' && hero.attribute !== heroPoolAttr) return false;

      // Dedicated Role Filter: when in dedicated mode, filter to heroes matching the target slot's role
      if (activeTargetMode === 'pick' && heroPoolRoleFilter === 'dedicated') {
        if (!hero.roles.includes(targetRole)) return false;
      }

      // Live search query (name, title, aliases, roles)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = hero.name.toLowerCase().includes(q);
        const matchesTitle = hero.title.toLowerCase().includes(q);
        const matchesAlias = hero.aliases?.some((a) => a.toLowerCase().includes(q));
        const matchesRole = hero.roles?.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesAlias && !matchesRole) return false;
      }
      return true;
    });

    // Sort to suggest corresponding heroes and AI recommendations FIRST:
    return filtered.sort((a, b) => {
      // 1. AI Recommended for this slot highest score first
      const aScore = slotRecScoreMap.get(a.id) || 0;
      const bScore = slotRecScoreMap.get(b.id) || 0;
      if (aScore !== bScore) return bScore - aScore;

      // 2. Matching dedicated role first
      const aRoleMatch = a.roles.includes(targetRole) ? 1 : 0;
      const bRoleMatch = b.roles.includes(targetRole) ? 1 : 0;
      if (aRoleMatch !== bRoleMatch) return bRoleMatch - aRoleMatch;

      // 3. Win rate descending
      return b.winRate - a.winRate;
    });
  }, [searchQuery, heroPoolAttr, heroPoolRoleFilter, targetRole, activeTargetMode, slotRecScoreMap]);

  // Filter heroes for modal search (Draft Studio style with dedicated hero suggestions first)
  const filteredModalHeroes = useMemo(() => {
    const filtered = HEROES_DATA.filter((h) => {
      if (modalAttr !== 'all' && h.attribute !== modalAttr) return false;

      // Role filter for modal
      if (modalTarget?.type === 'pick' && modalRoleFilter === 'dedicated') {
        if (!h.roles.includes(modalTargetRole)) return false;
      }

      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchesAlias = h.aliases?.some((a) => a.toLowerCase().includes(q));
        const matchesRole = h.roles?.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesAlias && !matchesRole) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      // 1. AI Recommended for modal slot
      const aScore = modalRecScoreMap.get(a.id) || 0;
      const bScore = modalRecScoreMap.get(b.id) || 0;
      if (aScore !== bScore) return bScore - aScore;

      // 2. Matching dedicated role
      const aRoleMatch = a.roles.includes(modalTargetRole) ? 1 : 0;
      const bRoleMatch = b.roles.includes(modalTargetRole) ? 1 : 0;
      if (aRoleMatch !== bRoleMatch) return bRoleMatch - aRoleMatch;

      return b.winRate - a.winRate;
    });
  }, [modalSearch, modalAttr, modalRoleFilter, modalTarget, modalTargetRole, modalRecScoreMap]);

  const radiantPickCount = radiantSlots.filter(Boolean).length;
  const direPickCount = direSlots.filter(Boolean).length;

  return (
    <div ref={containerRef} className="space-y-4 pb-12">
      
      {/* ========================================================= */}
      {/* 1. TOP BANNER & ADVANTAGE METRICS                         */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-dota-panel via-slate-900 to-dota-bg border-2 border-dota-border rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Title & Perspective Toggle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 p-0.5 flex items-center justify-center flex-shrink-0 shadow-dota-glow">
            <div className="w-full h-full bg-dota-bg rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-dota text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                5v5 PREDICTIVE DRAFT ORACLE
              </h1>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-500/40">
                Dedicated Slots
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Each position (Pos 1–5) is a dedicated slot. Select any slot to view tailored counter-picks & matching heroes first.
            </p>
          </div>
        </div>

        {/* Advantage Progress Bar & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-xl">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <Shield className="w-3 h-3" /> RAD {analysis.draftAdvantage.radiantScore}%
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>E: <strong className={analysis.draftAdvantage.earlyAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'}>{analysis.draftAdvantage.earlyAdvantage}</strong></span>
                <span>M: <strong className={analysis.draftAdvantage.midAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'}>{analysis.draftAdvantage.midAdvantage}</strong></span>
                <span>L: <strong className={analysis.draftAdvantage.lateAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'}>{analysis.draftAdvantage.lateAdvantage}</strong></span>
              </div>
              <span className="text-rose-400 flex items-center gap-1 font-mono">
                DIRE {analysis.draftAdvantage.direScore}% <Swords className="w-3 h-3" />
              </span>
            </div>

            <div className="relative h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-dota-border">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                style={{ width: `${analysis.draftAdvantage.radiantScore}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-500"
                style={{ width: `${analysis.draftAdvantage.direScore}%` }}
              />
            </div>
          </div>

          {/* Quick Presets & Reset */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {PRESET_SCENARIOS.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 hover:border-dota-gold/50 transition-all"
                title={p.description}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
            <button
              onClick={handleClearDraft}
              className="p-1 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700"
              title="Reset Draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. DRAFT BOARD - DEDICATED SLOTS (POS 1 TO 5 NEVER SHIFT) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        
        {/* RADIANT SIDE - 5 DEDICATED SLOTS */}
        <div className="bg-dota-panel rounded-2xl border-2 border-emerald-500/40 p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="font-dota font-black text-sm text-emerald-300 tracking-wider">THE RADIANT</span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30">
                {radiantPickCount}/5 Dedicated Picks
              </span>
            </div>
            <button
              onClick={() => setUserTeam('radiant')}
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                userTeam === 'radiant'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800 border border-slate-700'
              }`}
            >
              {userTeam === 'radiant' ? 'Active Perspective' : 'Set as Your Team'}
            </button>
          </div>

          {/* 5 Dedicated Radiant Slot Cards */}
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = radiantSlots[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;
              const isTargeted = activeTargetSlot.team === 'radiant' && activeTargetSlot.pos === pos && activeTargetMode === 'pick';

              return (
                <div
                  key={`rad-dedicated-pos-${pos}`}
                  onClick={() => handleOpenSlotModal('radiant', 'pick', pos)}
                  className={`h-24 rounded-xl border p-1.5 flex flex-col justify-between transition-all cursor-pointer relative select-none group ${
                    isTargeted 
                      ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-2 ring-dota-gold/80' 
                      : hero 
                        ? 'bg-dota-card/95 border-emerald-500/50 hover:border-emerald-400 hover:scale-[1.02]' 
                        : 'bg-dota-bg/80 border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10'
                  }`}
                  title={
                    hero 
                      ? `${hero.name} (Radiant ${def.name}) - Click to change` 
                      : `Radiant ${def.name} (${def.role}) - Click to select suggested heroes`
                  }
                >
                  {/* Top Bar: Dedicated Position & Role Tag */}
                  <div className="flex items-center justify-between text-[10px] leading-none">
                    <span className={`font-black uppercase px-1 py-0.2 rounded text-[8px] ${
                      isTargeted ? 'bg-amber-950 text-amber-300 border border-amber-500/50' : 'bg-slate-900 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      P{pos}
                    </span>
                    {hero ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHero('radiant', 'pick', pos);
                        }}
                        className="p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/60 leading-none transition-colors"
                        title="Remove hero from this dedicated slot"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    ) : (
                      <span className="text-[8px] text-slate-500 uppercase">{def.lane.split(' ')[0]}</span>
                    )}
                  </div>

                  {/* Center: Hero Avatar & Name OR + Add Hero */}
                  {hero ? (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHero) onSelectHero(hero);
                      }}
                      className="flex items-center gap-1.5 overflow-hidden"
                    >
                      <img 
                        src={hero.avatarUrl} 
                        alt={hero.name} 
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-emerald-500/50 shadow group-hover:scale-105 transition-transform" 
                      />
                      <div className="truncate flex-1">
                        <div className="font-dota font-bold text-xs text-slate-100 truncate group-hover:text-emerald-300 leading-tight">
                          {hero.name}
                        </div>
                        <div className="text-[9px] text-emerald-400 font-semibold leading-none">{hero.winRate}% WR</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1 text-slate-400 group-hover:text-emerald-300">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-emerald-500 group-hover:bg-emerald-500/20 flex items-center justify-center transition-all group-hover:scale-110">
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-emerald-300">Add {def.role.split(' ')[0]}</span>
                    </div>
                  )}

                  {/* Bottom: Dedicated Role Label */}
                  <div className="text-[8px] text-slate-400 truncate flex items-center justify-between leading-none">
                    <span className="truncate font-semibold text-slate-300">{def.role.replace(' Support', ' Sup')}</span>
                    {isTargeted ? (
                      <span className="text-amber-300 font-black text-[7px] animate-pulse">TARGET</span>
                    ) : (
                      <span className="text-[7px] text-slate-500 group-hover:text-slate-400">Suggest</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radiant Bans Bar */}
          <div className="flex items-center gap-1.5 min-h-[28px] overflow-x-auto custom-scrollbar pt-1 border-t border-emerald-500/20 text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 font-bold">
              <Lock className="w-3 h-3 text-red-400" /> Bans:
            </span>
            {radiantBanIds.map((banId, idx) => {
              const hero = HERO_MAP.get(banId);
              return (
                <div key={`rad-ban-${banId}-${idx}`} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-200 text-[10px]">
                  {hero && <img src={hero.avatarUrl} alt={hero.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                  <span className="line-through">{hero?.name || banId}</span>
                  <button onClick={() => handleRemoveHero('radiant', 'ban', idx)} className="text-red-400 hover:text-white font-bold">×</button>
                </div>
              );
            })}
            {radiantBanIds.length < 7 && (
              <button
                onClick={() => handleOpenSlotModal('radiant', 'ban')}
                className="flex-shrink-0 text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-dashed border-red-500/40 hover:bg-red-500/10 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> Ban Hero
              </button>
            )}
          </div>
        </div>

        {/* DIRE SIDE - 5 DEDICATED SLOTS */}
        <div className="bg-dota-panel rounded-2xl border-2 border-rose-500/40 p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span className="font-dota font-black text-sm text-rose-300 tracking-wider">THE DIRE</span>
              <span className="text-[10px] text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-500/30">
                {direPickCount}/5 Dedicated Picks
              </span>
            </div>
            <button
              onClick={() => setUserTeam('dire')}
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                userTeam === 'dire'
                  ? 'bg-rose-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800 border border-slate-700'
              }`}
            >
              {userTeam === 'dire' ? 'Active Perspective' : 'Set as Your Team'}
            </button>
          </div>

          {/* 5 Dedicated Dire Slot Cards */}
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = direSlots[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;
              const isTargeted = activeTargetSlot.team === 'dire' && activeTargetSlot.pos === pos && activeTargetMode === 'pick';

              return (
                <div
                  key={`dire-dedicated-pos-${pos}`}
                  onClick={() => handleOpenSlotModal('dire', 'pick', pos)}
                  className={`h-24 rounded-xl border p-1.5 flex flex-col justify-between transition-all cursor-pointer relative select-none group ${
                    isTargeted 
                      ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-2 ring-dota-gold/80' 
                      : hero 
                        ? 'bg-dota-card/95 border-rose-500/50 hover:border-rose-400 hover:scale-[1.02]' 
                        : 'bg-dota-bg/80 border-dashed border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/10'
                  }`}
                  title={
                    hero 
                      ? `${hero.name} (Dire ${def.name}) - Click to change` 
                      : `Dire ${def.name} (${def.role}) - Click to select suggested heroes`
                  }
                >
                  {/* Top Bar: Dedicated Position & Role */}
                  <div className="flex items-center justify-between text-[10px] leading-none">
                    <span className={`font-black uppercase px-1 py-0.2 rounded text-[8px] ${
                      isTargeted ? 'bg-amber-950 text-amber-300 border border-amber-500/50' : 'bg-slate-900 text-rose-400 border border-rose-500/40'
                    }`}>
                      P{pos}
                    </span>
                    {hero ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHero('dire', 'pick', pos);
                        }}
                        className="p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/60 leading-none transition-colors"
                        title="Remove hero from this dedicated slot"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    ) : (
                      <span className="text-[8px] text-slate-500 uppercase">{def.lane.split(' ')[0]}</span>
                    )}
                  </div>

                  {/* Center: Hero Avatar & Name OR + Add Hero */}
                  {hero ? (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHero) onSelectHero(hero);
                      }}
                      className="flex items-center gap-1.5 overflow-hidden"
                    >
                      <img 
                        src={hero.avatarUrl} 
                        alt={hero.name} 
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-rose-500/50 shadow group-hover:scale-105 transition-transform" 
                      />
                      <div className="truncate flex-1">
                        <div className="font-dota font-bold text-xs text-slate-100 truncate group-hover:text-rose-300 leading-tight">
                          {hero.name}
                        </div>
                        <div className="text-[9px] text-rose-400 font-semibold leading-none">{hero.winRate}% WR</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1 text-slate-400 group-hover:text-rose-300">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-rose-500 group-hover:bg-rose-500/20 flex items-center justify-center transition-all group-hover:scale-110">
                        <Plus className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-rose-300">Add {def.role.split(' ')[0]}</span>
                    </div>
                  )}

                  {/* Bottom: Dedicated Role Label */}
                  <div className="text-[8px] text-slate-400 truncate flex items-center justify-between leading-none">
                    <span className="truncate font-semibold text-slate-300">{def.role.replace(' Support', ' Sup')}</span>
                    {isTargeted ? (
                      <span className="text-amber-300 font-black text-[7px] animate-pulse">TARGET</span>
                    ) : (
                      <span className="text-[7px] text-slate-500 group-hover:text-slate-400">Suggest</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dire Bans Bar */}
          <div className="flex items-center gap-1.5 min-h-[28px] overflow-x-auto custom-scrollbar pt-1 border-t border-rose-500/20 text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 font-bold">
              <Lock className="w-3 h-3 text-red-400" /> Bans:
            </span>
            {direBanIds.map((banId, idx) => {
              const hero = HERO_MAP.get(banId);
              return (
                <div key={`dire-ban-${banId}-${idx}`} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-200 text-[10px]">
                  {hero && <img src={hero.avatarUrl} alt={hero.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                  <span className="line-through">{hero?.name || banId}</span>
                  <button onClick={() => handleRemoveHero('dire', 'ban', idx)} className="text-red-400 hover:text-white font-bold">×</button>
                </div>
              );
            })}
            {direBanIds.length < 7 && (
              <button
                onClick={() => handleOpenSlotModal('dire', 'ban')}
                className="flex-shrink-0 text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-dashed border-red-500/40 hover:bg-red-500/10 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> Ban Hero
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. DEDICATED HERO SELECTION POOL (SUGGESTS CORRESPONDING HEROES FIRST!) */}
      {/* ========================================================= */}
      <div className="bg-dota-panel border border-dota-border rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        
        {/* Header Bar: Dedicated Target, Filter Tabs & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Dedicated Target Info & Position Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-dota font-bold text-xs sm:text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Dedicated Slot:</span>
            </h3>

            {/* Target Team & Slot Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-dota-bg border border-dota-border text-xs shadow-inner">
              <span className="text-slate-400 text-[11px]">Filling:</span>
              <button
                onClick={() => {
                  SoundEngine.playHover();
                  setActiveTargetSlot((prev) => ({ ...prev, team: prev.team === 'radiant' ? 'dire' : 'radiant' }));
                }}
                className={`font-black text-[11px] px-2 py-0.5 rounded transition-all ${
                  activeTargetSlot.team === 'radiant' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900' 
                    : 'bg-rose-950 text-rose-300 border border-rose-500/50 hover:bg-rose-900'
                }`}
                title="Click to toggle Radiant vs Dire"
              >
                {activeTargetSlot.team === 'radiant' ? 'THE RADIANT' : 'THE DIRE'}
              </button>

              {activeTargetMode === 'pick' ? (
                <span className="text-dota-gold font-bold text-[11px] flex items-center gap-1">
                  <span>Pos {activeTargetSlot.pos} ({targetRole})</span>
                </span>
              ) : (
                <span className="text-red-400 font-bold text-[11px]">Banning</span>
              )}
            </div>

            {/* Position 1 to 5 + Ban quick selector pills */}
            <div className="flex items-center gap-0.5 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-[10px]">
              {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
                const isPosEmpty = activeTargetSlot.team === 'radiant' 
                  ? radiantSlots[pos - 1] === null 
                  : direSlots[pos - 1] === null;

                return (
                  <button
                    key={`quick-pos-tab-${pos}`}
                    onClick={() => {
                      SoundEngine.playHover();
                      setActiveTargetSlot((prev) => ({ ...prev, pos }));
                      setActiveTargetMode('pick');
                      setHeroPoolRoleFilter('dedicated');
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-all relative ${
                      activeTargetMode === 'pick' && activeTargetSlot.pos === pos
                        ? 'bg-dota-gold text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    P{pos}
                    {isPosEmpty && (
                      <span className="absolute -top-1 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  SoundEngine.playHover();
                  setActiveTargetMode(activeTargetMode === 'ban' ? 'pick' : 'ban');
                }}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  activeTargetMode === 'ban'
                    ? 'bg-red-600 text-white font-black shadow'
                    : 'text-red-400 hover:text-white'
                }`}
              >
                Ban
              </button>
            </div>

            {/* Search Modal Button */}
            <button
              onClick={() => handleOpenSlotModal(
                activeTargetSlot.team, 
                activeTargetMode, 
                activeTargetMode === 'pick' ? activeTargetSlot.pos : undefined
              )}
              className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-600/70 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all shadow-sm"
              title="Open full-screen search and suggestion modal"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Search Modal</span>
            </button>
          </div>

          {/* Right: Corresponding Heroes Filter Toggle & Search Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Filter Toggle: Suggest Corresponding Role Heroes First */}
            {activeTargetMode === 'pick' && (
              <div className="flex items-center gap-1 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-[10px]">
                <button
                  onClick={() => setHeroPoolRoleFilter('dedicated')}
                  className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all ${
                    heroPoolRoleFilter === 'dedicated'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Show heroes matching dedicated ${targetRole} role`}
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>{targetRole} Only</span>
                </button>
                <button
                  onClick={() => setHeroPoolRoleFilter('all')}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    heroPoolRoleFilter === 'all'
                      ? 'bg-slate-700 text-white font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Heroes
                </button>
              </div>
            )}

            {/* Attribute Pills */}
            <div className="flex items-center gap-0.5 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-[10px]">
              {[
                { id: 'all', label: 'ALL' },
                { id: 'str', label: 'STR' },
                { id: 'agi', label: 'AGI' },
                { id: 'int', label: 'INT' },
                { id: 'all_attr', label: 'UNI' },
              ].map((attr) => (
                <button
                  key={`attr-filter-${attr.id}`}
                  onClick={() => setHeroPoolAttr(attr.id === 'all_attr' ? 'all' : attr.id as any)}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    (heroPoolAttr === attr.id || (attr.id === 'all_attr' && heroPoolAttr === 'all'))
                      ? 'bg-dota-gold text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {attr.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${targetRole} heroes...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-dota-bg border border-dota-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Hero Pool Grid / Chips - Corresponding & Recommended Heroes Appear First! */}
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1 custom-scrollbar">
          {availablePoolHeroes.map((hero) => {
            const isAlreadyDrafted = allSelectedIds.has(hero.id);
            const isTargetRadiant = activeTargetSlot.team === 'radiant';
            const recScore = slotRecScoreMap.get(hero.id);
            const isRoleMatch = hero.roles.includes(targetRole);

            return (
              <button
                key={`pool-hero-${hero.id}`}
                onClick={() => handleQuickSelectHero(hero.id)}
                disabled={isAlreadyDrafted}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all relative ${
                  isAlreadyDrafted
                    ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                    : recScore
                    ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 hover:bg-amber-900/60 shadow-dota-glow hover:scale-[1.02]'
                    : isRoleMatch
                    ? (isTargetRadiant 
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-slate-200 hover:bg-emerald-900/50 hover:text-white hover:scale-[1.02]' 
                        : 'bg-rose-950/30 border-rose-500/60 text-slate-200 hover:bg-rose-900/50 hover:text-white hover:scale-[1.02]')
                    : 'bg-dota-panelAlt hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:scale-[1.01]'
                }`}
                title={
                  isAlreadyDrafted 
                    ? `${hero.name} (Already drafted or banned)` 
                    : recScore
                    ? `⭐ ${hero.name} (${recScore}% AI Match for Pos ${activeTargetSlot.pos}) - Click to assign`
                    : `${hero.name} (${hero.roles.join(', ')}) - Click to assign to Pos ${activeTargetSlot.pos}`
                }
              >
                <img
                  src={hero.avatarUrl}
                  alt={hero.name}
                  className="w-5 h-5 rounded object-cover flex-shrink-0"
                />
                <span className="truncate max-w-[110px]">{hero.name}</span>
                {recScore && (
                  <span className="text-[9px] font-mono font-black text-amber-300 px-1 rounded bg-amber-500/20">
                    {recScore}%
                  </span>
                )}
                <Plus className={`w-3 h-3 ml-0.5 ${
                  activeTargetMode === 'ban'
                    ? 'text-red-400'
                    : isTargetRadiant
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`} />
              </button>
            );
          })}
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. PREDICTIVE ANALYSIS & STRATEGY ENGINE                  */}
      {/* ========================================================= */}
      <div className="bg-dota-panel rounded-2xl border-2 border-dota-border overflow-hidden shadow-2xl">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center border-b border-dota-border bg-dota-card/60 overflow-x-auto p-1.5 gap-1.5">
          
          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('picks');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'picks'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-500/70 shadow-dota-glow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎯 Optimal Picks & Counter Bans</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('bans');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'bans'
                ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-500/70 shadow-dota-glow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            <span>🔮 Ban Intent & Predicted Lineup</span>
            {analysis.banPredictions.telegraphedHeroes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[9px] font-mono">
                {analysis.banPredictions.telegraphedHeroes.length} telegraphed
              </span>
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('lanes');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'lanes'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/70 shadow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-cyan-400" />
            <span>⚔️ Lane Forecast & Strategy</span>
          </button>

        </div>

        {/* TAB CONTENT */}
        <div className="p-4 sm:p-5 space-y-5">

          {/* TAB 1: OPTIMAL PICKS & COUNTER BANS */}
          {activeAnalysisTab === 'picks' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Picks Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Target className="w-4 h-4" />
                    </span>
                    <h3 className="font-dota font-bold text-sm text-slate-100 flex items-center gap-2">
                      OPTIMAL PICKS FOR {userTeam.toUpperCase()}
                      <span className="text-[10px] font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                        Targeting Pos {activeTargetSlot.pos} ({POSITION_DEFINITIONS[activeTargetSlot.pos].name})
                      </span>
                    </h3>
                  </div>

                  {/* Role filter tabs */}
                  <div className="flex items-center gap-1 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-[10px]">
                    <button
                      onClick={() => setSuggestionRoleFilter('all')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        suggestionRoleFilter === 'all' ? 'bg-dota-gold text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Roles
                    </button>
                    {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => (
                      <button
                        key={`sugg-filter-${pos}`}
                        onClick={() => {
                          setSuggestionRoleFilter(pos);
                          setActiveTargetSlot({ team: userTeam, pos });
                          setActiveTargetMode('pick');
                          setHeroPoolRoleFilter('dedicated');
                        }}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          suggestionRoleFilter === pos || activeTargetSlot.pos === pos
                            ? 'bg-dota-gold text-slate-950 font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pos {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4-column cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {analysis.suggestedPicks
                    .filter((p) => suggestionRoleFilter === 'all' || p.pos === suggestionRoleFilter)
                    .slice(0, 8)
                    .map((pick, i) => (
                      <div
                        key={`pick-sugg-${pick.hero.id}-${i}`}
                        className="p-2.5 rounded-xl bg-dota-card border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between h-[126px] shadow-sm hover:shadow-md group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-black uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px]">
                              {pick.roleName}
                            </span>
                            <span className="font-mono font-bold text-amber-300 text-[10px] flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> {pick.score}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <img src={pick.hero.avatarUrl} alt={pick.hero.name} className="w-8 h-8 rounded-lg object-cover border border-emerald-500/60 flex-shrink-0" />
                            <div className="truncate">
                              <div className="font-dota font-bold text-xs text-slate-100 truncate group-hover:text-emerald-300">
                                {pick.hero.name}
                              </div>
                              <div className="text-[10px] text-emerald-400 font-semibold">{pick.winRate}% WR</div>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-300 line-clamp-1 leading-tight">
                            • {pick.reasons[0] || 'High matchup rating against current draft.'}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                          <button
                            onClick={() => onSelectHero && onSelectHero(pick.hero)}
                            className="text-slate-400 hover:text-white font-bold text-[9px]"
                          >
                            Guide →
                          </button>
                          <button
                            onClick={() => handlePickSuggested(pick.hero.id, pick.pos)}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] shadow active:scale-95"
                          >
                            Pick for Pos {pick.pos}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recommended Bans Section */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-red-500/20 text-red-300">
                      <Lock className="w-4 h-4" />
                    </span>
                    <h3 className="font-dota font-bold text-sm text-slate-100">
                      RECOMMENDED BANS FOR {userTeam.toUpperCase()}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Protects cores & denies enemy combos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {analysis.suggestedBans.slice(0, 6).map((ban, i) => (
                    <div 
                      key={`ban-sugg-${ban.hero.id}-${i}`}
                      className="p-2 rounded-xl bg-dota-card border border-red-500/30 hover:border-red-400 transition-all flex flex-col justify-between h-[105px] shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className={`font-black uppercase px-1 py-0.2 rounded border ${
                            ban.priority === 'CRITICAL' ? 'bg-red-950 text-red-300 border-red-500/50' : 'bg-amber-950 text-amber-300 border-amber-500/50'
                          }`}>
                            {ban.priority}
                          </span>
                          <span className="font-mono text-amber-300 font-bold">{ban.impactScore}/100</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <img src={ban.hero.avatarUrl} alt={ban.hero.name} className="w-7 h-7 rounded-md object-cover border border-red-500/40 flex-shrink-0" />
                          <div className="truncate">
                            <div className="font-dota font-bold text-xs text-slate-100 truncate">{ban.hero.name}</div>
                            <div className="text-[9px] text-red-300 font-semibold truncate">{ban.category.split(' ')[0]}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBanSuggested(ban.hero.id)}
                        className="w-full py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 text-[10px] font-bold transition-all active:scale-95"
                      >
                        Ban Hero
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BAN INTENT & PREDICTED LINEUP */}
          {activeAnalysisTab === 'bans' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Ban Intent Decryption Card */}
              <div className="bg-gradient-to-br from-dota-card to-dota-bg rounded-xl border-2 border-amber-500/30 p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
                      <Lock className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-dota font-bold text-sm text-amber-200">
                        BAN-INTENT DECRYPTION
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Infers what strategy Dire is clearing the runway for based on their bans
                      </p>
                    </div>
                  </div>

                  {analysis.banPredictions.detectedStrategy && (
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-amber-400 block">Detected Strategy</span>
                      <span className="text-xs font-black text-amber-200 font-dota">
                        {analysis.banPredictions.detectedStrategy.name}
                      </span>
                    </div>
                  )}
                </div>

                {analysis.banPredictions.detectedStrategy ? (
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300">
                    <p>{analysis.banPredictions.detectedStrategy.description}</p>
                    <div className="mt-1 text-[10px] text-amber-300/90 font-mono">
                      Trigger Bans: <strong>{analysis.banPredictions.detectedStrategy.triggerBans.join(', ')}</strong> • Confidence: {analysis.banPredictions.detectedStrategy.confidence}%
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                    Add bans on Dire’s side (e.g. Anti-Mage, Ancient Apparition, Axe) to see real-time strategy intent decryption.
                  </div>
                )}

                {/* Telegraphed Heroes Cards */}
                <div className="space-y-2">
                  <h4 className="text-[11px] uppercase font-black text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    Telegraphed Picks ({analysis.banPredictions.telegraphedHeroes.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {analysis.banPredictions.telegraphedHeroes.map((item) => (
                      <div key={`telegraph-${item.hero.id}`} className="p-2.5 rounded-xl bg-dota-panel border border-amber-500/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={item.hero.avatarUrl} alt={item.hero.name} className="w-7 h-7 rounded-md object-cover border border-amber-500/60" />
                            <span className="font-dota font-bold text-xs text-slate-100">{item.hero.name}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20">
                            {item.confidence}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">{item.reason}</p>
                        <div className="p-1 rounded bg-red-950/40 text-[10px] text-red-200">
                          <strong>Counter:</strong> {item.counterRecommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lineup Missing Roles Prediction Card */}
              <div className="bg-gradient-to-br from-dota-card to-dota-bg rounded-xl border-2 border-rose-500/30 p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">
                      <Crown className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-dota font-bold text-sm text-rose-200">
                        DIRE LINEUP FORECAST & MISSING ROLES
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Archetype: <strong className="text-rose-300">{analysis.lineupPrediction.detectedArchetype.name}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {analysis.lineupPrediction.predictedHeroes.map((pred, i) => (
                    <div key={`lineup-pred-${pred.hero.id}-${i}`} className="p-2.5 rounded-xl bg-dota-panel border border-rose-500/30 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-black uppercase px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                            {pred.roleName}
                          </span>
                          <span className="font-mono font-bold text-amber-300">{pred.confidence}% Likelihood</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img src={pred.hero.avatarUrl} alt={pred.hero.name} className="w-7 h-7 rounded-md object-cover border border-rose-500/60" />
                          <div className="font-dota font-bold text-xs text-slate-100">{pred.hero.name}</div>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">{pred.strategicFitReason}</p>
                      </div>

                      <button
                        onClick={() => handleAssignHero('dire', 'pick', pred.hero.id, pred.predictedPos)}
                        className="w-full py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 font-bold text-[10px]"
                      >
                        Assign to Dire Pos {pred.predictedPos}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TACTICAL ADVANTAGE & LANE FORECAST */}
          {activeAnalysisTab === 'lanes' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Lane Forecast Cards */}
              <div className="space-y-2.5">
                <h3 className="font-dota font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-cyan-400" /> PROJECTED LANE MATCHUPS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {analysis.laneForecasts.map((lane, idx) => (
                    <div key={`lane-${idx}`} className="p-3 rounded-xl bg-dota-card border border-dota-border space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-400">Lane {idx + 1}</span>
                        <span className={`font-black uppercase px-1.5 py-0.2 rounded ${
                          lane.advantage === 'Radiant Favored' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          lane.advantage === 'Dire Favored' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                          'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}>
                          {lane.advantage}
                        </span>
                      </div>
                      <h4 className="font-dota font-bold text-xs text-slate-100">{lane.laneName}</h4>
                      <p className="text-[10px] text-slate-300 leading-snug">{lane.tacticalTip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Attributes Comparison */}
              <div className="bg-dota-card rounded-xl border border-dota-border p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="font-dota flex items-center gap-1.5 text-slate-200">
                    <TrendingUp className="w-3.5 h-3.5 text-dota-gold" /> ATTRIBUTE COMPARISON
                  </span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-emerald-400 font-bold">• Radiant</span>
                    <span className="text-rose-400 font-bold">• Dire</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Crowd Control / Stuns', rad: analysis.teamfightScores.radiant.cc, dire: analysis.teamfightScores.dire.cc },
                    { label: 'Burst & Elimination', rad: analysis.teamfightScores.radiant.burst, dire: analysis.teamfightScores.dire.burst },
                    { label: 'Tower Push & Siege', rad: analysis.teamfightScores.radiant.push, dire: analysis.teamfightScores.dire.push },
                    { label: 'Sustain & Healing', rad: analysis.teamfightScores.radiant.sustain, dire: analysis.teamfightScores.dire.sustain },
                    { label: 'Late-Game Scaling', rad: analysis.teamfightScores.radiant.scaling, dire: analysis.teamfightScores.dire.scaling }
                  ].map((attr, idx) => (
                    <div key={`attr-${idx}`} className="space-y-0.5 text-[10px]">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-400 font-mono">{attr.rad}%</span>
                        <span className="text-slate-300">{attr.label}</span>
                        <span className="text-rose-400 font-mono">{attr.dire}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                        <div className="h-full bg-emerald-500" style={{ width: `${attr.rad / (attr.rad + attr.dire || 1) * 100}%` }} />
                        <div className="h-full bg-rose-500" style={{ width: `${attr.dire / (attr.rad + attr.dire || 1) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Win Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-dota font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> RADIANT WIN CONDITION
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {analysis.winConditions.radiant.map((wc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{wc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-dota font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> DIRE WIN CONDITION
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {analysis.winConditions.dire.map((wc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{wc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. SEARCH & SELECT MODAL (SUGGESTS CORRESPONDING HEROES FIRST!) */}
      {/* ========================================================= */}
      {modalTarget && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`bg-slate-900 border-2 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            modalTarget.type === 'ban' 
              ? 'border-red-500/70' 
              : modalTarget.team === 'radiant' 
                ? 'border-emerald-500/70' 
                : 'border-rose-500/70'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              modalTarget.type === 'ban' 
                ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-red-900/50' 
                : modalTarget.team === 'radiant'
                  ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-emerald-900/50'
                  : 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-rose-900/50'
            }`}>
              <div className="flex items-center gap-2.5">
                <Crosshair className={`w-5 h-5 ${
                  modalTarget.type === 'ban' 
                    ? 'text-red-400' 
                    : modalTarget.team === 'radiant' 
                      ? 'text-emerald-400' 
                      : 'text-rose-400'
                }`} />
                <div>
                  <h3 className="font-dota font-bold text-base text-white flex items-center gap-2">
                    <span>
                      {modalTarget.type === 'pick'
                        ? `Select Dedicated Slot: ${modalTarget.team.toUpperCase()} Pos ${modalTargetPos} (${modalTargetDef.name})`
                        : `Ban Hero for ${modalTarget.team.toUpperCase()}`
                      }
                    </span>
                    {modalTarget.type === 'pick' && (
                      (() => {
                        const existingId = modalTarget.team === 'radiant' 
                          ? radiantSlots[modalTargetPos - 1] 
                          : direSlots[modalTargetPos - 1];
                        return existingId ? (
                          <span className="text-xs font-sans px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            Replacing: {HERO_MAP.get(existingId)?.name}
                          </span>
                        ) : null;
                      })()
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {modalTarget.type === 'pick' 
                      ? `Dedicated Role: ${modalTargetDef.role} (${modalTargetDef.lane}) • Suggesting corresponding heroes first`
                      : 'Banning this hero will update predictive enemy intent'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalTarget(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Top Recommended Picks Showcase (Specifically for this Dedicated Slot) */}
            {modalTarget.type === 'pick' && modalRecommendations.length > 0 && (
              <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-dota font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Top AI Counter-Picks for Pos {modalTargetPos} ({modalTargetRole}):
                  </span>
                  <span className="text-[10px] text-slate-400">Ranked by synergy & counter value</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {modalRecommendations.slice(0, 4).map((rec) => (
                    <button
                      key={`modal-rec-${rec.hero.id}`}
                      onClick={() => handleAssignHero(modalTarget.team, 'pick', rec.hero.id, modalTargetPos)}
                      className="p-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-left transition-all group shadow-sm flex items-center gap-2"
                    >
                      <img src={rec.hero.avatarUrl} alt={rec.hero.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-amber-500/60" />
                      <div className="truncate flex-1">
                        <div className="font-bold text-xs text-amber-200 group-hover:text-white truncate">
                          {rec.hero.name}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center justify-between">
                          <span>{rec.score}% Match</span>
                          <span className="text-[9px] text-slate-400">{rec.hero.winRate}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Filter Controls: Search Bar + Role & Attribute Filters */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={`Search ${modalTargetRole} heroes (e.g. Anti-Mage, Magina, Carry, Stun)...`}
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className={`w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner ${
                    modalTarget.type === 'ban' 
                      ? 'focus:border-red-500' 
                      : modalTarget.team === 'radiant' 
                        ? 'focus:border-emerald-500' 
                        : 'focus:border-rose-500'
                  }`}
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pills: Dedicated Role First, then Attribute Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {modalTarget.type === 'pick' && (
                  <>
                    <button
                      onClick={() => setModalRoleFilter('dedicated')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        modalRoleFilter === 'dedicated'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{modalTargetRole} Only (Pos {modalTargetPos})</span>
                    </button>
                    <button
                      onClick={() => setModalRoleFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        modalRoleFilter === 'all'
                          ? 'bg-slate-700 text-white font-black shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Roles
                    </button>
                    <span className="text-slate-700">|</span>
                  </>
                )}

                {[
                  { id: 'all', label: 'All Attributes' },
                  { id: 'str', label: 'Strength' },
                  { id: 'agi', label: 'Agility' },
                  { id: 'int', label: 'Intelligence' },
                  { id: 'all_attr', label: 'Universal' },
                ].map((attr) => (
                  <button
                    key={`modal-attr-${attr.id}`}
                    onClick={() => setModalAttr(attr.id === 'all_attr' ? 'all' : attr.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      (modalAttr === attr.id || (attr.id === 'all_attr' && modalAttr === 'all'))
                        ? (modalTarget.type === 'ban' 
                            ? 'bg-dota-red text-white font-black shadow' 
                            : modalTarget.team === 'radiant' 
                              ? 'bg-emerald-600 text-white font-black shadow' 
                              : 'bg-rose-600 text-white font-black shadow')
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Heroes Grid (Sorted by AI Recommendation & Dedicated Role First!) */}
            <div className="p-4 overflow-y-auto max-h-[45vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 custom-scrollbar">
              {filteredModalHeroes.length > 0 ? (
                filteredModalHeroes.map((h) => {
                  const isCurrentSlotHero = modalTarget.type === 'pick' && (
                    (modalTarget.team === 'radiant' && radiantSlots[modalTargetPos - 1] === h.id) ||
                    (modalTarget.team === 'dire' && direSlots[modalTargetPos - 1] === h.id)
                  );
                  const isOtherSlotHero = allSelectedIds.has(h.id) && !isCurrentSlotHero;
                  const recScore = modalRecScoreMap.get(h.id);
                  const isRoleMatch = h.roles.includes(modalTargetRole);

                  return (
                    <div
                      key={`modal-picker-${h.id}`}
                      onClick={() => handleAssignHero(
                        modalTarget.team, 
                        modalTarget.type, 
                        h.id, 
                        modalTargetPos
                      )}
                      className={`group bg-dota-bg/90 hover:bg-slate-850 border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01] shadow ${
                        isCurrentSlotHero
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : isOtherSlotHero
                          ? 'border-slate-800 opacity-40 hover:opacity-100 hover:border-amber-500'
                          : recScore
                          ? 'border-amber-500/80 bg-amber-950/20 hover:bg-amber-950/40 shadow-dota-glow'
                          : isRoleMatch
                          ? (modalTarget.team === 'radiant' ? 'border-emerald-500/50 hover:border-emerald-400' : 'border-rose-500/50 hover:border-rose-400')
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 group-hover:border-dota-gold flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-amber-300 truncate">
                            {h.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">
                            {h.attribute}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <span className="text-[11px] text-slate-400 truncate">
                            {h.roles.slice(0, 2).join(', ')}
                          </span>
                          {recScore && (
                            <span className="text-[10px] font-mono font-bold text-amber-300 px-1 rounded bg-amber-500/20">
                              {recScore}% Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                  No heroes found matching "{modalSearch}"
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredModalHeroes.length} heroes</span>
              <button
                onClick={() => setModalTarget(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
