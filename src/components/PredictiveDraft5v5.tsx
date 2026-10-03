import React, { useState, useMemo, useRef } from 'react';
import { HEROES_DATA, HERO_MAP } from '../data/heroes';
import { HeroData, AttributeType, RoleType } from '../types/hero';
import { 
  runPredictive5v5Analysis, 
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
  Grid 
} from 'lucide-react';

interface PredictiveDraft5v5Props {
  onSelectHero?: (hero: HeroData) => void;
}

// Preset drafts for immediate 1-click testing
interface PresetScenario {
  id: string;
  name: string;
  description: string;
  radiantHeroIds: string[];
  direHeroIds: string[];
  radiantBanIds: string[];
  direBanIds: string[];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'ban_telegraph_am',
    name: 'AM & Nyx Banned',
    description: 'Dire banned Anti-Mage and Nyx. Oracle decrypts incoming Medusa / Storm Spirit mana-shield core.',
    radiantHeroIds: ['sven', 'storm_spirit', 'lion'],
    direHeroIds: ['faceless_void', 'witch_doctor'],
    radiantBanIds: ['pudge'],
    direBanIds: ['anti_mage', 'nyx_assassin']
  },
  {
    id: 'teamfight_clash',
    name: 'TI Wombo Combo',
    description: 'Classic 5v5 teamfight clash: Void + Witch Doctor vs Sven + Lion + Windranger.',
    radiantHeroIds: ['sven', 'storm_spirit', 'lion', 'windranger'],
    direHeroIds: ['faceless_void', 'witch_doctor', 'axe', 'phantom_assassin'],
    radiantBanIds: ['drow_ranger', 'pudge'],
    direBanIds: ['anti_mage', 'legion_commander']
  },
  {
    id: 'sustain_ban_aa',
    name: 'AA Banned (Sustain)',
    description: 'Dire banned Ancient Apparition. Oracle predicts high-regen Morphling / Huskar.',
    radiantHeroIds: ['drow_ranger', 'witch_doctor'],
    direHeroIds: ['axe'],
    radiantBanIds: ['storm_spirit'],
    direBanIds: ['ancient_apparition', 'drow_ranger']
  },
  {
    id: 'blank_canvas',
    name: 'Clean Draft',
    description: 'Empty board for customized Captains Mode and ranked predictive analysis.',
    radiantHeroIds: [],
    direHeroIds: [],
    radiantBanIds: [],
    direBanIds: []
  }
];

