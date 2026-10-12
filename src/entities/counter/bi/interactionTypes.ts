export interface ItemCounteredByHero {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemCost: number;
  itemImage?: string;
  description: string;
  whyCounteredSummary: string;
  counteredByHeroes: {
    heroId: string;
    heroName: string;
    heroAvatar?: string;
    abilityOrMechanic: string;
    howItCounters: string;
    severity: 'HARD_COUNTER' | 'SOFT_COUNTER';
  }[];
}

export interface HeroCounteredByItem {
  heroId: string;
  heroName: string;
  heroAvatar?: string;
  attribute: string;
  primaryRole: string;
  coreVulnerability: string;
  counteredByItems: {
    itemId: string;
    itemName: string;
    cost: number;
    mechanicTag: string; // e.g. "Break", "True Strike", "Disarm", "Dispel", "Anti-Heal", "Spellblock"
    howItCounters: string;
    priority: 'MUST_BUY' | 'HIGH_VALUE' | 'SITUATIONAL';
  }[];
}

export interface ItemToItemCounterEntry {
  itemId: string;
  counterItems: {
    itemId: string;
    itemName: string;
    cost: number;
    mechanicTag: string;
    howItCounters: string;
  }[];
}
