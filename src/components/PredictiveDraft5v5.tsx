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
  SlidersHorizontal,
  Info,
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
    name: 'Ban Intent: AM & Nyx Banned',
    description: 'Dire banned Anti-Mage and Nyx. Oracle decrypts incoming Medusa / Storm Spirit mana-shield core.',
    radiantHeroIds: ['sven', 'storm_spirit', 'lion'],
    direHeroIds: ['faceless_void', 'witch_doctor'],
    radiantBanIds: ['pudge'],
    direBanIds: ['anti_mage', 'nyx_assassin']
  },
  {
    id: 'teamfight_clash',
    name: 'TI Wombo Combo Clash',
    description: 'Classic 5v5 teamfight clash: Void + Witch Doctor vs Sven + Lion + Windranger.',
    radiantHeroIds: ['sven', 'storm_spirit', 'lion', 'windranger'],
    direHeroIds: ['faceless_void', 'witch_doctor', 'axe', 'phantom_assassin'],
    radiantBanIds: ['drow_ranger', 'pudge'],
    direBanIds: ['anti_mage', 'legion_commander']
  },
  {
    id: 'sustain_ban_aa',
    name: 'Sustain Telegraph: AA Banned',
    description: 'Dire banned Ancient Apparition & Spirit Vessel carriers. Oracle predicts high-regen Morphling / Huskar.',
    radiantHeroIds: ['drow_ranger', 'witch_doctor'],
    direHeroIds: ['axe'],
    radiantBanIds: ['storm_spirit'],
    direBanIds: ['ancient_apparition', 'drow_ranger']
  },
  {
    id: 'blank_canvas',
    name: 'Clean Draft (From Scratch)',
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
    return 'suggestions'; // Default to suggestions for immediate pick/ban action
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
    <div ref={containerRef} className="space-y-6 pb-16 animate-fadeIn">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & DRAFT ADVANTAGE METER                     */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-dota-panel via-dota-panelAlt to-dota-bg border-2 border-dota-border p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Header Title & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 p-0.5 shadow-dota-glow flex items-center justify-center">
                <div className="w-full h-full bg-dota-bg rounded-[14px] flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-dota text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 tracking-wider">
                    5v5 PREDICTIVE DRAFT ORACLE
                  </h1>
                  <span className="flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 border border-indigo-500/50">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    AI Predictive Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans tracking-wide">
                  Decodes telegraphed enemy picks from bans • Forecasts missing lineup roles • Recommends optimal counter-picks
                </p>
              </div>
            </div>

            {/* Quick Action Presets & Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-dota-card/80 border border-dota-border rounded-xl p-1 text-xs">
                <span className="text-[11px] text-slate-400 px-2 font-bold uppercase tracking-wider hidden sm:inline">Presets:</span>
                {PRESET_SCENARIOS.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleLoadPreset(p)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all border border-transparent hover:border-dota-gold/40"
                    title={p.description}
                  >
                    {p.name.split(':')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={handleClearDraft}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-dota-border hover:border-red-500/50 text-xs font-bold transition-all"
                title="Clear all picks and bans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Draft Advantage Meter */}
          <div className="bg-dota-card/90 rounded-2xl border border-dota-border p-4 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="font-dota uppercase tracking-wider text-sm font-black">
                  Radiant Advantage: {analysis.draftAdvantage.radiantScore}%
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>Early: <strong className={analysis.draftAdvantage.earlyAdvantage === 'Radiant' ? 'text-emerald-400' : (analysis.draftAdvantage.earlyAdvantage === 'Dire' ? 'text-rose-400' : 'text-slate-300')}>{analysis.draftAdvantage.earlyAdvantage}</strong></span>
                <span>•</span>
                <span>Mid: <strong className={analysis.draftAdvantage.midAdvantage === 'Radiant' ? 'text-emerald-400' : (analysis.draftAdvantage.midAdvantage === 'Dire' ? 'text-rose-400' : 'text-slate-300')}>{analysis.draftAdvantage.midAdvantage}</strong></span>
                <span>•</span>
                <span>Late: <strong className={analysis.draftAdvantage.lateAdvantage === 'Radiant' ? 'text-emerald-400' : (analysis.draftAdvantage.lateAdvantage === 'Dire' ? 'text-rose-400' : 'text-slate-300')}>{analysis.draftAdvantage.lateAdvantage}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-rose-400">
                <Swords className="w-4 h-4" />
                <span className="font-dota uppercase tracking-wider text-sm font-black">
                  Dire Advantage: {analysis.draftAdvantage.direScore}%
                </span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="relative h-3.5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-dota-border">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-700 ease-out flex items-center justify-start pl-2"
                style={{ width: `${analysis.draftAdvantage.radiantScore}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 transition-all duration-700 ease-out"
                style={{ width: `${analysis.draftAdvantage.direScore}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-0.5 h-full bg-white/70 shadow-glow" />
              </div>
            </div>

            {/* Perspective & Active Target Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-slate-400">
                  <Info className="w-3.5 h-3.5 text-dota-gold" />
                  Active Target Slot:
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${
                  activeTargetSlot.team === 'radiant'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-rose-950 text-rose-300 border-rose-500/50'
                }`}>
                  {activeTargetSlot.team.toUpperCase()} POS {activeTargetSlot.pos} ({POSITION_DEFINITIONS[activeTargetSlot.pos].name})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Drafting Side:</span>
                <button
                  onClick={() => setUserTeam('radiant')}
                  className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all ${
                    userTeam === 'radiant'
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-dota-glow font-black'
                      : 'text-slate-400 hover:text-white bg-slate-800/60 border border-transparent'
                  }`}
                >
                  Radiant View
                </button>
                <button
                  onClick={() => setUserTeam('dire')}
                  className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all ${
                    userTeam === 'dire'
                      ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-dota-crimson font-black'
                      : 'text-slate-400 hover:text-white bg-slate-800/60 border border-transparent'
                  }`}
                >
                  Dire View
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THE 5v5 DRAFT BOARD: RADIANT VS DIRE (FIXED HEIGHT)    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* RADIANT TEAM (LIGHT) */}
        <div className="bg-dota-panel rounded-3xl border-2 border-emerald-500/30 p-4 sm:p-5 space-y-3.5 shadow-xl relative min-h-[460px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <h2 className="font-dota font-black text-lg text-emerald-300 tracking-wider">
                  THE RADIANT
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  {radiantHeroIds.length} / 5 Picked
                </span>
              </div>
              {userTeam === 'radiant' && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Your Perspective
                </span>
              )}
            </div>

            {/* 5 Pos Slots - Strict Fixed Height (h-16) to eliminate layout shift */}
            <div className="space-y-2">
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
                    className={`h-16 min-h-[64px] max-h-16 flex items-center justify-between px-3 py-1.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isActiveTarget
                        ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-1 ring-dota-gold/80'
                        : hero 
                          ? 'bg-dota-card/90 border-emerald-500/40 hover:border-emerald-400' 
                          : 'bg-dota-bg/60 border-dashed border-emerald-500/30 hover:border-emerald-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Pos Badge */}
                      <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border transition-all ${
                        isActiveTarget ? 'bg-amber-950/80 border-dota-gold text-amber-300' : 'bg-slate-900 border-emerald-500/40 text-emerald-400'
                      }`}>
                        <span className="text-[8px] font-black uppercase leading-none">POS</span>
                        <span className="text-sm font-black leading-none font-dota">{pos}</span>
                      </div>

                      {hero ? (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectHero) onSelectHero(hero);
                          }}
                          className="flex items-center gap-2.5 group overflow-hidden"
                          title="Click to view full hero guide"
                        >
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/60 relative flex-shrink-0 group-hover:scale-105 transition-transform">
                            <img src={hero.avatarUrl} alt={hero.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-dota font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                                {hero.name}
                              </span>
                              <span className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase ${
                                hero.attribute === 'str' ? 'bg-red-500/20 text-red-300' :
                                hero.attribute === 'agi' ? 'bg-green-500/20 text-green-300' :
                                hero.attribute === 'int' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {hero.attribute}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                              <span>{def.lane}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">{hero.winRate}% WR</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <span>{def.name}</span>
                            {isActiveTarget && (
                              <span className="text-[9px] font-black text-amber-300 uppercase px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40">
                                Target Slot
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{def.lane} • Click hero below to pick</div>
                        </div>
                      )}
                    </div>

                    {/* Slot Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hero ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveHero('radiant', 'pick', pos - 1);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 transition-all"
                          title="Remove Hero"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPicker('radiant', 'pick', pos, pos - 1);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Search</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Radiant Bans Bar - Single line horizontal scrollable */}
          <div className="pt-2 border-t border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                Radiant Bans ({radiantBanIds.length}/7):
              </span>
              {radiantBanIds.length < 7 && (
                <button
                  onClick={() => handleOpenPicker('radiant', 'ban')}
                  className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Ban
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 h-11 min-h-[44px] max-h-11 overflow-x-auto custom-scrollbar p-1.5 bg-dota-bg/80 rounded-xl border border-dota-border">
              {radiantBanIds.map((banId, idx) => {
                const hero = HERO_MAP.get(banId);
                return (
                  <div 
                    key={`rad-ban-${banId}-${idx}`}
                    className="flex-shrink-0 flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-bold"
                  >
                    {hero && (
                      <img src={hero.avatarUrl} alt={hero.name} className="w-5 h-5 rounded-md object-cover grayscale" />
                    )}
                    <span className="line-through">{hero?.name || banId}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHero('radiant', 'ban', idx);
                      }}
                      className="ml-1 text-red-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {radiantBanIds.length === 0 && (
                <span className="text-[11px] text-slate-500 italic px-2">No bans registered. Click + Add Ban to lock out enemy heroes.</span>
              )}
            </div>
          </div>

        </div>

        {/* DIRE TEAM (DARKNESS) */}
        <div className="bg-dota-panel rounded-3xl border-2 border-rose-500/30 p-4 sm:p-5 space-y-3.5 shadow-xl relative min-h-[460px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                <h2 className="font-dota font-black text-lg text-rose-300 tracking-wider">
                  THE DIRE
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-400 border border-rose-500/30">
                  {direHeroIds.length} / 5 Picked
                </span>
              </div>
              {userTeam === 'dire' && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Your Perspective
                </span>
              )}
            </div>

            {/* 5 Pos Slots - Strict Fixed Height (h-16) to eliminate layout shift */}
            <div className="space-y-2">
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
                    className={`h-16 min-h-[64px] max-h-16 flex items-center justify-between px-3 py-1.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isActiveTarget
                        ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-1 ring-dota-gold/80'
                        : hero 
                          ? 'bg-dota-card/90 border-rose-500/40 hover:border-rose-400' 
                          : 'bg-dota-bg/60 border-dashed border-rose-500/30 hover:border-rose-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Pos Badge */}
                      <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border transition-all ${
                        isActiveTarget ? 'bg-amber-950/80 border-dota-gold text-amber-300' : 'bg-slate-900 border-rose-500/40 text-rose-400'
                      }`}>
                        <span className="text-[8px] font-black uppercase leading-none">POS</span>
                        <span className="text-sm font-black leading-none font-dota">{pos}</span>
                      </div>

                      {hero ? (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectHero) onSelectHero(hero);
                          }}
                          className="flex items-center gap-2.5 group overflow-hidden"
                          title="Click to view full hero guide"
                        >
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-rose-500/60 relative flex-shrink-0 group-hover:scale-105 transition-transform">
                            <img src={hero.avatarUrl} alt={hero.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-dota font-bold text-sm text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                                {hero.name}
                              </span>
                              <span className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase ${
                                hero.attribute === 'str' ? 'bg-red-500/20 text-red-300' :
                                hero.attribute === 'agi' ? 'bg-green-500/20 text-green-300' :
                                hero.attribute === 'int' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {hero.attribute}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                              <span>{def.lane}</span>
                              <span>•</span>
                              <span className="text-rose-400 font-bold">{hero.winRate}% WR</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <span>{def.name}</span>
                            {isActiveTarget && (
                              <span className="text-[9px] font-black text-amber-300 uppercase px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40">
                                Target Slot
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{def.lane} • Click hero below to pick</div>
                        </div>
                      )}
                    </div>

                    {/* Slot Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hero ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveHero('dire', 'pick', pos - 1);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 transition-all"
                          title="Remove Hero"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPicker('dire', 'pick', pos, pos - 1);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/50 hover:border-rose-400 text-xs font-bold transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Search</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Dire Bans Bar - Single line horizontal scrollable */}
          <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                Dire Bans ({direBanIds.length}/7):
              </span>
              {direBanIds.length < 7 && (
                <button
                  onClick={() => handleOpenPicker('dire', 'ban')}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Ban
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 h-11 min-h-[44px] max-h-11 overflow-x-auto custom-scrollbar p-1.5 bg-dota-bg/80 rounded-xl border border-dota-border">
              {direBanIds.map((banId, idx) => {
                const hero = HERO_MAP.get(banId);
                return (
                  <div 
                    key={`dire-ban-${banId}-${idx}`}
                    className="flex-shrink-0 flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-bold"
                  >
                    {hero && (
                      <img src={hero.avatarUrl} alt={hero.name} className="w-5 h-5 rounded-md object-cover grayscale" />
                    )}
                    <span className="line-through">{hero?.name || banId}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHero('dire', 'ban', idx);
                      }}
                      className="ml-1 text-red-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {direBanIds.length === 0 && (
                <span className="text-[11px] text-slate-500 italic px-2">No bans registered. Click + Add Ban to input enemy bans.</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. PREDICTIVE ANALYSIS & HERO SELECTION SECTION (TABS)    */}
      {/* ========================================================= */}
      <div className="bg-dota-panel rounded-3xl border-2 border-dota-border overflow-hidden shadow-2xl">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center border-b border-dota-border bg-dota-card/50 overflow-x-auto p-1.5 gap-2">
          
          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('suggestions');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'suggestions'
                ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/60 shadow-dota-glow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>🎯 Optimal Picks & Counter Bans</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('arsenal');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'arsenal'
                ? 'bg-gradient-to-r from-indigo-500/25 to-blue-500/25 text-indigo-300 border border-indigo-500/60 shadow-dota-mana font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Grid className="w-4 h-4 text-indigo-400" />
            <span>🎮 Hero Arsenal (Quick Picker)</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('bans_intent');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'bans_intent'
                ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/60 shadow-dota-glow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-amber-400" />
            <span>🔮 Ban Intent & Predicted Lineup</span>
            {analysis.banPredictions.telegraphedHeroes.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono">
                {analysis.banPredictions.telegraphedHeroes.length} telegraphed
              </span>
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('tactical');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'tactical'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/60 shadow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>⚔️ Lane Forecast & Strategy</span>
          </button>

        </div>

        {/* TAB CONTENT - STABLE CONTAINERS WITH ZERO JUMP */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: OPTIMAL PICKS (PLACED FIRST!) & COUNTER BANS       */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'suggestions' && (
            <div className="space-y-7 animate-fadeIn">
              
              {/* PICKS FIRST: Never gets pushed down by bans! */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-dota font-bold text-lg text-slate-100 flex items-center gap-2">
                        OPTIMAL PICKS FOR {userTeam.toUpperCase()}
                        <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40">
                          Targeting Pos {activeTargetSlot.pos}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        1-Click pick immediately slots into your active target slot ({POSITION_DEFINITIONS[activeTargetSlot.pos].name})
                      </p>
                    </div>
                  </div>

                  {/* Position Filter Tabs */}
                  <div className="flex items-center gap-1 bg-dota-bg p-1 rounded-xl border border-dota-border overflow-x-auto text-[11px]">
                    <button
                      onClick={() => setSuggestionRoleFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                        suggestionRoleFilter === 'all'
                          ? 'bg-dota-gold text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
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
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                          suggestionRoleFilter === pos || activeTargetSlot.pos === pos
                            ? 'bg-dota-gold text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pos {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Picks Grid - Stable min-h to prevent layout bounce */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[300px]">
                  {analysis.suggestedPicks
                    .filter((p) => suggestionRoleFilter === 'all' || p.pos === suggestionRoleFilter)
                    .slice(0, 6)
                    .map((pick, i) => (
                      <div
                        key={`pick-sugg-${pick.hero.id}-${i}`}
                        className="p-4 rounded-2xl bg-dota-card border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3 shadow-md flex flex-col justify-between group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              {pick.roleName}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-300">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>{pick.score}/100 Match</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <img src={pick.hero.avatarUrl} alt={pick.hero.name} className="w-12 h-12 rounded-xl object-cover border border-emerald-500/60 flex-shrink-0 group-hover:scale-105 transition-transform" />
                            <div>
                              <div className="font-dota font-bold text-sm text-slate-100">{pick.hero.name}</div>
                              <div className="text-[11px] text-emerald-400 font-bold">{pick.winRate}% Win Rate</div>
                            </div>
                          </div>

                          {/* Tactical Reasons */}
                          <div className="space-y-1.5 text-[11px]">
                            {pick.reasons.map((r, ri) => (
                              <div key={ri} className="flex items-start gap-1.5 text-slate-300">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => onSelectHero && onSelectHero(pick.hero)}
                            className="text-xs text-slate-400 hover:text-white font-bold"
                          >
                            Inspect Build →
                          </button>
                          <button
                            onClick={(e) => handlePickSuggested(e, pick.hero.id, pick.pos)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-md active:scale-95"
                          >
                            Pick for {userTeam === 'radiant' ? 'Radiant' : 'Dire'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* RECOMMENDED BANS */}
              <div className="space-y-4 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-dota font-bold text-lg text-slate-100">
                        RECOMMENDED BANS FOR {userTeam.toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Counters to your drafted cores, enemy combo enablers, and telegraphed enemy picks
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {analysis.suggestedBans.map((ban, i) => (
                    <div 
                      key={`ban-sugg-${ban.hero.id}-${i}`}
                      className="p-4 rounded-2xl bg-dota-card border border-red-500/30 hover:border-red-500/60 transition-all space-y-3 shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            ban.priority === 'CRITICAL' ? 'bg-red-950 text-red-300 border-red-500' :
                            ban.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-500' :
                            'bg-slate-900 text-slate-300 border-slate-700'
                          }`}>
                            {ban.priority} PRIORITY
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Impact: <strong className="text-amber-300">{ban.impactScore}/100</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img src={ban.hero.avatarUrl} alt={ban.hero.name} className="w-12 h-12 rounded-xl object-cover border border-red-500/50 flex-shrink-0" />
                          <div>
                            <div className="font-dota font-bold text-sm text-slate-100">{ban.hero.name}</div>
                            <div className="text-[10px] text-red-300 font-bold uppercase">{ban.category}</div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug">
                          {ban.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{ban.hero.winRate}% Win Rate</span>
                        <button
                          onClick={(e) => handleBanHero(e, ban.hero.id)}
                          className="px-3 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          Ban This Hero
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HERO ARSENAL (INLINE QUICK PICKER)                 */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'arsenal' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-dota font-bold text-lg text-slate-100 flex items-center gap-2">
                    <span>1-CLICK HERO ARSENAL</span>
                    <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40">
                      Target: {activeTargetSlot.team.toUpperCase()} Pos {activeTargetSlot.pos}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any hero to instantly draft into {activeTargetSlot.team.toUpperCase()} Pos {activeTargetSlot.pos} ({POSITION_DEFINITIONS[activeTargetSlot.pos].name})
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-52 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search 128 heroes..."
                      value={arsenalSearch}
                      onChange={(e) => setArsenalSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-dota-bg border border-dota-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold"
                    />
                  </div>

                  {/* Attribute pills */}
                  <div className="flex items-center gap-1 bg-dota-bg p-1 rounded-xl border border-dota-border text-xs">
                    {(['all', 'str', 'agi', 'int', 'all'] as (AttributeType | 'all')[]).slice(0, 4).map((attr, idx) => (
                      <button
                        key={`attr-arsenal-${idx}`}
                        onClick={() => setArsenalAttr(attr)}
                        className={`px-2 py-0.5 rounded-lg font-bold uppercase text-[11px] transition-all ${
                          arsenalAttr === attr ? 'bg-dota-gold text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {attr === 'all' ? 'All' : attr}
                      </button>
                    ))}
                  </div>

                  {/* Role pills */}
                  <div className="flex items-center gap-1 bg-dota-bg p-1 rounded-xl border border-dota-border text-xs overflow-x-auto">
                    {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as (RoleType | 'all')[]).map((role, idx) => (
                      <button
                        key={`role-arsenal-${idx}`}
                        onClick={() => setArsenalRole(role)}
                        className={`px-2 py-0.5 rounded-lg font-bold uppercase text-[11px] transition-all whitespace-nowrap ${
                          arsenalRole === role ? 'bg-indigo-500 text-white font-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {role === 'all' ? 'All' : role.replace(' Support', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Arsenal Grid Scrollable - Zero dropping down */}
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {arsenalHeroes.map((hero) => {
                    const isSelected = allSelectedIds.has(hero.id);

                    return (
                      <button
                        key={`arsenal-hero-${hero.id}`}
                        disabled={isSelected}
                        onClick={(e) => handlePickFromArsenal(e, hero.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-900'
                            : 'bg-dota-card hover:bg-slate-800 border-dota-border hover:border-dota-gold/70 hover:scale-[1.02] shadow-sm'
                        }`}
                        title={isSelected ? 'Already drafted or banned' : `Pick ${hero.name} for ${activeTargetSlot.team.toUpperCase()} Pos ${activeTargetSlot.pos}`}
                      >
                        <img src={hero.avatarUrl} alt={hero.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        <div className="truncate flex-1">
                          <div className="font-dota font-bold text-xs text-slate-100 truncate">{hero.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
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
            <div className="space-y-7 animate-fadeIn">
              
              {/* Ban Intent Decryption Card */}
              <div className="bg-gradient-to-br from-dota-card to-dota-bg rounded-2xl border-2 border-amber-500/30 p-5 sm:p-6 space-y-4 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-dota font-bold text-lg text-amber-200">
                        BAN-INTENT DECRYPTION
                      </h3>
                      <p className="text-xs text-slate-400">
                        Infers what strategy Dire is clearing the runway for based on their bans
                      </p>
                    </div>
                  </div>

                  {analysis.banPredictions.detectedStrategy && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Detected Strategy</span>
                      <span className="text-sm font-black text-amber-200 font-dota">
                        {analysis.banPredictions.detectedStrategy.name}
                      </span>
                    </div>
                  )}
                </div>

                {analysis.banPredictions.detectedStrategy ? (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {analysis.banPredictions.detectedStrategy.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-amber-300/90 font-mono">
                      <span>Trigger Bans:</span>
                      <span className="font-bold underline decoration-amber-400/50">
                        {analysis.banPredictions.detectedStrategy.triggerBans.join(', ')}
                      </span>
                      <span>•</span>
                      <span>Confidence: {analysis.banPredictions.detectedStrategy.confidence}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                    Add bans on Dire’s side (e.g. Anti-Mage, Ancient Apparition, Axe, Silencer) to see real-time strategy intent decryption.
                  </div>
                )}

                {/* Telegraphed Heroes Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    High-Probability Telegraphed Picks ({analysis.banPredictions.telegraphedHeroes.length})
                  </h4>

                  {analysis.banPredictions.telegraphedHeroes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {analysis.banPredictions.telegraphedHeroes.map((item) => (
                        <div 
                          key={`telegraph-${item.hero.id}`}
                          className="p-3.5 rounded-2xl bg-dota-panel border border-amber-500/40 hover:border-amber-400 transition-all space-y-2 shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img src={item.hero.avatarUrl} alt={item.hero.name} className="w-10 h-10 rounded-xl object-cover border border-amber-500/60" />
                              <div>
                                <div className="font-dota font-bold text-sm text-slate-100">{item.hero.name}</div>
                                <div className="text-[10px] text-slate-400">{item.hero.roles.join(', ')}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-amber-300 font-mono px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40">
                                {item.confidence}% Match
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-snug">
                            {item.reason}
                          </p>

                          <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-[11px] text-red-200">
                            <strong>Counter Prep:</strong> {item.counterRecommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-dota-bg rounded-xl border border-dota-border">
                      No strong telegraphed hero patterns detected yet. Try adding bans or loading the "Ban Intent" preset above.
                    </div>
                  )}
                </div>

              </div>

              {/* Lineup Missing Roles Prediction Card */}
              <div className="bg-gradient-to-br from-dota-card to-dota-bg rounded-2xl border-2 border-rose-500/30 p-5 sm:p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-dota font-bold text-lg text-rose-200">
                        DIRE LINEUP COMPLETION FORECAST
                      </h3>
                      <p className="text-xs text-slate-400">
                        Predicts missing positions and highest probability heroes to complete Dire's archetype
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">Draft Archetype</span>
                    <span className="text-sm font-black text-rose-200 font-dota">
                      {analysis.lineupPrediction.detectedArchetype.name}
                    </span>
                  </div>
                </div>

                {/* Archetype Description & Strengths */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {analysis.lineupPrediction.detectedArchetype.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                      <strong>Strengths:</strong> {analysis.lineupPrediction.detectedArchetype.strengths.join(', ')}
                    </div>
                    <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                      <strong>Weaknesses:</strong> {analysis.lineupPrediction.detectedArchetype.weaknesses.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Vacant Roles & Candidate Predictions */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                    Vacant Roles & Predicted Heroes
                  </h4>

                  {analysis.lineupPrediction.predictedHeroes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {analysis.lineupPrediction.predictedHeroes.map((pred, i) => (
                        <div
                          key={`lineup-pred-${pred.hero.id}-${i}`}
                          className="p-3.5 rounded-2xl bg-dota-panel border border-rose-500/30 hover:border-rose-400 transition-all space-y-2.5 shadow-md flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-500/40">
                                {pred.roleName}
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-300">
                                {pred.confidence}% Likelihood
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <img src={pred.hero.avatarUrl} alt={pred.hero.name} className="w-11 h-11 rounded-xl object-cover border border-rose-500/60" />
                              <div>
                                <div className="font-dota font-bold text-sm text-slate-100">{pred.hero.name}</div>
                                <div className="text-[11px] text-slate-400">{pred.laneMatchupNote}</div>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-snug">
                              {pred.strategicFitReason}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Win Rate: <strong className="text-emerald-400">{pred.hero.winRate}%</strong></span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                assignHeroToTeam('dire', pred.predictedPos, pred.hero.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 font-bold transition-all active:scale-95"
                            >
                              Assign to Dire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic p-3 bg-dota-bg rounded-xl border border-dota-border">
                      Dire draft is fully populated with 5 heroes!
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: TACTICAL ADVANTAGE & LANE FORECAST                 */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'tactical' && (
            <div className="space-y-7 animate-fadeIn">
              
              {/* Lane Forecast Cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-dota font-bold text-lg text-slate-100">
                      PROJECTED LANE MATCHUPS
                    </h3>
                    <p className="text-xs text-slate-400">
                      Safe Lane vs Offlane, Mid Lane 1v1, and Offlane vs Safe Lane expectations
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.laneForecasts.map((lane, idx) => (
                    <div 
                      key={`lane-${idx}`}
                      className="p-4 rounded-2xl bg-dota-card border border-dota-border hover:border-cyan-500/40 transition-all space-y-3 shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Lane {idx + 1}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            lane.advantage === 'Radiant Favored' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            lane.advantage === 'Dire Favored' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                            'bg-slate-900 text-slate-300 border border-slate-700'
                          }`}>
                            {lane.advantage}
                          </span>
                        </div>

                        <h4 className="font-dota font-bold text-sm text-slate-100">
                          {lane.laneName}
                        </h4>

                        <p className="text-[11px] text-slate-300 leading-snug">
                          {lane.tacticalTip}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Confidence: {lane.confidence}%</span>
                        <span>Phase: 0 - 10 Min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Composition Radar/Comparison */}
              <div className="bg-dota-card rounded-2xl border border-dota-border p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-dota font-bold text-base text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-dota-gold" />
                    TEAM ATTRIBUTES & POWERSPIKE COMPARISON
                  </h4>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Radiant
                    </span>
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Dire
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Crowd Control & Stuns', rad: analysis.teamfightScores.radiant.cc, dire: analysis.teamfightScores.dire.cc },
                    { label: 'Burst & Single Target Damage', rad: analysis.teamfightScores.radiant.burst, dire: analysis.teamfightScores.dire.burst },
                    { label: 'Tower Push & Siege', rad: analysis.teamfightScores.radiant.push, dire: analysis.teamfightScores.dire.push },
                    { label: 'Healing & Sustain', rad: analysis.teamfightScores.radiant.sustain, dire: analysis.teamfightScores.dire.sustain },
                    { label: 'Late-Game Scaling', rad: analysis.teamfightScores.radiant.scaling, dire: analysis.teamfightScores.dire.scaling }
                  ].map((attr, idx) => (
                    <div key={`attr-${idx}`} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-emerald-400 font-mono">{attr.rad}%</span>
                        <span className="text-slate-300 font-sans">{attr.label}</span>
                        <span className="text-rose-400 font-mono">{attr.dire}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${attr.rad / (attr.rad + attr.dire || 1) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${attr.dire / (attr.rad + attr.dire || 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Win Conditions Roadmap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Radiant Win Condition */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-dota font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    RADIANT VICTORY ROADMAP
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.winConditions.radiant.map((wc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{wc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dire Win Condition */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-dota font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    DIRE VICTORY ROADMAP
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.winConditions.dire.map((wc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
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
      {/* 4. MODAL HERO SELECTOR FOR PICKS & BANS                   */}
      {/* ========================================================= */}
      {modalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-dota-panel rounded-3xl border-2 border-dota-gold/60 p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-dota-border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  modalTarget.type === 'pick'
                    ? (modalTarget.team === 'radiant' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-rose-500/20 border-rose-500/50 text-rose-300')
                    : 'bg-red-500/20 border-red-500/50 text-red-300'
                }`}>
                  {modalTarget.type === 'pick' ? <Swords className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-dota font-black text-lg text-slate-100">
                    {modalTarget.type === 'pick'
                      ? `Select Hero for ${modalTarget.team.toUpperCase()} (Pos ${modalTarget.pos || 1})`
                      : `Add Ban for ${modalTarget.team.toUpperCase()}`
                    }
                  </h3>
                  <p className="text-xs text-slate-400">
                    {modalTarget.type === 'pick' ? 'Choose from available Dota 2 heroes' : 'Banning this hero will update predictive enemy intent'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalTarget(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by hero name, alias (e.g. AM, PA, Butcher)..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-dota-bg border border-dota-border rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dota-gold"
                />
              </div>

              {/* Attribute filter */}
              <div className="flex items-center gap-1 bg-dota-bg p-1 rounded-xl border border-dota-border">
                {(['all', 'str', 'agi', 'int', 'all'] as (AttributeType | 'all')[]).slice(0, 4).map((attr, idx) => (
                  <button
                    key={`attr-modal-${idx}`}
                    onClick={() => setModalAttr(attr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      modalAttr === attr ? 'bg-dota-gold text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {attr === 'all' ? 'All' : attr}
                  </button>
                ))}
              </div>
            </div>

            {/* Heroes Grid Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {modalCandidateHeroes.map((hero) => {
                  const isSelected = allSelectedIds.has(hero.id);

                  return (
                    <button
                      key={`modal-hero-${hero.id}`}
                      disabled={isSelected}
                      onClick={() => handleAssignHeroFromModal(hero.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'opacity-35 cursor-not-allowed bg-slate-900 border-slate-800'
                          : 'bg-dota-card/90 hover:bg-slate-800 border-dota-border hover:border-dota-gold/60 hover:scale-[1.02]'
                      }`}
                    >
                      <img src={hero.avatarUrl} alt={hero.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-dota font-bold text-xs text-slate-100 truncate">{hero.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
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
            <div className="pt-3 border-t border-dota-border flex items-center justify-between text-xs text-slate-400">
              <span>Showing {modalCandidateHeroes.length} heroes</span>
              <button
                onClick={() => setModalTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
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
