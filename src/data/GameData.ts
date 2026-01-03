export interface UnitData {
  id: string;
  name: string;
  tier: number; // 1, 2, 3 stars
  cost: number;
  stats: {
    hp: number;
    damage: number;
    attackSpeed: number; // attacks per second
    range: number;
    moveSpeed: number;
  };
  tags: string[]; // e.g. ['Warrior', 'Human']
}

export const UNIT_CATALOG: Record<string, UnitData> = {
  'warrior_basic': {
    id: 'warrior_basic',
    name: 'Novice Guard',
    tier: 1,
    cost: 10,
    stats: { hp: 100, damage: 10, attackSpeed: 1.0, range: 60, moveSpeed: 120 },
    tags: ['Human', 'Warrior']
  },
  'archer_basic': {
    id: 'archer_basic',
    name: 'Novice Archer',
    tier: 1,
    cost: 10,
    stats: { hp: 60, damage: 8, attackSpeed: 1.2, range: 200, moveSpeed: 110 },
    tags: ['Human', 'Ranger']
  },
  'mage_basic': {
    id: 'mage_basic',
    name: 'Apprentice Mage',
    tier: 1,
    cost: 12,
    stats: { hp: 50, damage: 20, attackSpeed: 0.6, range: 180, moveSpeed: 100 },
    tags: ['Human', 'Mage']
  }
};

export interface GameState {
  gold: number;
  wave: number;
  commanderHp: number;
  maxCommanderHp: number;
  // Units currently owned and active
  myUnits: UnitInstance[];
  // Units on bench (optional for MVP, but good for merging logic)
  benchUnits: UnitInstance[];
}

export interface UnitInstance {
  instanceId: string;
  dataId: string; // Refers to UNIT_CATALOG key
  starLevel: number; // 1, 2, 3
  currentHp: number;
}
