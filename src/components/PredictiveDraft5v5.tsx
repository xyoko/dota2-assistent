import React, { useState, useMemo } from 'react';
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
  Info
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
    radiantHeroIds: ['sven', 'lion'],
    direHeroIds: ['axe', 'witch_doctor'],
    radiantBanIds: ['faceless_void'],
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

  // Sub-tab view: 'bans_intent' | 'suggestions' | 'tactical'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'bans_intent' | 'suggestions' | 'tactical'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subtab');
      if (sub === 'suggestions' || sub === 'tactical' || sub === 'bans_intent') {
        return sub;
      }
    } catch {}
    return 'bans_intent';
  });

  // Pick suggestions filter by position
  const [suggestionRoleFilter, setSuggestionRoleFilter] = useState<PositionNumber | 'all'>('all');

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
  };

  // Handle Clear Draft
  const handleClearDraft = () => {
    SoundEngine.playHover();
    setRadiantHeroIds([]);
    setDireHeroIds([]);
    setRadiantBanIds([]);
    setDireBanIds([]);
  };

  // Handle Open Modal
  const handleOpenPicker = (team: 'radiant' | 'dire', type: 'pick' | 'ban', pos?: PositionNumber, slotIndex?: number) => {
    SoundEngine.playHover();
    setModalTarget({ team, type, pos, slotIndex });
    setModalSearch('');
    setModalAttr('all');
    setModalRole('all');
  };

  // Handle Slot Assignment
  const handleAssignHero = (heroId: string) => {
    if (!modalTarget) return;

    SoundEngine.playPick();
    const { team, type, slotIndex } = modalTarget;

    if (type === 'pick') {
      if (team === 'radiant') {
        const next = [...radiantHeroIds];
        if (slotIndex !== undefined && slotIndex < next.length) {
          next[slotIndex] = heroId;
        } else {
          next.push(heroId);
        }
        setRadiantHeroIds(next);
      } else {
        const next = [...direHeroIds];
        if (slotIndex !== undefined && slotIndex < next.length) {
          next[slotIndex] = heroId;
        } else {
          next.push(heroId);
        }
        setDireHeroIds(next);
      }
    } else {
      // Ban
      if (team === 'radiant') {
        if (!radiantBanIds.includes(heroId)) {
          setRadiantBanIds([...radiantBanIds, heroId]);
        }
      } else {
        if (!direBanIds.includes(heroId)) {
          setDireBanIds([...direBanIds, heroId]);
        }
      }
    }

    setModalTarget(null);
  };

  // Quick Remove
  const handleRemoveHero = (team: 'radiant' | 'dire', type: 'pick' | 'ban', index: number) => {
    SoundEngine.playHover();
    if (type === 'pick') {
      if (team === 'radiant') {
        setRadiantHeroIds(radiantHeroIds.filter((_, i) => i !== index));
      } else {
        setDireHeroIds(direHeroIds.filter((_, i) => i !== index));
      }
    } else {
      if (team === 'radiant') {
        setRadiantBanIds(radiantBanIds.filter((_, i) => i !== index));
      } else {
        setDireBanIds(direBanIds.filter((_, i) => i !== index));
      }
    }
  };

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
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & DRAFT ADVANTAGE METER                     */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-dota-panel via-dota-panelAlt to-dota-bg border-2 border-dota-border p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
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
          <div className="bg-dota-card/90 rounded-2xl border border-dota-border p-4 space-y-3 shadow-inner">
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
            <div className="relative h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-dota-border">
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

            {/* Perspective Selector */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-dota-gold" />
                AI recommendations are tailored for your perspective:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setUserTeam('radiant')}
                  className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all ${
                    userTeam === 'radiant'
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-dota-glow'
                      : 'text-slate-400 hover:text-white bg-slate-800/60 border border-transparent'
                  }`}
                >
                  Drafting as Radiant
                </button>
                <button
                  onClick={() => setUserTeam('dire')}
                  className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all ${
                    userTeam === 'dire'
                      ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-dota-crimson'
                      : 'text-slate-400 hover:text-white bg-slate-800/60 border border-transparent'
                  }`}
                >
                  Drafting as Dire
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THE 5v5 DRAFT BOARD: RADIANT VS DIRE                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RADIANT TEAM (LIGHT) */}
        <div className="bg-dota-panel rounded-3xl border-2 border-emerald-500/30 p-4 sm:p-5 space-y-4 shadow-xl relative">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
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

          {/* 5 Pos Slots */}
          <div className="space-y-2.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = radiantHeroIds[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;

              return (
                <div 
                  key={`rad-pos-${pos}`}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    hero 
                      ? 'bg-dota-card/90 border-emerald-500/40 shadow-sm'
                      : 'bg-dota-bg/60 border-dashed border-emerald-500/30 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Pos Badge */}
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-emerald-500/40 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-black uppercase text-emerald-400 leading-none">POS</span>
                      <span className="text-sm font-black text-white leading-none font-dota">{pos}</span>
                    </div>

                    {hero ? (
                      <div 
                        onClick={() => onSelectHero && onSelectHero(hero)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/60 relative flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={hero.avatarUrl} alt={hero.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-dota font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                              {hero.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              hero.attribute === 'str' ? 'bg-red-500/20 text-red-300' :
                              hero.attribute === 'agi' ? 'bg-green-500/20 text-green-300' :
                              hero.attribute === 'int' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {hero.attribute}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{def.name} • {def.lane}</span>
                            <span className="text-emerald-400 font-bold">{hero.winRate}% WR</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-bold text-slate-300">{def.name}</div>
                        <div className="text-[11px] text-slate-500">{def.lane} • Vacant Slot</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {hero ? (
                      <button
                        onClick={() => handleRemoveHero('radiant', 'pick', pos - 1)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 transition-all"
                        title="Remove Hero"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPicker('radiant', 'pick', pos, pos - 1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pick</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Radiant Bans Bar */}
          <div className="pt-2 border-t border-emerald-500/20 space-y-2">
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

            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-dota-bg/80 rounded-xl border border-dota-border">
              {radiantBanIds.map((banId, idx) => {
                const hero = HERO_MAP.get(banId);
                return (
                  <div 
                    key={`rad-ban-${banId}-${idx}`}
                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-bold group"
                  >
                    {hero && (
                      <img src={hero.avatarUrl} alt={hero.name} className="w-5 h-5 rounded-md object-cover grayscale" />
                    )}
                    <span className="line-through">{hero?.name || banId}</span>
                    <button
                      onClick={() => handleRemoveHero('radiant', 'ban', idx)}
                      className="ml-1 text-red-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {radiantBanIds.length === 0 && (
                <span className="text-[11px] text-slate-500 italic py-1">No bans registered. Click + Add Ban to lock out enemy heroes.</span>
              )}
            </div>
          </div>

        </div>

        {/* DIRE TEAM (DARKNESS) */}
        <div className="bg-dota-panel rounded-3xl border-2 border-rose-500/30 p-4 sm:p-5 space-y-4 shadow-xl relative">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
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

          {/* 5 Pos Slots */}
          <div className="space-y-2.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = direHeroIds[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;

              return (
                <div 
                  key={`dire-pos-${pos}`}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    hero 
                      ? 'bg-dota-card/90 border-rose-500/40 shadow-sm'
                      : 'bg-dota-bg/60 border-dashed border-rose-500/30 hover:border-rose-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Pos Badge */}
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-rose-500/40 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-black uppercase text-rose-400 leading-none">POS</span>
                      <span className="text-sm font-black text-white leading-none font-dota">{pos}</span>
                    </div>

                    {hero ? (
                      <div 
                        onClick={() => onSelectHero && onSelectHero(hero)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-rose-500/60 relative flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={hero.avatarUrl} alt={hero.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-dota font-bold text-sm text-slate-100 group-hover:text-rose-300 transition-colors">
                              {hero.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              hero.attribute === 'str' ? 'bg-red-500/20 text-red-300' :
                              hero.attribute === 'agi' ? 'bg-green-500/20 text-green-300' :
                              hero.attribute === 'int' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {hero.attribute}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{def.name} • {def.lane}</span>
                            <span className="text-rose-400 font-bold">{hero.winRate}% WR</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-bold text-slate-300">{def.name}</div>
                        <div className="text-[11px] text-slate-500">{def.lane} • Vacant Slot</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {hero ? (
                      <button
                        onClick={() => handleRemoveHero('dire', 'pick', pos - 1)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 transition-all"
                        title="Remove Hero"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPicker('dire', 'pick', pos, pos - 1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/50 hover:border-rose-400 text-xs font-bold transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pick</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Dire Bans Bar */}
          <div className="pt-2 border-t border-rose-500/20 space-y-2">
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

            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-dota-bg/80 rounded-xl border border-dota-border">
              {direBanIds.map((banId, idx) => {
                const hero = HERO_MAP.get(banId);
                return (
                  <div 
                    key={`dire-ban-${banId}-${idx}`}
                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-bold group"
                  >
                    {hero && (
                      <img src={hero.avatarUrl} alt={hero.name} className="w-5 h-5 rounded-md object-cover grayscale" />
                    )}
                    <span className="line-through">{hero?.name || banId}</span>
                    <button
                      onClick={() => handleRemoveHero('dire', 'ban', idx)}
                      className="ml-1 text-red-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {direBanIds.length === 0 && (
                <span className="text-[11px] text-slate-500 italic py-1">No bans registered. Click + Add Ban to input enemy bans.</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. PREDICTIVE ANALYSIS SECTION (TABS)                     */}
      {/* ========================================================= */}
      <div className="bg-dota-panel rounded-3xl border-2 border-dota-border overflow-hidden shadow-2xl">
        
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-dota-border bg-dota-card/50 overflow-x-auto p-1.5 gap-2">
          
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
              setActiveAnalysisTab('suggestions');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'suggestions'
                ? 'bg-gradient-to-r from-indigo-500/25 to-blue-500/25 text-indigo-300 border border-indigo-500/60 shadow-dota-mana font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Target className="w-4 h-4 text-indigo-400" />
            <span>🎯 AI Ban & Pick Suggestions</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('tactical');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'tactical'
                ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/60 shadow-dota-glow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Swords className="w-4 h-4 text-emerald-400" />
            <span>⚔️ Lane Matchups & Tactical Plan</span>
          </button>

        </div>

        {/* TAB CONTENT */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: BAN INTENT & PREDICTED LINEUP                      */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'bans_intent' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Ban Intent Decryption Card */}
              <div className="bg-gradient-to-br from-dota-card to-dota-bg rounded-2xl border-2 border-amber-500/30 p-5 sm:p-6 space-y-5 shadow-lg relative overflow-hidden">
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
              <div className="bg-gradient-to-br from-dota-card to-dota-bg rounded-2xl border-2 border-rose-500/30 p-5 sm:p-6 space-y-5 shadow-lg">
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
                              onClick={() => {
                                setDireHeroIds([...direHeroIds, pred.hero.id]);
                                SoundEngine.playPick();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 font-bold transition-all"
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
          {/* TAB 2: AI BAN & PICK SUGGESTIONS                          */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'suggestions' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* SUGGESTED BANS */}
              <div className="space-y-4">
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
                        Prioritizes heroes that hard-counter your drafted cores, disrupt enemy combos, or deny telegraphed picks
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
                          onClick={() => {
                            if (userTeam === 'radiant') {
                              if (!radiantBanIds.includes(ban.hero.id)) setRadiantBanIds([...radiantBanIds, ban.hero.id]);
                            } else {
                              if (!direBanIds.includes(ban.hero.id)) setDireBanIds([...direBanIds, ban.hero.id]);
                            }
                            SoundEngine.playPick();
                          }}
                          className="px-3 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-bold transition-all shadow-sm"
                        >
                          Ban This Hero
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUGGESTED PICKS */}
              <div className="space-y-4 pt-4 border-t border-dota-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-dota font-bold text-lg text-slate-100">
                        OPTIMAL PICKS FOR {userTeam.toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Highest value picks considering enemy counters, synergy with allies, and team balance
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
                        onClick={() => setSuggestionRoleFilter(pos)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                          suggestionRoleFilter === pos
                            ? 'bg-dota-gold text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pos {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Picks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            onClick={() => {
                              if (userTeam === 'radiant') {
                                if (radiantHeroIds.length < 5) setRadiantHeroIds([...radiantHeroIds, pick.hero.id]);
                              } else {
                                if (direHeroIds.length < 5) setDireHeroIds([...direHeroIds, pick.hero.id]);
                              }
                              SoundEngine.playPick();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-md"
                          >
                            Pick for {userTeam === 'radiant' ? 'Radiant' : 'Dire'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: TACTICAL ADVANTAGE & LANE FORECAST                 */}
          {/* ========================================================= */}
          {activeAnalysisTab === 'tactical' && (
            <div className="space-y-8 animate-fadeIn">
              
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
                      onClick={() => handleAssignHero(hero.id)}
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
