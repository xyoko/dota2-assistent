import { RoleType, AttributeType } from '../../hero/bi/types';

export type MetaTier = 'S+' | 'S' | 'A' | 'B';

export interface TimingSpike {
  timing: string; // e.g. "12-14 min", "20-22 min"
  item: string; // e.g. "Maelstrom + Dragon Lance", "Gleipnir"
  impact: string;
}

export interface FacetSynergy {
  facetName: string;
  description: string;
  metaImpact: string;
}

export interface InnateFactor {
  innateName: string;
  description: string;
}

export interface HeroMetaProfile {
  heroId: string;
  name: string;
  title: string;
  attribute: AttributeType;
  roles: RoleType[];
  primaryRole: RoleType;
  avatarUrl: string;
  tier: MetaTier;
  winRate: number;
  pickRate: number;
  banRate: number;
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
  
  // Tactical reasoning of why this hero is meta this season
  whyMeta: {
    headline: string;
    coreReasons: string[];
    facetSynergy: FacetSynergy;
    innateFactor: InnateFactor;
    timingSpikes: TimingSpike[];
    bestWith: string[];
    counteredBy: string[];
    proTip: string;
  };
}

export interface MetaTheme {
  title: string;
  badge: string;
  description: string;
  keyHeroes: string[];
  tacticalAdvice: string;
}

export interface MetaSeasonData {
  seasonTitle: string;
  patchVersion: string;
  lastUpdated: string;
  metaSummary: string;
  themes: MetaTheme[];
  heroes: HeroMetaProfile[];
}
