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
import { EsportsOracleCockpit } from '../../../features/predictive-draft/ui/EsportsOracleCockpit';
import { 
  BrainCircuit, 
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
  Loader2,
  Key,
  ExternalLink,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers
} from 'lucide-react';

export type DedicatedSlots = [string | null, string | null, string | null, string | null, string | null];

export interface PredictiveDraft5v5Props {
  onSelectHero?: (hero: HeroData, pos?: PositionNumber) => void;
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

  // Active / Passive drafting cockpit mode: 'active' focuses on active target slot & compact lineup; 'passive' shows full 10-hero lineup board
  const [draftFocusMode, setDraftFocusMode] = useState<'active' | 'passive'>('active');

  // Collapsible Ban Deck toggle in active cockpit mode
  const [showBansDeck, setShowBansDeck] = useState<boolean>(false);

  // Strategy Module Dropdown menu state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Gemini AI Oracle state (Gemini Flash-Lite Free Tier)
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Gemini Free Tier API Key modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [keyStatus, setKeyStatus] = useState(() => GeminiService.getKeyConfigStatus());
  const [testConnResult, setTestConnResult] = useState<{ testing: boolean; message: string; ok?: boolean } | null>(null);

  const handleSaveCustomKey = () => {
    if (!customKeyInput.trim()) return;
    GeminiService.setCustomApiKey(customKeyInput.trim());
    setKeyStatus(GeminiService.getKeyConfigStatus());
    setCustomKeyInput('');
    setTestConnResult({ testing: false, message: 'Custom key saved successfully!', ok: true });
  };

  const handleClearCustomKey = () => {
    GeminiService.setCustomApiKey('');
    setKeyStatus(GeminiService.getKeyConfigStatus());
    setCustomKeyInput('');
    setTestConnResult(null);
  };

  const handleTestConnection = async () => {
    setTestConnResult({ testing: true, message: 'Testing connection to Gemini Flash-Lite...' });
    const res = await GeminiService.testConnection();
    if (res.success) {
      setTestConnResult({ testing: false, message: 'Connected to Gemini Flash-Lite (Free Tier) successfully!', ok: true });
    } else {
      setTestConnResult({ testing: false, message: `Connection failed: ${res.error}`, ok: false });
    }
  };

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
        if (!GeminiService.isKeyConfigured()) {
          const fallbackAdvice = GeminiService.generateDeterministicDraftAdvice({
            allies: alliesData,
            opponents: opponentsData,
            bans: banNames
          });
          setAiAnalysis(`${fallbackAdvice}\n\n> 💡 **Custom Question Answered**: For *"${customQ.trim()}"*, prioritize lane control, active defensive itemization, and timing smoke ganks around enemy ultimate cooldowns.\n> *To unlock live AI match analysis with Gemini Flash-Lite (Google AI Studio Free Tier), click "Free Tier Config" above.*`);
        } else {
          const res = await GeminiService.generateText(fullPrompt, 'You are an elite Dota 2 coach and drafting analyst for Patch 7.37d. Provide concise, tactical advice.');
          setAiAnalysis(res);
        }
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

  const activeSlotDef = POSITION_DEFINITIONS[activeTargetSlot.pos];
  const activeSlotHeroId = activeTargetSlot.team === 'allies' 
    ? allySlots[activeTargetSlot.pos - 1] 
    : opponentSlots[activeTargetSlot.pos - 1];
  const activeSlotHero = activeSlotHeroId ? HERO_MAP.get(activeSlotHeroId) : null;

  const alliesData = useMemo(() => {
    return allySlots
      .map((id, idx) => ({ id, pos: (idx + 1) as PositionNumber }))
      .filter(s => s.id !== null)
      .map(s => {
        const hero = HERO_MAP.get(s.id!);
        return {
          name: hero?.name || s.id!,
          role: POSITION_DEFINITIONS[s.pos].role,
          avatarUrl: hero?.avatarUrl
        };
      });
  }, [allySlots]);

  const opponentsData = useMemo(() => {
    return opponentSlots
      .map((id, idx) => ({ id, pos: (idx + 1) as PositionNumber }))
      .filter(s => s.id !== null)
      .map(s => {
        const hero = HERO_MAP.get(s.id!);
        return {
          name: hero?.name || s.id!,
          role: POSITION_DEFINITIONS[s.pos].role,
          avatarUrl: hero?.avatarUrl
        };
      });
  }, [opponentSlots]);

  const banNames = useMemo(() => {
    return [...allyBanIds, ...opponentBanIds]
      .map(id => HERO_MAP.get(id)?.name || id);
  }, [allyBanIds, opponentBanIds]);

