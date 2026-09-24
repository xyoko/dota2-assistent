import React, { useState, useMemo } from 'react';
import { 
  ITEMS_COUNTERED_BY_HEROES, 
  HEROES_COUNTERED_BY_ITEMS,
  ITEM_TO_ITEM_COUNTERS
} from '../data/heroItemInteractions';
import { HERO_MAP, HEROES_DATA, resolveHeroData } from '../data/heroes';
import { DOTA_ITEMS } from '../data/items';
import { HeroData } from '../types/hero';
import { SoundEngine } from '../services/soundFx';
import { getItemImageUrl } from './DotaUIComponents';
import { 
  ShieldAlert, 
  Sword, 
  Sparkles, 
  ArrowRightLeft, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Info,
  Search,
  Users
} from 'lucide-react';

interface HeroItemInteractionsProps {
  onSelectHero: (hero: HeroData) => void;
}

export const HeroItemInteractions: React.FC<HeroItemInteractionsProps> = ({ onSelectHero }) => {
  // Mode: select by hero or select by item
  const [selectionMode, setSelectionMode] = useState<'hero' | 'item'>('hero');
  
  // Selected IDs
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>('anti_mage');
  const [selectedItemId, setSelectedItemId] = useState<string | null>('bkb');
  
  // Real-time Search input
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Available Heroes List filtered by search
  const filteredHeroes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return HEROES_COUNTERED_BY_ITEMS;
    return HEROES_COUNTERED_BY_ITEMS.filter((h) => 
      h.heroName.toLowerCase().includes(q) ||
      h.coreVulnerability.toLowerCase().includes(q) ||
      h.counteredByItems.some((i) => i.itemName.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Available Items List filtered by search
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ITEMS_COUNTERED_BY_HEROES;
    return ITEMS_COUNTERED_BY_HEROES.filter((i) => 
      i.itemName.toLowerCase().includes(q) ||
      i.itemCategory.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.whyCounteredSummary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Chosen hero data
  const chosenHeroData = useMemo(() => {
    if (!selectedHeroId) return null;
    const heroInteraction = HEROES_COUNTERED_BY_ITEMS.find((h) => h.heroId === selectedHeroId);
    const heroFull = HERO_MAP.get(selectedHeroId) || HEROES_DATA.find((h) => h.id === selectedHeroId);
    
    // Items that this hero counters
    const itemsThisHeroCounters = ITEMS_COUNTERED_BY_HEROES.filter((item) =>
      item.counteredByHeroes.some((h) => h.heroId === selectedHeroId)
    ).map((item) => {
      const specificEntry = item.counteredByHeroes.find((h) => h.heroId === selectedHeroId)!;
      return {
        item,
        specificEntry
      };
    });

    // Heroes that hard-counter this hero (from full hero dataset)
    const heroesThatCounterThisHero = heroFull?.weakAgainst || [];

    return {
      heroInteraction,
      heroFull,
      itemsThisHeroCounters,
      heroesThatCounterThisHero
    };
  }, [selectedHeroId]);

  // Chosen item data
  const chosenItemData = useMemo(() => {
    if (!selectedItemId) return null;
    const itemInteraction = ITEMS_COUNTERED_BY_HEROES.find((i) => i.itemId === selectedItemId);
    const itemCatalog = DOTA_ITEMS[selectedItemId];

    // Heroes that this item counters
    const heroesThisItemCounters = HEROES_COUNTERED_BY_ITEMS.filter((hero) =>
      hero.counteredByItems.some((i) => 
        i.itemId === selectedItemId || 
        itemInteraction?.itemName.toLowerCase().includes(i.itemName.toLowerCase()) ||
        i.itemName.toLowerCase().includes(selectedItemId)
      )
    ).map((hero) => {
      const specificEntry = hero.counteredByItems.find((i) => 
        i.itemId === selectedItemId || 
        itemInteraction?.itemName.toLowerCase().includes(i.itemName.toLowerCase()) ||
        i.itemName.toLowerCase().includes(selectedItemId)
      )!;
      return {
        hero,
        specificEntry
      };
    });

    // Items that counter this item (Item vs Item counters)
    const itemsThatCounterThisItem = ITEM_TO_ITEM_COUNTERS[selectedItemId] || [];

    return {
      itemInteraction,
      itemCatalog,
      heroesThisItemCounters,
      itemsThatCounterThisItem
    };
  }, [selectedItemId]);

  const handleHeroSelect = (id: string) => {
    setSelectedHeroId(id);
    SoundEngine.playPick();
  };

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    SoundEngine.playPick();
  };

  return (
    <div className="space-y-6">
      
      {/* Sleek Minimal Dark Header */}
      <div className="bg-black/95 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <h2 className="font-dota font-black text-xl sm:text-2xl text-white tracking-wide">
                Hero ↔ Item Counter Interactions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
              Choose any hero or item to view exact counter mechanics: items that counter the hero, heroes that counter the hero, and items that counter items.
            </p>
          </div>

          {/* Mode Switcher: Hero vs Item */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-center">
            <button
              onClick={() => {
                setSelectionMode('hero');
                setSearchQuery('');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectionMode === 'hero'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              <span>Choose Hero</span>
            </button>

            <button
              onClick={() => {
                setSelectionMode('item');
                setSearchQuery('');
                SoundEngine.playHover();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectionMode === 'item'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Choose Item</span>
            </button>
          </div>
        </div>

        {/* Real-time Search Input & Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  selectionMode === 'hero'
                    ? "Search heroes (e.g. Anti-Mage, Axe, Storm, PA)..."
                    : "Search items (e.g. BKB, Linken's, Butterfly, Blade Mail)..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Clear Selection Button */}
            {((selectionMode === 'hero' && selectedHeroId) || (selectionMode === 'item' && selectedItemId)) && (
              <button
                onClick={() => {
                  if (selectionMode === 'hero') setSelectedHeroId(null);
                  else setSelectedItemId(null);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 self-end sm:self-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <span>Reset Selection</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Selector Pills / Avatars */}
          {selectionMode === 'hero' ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
              {filteredHeroes.map((h) => {
                const isSelected = selectedHeroId === h.heroId;
                return (
                  <button
                    key={h.heroId}
                    onClick={() => handleHeroSelect(h.heroId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-dota-glow font-bold scale-[1.02]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <img
                      src={h.heroAvatar}
                      alt={h.heroName}
                      className="w-6 h-6 rounded-md object-cover border border-slate-700"
                    />
                    <span className="text-xs whitespace-nowrap">{h.heroName}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
              {filteredItems.map((item) => {
                const isSelected = selectedItemId === item.itemId;
                return (
                  <button
                    key={item.itemId}
                    onClick={() => handleItemSelect(item.itemId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow font-bold scale-[1.02]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <img
                      src={getItemImageUrl(item.itemId)}
                      alt={item.itemName}
                      className="w-6 h-5 rounded object-contain border border-slate-700 bg-slate-950"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                      }}
                    />
                    <span className="text-xs whitespace-nowrap">{item.itemName}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* FOCUSED VIEW: CHOSEN HERO */}
      {selectionMode === 'hero' && chosenHeroData && (
        <div className="bg-black/95 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
          
          {/* Hero Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={chosenHeroData.heroInteraction?.heroAvatar || chosenHeroData.heroFull?.avatarUrl}
                alt={chosenHeroData.heroInteraction?.heroName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/60 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-dota font-black text-xl sm:text-2xl text-white">
                    {chosenHeroData.heroInteraction?.heroName}
                  </h3>
                  {chosenHeroData.heroFull && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700 uppercase">
                      {chosenHeroData.heroFull.attribute}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Core Vulnerability: <strong className="text-amber-300">{chosenHeroData.heroInteraction?.coreVulnerability}</strong>
                </p>
              </div>
            </div>

            {chosenHeroData.heroFull && (
              <button
                onClick={() => onSelectHero(chosenHeroData.heroFull!)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-dota-gold flex items-center gap-1.5 self-start sm:self-center transition-colors shadow"
              >
                <span>View Full Build Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Section 1: Items That Hard Counter This Hero */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h4 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
                1. Items That Counter {chosenHeroData.heroInteraction?.heroName} ({chosenHeroData.heroInteraction?.counteredByItems.length || 0})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chosenHeroData.heroInteraction?.counteredByItems.map((counter, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 space-y-2 transition-all shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getItemImageUrl(counter.itemId)}
                        alt={counter.itemName}
                        className="w-8 h-6 rounded object-contain border border-slate-700 bg-slate-950 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                        }}
                      />
                      <span className="font-dota font-bold text-sm text-white">
                        {counter.itemName}
                      </span>
                      {counter.cost > 0 && (
                        <span className="text-xs font-bold text-dota-gold font-mono">
                          {counter.cost}g
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                      {counter.mechanicTag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {counter.howItCounters}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Heroes That Hard Counter This Hero */}
          {chosenHeroData.heroesThatCounterThisHero.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h4 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
                  2. Heroes That Counter {chosenHeroData.heroInteraction?.heroName} ({chosenHeroData.heroesThatCounterThisHero.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chosenHeroData.heroesThatCounterThisHero.map((counterHero, idx) => {
                  const heroObj = resolveHeroData(counterHero.heroId, counterHero.heroName, counterHero.reason);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectHero(heroObj);
                      }}
                      className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/80 rounded-xl p-4 space-y-2.5 transition-all shadow hover:shadow-dota-glow hover:scale-[1.01] cursor-pointer select-none"
                      title={`Click to open ${counterHero.heroName}'s build and tactic info card`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={heroObj.avatarUrl}
                            alt={counterHero.heroName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 group-hover:border-amber-400 shadow-sm flex-shrink-0 transition-colors"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                            }}
                          />
                          <div>
                            <div className="font-dota font-bold text-sm text-amber-200 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                              <span>{counterHero.heroName}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-dota-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[10px] text-red-400 font-bold uppercase">
                              Direct Matchup Counter
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/40 text-[11px] font-bold text-dota-gold group-hover:bg-amber-500/20 group-hover:border-amber-400 transition-all flex items-center gap-1">
                          <span>Hero Info</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800/80">
                        {counterHero.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Items Ruined By This Hero (What enemies should NOT buy) */}
          {chosenHeroData.itemsThisHeroCounters.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
                  3. Items That {chosenHeroData.heroInteraction?.heroName} Counters (Do NOT build against this hero)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chosenHeroData.itemsThisHeroCounters.map(({ item, specificEntry }, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 space-y-2 transition-all shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getItemImageUrl(item.itemId)}
                          alt={item.itemName}
                          className="w-8 h-6 rounded object-contain border border-slate-700 bg-slate-950 flex-shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                          }}
                        />
                        <span className="font-dota font-bold text-sm text-emerald-300">
                          {item.itemName}
                        </span>
                        <span className="text-xs font-bold text-dota-gold font-mono">
                          {item.itemCost}g
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        {specificEntry.abilityOrMechanic}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {specificEntry.howItCounters}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* FOCUSED VIEW: CHOSEN ITEM */}
      {selectionMode === 'item' && chosenItemData && chosenItemData.itemInteraction && (
        <div className="bg-black/95 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
          
          {/* Item Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={getItemImageUrl(chosenItemData.itemInteraction.itemId)}
                alt={chosenItemData.itemInteraction.itemName}
                className="w-14 h-11 rounded-xl object-contain border-2 border-cyan-500/60 bg-slate-950 shadow-lg flex-shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                }}
              />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-dota font-black text-xl sm:text-2xl text-white">
                    {chosenItemData.itemInteraction.itemName}
                  </h3>
                  <span className="text-xs font-bold text-dota-gold font-mono bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800">
                    {chosenItemData.itemInteraction.itemCost}g
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {chosenItemData.itemInteraction.itemCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans leading-relaxed">
                  {chosenItemData.itemInteraction.description}
                </p>
              </div>
            </div>
          </div>

          {/* Core Item Vulnerability Summary */}
          <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                Why this item gets countered:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {chosenItemData.itemInteraction.whyCounteredSummary}
              </p>
            </div>
          </div>

          {/* Section 1: Items That Counter This Item (Item vs Item) */}
          {chosenItemData.itemsThatCounterThisItem.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
                  1. Items That Counter {chosenItemData.itemInteraction.itemName} (Item vs Item) ({chosenItemData.itemsThatCounterThisItem.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chosenItemData.itemsThatCounterThisItem.map((counterItem, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 space-y-2 transition-all shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getItemImageUrl(counterItem.itemId)}
                          alt={counterItem.itemName}
                          className="w-8 h-6 rounded object-contain border border-slate-700 bg-slate-950 flex-shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png';
                          }}
                        />
                        <span className="font-dota font-bold text-sm text-white">
                          {counterItem.itemName}
                        </span>
                        <span className="text-xs font-bold text-dota-gold font-mono">
                          {counterItem.cost}g
                        </span>
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                        {counterItem.mechanicTag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800/80">
                      {counterItem.howItCounters}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Heroes That Hard Counter This Item */}
          <div className="space-y-3 pt-2 border-t border-slate-850">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h4 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
                2. Heroes That Bypass / Ruin {chosenItemData.itemInteraction.itemName} ({chosenItemData.itemInteraction.counteredByHeroes.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chosenItemData.itemInteraction.counteredByHeroes.map((heroEntry, idx) => {
                const heroObj = resolveHeroData(heroEntry.heroId, heroEntry.heroName, heroEntry.howItCounters);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      SoundEngine.playPick();
                      onSelectHero(heroObj);
                    }}
                    className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-red-500/80 rounded-xl p-4 space-y-2.5 transition-all shadow hover:shadow-dota-crimson hover:scale-[1.01] cursor-pointer select-none"
                    title={`Click to inspect ${heroEntry.heroName}'s build and tactic card`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={heroObj.avatarUrl || heroEntry.heroAvatar}
                          alt={heroEntry.heroName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 group-hover:border-red-400 flex-shrink-0 transition-colors"
                        />
                        <div>
                          <div className="font-dota font-bold text-sm text-white group-hover:text-red-300 transition-colors flex items-center gap-1.5">
                            <span>{heroEntry.heroName}</span>
                            <ExternalLink className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-amber-400 font-semibold">
                            {heroEntry.abilityOrMechanic}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                          {heroEntry.severity.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                          Card ➔
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800">
                      {heroEntry.howItCounters}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Heroes Countered By This Item (When to buy this item) */}
          {chosenItemData.heroesThisItemCounters.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h4 className="font-dota font-bold text-sm text-slate-200 uppercase tracking-wider">
                  3. Heroes Countered By {chosenItemData.itemInteraction.itemName} (Purchase this item to shut them down)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chosenItemData.heroesThisItemCounters.map(({ hero, specificEntry }, idx) => {
                  const heroObj = resolveHeroData(hero.heroId, hero.heroName, specificEntry.howItCounters);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        SoundEngine.playPick();
                        onSelectHero(heroObj);
                      }}
                      className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/80 rounded-xl p-4 space-y-2.5 transition-all shadow hover:shadow-dota-glow hover:scale-[1.01] cursor-pointer select-none"
                      title={`Click to inspect ${hero.heroName}'s build and tactic card`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={heroObj.avatarUrl || hero.heroAvatar}
                            alt={hero.heroName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 group-hover:border-emerald-400 flex-shrink-0 transition-colors"
                          />
                          <div>
                            <div className="font-dota font-bold text-sm text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                              <span>{hero.heroName}</span>
                              <ExternalLink className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {hero.coreVulnerability}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            {specificEntry.mechanicTag}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                            Card ➔
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800">
                        {specificEntry.howItCounters}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* CLEAN EMPTY STATE (WHEN NOTHING SELECTED YET) */}
      {((selectionMode === 'hero' && !chosenHeroData) || (selectionMode === 'item' && !chosenItemData)) && (
        <div className="bg-black/95 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            {selectionMode === 'hero' ? <Sword className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <h3 className="font-dota font-bold text-base text-slate-300">
            {selectionMode === 'hero' ? 'Select Any Hero Above' : 'Select Any Item Above'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-sans leading-relaxed">
            {selectionMode === 'hero'
              ? 'Click or search a hero chip above to inspect items that counter them, heroes that counter them, and items they ruin.'
              : 'Click or search an item chip above to inspect items that counter it, heroes that bypass it, and who it shuts down.'}
          </p>
        </div>
      )}

    </div>
  );
};
