import React, { useState, useMemo } from 'react';
import { HEROES_DATA, HERO_MAP } from '../../../entities/hero/bi/heroes';
import { DOTA_ITEMS } from '../../../entities/item/bi/items';
import { DotaItem } from '../../../entities/item/bi/types';
import { HeroData } from '../../../entities/hero/bi/types';
import { SoundEngine } from '../../../shared/bi/sound/soundFx';
import { 
  FlaskConical, 
  Coins, 
  Trash2, 
  Sword, 
  Heart, 
  Zap, 
  Shield, 
  ShieldCheck, 
  Sparkles,
  Plus,
  Search,
  X
} from 'lucide-react';

interface BuildSandboxProps {
  onSelectHero: (hero: HeroData) => void;
}

export const BuildSandbox: React.FC<BuildSandboxProps> = () => {
  const [selectedHeroId, setSelectedHeroId] = useState<string>('anti_mage');
  const [equippedSlots, setEquippedSlots] = useState<(DotaItem | null)[]>([
    DOTA_ITEMS.power_treads || null,
    DOTA_ITEMS.battle_fury || null,
    DOTA_ITEMS.manta || null,
    null,
    null,
    null
  ]);

  // Search in shop catalog
  const [shopSearch, setShopSearch] = useState<string>('');
  
  // Modal for clicking slot box with '+'
  const [activeSlotTarget, setActiveSlotTarget] = useState<number | null>(null);
  const [slotPickerSearch, setSlotPickerSearch] = useState<string>('');
  const [slotPickerCategory, setSlotPickerCategory] = useState<string>('all');

  const hero = HERO_MAP.get(selectedHeroId) || HEROES_DATA[0];

  // Calculate stats from equipped items
  const totalGold = equippedSlots.reduce((sum, item) => sum + (item ? item.cost : 0), 0);
  
  let bonusDamage = 0;
  let bonusHP = 0;
  let bonusMana = 0;
  let bonusArmor = 0;
  const activeEffects: string[] = [];
  const counterBadges: { tag: string; label: string; desc: string }[] = [];

  equippedSlots.forEach((item) => {
    if (!item) return;

    if (item.id === 'battle_fury') { bonusDamage += 65; activeEffects.push('Cleaves 70% damage'); }
    if (item.id === 'power_treads') { bonusDamage += 10; bonusHP += 200; }
    if (item.id === 'manta') { bonusDamage += 26; bonusArmor += 4.5; activeEffects.push('Summons 2 Illusions + Dispel'); }
    if (item.id === 'bkb') { bonusDamage += 24; bonusHP += 220; counterBadges.push({ tag: 'Debuff Immunity', label: 'Magic & Stun Immunity', desc: 'Active Avatar prevents magic lockdown' }); }
    if (item.id === 'mkb') { bonusDamage += 40; counterBadges.push({ tag: 'True Strike', label: '80% Pierce Evasion', desc: 'Counters PA / Windranger / Butterfly' }); }
    if (item.id === 'silver_edge') { bonusDamage += 52; counterBadges.push({ tag: 'Break', label: '5s Break Passives', desc: 'Disables Bristleback / PA passives' }); }
    if (item.id === 'nullifier') { bonusDamage += 75; bonusArmor += 10; counterBadges.push({ tag: 'Continuous Dispel', label: 'Dispels Ghost / Force', desc: 'Nullifies support defensive items' }); }
    if (item.id === 'abyssal') { bonusDamage += 30; bonusHP += 250; counterBadges.push({ tag: 'BKB Pierce Stun', label: '2.0s Overwhelm', desc: 'Instant melee stun through BKB' }); }
    if (item.id === 'linkens') { bonusHP += 350; bonusMana += 250; counterBadges.push({ tag: 'Spellblock', label: 'Blocks Target Spell', desc: 'Blocks Duel / Doom / Primal Roar' }); }
    if (item.id === 'blade_mail') { bonusDamage += 20; bonusArmor += 7; counterBadges.push({ tag: 'Damage Return', label: '85% Damage Return', desc: 'Punishes Windranger Focus Fire / PA crits' }); }
    if (item.id === 'heart') { bonusHP += 770 + 770; bonusDamage += 35; }
    if (item.id === 'skadi') { bonusHP += 484; bonusMana += 264; bonusArmor += 3; counterBadges.push({ tag: 'Skadi Anti-Heal', label: '-40% Heal & 50% Slow', desc: 'Pierces BKB' }); }
    if (item.id === 'butterfly') { bonusDamage += 25 + 35; bonusArmor += 5.8; counterBadges.push({ tag: 'Evasion', label: '35% Evasion', desc: 'Forces enemies to buy MKB' }); }
    if (item.id === 'daedalus') { bonusDamage += 88; counterBadges.push({ tag: 'Crit', label: '225% Critical Strike', desc: 'Massive Physical Burst' }); }
    if (item.id === 'satanic') { bonusHP += 550; bonusDamage += 63; activeEffects.push('+175% Unholy Lifesteal & Basic Dispel'); }
  });

  const allItemsList = Object.values(DOTA_ITEMS);

  // Filtered items in right shop catalog
  const filteredShopItems = useMemo(() => {
    if (!shopSearch.trim()) return allItemsList;
    const q = shopSearch.toLowerCase().trim();
    return allItemsList.filter((item) => 
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  }, [shopSearch, allItemsList]);

  // Filtered items in slot modal search
  const filteredModalItems = useMemo(() => {
    return allItemsList.filter((item) => {
      if (slotPickerCategory !== 'all' && item.category !== slotPickerCategory) {
        return false;
      }
      if (slotPickerSearch.trim()) {
        const q = slotPickerSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }
      return true;
    });
  }, [slotPickerSearch, slotPickerCategory, allItemsList]);

  const handleEquipItem = (item: DotaItem) => {
    const emptyIndex = equippedSlots.findIndex((s) => s === null);
    if (emptyIndex !== -1) {
      const next = [...equippedSlots];
      next[emptyIndex] = item;
      setEquippedSlots(next);
      SoundEngine.playGold();
    }
  };

  const handleEquipToSpecificSlot = (item: DotaItem, slotIndex: number) => {
    const next = [...equippedSlots];
    next[slotIndex] = item;
    setEquippedSlots(next);
    SoundEngine.playGold();
    setActiveSlotTarget(null);
    setSlotPickerSearch('');
  };

  const handleUnequipItem = (index: number) => {
    const next = [...equippedSlots];
    next[index] = null;
    setEquippedSlots(next);
    SoundEngine.playHover();
  };

  const handleClearAll = () => {
    setEquippedSlots([null, null, null, null, null, null]);
    SoundEngine.playHover();
  };

  const handleOpenSlotModal = (slotIndex: number) => {
    setActiveSlotTarget(slotIndex);
    setSlotPickerSearch('');
    setSlotPickerCategory('all');
    SoundEngine.playHover();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-hud-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-hud-surface border border-white/[0.08] flex items-center justify-center text-hud-cyan shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-tight">
                Secret Shop & Build Sandbox
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
              Experiment with 6-slot item loadouts for any hero. Click empty slot boxes with <span className="text-hud-cyan font-mono font-bold">+</span> to search and equip items.
            </p>
          </div>

          {/* Hero Switcher */}
          <div className="flex items-center gap-3 bg-hud-surface p-2 rounded-lg border border-white/[0.08]">
            <img
              src={hero.avatarUrl}
              alt={hero.name}
              className="w-10 h-10 rounded-lg object-cover border border-white/[0.1]"
            />
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Active Hero:</span>
              <select
                value={selectedHeroId}
                aria-label="Select active hero for build sandbox"
                onChange={(e) => {
                  setSelectedHeroId(e.target.value);
                  SoundEngine.playPick();
                }}
                className="bg-transparent text-xs sm:text-sm font-display font-semibold text-slate-200 focus:outline-none cursor-pointer block"
              >
                {HEROES_DATA.map((h) => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-slate-200">
                    {h.name} ({h.roles[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: 6-Slot Inventory + Calculated Stats + Counter Badges */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* INVENTORY SLOTS PANEL */}
          <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-sm sm:text-base text-slate-100">
                  Equipped Inventory Loadout
                </h3>
                <span className="text-xs font-mono tabular-nums text-hud-gold bg-hud-surface px-2.5 py-0.5 rounded border border-white/[0.08] flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  {totalGold.toLocaleString()}g NET WORTH
                </span>
              </div>

              <button
                onClick={handleClearAll}
                className="min-h-[44px] sm:min-h-0 touch-target flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 font-mono uppercase tracking-wider transition-colors focus-hud"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            {/* 6 Grid Inventory Slots with OnClick Add Action */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {equippedSlots.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item) {
                      handleUnequipItem(idx);
                    } else {
                      handleOpenSlotModal(idx);
                    }
                  }}
                  className={`group relative h-28 rounded-xl border flex flex-col items-center justify-between p-2 text-center transition-colors cursor-pointer select-none focus-hud ${
                    item
                      ? 'bg-hud-surface border-white/[0.12] hover:border-red-500/60 shadow-hud-sm'
                      : 'bg-hud-bg/60 border-dashed border-white/[0.12] hover:border-hud-cyan/60 hover:bg-hud-surface'
                  }`}
                  title={item ? `${item.name} - Click to remove` : `Slot ${idx + 1} - Click to search and add item`}
                >
                  <span className="text-[10px] text-slate-400 font-mono uppercase self-start">
                    Slot {idx + 1}
                  </span>

                  {item ? (
                    <>
                      <img
                        src={item.img || 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png'}
                        alt={item.name}
                        className="w-12 h-9 rounded object-contain border border-white/[0.1] shadow-sm"
                      />
                      <div className="w-full">
                        <span className="font-display font-medium text-[11px] text-slate-200 truncate block">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums text-hud-gold">
                          {item.cost}g
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-red-950/90 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-red-300 font-mono text-[10px] uppercase">
                        REMOVE
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-auto text-slate-400 group-hover:text-hud-cyan transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-hud-surface group-hover:bg-hud-cyan/15 border border-white/[0.08] group-hover:border-hud-cyan/40 flex items-center justify-center mb-1 transition-colors">
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-hud-cyan" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider">ADD ITEM</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Calculated Stat Modifiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-hud-surface border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-500/30">
                  <Sword className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Bonus Damage</div>
                  <div className="font-mono tabular-nums font-bold text-sm text-red-400">+{bonusDamage} DMG</div>
                </div>
              </div>

              <div className="bg-hud-surface border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Bonus Health</div>
                  <div className="font-mono tabular-nums font-bold text-sm text-emerald-400">+{bonusHP} HP</div>
                </div>
              </div>

              <div className="bg-hud-surface border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-950/60 text-sky-400 border border-sky-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Bonus Mana</div>
                  <div className="font-mono tabular-nums font-bold text-sm text-sky-400">+{bonusMana} MP</div>
                </div>
              </div>

              <div className="bg-hud-surface border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Bonus Armor</div>
                  <div className="font-mono tabular-nums font-bold text-sm text-slate-200">+{bonusArmor.toFixed(1)} Armor</div>
                </div>
              </div>
            </div>

          </div>

          {/* ACTIVE COUNTER CAPABILITIES GENERATED BY THIS LOADOUT */}
          <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-sm space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
              <ShieldCheck className="w-4 h-4 text-hud-cyan" />
              Active Tactical Counters in this Build ({counterBadges.length})
            </h3>

            {counterBadges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {counterBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-hud-surface border border-white/[0.06] rounded-lg p-3 space-y-1 shadow-hud-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-medium text-xs text-slate-200">{badge.label}</span>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        {badge.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug font-sans">
                      {badge.desc}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-sans">
                Equip counter items (like MKB, Silver Edge, BKB, Vessel, Scythe, Halberd) from the shop on the right to see their counter capabilities.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Secret Shop Item Catalog */}
        <div className="bg-hud-panel border border-white/[0.08] rounded-xl p-5 shadow-hud-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hud-gold" />
              Shop Catalog
            </h3>
            <span className="text-[11px] font-mono text-slate-400 uppercase">CLICK TO EQUIP</span>
          </div>

          {/* Search in Catalog */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search item catalog..."
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 min-h-[44px] bg-hud-bg border border-white/[0.1] rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-hud-cyan focus-hud transition-colors"
            />
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredShopItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleEquipItem(item)}
                className="group bg-hud-surface hover:bg-white/[0.06] border border-white/[0.08] hover:border-hud-cyan/40 rounded-lg p-2.5 text-left transition-colors flex items-center gap-2.5 shadow-hud-sm min-h-[44px] touch-target focus-hud"
              >
                <img
                  src={item.img || 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png'}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-9 h-7 rounded object-contain border border-white/[0.1] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-display font-medium text-xs text-slate-200 group-hover:text-hud-cyan transition-colors truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono tabular-nums font-bold text-hud-gold">
                    {item.cost}g
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ON-CLICK SEARCH MODAL FOR EMPTY SLOT BOX WITH '+' */}
      {activeSlotTarget !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-hud-panel border border-white/[0.12] rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-hud-lg overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-hud-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-hud-bg border border-white/[0.08] flex items-center justify-center font-mono font-bold text-xs text-hud-gold">
                  {activeSlotTarget + 1}
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base text-slate-100 uppercase tracking-tight">
                  Equip Item into Slot {activeSlotTarget + 1}
                </h3>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors focus-hud"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-white/[0.06] bg-hud-bg space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search item (e.g. BKB, Daedalus, Heart, Blink)..."
                  value={slotPickerSearch}
                  autoFocus
                  onChange={(e) => setSlotPickerSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 min-h-[44px] bg-hud-surface border border-white/[0.1] focus:border-hud-cyan rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-colors focus-hud"
                />
                {slotPickerSearch && (
                  <button
                    onClick={() => setSlotPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'weapons', 'armor', 'artifacts', 'support'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSlotPickerCategory(cat)}
                    className={`min-h-[44px] sm:min-h-0 touch-target px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors focus-hud ${
                      slotPickerCategory === cat
                        ? 'bg-hud-cyan text-slate-950 font-bold shadow-hud-sm'
                        : 'bg-hud-surface text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                    }`}
                  >
                    {cat === 'all' ? 'All Items' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Items Grid */}
            <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredModalItems.length > 0 ? (
                filteredModalItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleEquipToSpecificSlot(item, activeSlotTarget)}
                    className="group bg-hud-surface hover:bg-white/[0.06] border border-white/[0.08] hover:border-hud-cyan/40 rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors shadow-hud-sm min-h-[44px] touch-target focus-hud"
                  >
                    <img
                      src={item.img || 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png'}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-11 h-9 rounded object-contain border border-white/[0.1] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-medium text-xs sm:text-sm text-slate-200 group-hover:text-hud-cyan transition-colors truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono tabular-nums font-bold text-hud-gold">{item.cost}g</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{item.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-hud-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                      EQUIP ➔
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-xs text-slate-400 font-mono">
                  NO ITEMS MATCH YOUR SEARCH.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-hud-surface border-t border-white/[0.06] flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Equip directly into Slot {activeSlotTarget + 1}</span>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="min-h-[44px] sm:min-h-0 touch-target px-3 py-1.5 rounded-lg bg-hud-bg hover:bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono uppercase text-xs focus-hud"
              >
                CANCEL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
