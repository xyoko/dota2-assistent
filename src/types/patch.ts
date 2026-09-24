import { RoleType } from './hero';

export type PatchChangeType = 'buff' | 'nerf' | 'fix' | 'rework';
export type PatchCategory = 'ability' | 'facet' | 'innate' | 'stats' | 'talents' | 'general';

export interface HeroPatchChange {
  heroId: string;
  heroName: string;
  avatarUrl: string;
  primaryRole: RoleType;
  changeType: PatchChangeType;
  category: PatchCategory;
  targetName: string;
  summary: string;
  details: string[];
  bugfixContext?: string;
  metaImpact: string;
  verdict: string;
}

export interface SystemPatchChange {
  category: string;
  title: string;
  changes: string[];
  impact: string;
}

export interface PatchNoteData {
  version: string;
  isLatest?: boolean;
  releaseDate: string;
  title: string;
  overview: string;
  highlights: string[];
  systemChanges: SystemPatchChange[];
  heroChanges: HeroPatchChange[];
}
