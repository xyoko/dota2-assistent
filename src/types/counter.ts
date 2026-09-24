export interface ThreatCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  heroExamples: string[];
  counterItems: {
    name: string;
    cost: number;
    why: string;
  }[];
  tacticalAdvice: string[];
}

export interface DraftAnalysisResult {
  enemyHeroIds: string[];
  threatScores: {
    magicDamage: number; // 0-100
    physicalDamage: number;
    pureDamage: number;
    crowdControl: number;
    mobility: number;
    healingSustain: number;
    pushTower: number;
    illusionSummons: number;
  };
  keyWeaknesses: string[];
  mustHaveItems: {
    item: string;
    cost: number;
    targets: string[];
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    reason: string;
  }[];
  recommendedHeroes: {
    heroId: string;
    role: string;
    score: number;
    reasons: string[];
  }[];
}
