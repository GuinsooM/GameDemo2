import Phaser from 'phaser';
import { GameState, UNIT_CATALOG, UnitInstance } from '../data/GameData';

export class GameManager {
  private static instance: GameManager;
  public state: GameState;

  private constructor() {
    this.state = {
      gold: 30, // Starting gold for initial unit purchases
      wave: 1,
      commanderHp: 100,
      maxCommanderHp: 100,
      myUnits: [],
      benchUnits: []
    };
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public resetGame() {
    this.state = {
      gold: 30, // Starting gold for initial unit purchases
      wave: 1,
      commanderHp: 100,
      maxCommanderHp: 100,
      myUnits: [],
      benchUnits: []
    };
  }

  public addGold(amount: number) {
    this.state.gold += amount;
  }

  public spendGold(amount: number): boolean {
    if (this.state.gold >= amount) {
      this.state.gold -= amount;
      return true;
    }
    return false;
  }

  public addUnit(unitId: string): boolean {
    // Check if we can add (limit 5 active)
    if (this.state.myUnits.length >= 5) {
      console.log('Max units reached!');
      return false;
    }

    const template = UNIT_CATALOG[unitId];
    if (!template) return false;

    const newUnit: UnitInstance = {
      instanceId: Phaser.Math.RND.uuid(),
      dataId: unitId,
      starLevel: 1,
      currentHp: template.stats.hp
    };

    this.state.myUnits.push(newUnit);
    this.checkMerge(unitId);
    return true;
  }

  private checkMerge(unitId: string) {
    // Simple merge logic: Find 3 units of same ID and Star Level 1
    const sameUnits = this.state.myUnits.filter(
      (u: UnitInstance) => u.dataId === unitId && u.starLevel === 1
    );

    if (sameUnits.length >= 3) {
      // Remove 3
      const toRemove = sameUnits.slice(0, 3);
      this.state.myUnits = this.state.myUnits.filter((u: UnitInstance) => !toRemove.includes(u));

      // Add 1 star level 2
      const upgradedUnit: UnitInstance = {
        instanceId: Phaser.Math.RND.uuid(),
        dataId: unitId,
        starLevel: 2,
        currentHp: UNIT_CATALOG[unitId].stats.hp * 2 // Simple buff
      };
      this.state.myUnits.push(upgradedUnit);
      console.log('Unit Upgraded!');
    }
  }
}
