'use client';

import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { HeroData, AttributeType } from '../../../entities/hero/bi/types';
import { 
  runPredictive5v5Analysis, 
  suggestPicks,
  POSITION_DEFINITIONS, 
  PositionNumber, 
  Predictive5v5Analysis 
} from '../../../features/predictive-draft/bi/predictiveDraftEngine';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { StorageService } from '../../../shared/bi/storage/storageService';
import { GeminiService } from '../../../shared/bi/ai/geminiService';
import { RoleOptimalPicks } from '../../../features/predictive-draft/ui/RoleOptimalPicks';
import { RoleBanSuggestions } from '../../../features/predictive-draft/ui/RoleBanSuggestions';
import { 
  BrainCircuit, 
  Shield, 
  Swords, 
  Target, 
  CheckCircle2, 
  X, 
  Plus, 
  RotateCcw, 
  Eye, 
  Search, 
  Crown, 
  Lock, 
  Trash2,
  AlertTriangle,
  Sparkles,
  Send,
  Bot,
  Loader2
} from 'lucide-react';

export type DedicatedSlots = [string | null, string | null, string | null, string | null, string | null];

export interface PredictiveDraft5v5Props {
  onSelectHero?: (hero: HeroData) => void;
  favorites?: string[];
  onToggleFavorite?: (heroId: string) => void;
}

