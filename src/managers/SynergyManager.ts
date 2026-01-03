import { UnitInstance, UNIT_CATALOG } from '../data/GameData';
import { Companion } from '../entities/Companion';

export class SynergyManager {
  public static calculateSynergies(units: UnitInstance[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    // We only count distinct DataIDs for synergies (standard Auto Chess rule)
    // Or, for this MVP, we can count total units. 
    // Let's stick to: If you have 2 "Novice Archers", it counts as 2 "Human" and 2 "Ranger".
    
    units.forEach(u => {
      const template = UNIT_CATALOG[u.dataId];
      template.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return counts;
  }

  public static applyBuffs(companions: Companion[], synergies: Record<string, number>) {
    // Example Buffs:
    // Warrior (2): +20% HP (Applied on spawn usually, but we can heal or shield)
    // Ranger (2): +20% Attack Speed
    // Human (2): +10% Damage

    companions.forEach(comp => {
      const tags = comp.unitData.dataId ? UNIT_CATALOG[comp.unitData.dataId].tags : [];
      
      // Simple logic: If unit has the tag, and the synergy count is met, apply buff
      // Note: In a real system, we'd have a config for thresholds (2/4/6).
      // Here we assume threshold is 2 for everything for MVP.

      if (tags.includes('Ranger') && synergies['Ranger'] >= 2) {
        // Decrease attack interval (increase speed)
        // Accessing private property via 'any' for MVP speed or add public setter
        (comp as any).attackInterval *= 0.8; 
      }

      if (tags.includes('Human') && synergies['Human'] >= 2) {
        (comp as any).damage *= 1.1;
      }
      
      // Warrior HP buff is tricky if already spawned, usually maxHP increases.
      // We will skip HP dynamic update for this MVP step.
    });
  }

  public static getActiveSynergyText(synergies: Record<string, number>): string[] {
    const lines: string[] = [];
    for (const [tag, count] of Object.entries(synergies)) {
        if (count >= 2) {
            lines.push(`${tag} (${count}): Active!`);
        } else {
            lines.push(`${tag} (${count}/2)`);
        }
    }
    return lines;
  }
}
