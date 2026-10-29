export type AttributeType = 'str' | 'agi' | 'int' | 'all';
export type AttackType = 'Melee' | 'Ranged';
export type RoleType = 'Carry' | 'Mid' | 'Offlane' | 'Soft Support' | 'Hard Support';
export type PositionNumber = 1 | 2 | 3 | 4 | 5;
export type HeroPositionSelection = PositionNumber | 'default';


export interface Ability {
  name: string;
  key: string; // Q, W, E, D, F, R
  description: string;
  manaCost?: string;
  cooldown?: string;
  img?: string;
  isUltimate?: boolean;
}

export interface TalentOption {
  level: 10 | 15 | 20 | 25;
  left: string;
  right: string;
  recommended: 'left' | 'right';
  reason?: string;
}

export interface ItemRecommendation {
  id: string;
  name: string;
  cost: number;
  reason?: string;
  situation?: string;
  category?: 'starting' | 'early' | 'core' | 'situational' | 'late' | 'neutral';
  tier?: number; // for neutral items 1-5
}

export interface MatchupEntry {
  heroId: string;
  heroName: string;
  reason: string;
  rating?: number; // 1-5 counter intensity
  tags?: string[];
}

export interface HeroData {
  id: string;
  name: string;
  aliases: string[];
  title: string;
  attribute: AttributeType;
  attackType: AttackType;
  roles: RoleType[];
  complexity: 1 | 2 | 3;
  winRate: number;
  pickRate: number;
  avatarUrl: string;
  bannerUrl?: string;
  summary: string;
  playstyle: string;
  
  // Power spikes and timings
  powerSpikes: {
    early: string;
    mid: string;
    late: string;
  };

  // Item Progression
  build: {
    starting: ItemRecommendation[];
    early: ItemRecommendation[];
    core: ItemRecommendation[];
    situational: {
      category: string; // e.g. "vs Heavy Magic", "vs Evasion / High Armor", "vs Elusive / Blinking", "vs High Regen / Heal", "vs Passives"
      items: ItemRecommendation[];
    }[];
    late: ItemRecommendation[];
    neutrals: {
      tier: number;
      items: string[];
    }[];
  };

  // Skill build & talents
  skillOrder: {
    maxPriority: string[];
    levelGuide: string[];
  };
  abilities: Ability[];
  talents: TalentOption[];

  // Counters & Synergies
  strongAgainst: MatchupEntry[];
  weakAgainst: MatchupEntry[];
  synergies: MatchupEntry[];
  
  // How to counter this hero (tactics & key items)
  counterStrategy: {
    keyCounterItems: {
      name: string;
      reason: string;
    }[];
    laningAdvice: string;
    teamfightAdvice: string;
    weaknessSummary: string[];
  };
}