export const PredictiveDraft5v5: React.FC<PredictiveDraft5v5Props> = ({ 
  onSelectHero,
  favorites: propFavorites,
  onToggleFavorite
}) => {
  // Favorites fallback to StorageService if not passed from parent
  const [internalFavorites, setInternalFavorites] = useState<string[]>(() => StorageService.getFavorites());
  const favorites = propFavorites || internalFavorites;

  const handleToggleFavorite = (heroId: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(heroId);
    } else {
      StorageService.toggleFavorite(heroId);
      setInternalFavorites(StorageService.getFavorites());
    }
  };

  // Dedicated 5 slots per team (Pos 1 = Safe Carry, Pos 2 = Mid, Pos 3 = Offlane, Pos 4 = Soft Support, Pos 5 = Hard Support)
  // Clean initial state without example heroes
  const [allySlots, setAllySlots] = useState<DedicatedSlots>([null, null, null, null, null]);
  const [opponentSlots, setOpponentSlots] = useState<DedicatedSlots>([null, null, null, null, null]);

  // Bans (up to 7 bans per side, forming the 14-hero ban roster)
  const [allyBanIds, setAllyBanIds] = useState<string[]>([]);
  const [opponentBanIds, setOpponentBanIds] = useState<string[]>([]);

  // Currently targeted dedicated slot for hero assignment
  const [activeTargetSlot, setActiveTargetSlot] = useState<{
    team: 'allies' | 'opponents';
    pos: PositionNumber;
  }>({ team: 'allies', pos: 1 });

  // Mode for the inline selection pool: 'pick' or 'ban'
  const [activeTargetMode, setActiveTargetMode] = useState<'pick' | 'ban'>('pick');

  // Role filtering mode in hero pool: 'dedicated' (shows corresponding heroes first) or 'all'
  
  // Inline Hero Pool search & filter states
    
  // Sub-tab view for analysis: 'picks' | 'bans' | 'intent' | 'lanes' | 'ai'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'picks' | 'bans' | 'intent' | 'lanes' | 'ai'>('picks');

  // Gemini AI Oracle state
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCustomQuestion, setAiCustomQuestion] = useState<string>('');

  // Search Modal state
  const [modalTarget, setModalTarget] = useState<{
    team: 'allies' | 'opponents';
    type: 'pick' | 'ban';
    pos?: PositionNumber;
  } | null>(null);

  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalAttr, setModalAttr] = useState<AttributeType | 'all'>('all');
  const [modalRoleFilter, setModalRoleFilter] = useState<'dedicated' | 'all'>('dedicated');

  const containerRef = useRef<HTMLDivElement>(null);

  // Dedicated role for active target slot
    
  // Run the Predictive Engine using dedicated slots
  const analysis: Predictive5v5Analysis = useMemo(() => {
    return runPredictive5v5Analysis(
      allySlots,
      opponentSlots,
      allyBanIds,
      opponentBanIds
    );
  }, [allySlots, opponentSlots, allyBanIds, opponentBanIds]);

  // Set of all selected hero IDs (picks and bans across both teams)
  const allSelectedIds = useMemo(() => {
    const picks = [...allySlots, ...opponentSlots].filter((id): id is string => Boolean(id));
    return new Set([...picks, ...allyBanIds, ...opponentBanIds]);
  }, [allySlots, opponentSlots, allyBanIds, opponentBanIds]);

  // Combined Ban Roster
  const allBanIds = useMemo(() => {
    return [...allyBanIds, ...opponentBanIds];
  }, [allyBanIds, opponentBanIds]);

  // AI-recommended counter & synergy picks specifically for the targeted dedicated slot
  
  // Recommendation score lookup map
  
  // Recommendations for the modal target slot
  const modalTargetPos = modalTarget?.pos || activeTargetSlot.pos;
  const modalTargetDef = POSITION_DEFINITIONS[modalTargetPos];
  const modalTargetRole = modalTargetDef.role;

  const modalRecommendations = useMemo(() => {
    if (!modalTarget || modalTarget.type === 'ban') return [];

    const myPicks = (modalTarget.team === 'allies' ? allySlots : opponentSlots)
      .map((id) => (id ? HERO_MAP.get(id) : null))
      .filter((h): h is HeroData => Boolean(h));

    const enemyPicks = (modalTarget.team === 'allies' ? opponentSlots : allySlots)
      .map((id) => (id ? HERO_MAP.get(id) : null))
      .filter((h): h is HeroData => Boolean(h));

    const allBans = allBanIds
      .map((id) => HERO_MAP.get(id))
      .filter((h): h is HeroData => Boolean(h));

    return suggestPicks(myPicks, enemyPicks, allBans, modalTargetPos);
  }, [modalTarget, allySlots, opponentSlots, allBanIds, modalTargetPos]);

  const modalRecScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    modalRecommendations.forEach((s) => map.set(s.hero.id, s.score));
    return map;
  }, [modalRecommendations]);

  // Reset Draft to clean initial state
  const handleClearDraft = () => {
    SoundEngine.playHover();
    setAllySlots([null, null, null, null, null]);
    setOpponentSlots([null, null, null, null, null]);
    setAllyBanIds([]);
    setOpponentBanIds([]);
    setActiveTargetSlot({ team: 'allies', pos: 1 });
    setActiveTargetMode('pick');
  };

  // Request Gemini AI Oracle Analysis
  const handleRequestAiAnalysis = async (customQ?: string) => {
    setIsAiLoading(true);
    setAiError(null);
    SoundEngine.playPick();
    try {
      const alliesData = allySlots
        .map((id, idx) => ({ id, pos: (idx + 1) as PositionNumber }))
        .filter(s => s.id !== null)
        .map(s => ({
          name: HERO_MAP.get(s.id!)?.name || s.id!,
          role: POSITION_DEFINITIONS[s.pos].role
        }));

      const opponentsData = opponentSlots
        .map((id, idx) => ({ id, pos: (idx + 1) as PositionNumber }))
        .filter(s => s.id !== null)
        .map(s => ({
          name: HERO_MAP.get(s.id!)?.name || s.id!,
          role: POSITION_DEFINITIONS[s.pos].role
        }));

      const banNames = [...allyBanIds, ...opponentBanIds]
        .map(id => HERO_MAP.get(id)?.name || id);

      if (customQ && customQ.trim()) {
        const fullPrompt = `Draft Context (Dota 2 Patch 7.37d):\nAllies: ${alliesData.map(a => `${a.name} (${a.role})`).join(', ') || 'None selected'}\nOpponents: ${opponentsData.map(o => `${o.name} (${o.role})`).join(', ') || 'None selected'}\nBanned Heroes: ${banNames.join(', ') || 'None'}\n\nTactical Question: ${customQ.trim()}\n\nProvide clear, high-level Grandmaster advice in clean Markdown formatting.`;
        const res = await GeminiService.generateText(fullPrompt, 'You are an elite Dota 2 coach and drafting analyst for Patch 7.37d. Provide concise, tactical advice.');
        setAiAnalysis(res);
      } else {
        const res = await GeminiService.analyzeDraftWithAI({
          allies: alliesData,
          opponents: opponentsData,
          bans: banNames
        });
        setAiAnalysis(res);
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI analysis.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Open Search Modal (Draft Studio style)
  const handleOpenSlotModal = (team: 'allies' | 'opponents', type: 'pick' | 'ban', pos?: PositionNumber) => {
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

  // Assign hero into dedicated slot (maintains fixed slot positions, no shifting)
  const handleAssignHero = (
    team: 'allies' | 'opponents', 
    type: 'pick' | 'ban', 
    heroId: string, 
    pos?: PositionNumber
  ) => {
    SoundEngine.playPick();

    if (type === 'ban') {
      if (team === 'allies') {
        if (!allyBanIds.includes(heroId) && allyBanIds.length < 7) {
          setAllyBanIds([...allyBanIds, heroId]);
        }
      } else {
        if (!opponentBanIds.includes(heroId) && opponentBanIds.length < 7) {
          setOpponentBanIds([...opponentBanIds, heroId]);
        }
      }
      setModalTarget(null);
      return;
    }

    // Pick into dedicated slot pos (1-5)
    const targetPos = pos || activeTargetSlot.pos;
    const slotIdx = targetPos - 1;

    if (team === 'allies') {
      const next: DedicatedSlots = [...allySlots];
      // If hero already assigned to another slot in Allies, remove from previous slot
      const existingIdx = next.indexOf(heroId);
      if (existingIdx !== -1 && existingIdx !== slotIdx) {
        next[existingIdx] = null;
      }
      next[slotIdx] = heroId;
      setAllySlots(next);

      // Auto advance target to next vacant Ally slot
      const nextEmptyPos = ([1, 2, 3, 4, 5] as PositionNumber[]).find((p) => next[p - 1] === null);
      if (nextEmptyPos) {
        setActiveTargetSlot({ team: 'allies', pos: nextEmptyPos });
      }
    } else {
      const next: DedicatedSlots = [...opponentSlots];
      const existingIdx = next.indexOf(heroId);
      if (existingIdx !== -1 && existingIdx !== slotIdx) {
        next[existingIdx] = null;
      }
      next[slotIdx] = heroId;
      setOpponentSlots(next);

      const nextEmptyPos = ([1, 2, 3, 4, 5] as PositionNumber[]).find((p) => next[p - 1] === null);
      if (nextEmptyPos) {
        setActiveTargetSlot({ team: 'opponents', pos: nextEmptyPos });
      }
    }

    setModalTarget(null);
  };

  // Remove hero from dedicated slot or ban (does NOT shift other slots!)
  const handleRemoveHero = (team: 'allies' | 'opponents', type: 'pick' | 'ban', posOrBanIdx: number) => {
    SoundEngine.playHover();
    if (type === 'pick') {
      const slotIdx = posOrBanIdx - 1;
      if (team === 'allies') {
        const next: DedicatedSlots = [...allySlots];
        next[slotIdx] = null;
        setAllySlots(next);
        setActiveTargetSlot({ team: 'allies', pos: posOrBanIdx as PositionNumber });
      } else {
        const next: DedicatedSlots = [...opponentSlots];
        next[slotIdx] = null;
        setOpponentSlots(next);
        setActiveTargetSlot({ team: 'opponents', pos: posOrBanIdx as PositionNumber });
      }
      setActiveTargetMode('pick');
          } else {
      // ban removal
      if (team === 'allies') {
        const next = [...allyBanIds];
        next.splice(posOrBanIdx, 1);
        setAllyBanIds(next);
      } else {
        const next = [...opponentBanIds];
        next.splice(posOrBanIdx, 1);
        setOpponentBanIds(next);
      }
    }
  };

  
  // Filter heroes for modal search
  const filteredModalHeroes = useMemo(() => {
    const filtered = HEROES_DATA.filter((h) => {
      if (allSelectedIds.has(h.id)) return false;
      if (modalAttr !== 'all' && h.attribute !== modalAttr) return false;

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
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      const aScore = modalRecScoreMap.get(a.id) || 0;
      const bScore = modalRecScoreMap.get(b.id) || 0;
      if (aScore !== bScore) return bScore - aScore;

      const aRoleMatch = a.roles.includes(modalTargetRole) ? 1 : 0;
      const bRoleMatch = b.roles.includes(modalTargetRole) ? 1 : 0;
      if (aRoleMatch !== bRoleMatch) return bRoleMatch - aRoleMatch;

      return b.winRate - a.winRate;
    });
  }, [modalSearch, modalAttr, modalRoleFilter, modalTarget, modalTargetRole, modalRecScoreMap, allSelectedIds, favorites]);

  const allyPickCount = allySlots.filter(Boolean).length;
  const opponentPickCount = opponentSlots.filter(Boolean).length;

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
              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 font-mono">
                Dedicated Roles
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Allies vs Opponents lineup engine. Select any dedicated slot to view tailored counter-picks & matching heroes.
            </p>
          </div>
        </div>

        {/* Advantage Progress Bar & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-xl">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <Shield className="w-3 h-3" /> ALLIES {analysis.draftAdvantage.radiantScore}%
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans">
                <span>E: <strong className={analysis.draftAdvantage.earlyAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'}>{analysis.draftAdvantage.earlyAdvantage === 'Radiant' ? 'Allies' : analysis.draftAdvantage.earlyAdvantage === 'Dire' ? 'Opponents' : 'Even'}</strong></span>
                <span>M: <strong className={analysis.draftAdvantage.midAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'}>{analysis.draftAdvantage.midAdvantage === 'Radiant' ? 'Allies' : analysis.draftAdvantage.midAdvantage === 'Dire' ? 'Opponents' : 'Even'}</strong></span>
                <span>L: <strong className={analysis.draftAdvantage.lateAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'}>{analysis.draftAdvantage.lateAdvantage === 'Radiant' ? 'Allies' : analysis.draftAdvantage.lateAdvantage === 'Dire' ? 'Opponents' : 'Even'}</strong></span>
              </div>
              <span className="text-rose-400 flex items-center gap-1 font-mono">
                OPPONENTS {analysis.draftAdvantage.direScore}% <Swords className="w-3 h-3" />
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

          {/* AI Oracle Quick Trigger */}
          <button
            onClick={() => {
              SoundEngine.playPick();
              setActiveAnalysisTab('ai');
              if (!aiAnalysis && !isAiLoading) {
                handleRequestAiAnalysis();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-950/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)]"
            title="Get instant Gemini AI Grandmaster Draft Breakdown"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>AI Oracle</span>
          </button>

          {/* Reset Draft Button */}
          <button
            onClick={handleClearDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-bold transition-all"
            title="Reset Draft to blank initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. DRAFT BOARD - DEDICATED SLOTS (ALLIES & OPPONENTS)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        
        {/* ALLIES SIDE - 5 DEDICATED SLOTS */}
        <div className="bg-dota-panel rounded-2xl border-2 border-emerald-500/40 p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="font-dota font-black text-sm text-emerald-300 tracking-wider">ALLIES</span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30">
                {allyPickCount}/5 Dedicated Picks
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Your Team Lineup
            </div>
          </div>

          {/* 5 Dedicated Allies Slot Cards */}
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = allySlots[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;
              const isTargeted = activeTargetSlot.team === 'allies' && activeTargetSlot.pos === pos && activeTargetMode === 'pick';

              return (
                <div
                  key={`ally-dedicated-pos-${pos}`}
                  onClick={() => handleOpenSlotModal('allies', 'pick', pos)}
                  className={`h-24 rounded-xl border p-1.5 flex flex-col justify-between transition-all cursor-pointer relative select-none group ${
                    isTargeted 
                      ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-2 ring-dota-gold/80' 
                      : hero 
                        ? 'bg-dota-card/95 border-emerald-500/50 hover:border-emerald-400 hover:scale-[1.02]' 
                        : 'bg-dota-bg/80 border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10'
                  }`}
                  title={
                    hero 
                      ? `${hero.name} (Ally ${def.name}) - Click to change` 
                      : `Ally ${def.name} (${def.role}) - Click to select suggested heroes`
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
                          handleRemoveHero('allies', 'pick', pos);
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

          {/* Allies Bans Bar */}
          <div className="flex items-center gap-1.5 min-h-[28px] overflow-x-auto custom-scrollbar pt-1 border-t border-emerald-500/20 text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 font-bold">
              <Lock className="w-3 h-3 text-red-400" /> Allies Bans:
            </span>
            {allyBanIds.map((banId, idx) => {
              const hero = HERO_MAP.get(banId);
              return (
                <div key={`ally-ban-${banId}-${idx}`} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-200 text-[10px]">
                  {hero && <img src={hero.avatarUrl} alt={hero.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                  <span className="line-through">{hero?.name || banId}</span>
                  <button onClick={() => handleRemoveHero('allies', 'ban', idx)} className="text-red-400 hover:text-white font-bold">×</button>
                </div>
              );
            })}
            {allyBanIds.length < 7 && (
              <button
                onClick={() => handleOpenSlotModal('allies', 'ban')}
                className="flex-shrink-0 text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-dashed border-red-500/40 hover:bg-red-500/10 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> Ban Hero
              </button>
            )}
          </div>
        </div>

        {/* OPPONENTS SIDE - 5 DEDICATED SLOTS */}
        <div className="bg-dota-panel rounded-2xl border-2 border-rose-500/40 p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span className="font-dota font-black text-sm text-rose-300 tracking-wider">OPPONENTS</span>
              <span className="text-[10px] text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-500/30">
                {opponentPickCount}/5 Dedicated Picks
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Enemy Draft Targets
            </div>
          </div>

          {/* 5 Dedicated Opponents Slot Cards */}
          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
              const def = POSITION_DEFINITIONS[pos];
              const heroId = opponentSlots[pos - 1];
              const hero = heroId ? HERO_MAP.get(heroId) : null;
              const isTargeted = activeTargetSlot.team === 'opponents' && activeTargetSlot.pos === pos && activeTargetMode === 'pick';

              return (
                <div
                  key={`opponent-dedicated-pos-${pos}`}
                  onClick={() => handleOpenSlotModal('opponents', 'pick', pos)}
                  className={`h-24 rounded-xl border p-1.5 flex flex-col justify-between transition-all cursor-pointer relative select-none group ${
                    isTargeted 
                      ? 'border-dota-gold bg-dota-gold/15 shadow-dota-glow ring-2 ring-dota-gold/80' 
                      : hero 
                        ? 'bg-dota-card/95 border-rose-500/50 hover:border-rose-400 hover:scale-[1.02]' 
                        : 'bg-dota-bg/80 border-dashed border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/10'
                  }`}
                  title={
                    hero 
                      ? `${hero.name} (Opponent ${def.name}) - Click to change` 
                      : `Opponent ${def.name} (${def.role}) - Click to select hero`
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
                          handleRemoveHero('opponents', 'pick', pos);
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
                      <span className="text-[7px] text-slate-500 group-hover:text-slate-400">Target</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opponents Bans Bar */}
          <div className="flex items-center gap-1.5 min-h-[28px] overflow-x-auto custom-scrollbar pt-1 border-t border-rose-500/20 text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 font-bold">
              <Lock className="w-3 h-3 text-red-400" /> Opponent Bans:
            </span>
            {opponentBanIds.map((banId, idx) => {
              const hero = HERO_MAP.get(banId);
              return (
                <div key={`opp-ban-${banId}-${idx}`} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-200 text-[10px]">
                  {hero && <img src={hero.avatarUrl} alt={hero.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                  <span className="line-through">{hero?.name || banId}</span>
                  <button onClick={() => handleRemoveHero('opponents', 'ban', idx)} className="text-red-400 hover:text-white font-bold">×</button>
                </div>
              );
            })}
            {opponentBanIds.length < 7 && (
              <button
                onClick={() => handleOpenSlotModal('opponents', 'ban')}
                className="flex-shrink-0 text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-dashed border-red-500/40 hover:bg-red-500/10 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> Ban Hero
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. PREDICTIVE ANALYSIS & STRATEGY ENGINE                  */}
      {/* ========================================================= */}
      <div className="space-y-4">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center border-b border-dota-border bg-dota-panel rounded-2xl p-1.5 gap-1.5 overflow-x-auto shadow-xl">
          
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
            <span>🎯 Optimal & Counter Picks</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('bans');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'bans'
                ? 'bg-gradient-to-r from-rose-500/30 to-red-500/30 text-rose-300 border border-rose-500/70 shadow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>🚫 Targeted Ban Suggestions</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('intent');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'intent'
                ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-500/70 shadow-dota-glow font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            <span>🔮 Ban Intent & Lineup Decryption</span>
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

          <button
            onClick={() => {
              SoundEngine.playHover();
              setActiveAnalysisTab('ai');
              if (!aiAnalysis && !isAiLoading) {
                handleRequestAiAnalysis();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeAnalysisTab === 'ai'
                ? 'bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-purple-600/30 text-purple-300 border border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.35)] font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>🔮 Gemini AI Oracle</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 text-[9px] font-mono">
              Live
            </span>
          </button>

        </div>

        {/* TAB 1: SEPARATE COMPONENT -> ROLE OPTIMAL & COUNTER PICKS */}
        {activeAnalysisTab === 'picks' && (
          <RoleOptimalPicks
            allySlots={allySlots}
            opponentSlots={opponentSlots}
            banIds={allBanIds}
            favorites={favorites}
            onPickHero={(heroId, pos) => handleAssignHero('allies', 'pick', heroId, pos)}
            onSelectHero={onSelectHero}
            onToggleFavorite={handleToggleFavorite}
            initialPos={activeTargetSlot.pos}
          />
        )}

        {/* TAB 2: SEPARATE COMPONENT -> ROLE BAN SUGGESTIONS */}
        {activeAnalysisTab === 'bans' && (
          <RoleBanSuggestions
            allySlots={allySlots}
            opponentSlots={opponentSlots}
            banIds={allBanIds}
            favorites={favorites}
            onBanHero={(heroId) => handleAssignHero('allies', 'ban', heroId)}
            onSelectHero={onSelectHero}
            initialPos={activeTargetSlot.pos}
          />
        )}

        {/* TAB 3: BAN INTENT & LINEUP FORECAST */}
        {activeAnalysisTab === 'intent' && (
          <div className="space-y-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-md">
            
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-dota font-bold text-base text-amber-200">
                  OPPONENT BAN-INTENT DECRYPTION
                </h3>
                <p className="text-[11px] text-slate-400">
                  Infers what strategy Opponents are clearing the runway for based on their active bans
                </p>
              </div>
            </div>

            {/* Detected Strategy Card */}
            {analysis.banPredictions.detectedStrategy ? (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-dota font-bold text-sm text-amber-300">
                    {analysis.banPredictions.detectedStrategy.name}
                  </span>
                  <span className="font-mono text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                    {analysis.banPredictions.detectedStrategy.confidence}% Confidence
                  </span>
                </div>
                <p className="text-slate-300">{analysis.banPredictions.detectedStrategy.description}</p>
                <div className="text-[10px] font-mono text-amber-300/80 pt-1">
                  Trigger Bans: <strong>{analysis.banPredictions.detectedStrategy.triggerBans.join(', ')}</strong>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
                Add opponent bans (e.g. Anti-Mage, Ancient Apparition, Axe) to decrypt telegraphed enemy strategies in real-time.
              </div>
            )}

            {/* Telegraphed Picks */}
            {analysis.banPredictions.telegraphedHeroes.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-dota font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Telegraphed Opponent Candidates ({analysis.banPredictions.telegraphedHeroes.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.banPredictions.telegraphedHeroes.map((item) => (
                    <div key={`telegraph-${item.hero.id}`} className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={item.hero.avatarUrl} alt={item.hero.name} className="w-8 h-8 rounded-lg object-cover border border-amber-500/60" />
                          <div>
                            <span className="font-dota font-bold text-xs text-white block">{item.hero.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.hero.roles.join(', ')}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                          {item.confidence}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{item.reason}</p>
                      <div className="p-2 rounded bg-red-950/40 border border-red-500/20 text-[10px] text-red-200">
                        <strong>Allied Counter:</strong> {item.counterRecommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opponent Lineup Forecast */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-dota font-bold text-xs uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Opponent Missing Roles Forecast ({analysis.lineupPrediction.detectedArchetype.name})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.lineupPrediction.predictedHeroes.map((pred, i) => (
                  <div key={`lineup-pred-${pred.hero.id}-${i}`} className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40 uppercase">
                          {pred.roleName}
                        </span>
                        <span className="font-mono text-amber-300 font-bold">{pred.confidence}% Likelihood</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img src={pred.hero.avatarUrl} alt={pred.hero.name} className="w-7 h-7 rounded-md object-cover border border-rose-500/50" />
                        <span className="font-dota font-bold text-xs text-white">{pred.hero.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">{pred.strategicFitReason}</p>
                    </div>

                    <button
                      onClick={() => handleAssignHero('opponents', 'pick', pred.hero.id, pred.predictedPos)}
                      className="w-full py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 font-bold text-[10px] transition-all"
                    >
                      Assign to Opponent Pos {pred.predictedPos}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: LANE FORECAST & WIN CONDITIONS */}
        {activeAnalysisTab === 'lanes' && (
          <div className="space-y-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-md">
            
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Swords className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-dota font-bold text-base text-cyan-200">
                  PROJECTED LANE MATCHUPS & 5V5 WIN CONDITIONS
                </h3>
                <p className="text-[11px] text-slate-400">
                  Head-to-head lane simulation comparing Allies vs Opponents assigned positions
                </p>
              </div>
            </div>

            {/* Lane Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.laneForecasts.map((lane, i) => (
                <div key={`lane-fc-${i}`} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-dota font-bold text-xs text-white">{lane.laneName}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      lane.advantage === 'Radiant Favored'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : lane.advantage === 'Dire Favored'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {lane.advantage === 'Radiant Favored' ? 'Allies Favored' : lane.advantage === 'Dire Favored' ? 'Opponents Favored' : 'Even Lane'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">{lane.tacticalTip}</p>
                </div>
              ))}
            </div>

            {/* 5v5 Win Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <h4 className="font-dota font-bold text-xs text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Allies Win Conditions
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {analysis.winConditions.radiant.map((wc, i) => (
                    <li key={`ally-wc-${i}`}>{wc}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <h4 className="font-dota font-bold text-xs text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Opponent Threat Conditions
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {analysis.winConditions.dire.map((wc, i) => (
                    <li key={`opp-wc-${i}`}>{wc}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: GEMINI AI TACTICAL ORACLE */}
        {activeAnalysisTab === 'ai' && (
          <div className="space-y-4 rounded-2xl bg-slate-950/85 border border-purple-500/40 p-4 sm:p-5 shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md">
            
            {/* AI Console Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 via-indigo-600/20 to-purple-900/40 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Bot className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-dota font-black text-base text-purple-200 tracking-wide">
                      GEMINI AI TACTICAL ORACLE
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Gemini 4 / 3.8 Flash Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Grandmaster / Immortal-level strategic breakdown for Patch 7.37d
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRequestAiAnalysis()}
                disabled={isAiLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Analyzing Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>{aiAnalysis ? 'Re-Analyze Draft' : 'Generate Full Breakdown'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Strategy Question Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-purple-300/80 uppercase tracking-wider">
                Tactical Quick Inquiries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Lane-by-lane dynamic matchups and rotation triggers',
                  'Countering enemy core timings and late-game spikes',
                  'Critical defensive itemization (BKB / Vessel / Pipe / Silver Edge)',
                  '20-Minute Tormentor & Roshan objective prioritization'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    disabled={isAiLoading}
                    onClick={() => {
                      setAiCustomQuestion(q);
                      handleRequestAiAnalysis(q);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/50 text-[11px] text-slate-300 hover:text-purple-200 transition-all text-left"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom AI Chat Prompt Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (aiCustomQuestion.trim() && !isAiLoading) {
                  handleRequestAiAnalysis(aiCustomQuestion);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={aiCustomQuestion}
                onChange={(e) => setAiCustomQuestion(e.target.value)}
                placeholder="Ask Gemini AI anything about this draft matchup..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400/50 text-xs text-slate-200 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiCustomQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>

            {/* AI Error Alert */}
            {aiError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-2.5 text-red-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="flex-1">{aiError}</span>
                <button
                  onClick={() => handleRequestAiAnalysis()}
                  className="px-2.5 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-[11px] font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* AI Response Output Console */}
            {isAiLoading ? (
              <div className="min-h-[220px] rounded-xl bg-slate-900/60 border border-purple-500/20 p-8 flex flex-col items-center justify-center space-y-3 text-center animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Loader2 className="w-6 h-6 text-purple-300 animate-spin" />
                </div>
                <div className="font-dota font-bold text-sm text-purple-200 uppercase tracking-wider">
                  Oracle Deep-Think Analysis in Progress...
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Synthesizing drafting algorithms, hero facets, counter intensity, and Patch 7.37d telemetry with Google Gemini.
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="rounded-xl bg-slate-900/80 border border-purple-500/30 p-4 sm:p-5 text-slate-200 text-xs leading-relaxed space-y-3 shadow-inner max-h-[550px] overflow-y-auto">
                <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                  {aiAnalysis}
                </div>
              </div>
            ) : (
              <div className="min-h-[160px] rounded-xl bg-slate-900/40 border border-dashed border-purple-500/30 p-6 flex flex-col items-center justify-center text-center space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400/60 animate-bounce" />
                <div className="font-dota font-bold text-xs text-purple-200 uppercase tracking-wide">
                  Oracle Awaiting Query
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Click <strong className="text-purple-300">Generate Full Breakdown</strong> or select an inquiry to receive a pro-grade tactical blueprint powered by Gemini AI.
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 5. SEARCH & SELECTION MODAL (DRAFT STUDIO STYLE)          */}
      {/* ========================================================= */}
      {modalTarget && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setModalTarget(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[85vh] bg-slate-950 border-2 border-dota-border rounded-2xl flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-dota-border flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  modalTarget.team === 'allies' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {modalTarget.type === 'ban' ? <Lock className="w-4 h-4 text-red-400" /> : <Target className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-dota font-black text-sm text-white">
                    SELECT {modalTarget.type === 'ban' ? 'BAN' : 'HERO'} FOR {modalTarget.team === 'allies' ? 'ALLIES' : 'OPPONENTS'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalTarget.type === 'ban' 
                      ? 'Select hero to add to the ban roster' 
                      : `Assigning Pos ${modalTargetPos} (${modalTargetDef.name})`}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setModalTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 border-b border-dota-border flex flex-wrap items-center justify-between gap-2 bg-slate-900/30">
              <div className="flex items-center gap-1.5 flex-wrap">
                {modalTarget.type === 'pick' && (
                  <button
                    onClick={() => setModalRoleFilter(prev => prev === 'dedicated' ? 'all' : 'dedicated')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      modalRoleFilter === 'dedicated'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ★ {modalTargetRole} Only
                  </button>
                )}

                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  {[
                    { id: 'all', label: 'ALL' },
                    { id: 'str', label: 'STR' },
                    { id: 'agi', label: 'AGI' },
                    { id: 'int', label: 'INT' },
                    { id: 'all_attr', label: 'UNI' }
                  ].map(attr => (
                    <button
                      key={`modal-attr-${attr.id}`}
                      onClick={() => setModalAttr(attr.id === 'all_attr' ? 'all' : attr.id as any)}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        (modalAttr === attr.id || (attr.id === 'all_attr' && modalAttr === 'all'))
                          ? 'bg-dota-gold text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {attr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search heroes..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-dota-gold"
                />
              </div>
            </div>

            {/* Hero Grid in Modal */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 custom-scrollbar">
              {filteredModalHeroes.map(hero => {
                const recScore = modalRecScoreMap.get(hero.id);
                const isFav = favorites.includes(hero.id);

                return (
                  <button
                    key={`modal-hero-${hero.id}`}
                    onClick={() => handleAssignHero(modalTarget.team, modalTarget.type, hero.id, modalTarget.pos)}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/60 flex items-center gap-2 text-left transition-all hover:scale-[1.02] group"
                  >
                    <img 
                      src={hero.avatarUrl} 
                      alt={hero.name} 
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-700 group-hover:border-amber-400" 
                    />
                    <div className="truncate flex-1">
                      <div className="font-dota font-bold text-xs text-white truncate group-hover:text-amber-300">
                        {hero.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>{hero.winRate}%</span>
                        {isFav && <span className="text-amber-400">★</span>}
                        {recScore && <span className="text-emerald-400 font-bold">{recScore}%</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