  return (
    <div ref={containerRef} className="space-y-4 pb-12">
      
      {/* ========================================================= */}
      {/* 1. TOP BANNER & ADVANTAGE METRICS                         */}
      {/* ========================================================= */}
      <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Title & Perspective Toggle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-hud-accent/10 border border-hud-accent/30 flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-4 h-4 text-hud-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase text-hud-text">
                5v5 Predictive Draft Oracle
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-hud-surface-raised text-hud-text-secondary border border-white/[0.08]">
                Dedicated Roles
              </span>
            </div>
            <p className="text-xs text-hud-text-muted mt-0.5">
              Lineup advantage & lane simulation engine. Switch between Active Focus and Full Overview.
            </p>
          </div>
        </div>

        {/* Advantage Progress Bar & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-xl">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium tabular-nums">
                <Crown className="w-3 h-3 text-emerald-400" /> ALLIES {analysis.draftAdvantage.radiantScore}%
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono text-hud-text-muted">
                <span>E: <strong className={analysis.draftAdvantage.earlyAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-red-400'}>{analysis.draftAdvantage.earlyAdvantage === 'Radiant' ? 'Allies' : analysis.draftAdvantage.earlyAdvantage === 'Dire' ? 'Opponents' : 'Even'}</strong></span>
                <span>M: <strong className={analysis.draftAdvantage.midAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-red-400'}>{analysis.draftAdvantage.midAdvantage === 'Radiant' ? 'Allies' : analysis.draftAdvantage.midAdvantage === 'Dire' ? 'Opponents' : 'Even'}</strong></span>
                <span>L: <strong className={analysis.draftAdvantage.lateAdvantage === 'Radiant' ? 'text-emerald-400' : 'text-red-400'}>{analysis.draftAdvantage.lateAdvantage === 'Radiant' ? 'Allies' : analysis.draftAdvantage.lateAdvantage === 'Dire' ? 'Opponents' : 'Even'}</strong></span>
              </div>
              <span className="text-red-400 flex items-center gap-1 font-mono font-medium tabular-nums">
                OPPONENTS {analysis.draftAdvantage.direScore}% <Swords className="w-3 h-3" />
              </span>
            </div>

            <div className="relative h-2 w-full bg-hud-bg rounded-sm overflow-hidden border border-white/[0.08]">
              <div 
                className="absolute inset-y-0 left-0 w-full bg-emerald-500 origin-left transition-transform duration-200 ease-out"
                style={{ transform: `scaleX(${Math.max(0, Math.min(100, analysis.draftAdvantage.radiantScore)) / 100})` }}
              />
              <div 
                className="absolute inset-y-0 right-0 w-full bg-red-500 origin-right transition-transform duration-200 ease-out"
                style={{ transform: `scaleX(${Math.max(0, Math.min(100, analysis.draftAdvantage.direScore)) / 100})` }}
              />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-hud-surface z-10" />
            </div>
          </div>

          {/* Active / Passive Focus Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-md bg-hud-bg border border-white/[0.08]">
            <button
              onClick={() => {
                SoundEngine.playHover();
                setDraftFocusMode('active');
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                draftFocusMode === 'active'
                  ? 'bg-hud-surface-raised text-hud-text font-medium border border-white/[0.12] shadow-sm'
                  : 'text-hud-text-muted hover:text-hud-text'
              }`}
              title="Active Cockpit: Focus on selected draft slot and collapse passive elements"
            >
              <Compass className="w-3.5 h-3.5 text-hud-accent" />
              <span>Active</span>
            </button>
            <button
              onClick={() => {
                SoundEngine.playHover();
                setDraftFocusMode('passive');
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                draftFocusMode === 'passive'
                  ? 'bg-hud-surface-raised text-hud-text font-medium border border-white/[0.12] shadow-sm'
                  : 'text-hud-text-muted hover:text-hud-text'
              }`}
              title="Passive Overview: Expand complete 10-hero lineup board and ban rosters"
            >
              <Layers className="w-3.5 h-3.5 text-hud-accent" />
              <span>Full Board</span>
            </button>
          </div>

          {/* Reset Draft Button */}
          <button
            onClick={handleClearDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-hud-surface hover:bg-red-500/10 text-hud-text-muted hover:text-red-400 border border-white/[0.08] text-xs font-medium transition-colors touch-target"
            title="Reset Draft to blank initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. DRAFT BOARD - ACTIVE FOCUS OR PASSIVE FULL BOARD       */}
      {/* ========================================================= */}
      {draftFocusMode === 'active' ? (
        /* ACTIVE DRAFT COCKPIT (COLLAPSED & HIGHEST DENSITY) */
        <div className="space-y-3">
          
          {/* Active Slot Focus Card & Mini Lineup Navigator */}
          <div className="bg-hud-surface border border-white/[0.08] rounded-lg p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Left: Current Active Slot Detail */}
            <div className="flex items-center gap-3.5">
              <div 
                onClick={() => handleOpenSlotModal(activeTargetSlot.team, activeTargetMode, activeTargetSlot.pos)}
                className={`w-12 h-12 rounded-md border flex items-center justify-center relative cursor-pointer group transition-colors overflow-hidden ${
                  activeSlotHero 
                    ? activeTargetSlot.team === 'allies' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-red-500/60 bg-red-500/10'
                    : 'border-dashed border-white/[0.2] bg-hud-bg hover:border-hud-accent/60'
                }`}
                title="Click to assign hero to this active slot"
              >
                {activeSlotHero ? (
                  <>
                    <img src={activeSlotHero.avatarUrl} alt={activeSlotHero.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </>
                ) : (
                  <div className="flex flex-col items-center text-hud-accent">
                    <Plus className="w-4 h-4" />
                    <span className="text-[7px] font-mono font-semibold">PICK</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                    activeTargetSlot.team === 'allies' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {activeTargetSlot.team === 'allies' ? 'Allies Team' : 'Opponents Team'}
                  </span>
                  <span className="text-xs font-mono text-hud-text-secondary">
                    Pos {activeTargetSlot.pos} • {activeSlotDef.name}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-hud-text mt-0.5">
                  {activeSlotHero ? activeSlotHero.name : `Select ${activeSlotDef.role}`}
                </h3>

                <div className="flex items-center gap-2 text-xs text-hud-text-muted mt-0.5">
                  <span>Lane: <strong className="text-hud-text-secondary">{activeSlotDef.lane}</strong></span>
                  {activeSlotHero && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono tabular-nums">{activeSlotHero.winRate}% WR</span>
                      <span>•</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHero(activeTargetSlot.team, 'pick', activeTargetSlot.pos);
                        }}
                        className="text-red-400 hover:text-red-300 underline text-xs"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Dual Team Quick Lineup Strip (P1-P5) */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Allies Mini Slots (P1 - P5) */}
              <div className="flex items-center gap-1 p-1 rounded-md bg-hud-bg border border-emerald-500/20">
                <span className="text-[9px] font-mono font-semibold text-emerald-400 uppercase px-1">Rad</span>
                {([1, 2, 3, 4, 5] as PositionNumber[]).map(pos => {
                  const hId = allySlots[pos - 1];
                  const h = hId ? HERO_MAP.get(hId) : null;
                  const isSelected = activeTargetSlot.team === 'allies' && activeTargetSlot.pos === pos;
                  return (
                    <button
                      key={`nav-ally-${pos}`}
                      onClick={() => {
                        SoundEngine.playHover();
                        setActiveTargetSlot({ team: 'allies', pos });
                        setActiveTargetMode('pick');
                      }}
                      className={`w-7 h-7 rounded overflow-hidden relative border transition-colors ${
                        isSelected 
                          ? 'border-hud-accent ring-1 ring-hud-accent/60 scale-105 z-10' 
                          : h ? 'border-emerald-500/40 opacity-90' : 'border-dashed border-emerald-500/30 bg-emerald-500/5 text-hud-text-muted'
                      }`}
                      title={`Ally Pos ${pos} - ${h?.name || 'Vacant'}`}
                    >
                      {h ? (
                        <img src={h.avatarUrl} alt={h.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-mono font-medium text-emerald-400">P{pos}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-hud-text-muted font-mono text-xs">VS</div>

              {/* Opponents Mini Slots (P1 - P5) */}
              <div className="flex items-center gap-1 p-1 rounded-md bg-hud-bg border border-red-500/20">
                <span className="text-[9px] font-mono font-semibold text-red-400 uppercase px-1">Dire</span>
                {([1, 2, 3, 4, 5] as PositionNumber[]).map(pos => {
                  const hId = opponentSlots[pos - 1];
                  const h = hId ? HERO_MAP.get(hId) : null;
                  const isSelected = activeTargetSlot.team === 'opponents' && activeTargetSlot.pos === pos;
                  return (
                    <button
                      key={`nav-opp-${pos}`}
                      onClick={() => {
                        SoundEngine.playHover();
                        setActiveTargetSlot({ team: 'opponents', pos });
                        setActiveTargetMode('pick');
                      }}
                      className={`w-7 h-7 rounded overflow-hidden relative border transition-colors ${
                        isSelected 
                          ? 'border-hud-accent ring-1 ring-hud-accent/60 scale-105 z-10' 
                          : h ? 'border-red-500/40 opacity-90' : 'border-dashed border-red-500/30 bg-red-500/5 text-hud-text-muted'
                      }`}
                      title={`Opponent Pos ${pos} - ${h?.name || 'Vacant'}`}
                    >
                      {h ? (
                        <img src={h.avatarUrl} alt={h.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-mono font-medium text-red-400">P{pos}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Collapsible Ban Deck Accordion (Hides passive ban clutter) */}
          <div className="rounded-lg bg-hud-surface border border-white/[0.08] overflow-hidden">
            <button
              onClick={() => {
                SoundEngine.playHover();
                setShowBansDeck(!showBansDeck);
              }}
              className="w-full px-3.5 py-2 flex items-center justify-between text-xs text-hud-text-muted hover:text-hud-text transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="font-medium text-hud-text">
                  Bans Roster ({allyBanIds.length + opponentBanIds.length}/14 Active)
                </span>
                <span className="text-[10px] text-hud-text-muted font-mono tabular-nums">
                  Allies: {allyBanIds.length} • Opponents: {opponentBanIds.length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-hud-text-muted">
                <span>{showBansDeck ? 'Hide Bans Deck' : 'Expand Bans Deck'}</span>
                {showBansDeck ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showBansDeck && (
              <div className="p-3 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-3 bg-hud-bg/50 animate-fadeIn">
                {/* Allies Bans */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-emerald-400 font-medium text-[10px] uppercase font-mono">Allies Bans:</span>
                  {allyBanIds.map((banId, idx) => {
                    const h = HERO_MAP.get(banId);
                    return (
                      <span key={`a-ban-${banId}-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-mono">
                        {h && <img src={h.avatarUrl} alt={h.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                        <span className="line-through">{h?.name || banId}</span>
                        <button onClick={() => handleRemoveHero('allies', 'ban', idx)} className="text-red-400 hover:text-white font-bold ml-0.5">×</button>
                      </span>
                    );
                  })}
                  {allyBanIds.length < 7 && (
                    <button
                      onClick={() => handleOpenSlotModal('allies', 'ban')}
                      className="text-red-400 hover:text-red-300 font-medium text-[10px] px-2 py-0.5 rounded border border-dashed border-red-500/30 hover:bg-red-500/10 transition-colors"
                    >
                      + Ban
                    </button>
                  )}
                </div>

                {/* Opponents Bans */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-red-400 font-medium text-[10px] uppercase font-mono">Opponent Bans:</span>
                  {opponentBanIds.map((banId, idx) => {
                    const h = HERO_MAP.get(banId);
                    return (
                      <span key={`o-ban-${banId}-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-mono">
                        {h && <img src={h.avatarUrl} alt={h.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                        <span className="line-through">{h?.name || banId}</span>
                        <button onClick={() => handleRemoveHero('opponents', 'ban', idx)} className="text-red-400 hover:text-white font-bold ml-0.5">×</button>
                      </span>
                    );
                  })}
                  {opponentBanIds.length < 7 && (
                    <button
                      onClick={() => handleOpenSlotModal('opponents', 'ban')}
                      className="text-red-400 hover:text-red-300 font-medium text-[10px] px-2 py-0.5 rounded border border-dashed border-red-500/30 hover:bg-red-500/10 transition-colors"
                    >
                      + Ban
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* PASSIVE FULL BOARD (10 COMPLETE SLOTS & PERSISTENT BANS) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 animate-fadeIn">
          
          {/* ALLIES SIDE - 5 DEDICATED SLOTS */}
          <div className="bg-hud-surface rounded-lg border border-emerald-500/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-sans font-semibold text-xs text-emerald-400 tracking-wider uppercase">ALLIES</span>
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 tabular-nums">
                  {allyPickCount}/5 Dedicated Picks
                </span>
              </div>
              <div className="text-[10px] text-hud-text-muted font-mono">
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
                    className={`h-22 rounded-md border p-1.5 flex flex-col justify-between transition-colors cursor-pointer relative select-none group ${
                      isTargeted 
                        ? 'border-hud-accent bg-hud-accent/10 ring-1 ring-hud-accent/60' 
                        : hero 
                          ? 'bg-hud-surface-raised border-emerald-500/40 hover:border-emerald-400' 
                          : 'bg-hud-bg/70 border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10'
                    }`}
                    title={
                      hero 
                        ? `${hero.name} (Ally ${def.name}) - Click to change` 
                        : `Ally ${def.name} (${def.role}) - Click to select suggested heroes`
                    }
                  >
                    {/* Top Bar: Dedicated Position & Role Tag */}
                    <div className="flex items-center justify-between text-[10px] leading-none">
                      <span className={`font-mono font-semibold uppercase px-1 py-0.2 rounded text-[8px] ${
                        isTargeted ? 'bg-hud-accent/20 text-hud-accent border border-hud-accent/40' : 'bg-hud-surface text-emerald-400 border border-emerald-500/30'
                      }`}>
                        P{pos}
                      </span>
                      {hero ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveHero('allies', 'pick', pos);
                          }}
                          className="p-0.5 rounded text-hud-text-muted hover:text-red-400 leading-none transition-colors"
                          title="Remove hero from this dedicated slot"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-[8px] text-hud-text-muted uppercase font-mono">{def.lane.split(' ')[0]}</span>
                      )}
                    </div>

                    {/* Center: Hero Avatar & Name OR + Add Hero */}
                    {hero ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectHero) onSelectHero(hero, pos);
                        }}
                        className="flex items-center gap-1.5 overflow-hidden"
                      >
                        <img 
                          src={hero.avatarUrl} 
                          alt={hero.name} 
                          className="w-7 h-7 rounded object-cover flex-shrink-0 border border-emerald-500/40" 
                        />
                        <div className="truncate flex-1">
                          <div className="font-medium text-xs text-hud-text truncate group-hover:text-emerald-400 leading-tight">
                            {hero.name}
                          </div>
                          <div className="text-[9px] font-mono text-emerald-400 leading-none tabular-nums">{hero.winRate}% WR</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1 text-hud-text-muted group-hover:text-emerald-400">
                        <div className="w-5 h-5 rounded bg-hud-surface border border-white/[0.08] group-hover:border-emerald-500/50 flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-[8px] font-mono font-medium mt-1 text-emerald-400">Add {def.role.split(' ')[0]}</span>
                      </div>
                    )}

                    {/* Bottom: Dedicated Role Label */}
                    <div className="text-[8px] text-hud-text-muted truncate flex items-center justify-between leading-none font-mono">
                      <span className="truncate">{def.role.replace(' Support', ' Sup')}</span>
                      {isTargeted ? (
                        <span className="text-hud-accent font-semibold text-[7px]">ACTIVE</span>
                      ) : (
                        <span className="text-[7px] text-hud-text-muted group-hover:text-hud-text-secondary">Pick</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Allies Bans Bar */}
            <div className="flex items-center gap-1.5 min-h-[28px] overflow-x-auto custom-scrollbar pt-1.5 border-t border-emerald-500/20 text-[10px]">
              <span className="text-hud-text-muted flex items-center gap-1 flex-shrink-0 font-medium">
                <Lock className="w-3 h-3 text-red-400" /> Allies Bans:
              </span>
              {allyBanIds.map((banId, idx) => {
                const hero = HERO_MAP.get(banId);
                return (
                  <div key={`ally-ban-${banId}-${idx}`} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-mono">
                    {hero && <img src={hero.avatarUrl} alt={hero.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                    <span className="line-through">{hero?.name || banId}</span>
                    <button onClick={() => handleRemoveHero('allies', 'ban', idx)} className="text-red-400 hover:text-white font-bold">×</button>
                  </div>
                );
              })}
              {allyBanIds.length < 7 && (
                <button
                  onClick={() => handleOpenSlotModal('allies', 'ban')}
                  className="flex-shrink-0 text-red-400 hover:text-red-300 font-medium flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-dashed border-red-500/30 hover:bg-red-500/10 transition-colors font-mono"
                >
                  <Plus className="w-2.5 h-2.5" /> Ban
                </button>
              )}
            </div>
          </div>

          {/* OPPONENTS SIDE - 5 DEDICATED SLOTS */}
          <div className="bg-hud-surface rounded-lg border border-red-500/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-sans font-semibold text-xs text-red-400 tracking-wider uppercase">OPPONENTS</span>
                <span className="text-[10px] font-mono text-red-400 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 tabular-nums">
                  {opponentPickCount}/5 Dedicated Picks
                </span>
              </div>
              <div className="text-[10px] text-hud-text-muted font-mono">
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
                    className={`h-22 rounded-md border p-1.5 flex flex-col justify-between transition-colors cursor-pointer relative select-none group ${
                      isTargeted 
                        ? 'border-hud-accent bg-hud-accent/10 ring-1 ring-hud-accent/60' 
                        : hero 
                          ? 'bg-hud-surface-raised border-red-500/40 hover:border-red-400' 
                          : 'bg-hud-bg/70 border-dashed border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10'
                    }`}
                    title={
                      hero 
                        ? `${hero.name} (Opponent ${def.name}) - Click to change` 
                        : `Opponent ${def.name} (${def.role}) - Click to select hero`
                    }
                  >
                    {/* Top Bar: Dedicated Position & Role */}
                    <div className="flex items-center justify-between text-[10px] leading-none">
                      <span className={`font-mono font-semibold uppercase px-1 py-0.2 rounded text-[8px] ${
                        isTargeted ? 'bg-hud-accent/20 text-hud-accent border border-hud-accent/40' : 'bg-hud-surface text-red-400 border border-red-500/30'
                      }`}>
                        P{pos}
                      </span>
                      {hero ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveHero('opponents', 'pick', pos);
                          }}
                          className="p-0.5 rounded text-hud-text-muted hover:text-red-400 leading-none transition-colors"
                          title="Remove hero from this dedicated slot"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-[8px] text-hud-text-muted uppercase font-mono">{def.lane.split(' ')[0]}</span>
                      )}
                    </div>

                    {/* Center: Hero Avatar & Name OR + Add Hero */}
                    {hero ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectHero) onSelectHero(hero, pos);
                        }}
                        className="flex items-center gap-1.5 overflow-hidden"
                      >
                        <img 
                          src={hero.avatarUrl} 
                          alt={hero.name} 
                          className="w-7 h-7 rounded object-cover flex-shrink-0 border border-red-500/40" 
                        />
                        <div className="truncate flex-1">
                          <div className="font-medium text-xs text-hud-text truncate group-hover:text-red-400 leading-tight">
                            {hero.name}
                          </div>
                          <div className="text-[9px] font-mono text-red-400 leading-none tabular-nums">{hero.winRate}% WR</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1 text-hud-text-muted group-hover:text-red-400">
                        <div className="w-5 h-5 rounded bg-hud-surface border border-white/[0.08] group-hover:border-red-500/50 flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3 text-red-400" />
                        </div>
                        <span className="text-[8px] font-mono font-medium mt-1 text-red-400">Add {def.role.split(' ')[0]}</span>
                      </div>
                    )}

                    {/* Bottom: Dedicated Role Label */}
                    <div className="text-[8px] text-hud-text-muted truncate flex items-center justify-between leading-none font-mono">
                      <span className="truncate">{def.role.replace(' Support', ' Sup')}</span>
                      {isTargeted ? (
                        <span className="text-hud-accent font-semibold text-[7px]">ACTIVE</span>
                      ) : (
                        <span className="text-[7px] text-hud-text-muted group-hover:text-hud-text-secondary">Pick</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Opponents Bans Bar */}
            <div className="flex items-center gap-1.5 min-h-[28px] overflow-x-auto custom-scrollbar pt-1.5 border-t border-red-500/20 text-[10px]">
              <span className="text-hud-text-muted flex items-center gap-1 flex-shrink-0 font-medium">
                <Lock className="w-3 h-3 text-red-400" /> Opponent Bans:
              </span>
              {opponentBanIds.map((banId, idx) => {
                const hero = HERO_MAP.get(banId);
                return (
                  <div key={`opp-ban-${banId}-${idx}`} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-mono">
                    {hero && <img src={hero.avatarUrl} alt={hero.name} className="w-3.5 h-3.5 rounded object-cover grayscale" />}
                    <span className="line-through">{hero?.name || banId}</span>
                    <button onClick={() => handleRemoveHero('opponents', 'ban', idx)} className="text-red-400 hover:text-white font-bold">×</button>
                  </div>
                );
              })}
              {opponentBanIds.length < 7 && (
                <button
                  onClick={() => handleOpenSlotModal('opponents', 'ban')}
                  className="flex-shrink-0 text-red-400 hover:text-red-300 font-medium flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-dashed border-red-500/30 hover:bg-red-500/10 transition-colors font-mono"
                >
                  <Plus className="w-2.5 h-2.5" /> Ban
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PREDICTIVE ANALYSIS & STRATEGY ENGINE                  */}
      {/* ========================================================= */}
      <div className="space-y-4">
        
        {/* STRATEGY MODULE CONTROL BAR (COMPACT DROPDOWN & QUICK PILLS) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-hud-surface rounded-lg p-2.5 border border-white/[0.08]">
          
          {/* Custom Strategy Mode Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => {
                SoundEngine.playHover();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-hud-bg border border-white/[0.1] hover:border-white/[0.2] text-hud-text font-medium text-xs transition-colors shadow-sm group touch-target"
            >
              {activeAnalysisTab === 'picks' && <Target className="w-4 h-4 text-emerald-400" />}
              {activeAnalysisTab === 'bans' && <Lock className="w-4 h-4 text-red-400" />}
              {activeAnalysisTab === 'intent' && <BrainCircuit className="w-4 h-4 text-amber-400" />}
              {activeAnalysisTab === 'lanes' && <Swords className="w-4 h-4 text-cyan-400" />}
              {activeAnalysisTab === 'ai' && <Sparkles className="w-4 h-4 text-hud-accent" />}
              
              <span className="uppercase tracking-wider font-mono text-[11px]">
                {activeAnalysisTab === 'picks' && 'Role Optimal Picks'}
                {activeAnalysisTab === 'bans' && 'Targeted Ban Suggestions'}
                {activeAnalysisTab === 'intent' && 'Ban-Intent Decryption'}
                {activeAnalysisTab === 'lanes' && 'Lane Matchup Forecast'}
                {activeAnalysisTab === 'ai' && 'AI Draft Advisor'}
              </span>

              {activeAnalysisTab === 'intent' && analysis.banPredictions.telegraphedHeroes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono tabular-nums">
                  {analysis.banPredictions.telegraphedHeroes.length} telegraphed
                </span>
              )}

              <ChevronDown className={`w-3.5 h-3.5 text-hud-text-muted group-hover:text-hud-text transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Items */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 rounded-lg bg-hud-surface-raised border border-white/[0.12] shadow-xl z-40 p-1 space-y-0.5 animate-fadeIn">
                {[
                  { id: 'picks', label: 'Role Optimal Picks', desc: 'Ranked synergies & counter-picks', icon: Target, color: 'text-emerald-400' },
                  { id: 'bans', label: 'Targeted Ban Suggestions', desc: 'Algorithmic ban priorities', icon: Lock, color: 'text-red-400' },
                  { id: 'intent', label: 'Ban-Intent Decryption', desc: 'Decode opponent strategy & candidate picks', icon: BrainCircuit, color: 'text-amber-400' },
                  { id: 'lanes', label: 'Lane Matchup Forecast', desc: 'Head-to-head lane simulation', icon: Swords, color: 'text-cyan-400' },
                  { id: 'ai', label: 'AI Draft Advisor', desc: 'Situational match analysis and win condition breakdown', icon: Sparkles, color: 'text-hud-accent' },
                ].map(item => {
                  const Icon = item.icon;
                  const isCurrent = activeAnalysisTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        SoundEngine.playPick();
                        setActiveAnalysisTab(item.id as any);
                        setIsDropdownOpen(false);
                        if (item.id === 'ai' && !aiAnalysis && !isAiLoading) {
                          handleRequestAiAnalysis();
                        }
                      }}
                      className={`w-full p-2.5 rounded-md text-left flex items-start gap-2.5 transition-colors ${
                        isCurrent 
                          ? 'bg-hud-surface text-hud-text border border-white/[0.12]' 
                          : 'hover:bg-white/[0.04] text-hud-text-muted hover:text-hud-text'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                      <div className="truncate">
                        <div className="font-semibold text-xs text-hud-text">{item.label}</div>
                        <div className="text-[10px] text-hud-text-muted">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Fast-Switch Segmented Pills */}
          <div className="flex items-center gap-0.5 bg-hud-bg p-0.5 rounded-md border border-white/[0.08] text-xs">
            <button
              onClick={() => {
                SoundEngine.playHover();
                setActiveAnalysisTab('picks');
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeAnalysisTab === 'picks' ? 'bg-hud-surface-raised text-emerald-400 font-medium border border-white/[0.12] shadow-sm' : 'text-hud-text-muted hover:text-hud-text'
              }`}
            >
              Picks
            </button>
            <button
              onClick={() => {
                SoundEngine.playHover();
                setActiveAnalysisTab('bans');
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeAnalysisTab === 'bans' ? 'bg-hud-surface-raised text-red-400 font-medium border border-white/[0.12] shadow-sm' : 'text-hud-text-muted hover:text-hud-text'
              }`}
            >
              Bans
            </button>
            <button
              onClick={() => {
                SoundEngine.playHover();
                setActiveAnalysisTab('intent');
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeAnalysisTab === 'intent' ? 'bg-hud-surface-raised text-amber-400 font-medium border border-white/[0.12] shadow-sm' : 'text-hud-text-muted hover:text-hud-text'
              }`}
            >
              Intent
            </button>
            <button
              onClick={() => {
                SoundEngine.playHover();
                setActiveAnalysisTab('lanes');
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeAnalysisTab === 'lanes' ? 'bg-hud-surface-raised text-cyan-400 font-medium border border-white/[0.12] shadow-sm' : 'text-hud-text-muted hover:text-hud-text'
              }`}
            >
              Lanes
            </button>
            <button
              onClick={() => {
                SoundEngine.playHover();
                setActiveAnalysisTab('ai');
                if (!aiAnalysis && !isAiLoading) {
                  handleRequestAiAnalysis();
                }
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                activeAnalysisTab === 'ai' ? 'bg-hud-surface-raised text-hud-accent font-medium border border-white/[0.12] shadow-sm' : 'text-hud-text-muted hover:text-hud-text'
              }`}
            >
              <Sparkles className="w-3 h-3 text-hud-accent" />
              <span>AI Advisor</span>
            </button>
          </div>

        </div>

        {/* TAB 1: SEPARATE COMPONENT -> ROLE OPTIMAL & COUNTER PICKS */}
        <div className={activeAnalysisTab === 'picks' ? 'block' : 'hidden'}>
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
        </div>

        {/* TAB 2: SEPARATE COMPONENT -> ROLE BAN SUGGESTIONS */}
        <div className={activeAnalysisTab === 'bans' ? 'block' : 'hidden'}>
          <RoleBanSuggestions
            allySlots={allySlots}
            opponentSlots={opponentSlots}
            banIds={allBanIds}
            favorites={favorites}
            onBanHero={(heroId) => handleAssignHero('allies', 'ban', heroId)}
            onSelectHero={onSelectHero}
            initialPos={activeTargetSlot.pos}
          />
        </div>

        {/* TAB 3: BAN INTENT & LINEUP FORECAST */}
        <div className={activeAnalysisTab === 'intent' ? 'block space-y-4 rounded-lg bg-hud-surface border border-white/[0.08] p-4 sm:p-5' : 'hidden'}>
            
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text">
                  Opponent Ban-Intent Decryption
                </h3>
                <p className="text-xs text-hud-text-muted">
                  Infers opponent intended strategy based on their active ban pattern
                </p>
              </div>
            </div>

            {/* Detected Strategy Card */}
            {analysis.banPredictions.detectedStrategy ? (
              <div className="p-3 rounded-md bg-hud-bg/80 border border-amber-500/30 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-amber-300">
                    {analysis.banPredictions.detectedStrategy.name}
                  </span>
                  <span className="font-mono text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 tabular-nums">
                    {analysis.banPredictions.detectedStrategy.confidence}% Confidence
                  </span>
                </div>
                <p className="text-hud-text-muted text-xs leading-relaxed">{analysis.banPredictions.detectedStrategy.description}</p>
                <div className="text-[10px] font-mono text-amber-300/80 pt-1">
                  Trigger Bans: <strong>{analysis.banPredictions.detectedStrategy.triggerBans.join(', ')}</strong>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-hud-bg/50 border border-white/[0.08] text-xs text-hud-text-muted text-center">
                Add opponent bans (e.g. Anti-Mage, Ancient Apparition, Axe) to decrypt telegraphed enemy strategies in real-time.
              </div>
            )}

            {/* Telegraphed Picks */}
            {analysis.banPredictions.telegraphedHeroes.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Telegraphed Opponent Candidates ({analysis.banPredictions.telegraphedHeroes.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.banPredictions.telegraphedHeroes.map((item) => (
                    <div key={`telegraph-${item.hero.id}`} className="p-3 rounded-md bg-hud-bg/70 border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={item.hero.avatarUrl} alt={item.hero.name} loading="lazy" decoding="async" className="w-8 h-8 rounded-md object-cover border border-white/[0.1]" />
                          <div>
                            <span className="font-semibold text-xs text-hud-text block">{item.hero.name}</span>
                            <span className="text-[10px] text-hud-text-muted font-mono">{item.hero.roles.join(', ')}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 tabular-nums">
                          {item.confidence}% Match
                        </span>
                      </div>
                      <p className="text-xs text-hud-text-muted leading-relaxed">{item.reason}</p>
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-300">
                        <strong className="text-red-200">Allied Counter:</strong> {item.counterRecommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opponent Lineup Forecast */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Opponent Missing Roles Forecast ({analysis.lineupPrediction.detectedArchetype.name})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.lineupPrediction.predictedHeroes.map((pred, i) => (
                  <div key={`lineup-pred-${pred.hero.id}-${i}`} className="p-3 rounded-md bg-hud-bg/70 border border-white/[0.08] flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/30 uppercase">
                          {pred.roleName}
                        </span>
                        <span className="font-mono text-amber-400 tabular-nums">{pred.confidence}% Likelihood</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img src={pred.hero.avatarUrl} alt={pred.hero.name} loading="lazy" decoding="async" className="w-7 h-7 rounded object-cover border border-white/[0.1]" />
                        <span className="font-semibold text-xs text-hud-text">{pred.hero.name}</span>
                      </div>
                      <p className="text-xs text-hud-text-muted leading-relaxed">{pred.strategicFitReason}</p>
                    </div>

                    <button
                      onClick={() => handleAssignHero('opponents', 'pick', pred.hero.id, pred.predictedPos)}
                      className="w-full py-1.5 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium transition-colors touch-target"
                    >
                      Assign to Opponent Pos {pred.predictedPos}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        {/* TAB 4: LANE FORECAST & WIN CONDITIONS */}
        <div className={activeAnalysisTab === 'lanes' ? 'block space-y-4 rounded-lg bg-hud-surface border border-white/[0.08] p-4 sm:p-5' : 'hidden'}>
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <div className="w-8 h-8 rounded-md bg-hud-accent/10 border border-hud-accent/30 flex items-center justify-center">
              <Swords className="w-4 h-4 text-hud-accent" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-hud-text">
                Projected Lane Matchups & 5v5 Win Conditions
              </h3>
              <p className="text-xs text-hud-text-muted">
                Head-to-head lane simulation comparing Allies vs Opponents assigned positions
              </p>
            </div>
          </div>

          {/* Lane Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analysis.laneForecasts.map((lane, i) => (
              <div key={`lane-fc-${i}`} className="p-3.5 rounded-md bg-hud-bg/70 border border-white/[0.08] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
                    <span className="font-semibold text-xs text-hud-text">{lane.laneName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap tabular-nums ${
                      lane.advantage === 'Radiant Favored'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : lane.advantage === 'Dire Favored'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-hud-surface text-hud-text-muted border-white/[0.08]'
                    }`}>
                      {lane.advantage === 'Radiant Favored' ? `Allies Favored (${lane.confidence}%)` : lane.advantage === 'Dire Favored' ? `Opponents Favored (${lane.confidence}%)` : `Even Lane (${lane.confidence}%)`}
                    </span>
                  </div>

                  {/* Lane Heroes Lineup Comparison */}
                  <div className="py-2.5 flex items-center justify-between gap-1 text-[11px]">
                    {/* Allies Heroes */}
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-mono font-semibold uppercase text-emerald-400">Allies</span>
                      {lane.radiantHeroes.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {lane.radiantHeroes.map((h) => (
                            <div key={`rad-lane-h-${h.id}`} className="flex items-center gap-1 bg-hud-surface border border-emerald-500/30 rounded px-1.5 py-0.5" title={`${h.name} (${h.attackType})`}>
                              <img src={h.avatarUrl} alt={h.name} loading="lazy" decoding="async" className="w-4 h-4 rounded object-cover" />
                              <span className="text-xs text-hud-text truncate max-w-[65px]">{h.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-hud-text-muted italic">Unassigned</span>
                      )}
                    </div>

                    <div className="px-1 text-[10px] font-mono text-hud-text-muted">VS</div>

                    {/* Opponents Heroes */}
                    <div className="flex-1 flex flex-col items-end gap-1">
                      <span className="text-[9px] font-mono font-semibold uppercase text-red-400">Opponents</span>
                      {lane.direHeroes.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {lane.direHeroes.map((h) => (
                            <div key={`dire-lane-h-${h.id}`} className="flex items-center gap-1 bg-hud-surface border border-red-500/30 rounded px-1.5 py-0.5" title={`${h.name} (${h.attackType})`}>
                              <span className="text-xs text-hud-text truncate max-w-[65px]">{h.name}</span>
                              <img src={h.avatarUrl} alt={h.name} loading="lazy" decoding="async" className="w-4 h-4 rounded object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-hud-text-muted italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tactical Tip */}
                <div className="p-2.5 rounded bg-hud-surface border border-white/[0.06] text-xs text-hud-text-muted leading-relaxed">
                  <span className="font-semibold text-hud-accent block mb-0.5 text-[10px] uppercase font-mono tracking-wider">Instruction</span>
                  {lane.tacticalTip}
                </div>
              </div>
            ))}
          </div>

          {/* 5v5 Win Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <h4 className="font-semibold text-xs text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Allies Win Conditions
              </h4>
              <ul className="text-xs text-hud-text-muted space-y-1 list-disc list-inside">
                {analysis.winConditions.radiant.map((wc, i) => (
                  <li key={`ally-wc-${i}`}>{wc}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-md bg-red-500/5 border border-red-500/20 space-y-2">
              <h4 className="font-semibold text-xs text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Opponent Threats
              </h4>
              <ul className="text-xs text-hud-text-muted space-y-1 list-disc list-inside">
                {analysis.winConditions.dire.map((wc, i) => (
                  <li key={`opp-wc-${i}`}>{wc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TAB 5: GEMINI AI TACTICAL ORACLE (PRO ESPORTS COCKPIT) */}
        <div className={activeAnalysisTab === 'ai' ? 'block' : 'hidden'}>
          <EsportsOracleCockpit
            allies={alliesData}
            opponents={opponentsData}
            bans={banNames}
            aiAnalysis={aiAnalysis}
            isAiLoading={isAiLoading}
            aiError={aiError}
            onRequestAnalysis={handleRequestAiAnalysis}
            onOpenKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. SEARCH & SELECTION MODAL (DRAFT STUDIO STYLE)          */}
      {/* ========================================================= */}
      {modalTarget && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 animate-fadeIn"
          onClick={() => setModalTarget(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[85vh] bg-hud-surface border border-white/[0.14] rounded-xl flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-hud-surface-raised">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  modalTarget.team === 'allies' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {modalTarget.type === 'ban' ? <Lock className="w-4 h-4 text-red-400" /> : <Target className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-hud-text uppercase tracking-wider font-mono">
                    Select {modalTarget.type === 'ban' ? 'Ban' : 'Hero'} for {modalTarget.team === 'allies' ? 'Allies' : 'Opponents'}
                  </h3>
                  <p className="text-xs text-hud-text-muted">
                    {modalTarget.type === 'ban' 
                      ? 'Select hero to add to the ban roster' 
                      : `Assigning Pos ${modalTargetPos} (${modalTargetDef.name})`}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setModalTarget(null)}
                className="p-1.5 rounded-md text-hud-text-muted hover:text-hud-text hover:bg-white/[0.08] transition-colors touch-target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 bg-hud-surface">
              <div className="flex items-center gap-1.5 flex-wrap">
                {modalTarget.type === 'pick' && (
                  <button
                    onClick={() => setModalRoleFilter(prev => prev === 'dedicated' ? 'all' : 'dedicated')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors touch-target ${
                      modalRoleFilter === 'dedicated'
                        ? 'bg-hud-surface-raised text-hud-text font-medium border border-white/[0.12] shadow-sm'
                        : 'bg-hud-bg text-hud-text-muted hover:text-hud-text border border-white/[0.06]'
                    }`}
                  >
                    ★ {modalTargetRole} Only
                  </button>
                )}

                <div className="flex items-center gap-0.5 bg-hud-bg p-0.5 rounded-md border border-white/[0.08] text-[10px]">
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
                      className={`px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                        (modalAttr === attr.id || (attr.id === 'all_attr' && modalAttr === 'all'))
                          ? 'bg-hud-surface-raised text-hud-text border border-white/[0.12]'
                          : 'text-hud-text-muted hover:text-hud-text'
                      }`}
                    >
                      {attr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-hud-text-muted" />
                <input
                  type="text"
                  placeholder="Search heroes..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-hud-bg border border-white/[0.1] rounded-md text-xs text-hud-text placeholder-hud-text-muted focus-hud"
                />
              </div>
            </div>

            {/* Hero Grid in Modal */}
            <div className="p-3.5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 custom-scrollbar">
              {filteredModalHeroes.map(hero => {
                const recScore = modalRecScoreMap.get(hero.id);
                const isFav = favorites.includes(hero.id);

                return (
                  <button
                    key={`modal-hero-${hero.id}`}
                    onClick={() => handleAssignHero(modalTarget.team, modalTarget.type, hero.id, modalTarget.pos)}
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '48px' }}
                    className="p-2 rounded-md bg-hud-bg/80 hover:bg-hud-surface-raised border border-white/[0.08] hover:border-hud-accent/60 flex items-center gap-2 text-left transition-colors group touch-target"
                  >
                    <img 
                      src={hero.avatarUrl} 
                      alt={hero.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-8 h-8 rounded object-cover flex-shrink-0 border border-white/[0.1] group-hover:border-hud-accent/60" 
                    />
                    <div className="truncate flex-1">
                      <div className="font-medium text-xs text-hud-text truncate group-hover:text-hud-accent">
                        {hero.name}
                      </div>
                      <div className="text-[10px] text-hud-text-muted flex items-center gap-1 font-mono">
                        <span className="tabular-nums">{hero.winRate}%</span>
                        {isFav && <span className="text-amber-400">★</span>}
                        {recScore && <span className="text-emerald-400 font-semibold tabular-nums">{recScore}%</span>}
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

      {/* ========================================================= */}
      {/* 6. GEMINI FLASH-LITE FREE TIER CONFIGURATION MODAL        */}
      {/* ========================================================= */}
      {isApiKeyModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn"
          onClick={() => setIsApiKeyModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-hud-surface border border-white/[0.14] rounded-xl p-5 shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-hud-accent/10 border border-hud-accent/30 flex items-center justify-center text-hud-accent">
                  <Key className="w-4 h-4 text-hud-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-hud-text">
                    Free Tier AI Configuration
                  </h3>
                  <p className="text-xs text-hud-text-muted">
                    Powered by Google Gemini Flash-Lite (Cheapest & Free Tier)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1.5 rounded-md text-hud-text-muted hover:text-hud-text hover:bg-white/[0.08] transition-colors touch-target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Tier Info Card */}
            <div className="p-3.5 rounded-md bg-hud-bg/70 border border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between text-hud-text font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-hud-accent" />
                  Active Model: Gemini Flash-Lite
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  100% Free Tier ($0.00)
                </span>
              </div>
              <p className="text-hud-text-muted text-xs leading-relaxed">
                Google AI Studio provides <strong>Gemini Flash-Lite</strong> completely free of charge with <strong>15 RPM</strong>, <strong>1,000,000 TPM</strong>, and <strong>1,500 daily requests</strong>.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-hud-accent/15 hover:bg-hud-accent/25 border border-hud-accent/30 text-hud-accent text-xs font-medium transition-colors touch-target"
                >
                  <span>Get Free Key on Google AI Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-hud-text-secondary">
                Current Key Status:
              </label>
              <div className="p-3 rounded-md bg-hud-bg border border-white/[0.08] flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-hud-text flex items-center gap-1.5">
                    {keyStatus.configured ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{keyStatus.source}</span>
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4 text-amber-400" />
                        <span>{keyStatus.source}</span>
                      </>
                    )}
                  </div>
                  {keyStatus.maskedKey && (
                    <div className="text-[11px] font-mono text-hud-text-muted mt-0.5">
                      Key: {keyStatus.maskedKey}
                    </div>
                  )}
                </div>

                {keyStatus.isCustom && (
                  <button
                    onClick={handleClearCustomKey}
                    className="px-2.5 py-1 rounded bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs transition-colors touch-target"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Custom Key Input */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-hud-text-secondary">
                Set Custom Google AI Studio Key:
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste AI Studio API key (AIzaSy...)"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-md bg-hud-bg border border-white/[0.1] text-xs text-hud-text placeholder-hud-text-muted focus-hud"
                />
                <button
                  onClick={handleSaveCustomKey}
                  disabled={!customKeyInput.trim()}
                  className="px-4 py-1.5 rounded-md bg-hud-accent hover:bg-hud-accent/90 disabled:opacity-40 text-slate-950 font-semibold text-xs transition-colors touch-target"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Test Connection Result */}
            {testConnResult && (
              <div className={`p-2.5 rounded-md text-xs flex items-center gap-2 ${
                testConnResult.ok === true
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : testConnResult.ok === false
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'bg-hud-bg border border-white/[0.1] text-hud-text-secondary'
              }`}>
                {testConnResult.testing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-hud-accent" />
                ) : testConnResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span className="flex-1 leading-snug">{testConnResult.message}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <button
                onClick={handleTestConnection}
                className="px-3 py-1.5 rounded-md bg-hud-bg hover:bg-white/[0.08] border border-white/[0.1] text-hud-text-secondary hover:text-hud-text text-xs font-medium flex items-center gap-1.5 transition-colors touch-target"
              >
                <Sparkles className="w-3.5 h-3.5 text-hud-accent" />
                <span>Test Connection</span>
              </button>

              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-hud-surface hover:bg-white/[0.08] border border-white/[0.1] text-hud-text text-xs font-medium transition-colors touch-target"
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
