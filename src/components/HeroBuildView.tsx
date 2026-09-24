import React, { useState, useEffect } from 'react';
import { HeroData } from '../types/hero';
import { StorageService } from '../services/storageService';
import { SoundEngine } from '../services/soundFx';
import { DotaComplexity, DotaRoleBadge, getItemImageUrl } from './DotaUIComponents';
import { SEASON_META_DATA } from '../data/seasonMetaData';
import { 
  X, 
  Star, 
  Zap, 
  Sparkles, 
  Crosshair, 
  Clock, 
  Layers, 
  Sword, 
  ShieldAlert, 
  Save, 
  Check, 
  AlertTriangle,
  Lightbulb,
  Coins,
  Flame,
  ChevronRight
} from 'lucide-react';

interface HeroBuildViewProps {
  hero: HeroData;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (heroId: string) => void;
  onSelectOtherHero?: (heroId: string) => void;
}

export const HeroBuildView: React.FC<HeroBuildViewProps> = ({
  hero,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectOtherHero
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'skills' | 'matchups' | 'strategy' | 'notes'>('build');
  const [userNote, setUserNote] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  const metaEntry = SEASON_META_DATA.heroes.find((m) => m.heroId === hero.id);

  useEffect(() => {
    setUserNote(StorageService.getHeroNote(hero.id));
  }, [hero.id]);

  const handleSaveNote = () => {
    StorageService.saveHeroNote(hero.id, userNote);
    setNoteSaved(true);
    SoundEngine.playGold();
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-dota-panel border-2 border-dota-gold/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Hero Banner */}
        <div className="relative bg-slate-950 border-b-2 border-dota-border overflow-hidden">
          
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src={hero.avatarUrl}
              alt={hero.name}
              className="w-full h-full object-cover object-center filter blur-md scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dota-panel via-dota-panel/95 to-transparent" />
          </div>

          <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Left: Avatar + Title + Attribute */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-dota-gold shadow-dota-glow flex-shrink-0">
                <img
                  src={hero.avatarUrl}
                  alt={hero.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-dota font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-yellow-300">
                    {hero.name}
                  </h1>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    hero.attribute === 'str' ? 'bg-red-950/90 text-red-400 border-red-800' :
                    hero.attribute === 'agi' ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800' :
                    hero.attribute === 'int' ? 'bg-blue-950/90 text-blue-400 border-blue-800' :
                    'bg-purple-950/90 text-purple-300 border-purple-800'
                  }`}>
                    {hero.attribute.toUpperCase()} • {hero.attackType}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium font-sans mt-0.5">
                  {hero.title}
                </p>

                {/* Official Roles Badges, Complexity & Season Meta */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {hero.roles.map((r) => (
                      <DotaRoleBadge key={r} role={r} />
                    ))}
                  </div>

                  <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60 text-xs">
                    {hero.winRate}% Win Rate
                  </span>

                  <DotaComplexity complexity={hero.complexity} size="md" />

                  {metaEntry ? (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                      metaEntry.tier === 'S+' || metaEntry.tier === 'S'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/70 shadow-dota-glow'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Season Meta: Tier {metaEntry.tier} {metaEntry.tier === 'S+' || metaEntry.tier === 'S' ? '(Dominant Pick)' : '(Balanced)'}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                      Non-Meta
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Controls & Close */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  onToggleFavorite(hero.id);
                  SoundEngine.playHover();
                }}
                className={`p-2.5 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-dota-glow'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  SoundEngine.playHover();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-red-950/80 border border-slate-700 hover:border-red-600 text-slate-400 hover:text-red-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="relative z-10 flex border-t border-dota-border bg-dota-panel/80 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('build');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'build'
                  ? 'border-dota-gold text-dota-gold bg-dota-gold/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sword className="w-4 h-4" />
              <span>Item Progression</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('skills');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'skills'
                  ? 'border-dota-int text-dota-int bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Skills & Talents</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('matchups');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'matchups'
                  ? 'border-dota-red text-red-400 bg-red-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>Counters & Matchups</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('strategy');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'strategy'
                  ? 'border-dota-agi text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Strategy & Spikes</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('notes');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'border-dota-uni text-purple-300 bg-purple-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Match Notes</span>
            </button>
          </div>

        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: ITEM PROGRESSION */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              
              {/* Starting Items */}
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-3 border-b border-dota-border/60 pb-2">
                  <h3 className="font-dota font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    Starting Items (600 Gold Budget)
                  </h3>
                  <span className="text-xs text-slate-400">Laning Phase Sustain</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.build.starting.map((item, idx) => (
                    <div key={idx} className="bg-dota-bg/90 border border-dota-border rounded-xl p-3 flex items-start gap-3 shadow">
                      <img
                        src={getItemImageUrl(item.id)}
                        alt={item.name}
                        className="w-10 h-8 rounded object-contain border border-slate-700 flex-shrink-0 bg-slate-950 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                          <span className="text-xs font-bold text-dota-gold flex items-center gap-0.5"><Coins className="w-3 h-3" />{item.cost}g</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early Game */}
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-3 border-b border-dota-border/60 pb-2">
                  <h3 className="font-dota font-bold text-sm sm:text-base text-cyan-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                    Early Game (Minute 0 – 12)
                  </h3>
                  <span className="text-xs text-slate-400">Boots, Wand & Core Components</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.build.early.map((item, idx) => (
                    <div key={idx} className="bg-dota-bg/90 border border-dota-border rounded-xl p-3 flex items-start gap-3 shadow">
                      <img
                        src={getItemImageUrl(item.id)}
                        alt={item.name}
                        className="w-10 h-8 rounded object-contain border border-slate-700 flex-shrink-0 bg-slate-950 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                          <span className="text-xs font-bold text-dota-gold flex items-center gap-0.5"><Coins className="w-3 h-3" />{item.cost}g</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Items */}
              <div className="bg-dota-panelAlt border-2 border-dota-gold/50 rounded-2xl p-5 shadow-dota-glow">
                <div className="flex items-center justify-between mb-3 border-b border-dota-gold/30 pb-2">
                  <h3 className="font-dota font-black text-base text-dota-gold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-dota-gold" />
                    Core Build (Primary Power Spike)
                  </h3>
                  <span className="text-xs text-amber-300 font-semibold">Essential Win-Condition Items</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.build.core.map((item, idx) => (
                    <div key={idx} className="bg-dota-bg border border-dota-gold/50 rounded-xl p-3 flex items-start gap-3 shadow-lg">
                      <img
                        src={getItemImageUrl(item.id)}
                        alt={item.name}
                        className="w-12 h-9 rounded object-contain border border-dota-gold/40 flex-shrink-0 bg-slate-950 shadow-md"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-200 truncate">{item.name}</span>
                          <span className="text-xs font-bold text-dota-gold flex items-center gap-0.5"><Coins className="w-3 h-3" />{item.cost}g</span>
                        </div>
                        {item.reason && (
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug font-sans">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BRIEFLY DETAILED SECTION FOR COUNTERS & THREAT MATRIX */}
              <div className="bg-gradient-to-r from-red-950/40 via-dota-panel to-slate-900 border-2 border-red-500/40 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/50 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <h3 className="font-dota font-black text-base text-white flex items-center gap-2">
                      <span>Brief Counter Guide & Matchup Threats</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('matchups');
                      SoundEngine.playHover();
                    }}
                    className="text-xs font-bold text-dota-gold hover:text-amber-300 flex items-center gap-1 transition-colors self-start sm:self-center"
                  >
                    <span>Inspect Full Matchups Tab</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  
                  {/* 1. Hard Hero Counters (Weak Against) */}
                  <div className="bg-dota-bg/85 border border-red-900/50 rounded-xl p-3.5 space-y-2.5 shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-dota font-bold text-xs text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        Hard Hero Counters
                      </span>
                      <span className="text-[10px] text-red-400 font-bold uppercase">Threats</span>
                    </div>
                    <div className="space-y-2">
                      {hero.weakAgainst.slice(0, 3).map((w, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            SoundEngine.playPick();
                            onSelectOtherHero && onSelectOtherHero(w.heroId);
                          }}
                          className="group flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-red-500/60 transition-all cursor-pointer"
                          title={`Click to inspect ${w.heroName}`}
                        >
                          <img
                            src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${w.heroId}.png`}
                            alt={w.heroName}
                            className="w-8 h-8 rounded-lg object-cover border border-red-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white group-hover:text-red-300 truncate">
                                {w.heroName}
                              </span>
                              <span className="text-[10px] text-red-400 font-bold uppercase">Danger</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {w.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Key Counter Items (What shuts them down) */}
                  <div className="bg-dota-bg/85 border border-amber-900/50 rounded-xl p-3.5 space-y-2.5 shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-dota font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        Must-Buy Counter Items
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">Item Locks</span>
                    </div>
                    <div className="space-y-2">
                      {hero.counterStrategy.keyCounterItems.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800"
                        >
                          <img
                            src={getItemImageUrl(item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                            alt={item.name}
                            className="w-8 h-6 rounded object-contain border border-amber-500/40 bg-slate-950 flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-amber-200 block truncate">
                              {item.name}
                            </span>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Favorable Matchups (Heroes this hero preys on) */}
                  <div className="bg-dota-bg/85 border border-emerald-900/50 rounded-xl p-3.5 space-y-2.5 shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-dota font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Favored Matchups
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">Preys On</span>
                    </div>
                    <div className="space-y-2">
                      {hero.strongAgainst.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            SoundEngine.playPick();
                            onSelectOtherHero && onSelectOtherHero(s.heroId);
                          }}
                          className="group flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer"
                          title={`Click to inspect ${s.heroName}`}
                        >
                          <img
                            src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${s.heroId}.png`}
                            alt={s.heroName}
                            className="w-8 h-8 rounded-lg object-cover border border-emerald-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white group-hover:text-emerald-300 truncate">
                                {s.heroName}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase">Favored</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                              {s.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Tactical Vulnerability Windows */}
                <div className="p-3 bg-black/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-300 block mb-0.5">Laning Vulnerability:</span>
                    <p className="text-slate-400 font-sans leading-relaxed">{hero.counterStrategy.laningAdvice}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block mb-0.5">Teamfight Exploitation:</span>
                    <p className="text-slate-400 font-sans leading-relaxed">{hero.counterStrategy.teamfightAdvice}</p>
                  </div>
                </div>
              </div>

              {/* Situational Item Branches */}
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-3 border-b border-dota-border/60 pb-2">
                  <h3 className="font-dota font-bold text-sm sm:text-base text-rose-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Situational & Counter Items (Adapt to Enemy Lineup)
                  </h3>
                  <span className="text-xs text-slate-400">Matchup Adaptations</span>
                </div>
                <div className="space-y-4">
                  {hero.build.situational.map((sit, idx) => (
                    <div key={idx} className="bg-dota-bg/70 border border-dota-border rounded-xl p-3.5">
                      <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        {sit.category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {sit.items.map((item, i) => (
                          <div key={i} className="bg-dota-panel p-3 rounded-xl border border-dota-border flex items-start gap-2.5 shadow">
                            <img
                              src={getItemImageUrl(item.id)}
                              alt={item.name}
                              className="w-9 h-7 rounded object-contain border border-slate-700 flex-shrink-0 bg-slate-950 shadow-sm"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                                <span className="text-xs font-bold text-dota-gold flex items-center gap-0.5">{item.cost}g</span>
                              </div>
                              {item.reason && (
                                <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{item.reason}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Late Game & Neutral Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Late Game */}
                <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5">
                  <h3 className="font-dota font-bold text-sm text-purple-300 mb-3 border-b border-dota-border/60 pb-2">
                    Late Game & Luxury
                  </h3>
                  <div className="space-y-2.5">
                    {hero.build.late.map((item, idx) => (
                      <div key={idx} className="bg-dota-bg p-2.5 rounded-xl border border-dota-border flex items-center justify-between gap-2 shadow">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={getItemImageUrl(item.id)}
                            alt={item.name}
                            className="w-8 h-6 rounded object-contain border border-slate-700 flex-shrink-0 bg-slate-950 shadow-sm"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                            }}
                          />
                          <div className="truncate">
                            <div className="font-bold text-xs text-slate-200 truncate">{item.name}</div>
                            {item.reason && <p className="text-[11px] text-slate-400 truncate">{item.reason}</p>}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-dota-gold flex-shrink-0">{item.cost}g</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neutral Items */}
                <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5">
                  <h3 className="font-dota font-bold text-sm text-emerald-300 mb-3 border-b border-dota-border/60 pb-2">
                    Recommended Neutral Items (Tier 1-5)
                  </h3>
                  <div className="space-y-2">
                    {hero.build.neutrals.map((n, idx) => (
                      <div key={idx} className="bg-dota-bg p-2.5 rounded-xl border border-dota-border flex items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-400 min-w-[50px]">Tier {n.tier}:</span>
                        <span className="text-slate-300 font-medium font-sans">{n.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SKILLS & TALENTS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              
              {/* Skill Maxing Priority Roadmap */}
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <h3 className="font-dota font-bold text-sm text-cyan-300 mb-2">
                  Recommended Skill Leveling Order
                </h3>
                <p className="text-xs text-slate-400 mb-3 font-sans">
                  Maxing priority: <span className="text-cyan-200 font-bold">{hero.skillOrder.maxPriority.join(' ➔ ')}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {hero.skillOrder.levelGuide.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center w-8 h-10 rounded-lg border text-xs font-bold ${
                        skill === 'R'
                          ? 'bg-red-950/90 border-red-500 text-red-300 shadow-sm'
                          : skill === 'Talent'
                          ? 'bg-amber-950/90 border-amber-500 text-amber-300 text-[10px] shadow-sm'
                          : 'bg-dota-bg border-dota-border text-slate-200'
                      }`}
                    >
                      <span className="text-[9px] text-slate-500 font-normal">{index + 1}</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Abilities Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hero.abilities.map((ab, idx) => (
                  <div key={idx} className="bg-dota-panelAlt border border-dota-border rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            ab.isUltimate ? 'bg-dota-red text-white shadow-dota-crimson' : 'bg-slate-800 text-dota-gold border border-dota-gold/40 shadow'
                          }`}>
                            {ab.key}
                          </span>
                          <span className="font-bold text-sm text-slate-100">{ab.name}</span>
                        </div>
                        {ab.isUltimate && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                            Ultimate
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
                        {ab.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Glowing Talent Tree */}
              <div className="bg-dota-panelAlt border-2 border-dota-gold/50 rounded-2xl p-5 sm:p-6 shadow-dota-glow">
                <div className="text-center mb-6">
                  <h3 className="font-dota font-black text-base sm:text-lg text-dota-gold tracking-wider uppercase">
                    Talent Tree Guide
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Glowing golden nodes represent recommended meta talent choices.
                  </p>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  {hero.talents.map((t) => (
                    <div key={t.level} className="flex items-center gap-3">
                      
                      {/* Left Option */}
                      <div className={`flex-1 p-3 rounded-xl border text-right text-xs font-semibold transition-all ${
                        t.recommended === 'left'
                          ? 'bg-dota-gold/20 border-dota-gold text-amber-200 shadow-dota-glow font-bold'
                          : 'bg-dota-bg/60 border-dota-border text-slate-400'
                      }`}>
                        {t.left}
                      </div>

                      {/* Level Circle Center */}
                      <div className="w-10 h-10 rounded-full bg-dota-panel border-2 border-dota-gold flex items-center justify-center font-dota font-bold text-xs text-dota-gold shadow flex-shrink-0">
                        {t.level}
                      </div>

                      {/* Right Option */}
                      <div className={`flex-1 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        t.recommended === 'right'
                          ? 'bg-dota-gold/20 border-dota-gold text-amber-200 shadow-dota-glow font-bold'
                          : 'bg-dota-bg/60 border-dota-border text-slate-400'
                      }`}>
                        {t.right}
                      </div>

                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-dota-border/60 text-center text-xs text-slate-400 space-y-1 font-sans">
                  {hero.talents.map((t) => t.reason ? (
                    <p key={t.level} className="text-[11px] text-slate-300">
                      <strong className="text-dota-gold">Lvl {t.level}:</strong> {t.reason}
                    </p>
                  ) : null)}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: COUNTERS & MATCHUPS */}
          {activeTab === 'matchups' && (
            <div className="space-y-6">
              
              {/* Strong Against */}
              <div className="bg-dota-panelAlt border border-emerald-600/40 rounded-2xl p-5 shadow">
                <h3 className="font-dota font-bold text-sm sm:text-base text-emerald-400 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Strong Against (Favorable Matchups)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hero.strongAgainst.map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectOtherHero && onSelectOtherHero(m.heroId);
                      }}
                      className="group bg-dota-bg/90 hover:bg-slate-800 border border-emerald-800/50 hover:border-emerald-500 rounded-xl p-3.5 cursor-pointer transition-all shadow flex items-start gap-3"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${m.heroId}.png`}
                        alt={m.heroName}
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-emerald-300 mb-1 flex items-center justify-between">
                          <span className="group-hover:text-emerald-200 transition-colors">{m.heroName}</span>
                          <span className="text-[10px] text-emerald-500 font-bold uppercase">Favored</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {m.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Against */}
              <div className="bg-dota-panelAlt border border-red-600/50 rounded-2xl p-5 shadow">
                <h3 className="font-dota font-bold text-sm sm:text-base text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Weak Against / Hard Counters (Threats to Avoid)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hero.weakAgainst.map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectOtherHero && onSelectOtherHero(m.heroId);
                      }}
                      className="group bg-dota-bg/90 hover:bg-slate-800 border border-red-800/50 hover:border-red-500 rounded-xl p-3.5 cursor-pointer transition-all shadow flex items-start gap-3"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${m.heroId}.png`}
                        alt={m.heroName}
                        className="w-10 h-10 rounded-lg object-cover border border-red-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-red-300 mb-1 flex items-center justify-between">
                          <span className="group-hover:text-red-200 transition-colors">{m.heroName}</span>
                          <span className="text-[10px] text-red-400 font-bold uppercase">Counters You</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {m.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Lane & Team Synergies */}
              <div className="bg-dota-panelAlt border border-cyan-600/40 rounded-2xl p-5 shadow">
                <h3 className="font-dota font-bold text-sm sm:text-base text-cyan-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Best Lane Partners & Team Synergies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hero.synergies.map((s, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectOtherHero && onSelectOtherHero(s.heroId);
                      }}
                      className="group bg-dota-bg/90 hover:bg-slate-800 border border-cyan-800/50 hover:border-cyan-500 rounded-xl p-3.5 cursor-pointer transition-all shadow flex items-start gap-3"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${s.heroId}.png`}
                        alt={s.heroName}
                        className="w-10 h-10 rounded-lg object-cover border border-cyan-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-cyan-300 mb-1">
                          {s.heroName}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {s.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enemy Counter Strategy & Items */}
              <div className="bg-dota-panelAlt border-2 border-dota-gold/50 rounded-2xl p-5 shadow-dota-glow">
                <h3 className="font-dota font-black text-sm sm:text-base text-dota-gold mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-dota-gold" />
                  Enemy Items That Counter You (Watch Out For)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hero.counterStrategy.keyCounterItems.map((c, idx) => (
                    <div key={idx} className="bg-dota-bg p-3.5 rounded-xl border border-dota-border shadow flex items-start gap-3">
                      <img
                        src={getItemImageUrl(c.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                        alt={c.name}
                        className="w-10 h-8 rounded object-contain border border-dota-gold/40 bg-slate-950 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-amber-200 mb-1">{c.name}</div>
                        <p className="text-[11px] text-slate-400 leading-snug font-sans">{c.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: STRATEGY & POWER SPIKES */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              
              {/* Playstyle Summary */}
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <h3 className="font-dota font-bold text-sm text-dota-gold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-dota-gold" />
                  Hero Playstyle & Core Mechanics
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {hero.playstyle}
                </p>
              </div>

              {/* Power Spikes Timeline */}
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <h3 className="font-dota font-bold text-sm text-amber-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Power Spikes Timeline
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-dota-bg border-l-4 border-l-amber-500 border-t border-r border-b border-dota-border shadow">
                    <span className="font-bold text-xs text-amber-300 uppercase tracking-wider">Early Game Spike:</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{hero.powerSpikes.early}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-dota-bg border-l-4 border-l-cyan-500 border-t border-r border-b border-dota-border shadow">
                    <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">Mid Game Spike:</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{hero.powerSpikes.mid}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-dota-bg border-l-4 border-l-purple-500 border-t border-r border-b border-dota-border shadow">
                    <span className="font-bold text-xs text-purple-300 uppercase tracking-wider">Late Game Spike:</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{hero.powerSpikes.late}</p>
                  </div>
                </div>
              </div>

              {/* Laning & Teamfighting Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                  <h4 className="font-dota font-bold text-xs sm:text-sm text-emerald-400 mb-2">
                    Laning Phase Tactics
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {hero.counterStrategy.laningAdvice}
                  </p>
                </div>

                <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                  <h4 className="font-dota font-bold text-xs sm:text-sm text-rose-400 mb-2">
                    Teamfighting & Objective Priorities
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {hero.counterStrategy.teamfightAdvice}
                  </p>
                </div>
              </div>

              {/* Weaknesses to Watch Out For */}
              <div className="bg-dota-panelAlt border border-red-900/40 rounded-2xl p-5 shadow">
                <h4 className="font-dota font-bold text-xs text-red-400 mb-2">
                  Hero Vulnerabilities:
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-sans">
                  {hero.counterStrategy.weaknessSummary.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {/* TAB 5: MY NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-dota-panelAlt border border-dota-border rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-dota font-bold text-sm text-purple-300">
                    Personal Matchup & Build Notes
                  </h3>
                  {noteSaved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3 font-sans">
                  Jot down your custom timings, specific enemy matchups, player notes, or experimental item builds. Saved locally in your browser.
                </p>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder={`Write your personal notes for ${hero.name}... (e.g. Always rush BKB before min 22 vs Lion, avoid picking into Slardar)`}
                  rows={8}
                  className="w-full bg-dota-bg border border-dota-border rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
