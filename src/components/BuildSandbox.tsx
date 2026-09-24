import React, { useState, useMemo } from 'react';
import { HEROES_DATA, HERO_MAP } from '../data/heroes';
import { DOTA_ITEMS } from '../data/items';
import { DotaItem } from '../types/item';
import { HeroData } from '../types/hero';
import { SoundEngine } from '../services/soundFx';
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
      <div className="bg-gradient-to-r from-amber-950/80 via-dota-panel to-slate-900 border border-dota-gold/50 rounded-2xl p-5 sm:p-6 shadow-dota-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-dota-gold" />
              <h2 className="font-dota font-black text-xl sm:text-2xl text-white">
                The Secret Shop & Build Sandbox
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Experiment with 6-slot item loadouts for any hero. Click empty slot boxes with <span className="text-dota-gold font-bold">+</span> to search and equip items intuitively.
            </p>
          </div>

          {/* Hero Switcher */}
          <div className="flex items-center gap-3 bg-dota-bg/90 p-2 rounded-xl border border-dota-border">
            <img
              src={hero.avatarUrl}
              alt={hero.name}
              className="w-10 h-10 rounded-lg object-cover border border-dota-gold/50"
            />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Active Hero:</span>
              <select
                value={selectedHeroId}
                onChange={(e) => {
                  setSelectedHeroId(e.target.value);
                  SoundEngine.playPick();
                }}
                className="bg-transparent text-xs sm:text-sm font-dota font-bold text-white focus:outline-none cursor-pointer block"
              >
                {HEROES_DATA.map((h) => (
                  <option key={h.id} value={h.id} className="bg-slate-900">
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
          <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-dota-border pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-dota font-black text-base text-white">
                  Equipped Inventory Loadout
                </h3>
                <span className="text-xs font-bold text-dota-gold bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-700/60 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  {totalGold.toLocaleString()} Net Worth
                </span>
              </div>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Slots</span>
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
                  className={`group relative h-28 rounded-xl border flex flex-col items-center justify-between p-2 text-center transition-all cursor-pointer select-none ${
                    item
                      ? 'bg-dota-bg/90 border-dota-gold/50 shadow-dota-glow hover:border-red-500'
                      : 'bg-dota-bg/40 border-dashed border-slate-700 hover:border-dota-gold hover:bg-amber-500/10 hover:shadow-dota-glow'
                  }`}
                  title={item ? `${item.name} - Click to remove` : `Slot ${idx + 1} - Click to search and add item`}
                >
                  <span className="text-[9px] text-slate-500 font-bold uppercase self-start">
                    Slot {idx + 1}
                  </span>

                  {item ? (
                    <>
                      <img
                        src={item.img || 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png'}
                        alt={item.name}
                        className="w-12 h-9 rounded object-contain border border-dota-gold/40 shadow group-hover:scale-105 transition-transform"
                      />
                      <div className="w-full">
                        <span className="font-bold text-[11px] text-amber-200 truncate block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-dota-gold font-semibold">
                          {item.cost}g
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-red-950/85 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-red-300 font-bold text-xs">
                        Click to Remove
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-auto text-slate-400 group-hover:text-dota-gold transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-800/80 group-hover:bg-amber-500/20 border border-slate-700 group-hover:border-dota-gold flex items-center justify-center mb-1 transition-all group-hover:scale-110 shadow">
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-dota-gold" />
                      </div>
                      <span className="text-[10px] font-bold">Add Item</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Calculated Stat Modifiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-dota-bg/80 border border-dota-border rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-950 text-red-400">
                  <Sword className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Bonus Damage</div>
                  <div className="font-bold text-sm text-red-300">+{bonusDamage} DMG</div>
                </div>
              </div>

              <div className="bg-dota-bg/80 border border-dota-border rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-950 text-green-400">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Bonus Health</div>
                  <div className="font-bold text-sm text-green-300">+{bonusHP} HP</div>
                </div>
              </div>

              <div className="bg-dota-bg/80 border border-dota-border rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-950 text-blue-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Bonus Mana</div>
                  <div className="font-bold text-sm text-blue-300">+{bonusMana} MP</div>
                </div>
              </div>

              <div className="bg-dota-bg/80 border border-dota-border rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Bonus Armor</div>
                  <div className="font-bold text-sm text-slate-200">+{bonusArmor.toFixed(1)} Armor</div>
                </div>
              </div>
            </div>

          </div>

          {/* ACTIVE COUNTER CAPABILITIES GENERATED BY THIS LOADOUT */}
          <div className="bg-dota-panel border border-dota-gold/40 rounded-2xl p-5 shadow-dota-glow space-y-4">
            <h3 className="font-dota font-black text-base text-dota-gold flex items-center gap-2 border-b border-dota-gold/30 pb-2.5">
              <ShieldCheck className="w-5 h-5 text-dota-gold" />
              Active Tactical Counters in this Build ({counterBadges.length})
            </h3>

            {counterBadges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {counterBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-dota-bg/90 border border-dota-border rounded-xl p-3 space-y-1 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-200">{badge.label}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">
                        {badge.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug font-sans">
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
        <div className="bg-dota-panel border border-dota-border rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-dota-border pb-3">
            <h3 className="font-dota font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dota-gold" />
              Shop Catalog
            </h3>
            <span className="text-[11px] text-slate-400">Click item to equip</span>
          </div>

          {/* Search in Catalog */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search item catalog..."
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-dota-bg border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-dota-gold"
            />
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredShopItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleEquipItem(item)}
                className="group bg-dota-bg/80 hover:bg-slate-800 border border-dota-border hover:border-dota-gold/60 rounded-xl p-2.5 text-left transition-all flex items-center gap-2.5 shadow"
              >
                <img
                  src={item.img || 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png'}
                  alt={item.name}
                  className="w-9 h-7 rounded object-contain border border-slate-700 group-hover:border-dota-gold flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-200 group-hover:text-amber-300 truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-semibold text-dota-gold">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dota-panel border-2 border-dota-gold/60 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-dota-border bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-dota-gold/20 border border-dota-gold/60 flex items-center justify-center text-dota-gold font-bold text-xs">
                  {activeSlotTarget + 1}
                </div>
                <h3 className="font-dota font-bold text-sm sm:text-base text-white">
                  Equip Item into Slot {activeSlotTarget + 1}
                </h3>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-800 bg-dota-bg/80 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dota-gold" />
                <input
                  type="text"
                  placeholder="Search item (e.g. BKB, Daedalus, Heart, Blink)..."
                  value={slotPickerSearch}
                  autoFocus
                  onChange={(e) => setSlotPickerSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-slate-900 border border-slate-700 focus:border-dota-gold rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                />
                {slotPickerSearch && (
                  <button
                    onClick={() => setSlotPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      slotPickerCategory === cat
                        ? 'bg-dota-gold text-slate-950 font-black shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
                    className="group bg-dota-bg/90 hover:bg-slate-800 border border-slate-800 hover:border-dota-gold/70 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01] shadow"
                  >
                    <img
                      src={item.img || 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png'}
                      alt={item.name}
                      className="w-11 h-9 rounded object-contain border border-slate-700 group-hover:border-dota-gold flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-amber-300 truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-dota-gold">{item.cost}g</span>
                        <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-dota-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      Equip ➔
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-xs text-slate-500">
                  No items match your search.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Clicking an item equips it directly into Slot {activeSlotTarget + 1}.</span>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
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
