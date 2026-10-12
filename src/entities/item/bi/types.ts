export type ItemCategory = 
  | 'consumables'
  | 'attributes'
  | 'armaments'
  | 'arcane'
  | 'common'
  | 'support'
  | 'caster'
  | 'weapons'
  | 'armor'
  | 'artifacts'
  | 'secret_shop'
  | 'neutral_1'
  | 'neutral_2'
  | 'neutral_3'
  | 'neutral_4'
  | 'neutral_5';

export interface DotaItem {
  id: string;
  name: string;
  cost: number;
  category: ItemCategory;
  description: string;
  stats?: string[];
  active?: string;
  passive?: string;
  cooldown?: string;
  manaCost?: string;
  img?: string;
  countersTags?: string[]; // e.g. ['invis', 'magic', 'evasion', 'passive', 'heal', 'lockdown', 'dispel']
  countersAgainstHeroes?: string[]; // hero IDs this item directly counters
  tips?: string;
}