export const PredictiveDraft5v5: React.FC<PredictiveDraft5v5Props> = ({ onSelectHero }) => {
  // Radiant & Dire Picks (up to 5 heroes each)
  const [radiantHeroIds, setRadiantHeroIds] = useState<string[]>(['sven', 'storm_spirit', 'lion']);
  const [direHeroIds, setDireHeroIds] = useState<string[]>(['faceless_void', 'witch_doctor']);

  // Bans (up to 5-7 bans each)
  const [radiantBanIds, setRadiantBanIds] = useState<string[]>(['pudge']);
  const [direBanIds, setDireBanIds] = useState<string[]>(['anti_mage', 'nyx_assassin']);

  // Active Perspective: 'radiant' or 'dire'
  const [userTeam, setUserTeam] = useState<'radiant' | 'dire'>('radiant');

  // Currently active slot for one-click hero assignment
  const [activeTargetSlot, setActiveTargetSlot] = useState<{
    team: 'radiant' | 'dire';
    pos: PositionNumber;
  }>({ team: 'radiant', pos: 4 });

  // Sub-tab view: 'suggestions' | 'arsenal' | 'bans_intent' | 'tactical'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'suggestions' | 'arsenal' | 'bans_intent' | 'tactical'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subtab');
      if (sub === 'suggestions' || sub === 'arsenal' || sub === 'bans_intent' || sub === 'tactical') {
        return sub;
      }
    } catch {}
    return 'suggestions'; // Default to suggestions for immediate pick action
  });

  // Pick suggestions filter by position
  const [suggestionRoleFilter, setSuggestionRoleFilter] = useState<PositionNumber | 'all'>('all');

  // Hero Arsenal Tab quick filter state
  const [arsenalSearch, setArsenalSearch] = useState<string>('');
  const [arsenalAttr, setArsenalAttr] = useState<AttributeType | 'all'>('all');
  const [arsenalRole, setArsenalRole] = useState<RoleType | 'all'>('all');

  // Modal State for Slot Picker / Ban Picker
  const [modalTarget, setModalTarget] = useState<{
    team: 'radiant' | 'dire';
    type: 'pick' | 'ban';
    pos?: PositionNumber;
    slotIndex?: number;
  } | null>(null);

  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalAttr, setModalAttr] = useState<AttributeType | 'all'>('all');
  const [modalRole, setModalRole] = useState<RoleType | 'all'>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  // Run the Predictive Engine
  const analysis: Predictive5v5Analysis = useMemo(() => {
    return runPredictive5v5Analysis(
      radiantHeroIds,
      direHeroIds,
      radiantBanIds,
      direBanIds
    );
  }, [radiantHeroIds, direHeroIds, radiantBanIds, direBanIds]);

  // Set of already selected IDs
  const allSelectedIds = useMemo(() => {
    return new Set([...radiantHeroIds, ...direHeroIds, ...radiantBanIds, ...direBanIds]);
  }, [radiantHeroIds, direHeroIds, radiantBanIds, direBanIds]);

  // Handle Preset Load
  const handleLoadPreset = (preset: PresetScenario) => {
    SoundEngine.playPick();
    setRadiantHeroIds(preset.radiantHeroIds);
    setDireHeroIds(preset.direHeroIds);
    setRadiantBanIds(preset.radiantBanIds);
    setDireBanIds(preset.direBanIds);
    setActiveTargetSlot({ team: 'radiant', pos: (Math.min(5, preset.radiantHeroIds.length + 1) as PositionNumber) });
  };

  // Handle Clear Draft
  const handleClearDraft = () => {
    SoundEngine.playHover();
    setRadiantHeroIds([]);
    setDireHeroIds([]);
    setRadiantBanIds([]);
    setDireBanIds([]);
    setActiveTargetSlot({ team: 'radiant', pos: 1 });
  };

  // Handle Open Modal
  const handleOpenPicker = (team: 'radiant' | 'dire', type: 'pick' | 'ban', pos?: PositionNumber, slotIndex?: number) => {
    SoundEngine.playHover();
    if (pos) {
      setActiveTargetSlot({ team, pos });
    }
    setModalTarget({ team, type, pos, slotIndex });
    setModalSearch('');
    setModalAttr('all');
    setModalRole('all');
  };

  // Assign hero to a specific team & slot without jumping scroll
  const assignHeroToTeam = (team: 'radiant' | 'dire', pos: PositionNumber, heroId: string) => {
    SoundEngine.playPick();
    const currentHeroIds = team === 'radiant' ? [...radiantHeroIds] : [...direHeroIds];
    const targetIdx = pos - 1;

    if (targetIdx < currentHeroIds.length) {
      currentHeroIds[targetIdx] = heroId;
    } else {
      currentHeroIds.push(heroId);
    }

    if (team === 'radiant') {
      setRadiantHeroIds(currentHeroIds);
    } else {
      setDireHeroIds(currentHeroIds);
    }

    // Auto-advance activeTargetSlot to next empty position
    let nextPos: PositionNumber = pos;
    for (let p = 1; p <= 5; p++) {
      if (p > currentHeroIds.length) {
        nextPos = p as PositionNumber;
        break;
      }
    }
    setActiveTargetSlot({ team, pos: nextPos });
  };

  // 1-Click Pick from Suggested Picks (zero scroll jump)
  const handlePickSuggested = (e: React.MouseEvent, heroId: string, rolePos?: PositionNumber) => {
    e.preventDefault();
    e.stopPropagation();
    const targetPos = rolePos || activeTargetSlot.pos;
    assignHeroToTeam(userTeam, targetPos, heroId);
  };

  // 1-Click Pick from Arsenal Grid (zero scroll jump)
  const handlePickFromArsenal = (e: React.MouseEvent, heroId: string) => {
    e.preventDefault();
    e.stopPropagation();
    assignHeroToTeam(activeTargetSlot.team, activeTargetSlot.pos, heroId);
  };

  // 1-Click Ban from Suggestions (zero scroll jump)
  const handleBanHero = (e: React.MouseEvent, heroId: string) => {
    e.preventDefault();
    e.stopPropagation();
    SoundEngine.playPick();

    if (userTeam === 'radiant') {
      if (!radiantBanIds.includes(heroId) && radiantBanIds.length < 7) {
        setRadiantBanIds([...radiantBanIds, heroId]);
      }
    } else {
      if (!direBanIds.includes(heroId) && direBanIds.length < 7) {
        setDireBanIds([...direBanIds, heroId]);
      }
    }
  };

  // Modal hero click
  const handleAssignHeroFromModal = (heroId: string) => {
    if (!modalTarget) return;

    SoundEngine.playPick();
    const { team, type, slotIndex } = modalTarget;

    if (type === 'pick') {
      const pos = (slotIndex !== undefined ? slotIndex + 1 : 1) as PositionNumber;
      assignHeroToTeam(team, pos, heroId);
    } else {
      // Ban
      if (team === 'radiant') {
        if (!radiantBanIds.includes(heroId) && radiantBanIds.length < 7) {
          setRadiantBanIds([...radiantBanIds, heroId]);
        }
      } else {
        if (!direBanIds.includes(heroId) && direBanIds.length < 7) {
          setDireBanIds([...direBanIds, heroId]);
        }
      }
    }

    setModalTarget(null);
  };

  // Quick Remove from slot or ban
  const handleRemoveHero = (team: 'radiant' | 'dire', type: 'pick' | 'ban', index: number) => {
    SoundEngine.playHover();
    if (type === 'pick') {
      if (team === 'radiant') {
        setRadiantHeroIds(radiantHeroIds.filter((_, i) => i !== index));
        setActiveTargetSlot({ team: 'radiant', pos: (index + 1) as PositionNumber });
      } else {
        setDireHeroIds(direHeroIds.filter((_, i) => i !== index));
        setActiveTargetSlot({ team: 'dire', pos: (index + 1) as PositionNumber });
      }
    } else {
      if (team === 'radiant') {
        setRadiantBanIds(radiantBanIds.filter((_, i) => i !== index));
      } else {
        setDireBanIds(direBanIds.filter((_, i) => i !== index));
      }
    }
  };

  // Filtered heroes for Hero Arsenal Quick Picker Tab
  const arsenalHeroes = useMemo(() => {
    return HEROES_DATA.filter((hero) => {
      if (arsenalAttr !== 'all' && hero.attribute !== arsenalAttr) return false;
      if (arsenalRole !== 'all' && !hero.roles.includes(arsenalRole)) return false;
      if (arsenalSearch.trim()) {
        const q = arsenalSearch.toLowerCase();
        const matchesName = hero.name.toLowerCase().includes(q);
        const matchesAlias = hero.aliases?.some((a) => a.toLowerCase().includes(q));
        const matchesTitle = hero.title.toLowerCase().includes(q);
        if (!matchesName && !matchesAlias && !matchesTitle) return false;
      }
      return true;
    });
  }, [arsenalAttr, arsenalRole, arsenalSearch]);

  // Filtered heroes for Modal Picker
  const modalCandidateHeroes = useMemo(() => {
    return HEROES_DATA.filter((hero) => {
      if (modalAttr !== 'all' && hero.attribute !== modalAttr) return false;
      if (modalRole !== 'all' && !hero.roles.includes(modalRole)) return false;
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase();
        const matchesName = hero.name.toLowerCase().includes(q);
        const matchesAlias = hero.aliases?.some((a) => a.toLowerCase().includes(q));
        const matchesTitle = hero.title.toLowerCase().includes(q);
        if (!matchesName && !matchesAlias && !matchesTitle) return false;
      }
      return true;
    });
  }, [modalAttr, modalRole, modalSearch]);

  return (
    <div ref={containerRef} className="space-y-4 pb-12 animate-fadeIn">
      
      {/* ========================================================= */}
      {/* 1. COMPACT STREAMLINED HEADER & ADVANTAGE BAR (~80px)     */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-dota-panel via-dota-panelAlt to-dota-bg border-2 border-dota-border rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Title & Badge */}
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
                AI Engine
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Target: <strong className={activeTargetSlot.team === 'radiant' ? 'text-emerald-400' : 'text-rose-400'}>{activeTargetSlot.team.toUpperCase()} Pos {activeTargetSlot.pos} ({POSITION_DEFINITIONS[activeTargetSlot.pos].name})</strong></span>
              <span>•</span>
              <button
                onClick={() => setUserTeam(userTeam === 'radiant' ? 'dire' : 'radiant')}
                className="text-[10px] text-amber-300 font-bold hover:underline"
              >
                Switch to {userTeam === 'radiant' ? 'Dire' : 'Radiant'} Perspective
              </button>
            </div>
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
            {PRESET_SCENARIOS.slice(0, 2).map((p) => (
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
      {/* 2. HORIZONTAL PRO-ARENA DRAFT BOARD (COMPACT ~130px)      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        
        {/* RADIANT SIDE - HORIZONTAL 5 SLOTS */}
        <div className="bg-dota-panel rounded-2xl border-2 border-emerald-500/40 p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="font-dota font-black text-sm text-emerald-300 tracking-wider">THE RADIANT</span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30">
                {radiantHeroIds.length}/5
              </span>
            </div>
            {userTeam === 'radiant' && (
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40">
                Your Team
              </span>
            )}
          </div>

          {/* 5 Horizontal Slots Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = radiantHeroIds[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;
              const isActiveTarget = activeTargetSlot.team === 'radiant' && activeTargetSlot.pos === pos;

              return (
                <div
                  key={`rad-pos-${pos}`}
                  onClick={() => {
                    setActiveTargetSlot({ team: 'radiant', pos });
                    SoundEngine.playHover();
                  }}
                  className={`h-20 rounded-xl border p-1 flex flex-col justify-between transition-all cursor-pointer relative select-none group ${
                    isActiveTarget 
                      ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-2 ring-dota-gold/80' 
                      : hero 
                        ? 'bg-dota-card/95 border-emerald-500/50 hover:border-emerald-400' 
                        : 'bg-dota-bg/80 border-dashed border-emerald-500/30 hover:border-emerald-500/60'
                  }`}
                  title={hero ? `${hero.name} (Click to inspect or change)` : `Click to target Pos ${pos}`}
                >
                  {/* Top Bar: Pos & Remove */}
                  <div className="flex items-center justify-between text-[10px] leading-none">
                    <span className={`font-black uppercase px-1 py-0.2 rounded text-[8px] ${
                      isActiveTarget ? 'bg-amber-950 text-amber-300 border border-amber-500/50' : 'bg-slate-900 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      P{pos}
                    </span>
                    {hero ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHero('radiant', 'pick', pos - 1);
                        }}
                        className="text-slate-400 hover:text-red-400 p-0.5 leading-none"
                        title="Remove"
                      >
                        ×
                      </button>
                    ) : (
                      <span className="text-[8px] text-slate-500 uppercase">{def.lane.split(' ')[0]}</span>
                    )}
                  </div>

                  {/* Center: Hero Avatar & Name OR + Pick */}
                  {hero ? (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHero) onSelectHero(hero);
                      }}
                      className="flex items-center gap-1 overflow-hidden"
                    >
                      <img src={hero.avatarUrl} alt={hero.name} className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-emerald-500/50" />
                      <div className="truncate flex-1">
                        <div className="font-dota font-bold text-[11px] text-slate-100 truncate group-hover:text-emerald-300 leading-tight">
                          {hero.name}
                        </div>
                        <div className="text-[9px] text-emerald-400 font-semibold leading-none">{hero.winRate}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-0.5 text-slate-400 group-hover:text-emerald-300">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[9px] font-bold">Pick</span>
                    </div>
                  )}

                  {/* Bottom: Role & Target Tag */}
                  <div className="text-[8px] text-slate-400 truncate flex items-center justify-between leading-none">
                    <span className="truncate">{hero ? hero.roles[0].replace(' Support', ' Sup') : def.role.replace(' Support', ' Sup')}</span>
                    {isActiveTarget && <span className="text-amber-300 font-black text-[7px] animate-pulse">TARGET</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radiant Bans Bar (Compact Single Row) */}
          <div className="flex items-center gap-1.5 h-7 min-h-[28px] overflow-x-auto custom-scrollbar pt-0.5 border-t border-emerald-500/20 text-[10px]">
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
                onClick={() => handleOpenPicker('radiant', 'ban')}
                className="flex-shrink-0 text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded border border-dashed border-red-500/40"
              >
                <Plus className="w-2.5 h-2.5" /> Ban
              </button>
            )}
          </div>
        </div>

        {/* DIRE SIDE - HORIZONTAL 5 SLOTS */}
        <div className="bg-dota-panel rounded-2xl border-2 border-rose-500/40 p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span className="font-dota font-black text-sm text-rose-300 tracking-wider">THE DIRE</span>
              <span className="text-[10px] text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-500/30">
                {direHeroIds.length}/5
              </span>
            </div>
            {userTeam === 'dire' && (
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40">
                Your Team
              </span>
            )}
          </div>

          {/* 5 Horizontal Slots Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = direHeroIds[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;
              const isActiveTarget = activeTargetSlot.team === 'dire' && activeTargetSlot.pos === pos;

              return (
                <div
                  key={`dire-pos-${pos}`}
                  onClick={() => {
                    setActiveTargetSlot({ team: 'dire', pos });
                    SoundEngine.playHover();
                  }}
                  className={`h-20 rounded-xl border p-1 flex flex-col justify-between transition-all cursor-pointer relative select-none group ${
                    isActiveTarget 
                      ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-2 ring-dota-gold/80' 
                      : hero 
                        ? 'bg-dota-card/95 border-rose-500/50 hover:border-rose-400' 
                        : 'bg-dota-bg/80 border-dashed border-rose-500/30 hover:border-rose-500/60'
                  }`}
                  title={hero ? `${hero.name} (Click to inspect or change)` : `Click to target Pos ${pos}`}
                >
                  {/* Top Bar: Pos & Remove */}
                  <div className="flex items-center justify-between text-[10px] leading-none">
                    <span className={`font-black uppercase px-1 py-0.2 rounded text-[8px] ${
                      isActiveTarget ? 'bg-amber-950 text-amber-300 border border-amber-500/50' : 'bg-slate-900 text-rose-400 border border-rose-500/40'
                    }`}>
                      P{pos}
                    </span>
                    {hero ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHero('dire', 'pick', pos - 1);
                        }}
                        className="text-slate-400 hover:text-red-400 p-0.5 leading-none"
                        title="Remove"
                      >
                        ×
                      </button>
                    ) : (
                      <span className="text-[8px] text-slate-500 uppercase">{def.lane.split(' ')[0]}</span>
                    )}
                  </div>

                  {/* Center: Hero Avatar & Name OR + Pick */}
                  {hero ? (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHero) onSelectHero(hero);
                      }}
                      className="flex items-center gap-1 overflow-hidden"
                    >
                      <img src={hero.avatarUrl} alt={hero.name} className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-rose-500/50" />
                      <div className="truncate flex-1">
                        <div className="font-dota font-bold text-[11px] text-slate-100 truncate group-hover:text-rose-300 leading-tight">
                          {hero.name}
                        </div>
                        <div className="text-[9px] text-rose-400 font-semibold leading-none">{hero.winRate}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-0.5 text-slate-400 group-hover:text-rose-300">
                      <Plus className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-[9px] font-bold">Pick</span>
                    </div>
                  )}

                  {/* Bottom: Role & Target Tag */}
                  <div className="text-[8px] text-slate-400 truncate flex items-center justify-between leading-none">
                    <span className="truncate">{hero ? hero.roles[0].replace(' Support', ' Sup') : def.role.replace(' Support', ' Sup')}</span>
                    {isActiveTarget && <span className="text-amber-300 font-black text-[7px] animate-pulse">TARGET</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dire Bans Bar (Compact Single Row) */}
          <div className="flex items-center gap-1.5 h-7 min-h-[28px] overflow-x-auto custom-scrollbar pt-0.5 border-t border-rose-500/20 text-[10px]">
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
                onClick={() => handleOpenPicker('dire', 'ban')}
                className="flex-shrink-0 text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded border border-dashed border-red-500/40"
              >
                <Plus className="w-2.5 h-2.5" /> Ban
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. THE SELECTING WINDOW & ORACLE HUB (STARTS AT Y ~240px) */}
      {/* ========================================================= */}
      <div className="bg-dota-panel rounded-2xl border-2 border-dota-border overflow-hidden shadow-2xl">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center border-b border-dota-border bg-dota-card/60 overflow-x-auto p-1.5 gap-1.5">
          
          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('suggestions');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'suggestions'
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
              setActiveAnalysisTab('arsenal');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'arsenal'
                ? 'bg-gradient-to-r from-indigo-500/30 to-blue-500/30 text-indigo-300 border border-indigo-500/70 shadow-dota-mana font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-indigo-400" />
            <span>🎮 Hero Arsenal (Quick Picker)</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('bans_intent');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'bans_intent'
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
              setActiveAnalysisTab('tactical');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'tactical'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/70 shadow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-cyan-400" />
            <span>⚔️ Lane Forecast & Strategy</span>
          </button>

        </div>

        {/* TAB CONTENT - IMMACULATELY SIZED FOR FULL VIEWPORT VISIBILITY */}
        <div className="p-4 sm:p-5 space-y-5">

          {/* ========================================================= */}
          {/* TAB 1: OPTIMAL PICKS (DIRECTLY VISIBLE, MULTIPLE ROWS!)   */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'suggestions' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* PICKS FIRST: High visibility, 2-3 rows immediately visible */}
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

                {/* Compact Picks Grid - Multiple rows fit easily in view */}
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
                            onClick={(e) => handlePickSuggested(e, pick.hero.id, pick.pos)}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] shadow active:scale-95"
                          >
                            Pick for {userTeam === 'radiant' ? 'Radiant' : 'Dire'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* RECOMMENDED BANS SECTION */}
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
                        onClick={(e) => handleBanHero(e, ban.hero.id)}
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

          {/* ========================================================= */}
          {/* TAB 2: HERO ARSENAL (QUICK 1-CLICK PICKER - 4+ ROWS!)    */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'arsenal' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <h3 className="font-dota font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>1-CLICK HERO ARSENAL</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-300 px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/40">
                      Target: {activeTargetSlot.team.toUpperCase()} Pos {activeTargetSlot.pos}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Click any hero to instantly draft into {activeTargetSlot.team.toUpperCase()} Pos {activeTargetSlot.pos} ({POSITION_DEFINITIONS[activeTargetSlot.pos].name})
                  </p>
                </div>

                {/* Search & Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-44 sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search 128 heroes..."
                      value={arsenalSearch}
                      onChange={(e) => setArsenalSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1 bg-dota-bg border border-dota-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold"
                    />
                  </div>

                  {/* Attributes */}
                  <div className="flex items-center gap-0.5 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-[10px]">
                    {(['all', 'str', 'agi', 'int', 'all'] as (AttributeType | 'all')[]).slice(0, 4).map((attr, idx) => (
                      <button
                        key={`attr-arsenal-${idx}`}
                        onClick={() => setArsenalAttr(attr)}
                        className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                          arsenalAttr === attr ? 'bg-dota-gold text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {attr === 'all' ? 'All' : attr}
                      </button>
                    ))}
                  </div>

                  {/* Roles */}
                  <div className="flex items-center gap-0.5 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-[10px]">
                    {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as (RoleType | 'all')[]).map((role, idx) => (
                      <button
                        key={`role-arsenal-${idx}`}
                        onClick={() => setArsenalRole(role)}
                        className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                          arsenalRole === role ? 'bg-indigo-500 text-white font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {role === 'all' ? 'All' : role.replace(' Support', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1-Click Hero Arsenal Grid - 4 to 5 full rows visible! */}
              <div className="max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {arsenalHeroes.map((hero) => {
                    const isSelected = allSelectedIds.has(hero.id);

                    return (
                      <button
                        key={`arsenal-hero-${hero.id}`}
                        disabled={isSelected}
                        onClick={(e) => handlePickFromArsenal(e, hero.id)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-900'
                            : 'bg-dota-card hover:bg-slate-800 border-dota-border hover:border-dota-gold/70 hover:scale-[1.02] shadow-sm'
                        }`}
                        title={isSelected ? 'Already drafted or banned' : `Pick ${hero.name} for ${activeTargetSlot.team.toUpperCase()} Pos ${activeTargetSlot.pos}`}
                      >
                        <img src={hero.avatarUrl} alt={hero.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        <div className="truncate flex-1">
                          <div className="font-dota font-bold text-[11px] text-slate-100 truncate">{hero.name}</div>
                          <div className="text-[9px] text-slate-400 flex items-center justify-between">
                            <span className={`uppercase font-bold ${
                              hero.attribute === 'str' ? 'text-red-400' :
                              hero.attribute === 'agi' ? 'text-green-400' :
                              hero.attribute === 'int' ? 'text-blue-400' : 'text-purple-400'
                            }`}>{hero.attribute}</span>
                            <span className="text-emerald-400 font-semibold">{hero.winRate}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: BAN INTENT & PREDICTED LINEUP                      */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'bans_intent' && (
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          assignHeroToTeam('dire', pred.predictedPos, pred.hero.id);
                        }}
                        className="w-full py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 font-bold text-[10px]"
                      >
                        Assign to Dire
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: TACTICAL ADVANTAGE & LANE FORECAST                 */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'tactical' && (
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
      {/* 4. COMPACT MODAL HERO SELECTOR FOR PICKS & BANS           */}
      {/* ========================================================= */}
      {modalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-dota-panel rounded-2xl border-2 border-dota-gold/60 p-4 sm:p-5 space-y-3 shadow-2xl max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-dota-border">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border ${
                  modalTarget.type === 'pick'
                    ? (modalTarget.team === 'radiant' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-rose-500/20 border-rose-500/50 text-rose-300')
                    : 'bg-red-500/20 border-red-500/50 text-red-300'
                }`}>
                  {modalTarget.type === 'pick' ? <Swords className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-dota font-black text-base text-slate-100">
                    {modalTarget.type === 'pick'
                      ? `Select Hero for ${modalTarget.team.toUpperCase()} (Pos ${modalTarget.pos || 1})`
                      : `Add Ban for ${modalTarget.team.toUpperCase()}`
                    }
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalTarget.type === 'pick' ? 'Choose from available Dota 2 heroes' : 'Banning this hero will update predictive enemy intent'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalTarget(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 128 heroes..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 bg-dota-bg border border-dota-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold"
                />
              </div>

              {/* Attribute filter */}
              <div className="flex items-center gap-0.5 bg-dota-bg p-0.5 rounded-lg border border-dota-border text-xs">
                {(['all', 'str', 'agi', 'int', 'all'] as (AttributeType | 'all')[]).slice(0, 4).map((attr, idx) => (
                  <button
                    key={`attr-modal-${idx}`}
                    onClick={() => setModalAttr(attr)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                      modalAttr === attr ? 'bg-dota-gold text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {attr === 'all' ? 'All' : attr}
                  </button>
                ))}
              </div>
            </div>

            {/* Heroes Grid Scrollable - 4 to 5 rows visible! */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[55vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {modalCandidateHeroes.map((hero) => {
                  const isSelected = allSelectedIds.has(hero.id);

                  return (
                    <button
                      key={`modal-hero-${hero.id}`}
                      disabled={isSelected}
                      onClick={() => handleAssignHeroFromModal(hero.id)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800'
                          : 'bg-dota-card/90 hover:bg-slate-800 border-dota-border hover:border-dota-gold/60 hover:scale-[1.02]'
                      }`}
                    >
                      <img src={hero.avatarUrl} alt={hero.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-dota font-bold text-xs text-slate-100 truncate">{hero.name}</div>
                        <div className="text-[9px] text-slate-400 flex items-center gap-1">
                          <span className={`uppercase font-bold ${
                            hero.attribute === 'str' ? 'text-red-400' :
                            hero.attribute === 'agi' ? 'text-green-400' :
                            hero.attribute === 'int' ? 'text-blue-400' : 'text-purple-400'
                          }`}>{hero.attribute}</span>
                          <span>•</span>
                          <span>{hero.winRate}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-dota-border flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Showing {modalCandidateHeroes.length} heroes</span>
              <button
                onClick={() => setModalTarget(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
