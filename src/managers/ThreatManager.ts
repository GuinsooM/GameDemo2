import Phaser from 'phaser';

export interface ThreatTarget {
    id: string;
    entity: Phaser.Physics.Arcade.Sprite;
    threat: number;
    isCommander: boolean;
}

export class ThreatManager {
    private static instance: ThreatManager;
    private targets: Map<string, ThreatTarget> = new Map();

    // Commander always has base high threat
    private readonly COMMANDER_BASE_THREAT = 1000;
    private readonly COMPANION_BASE_THREAT = 10;
    private readonly THREAT_PER_DAMAGE = 1;
    private readonly THREAT_DECAY_RATE = 2; // per second

    private constructor() { }

    public static getInstance(): ThreatManager {
        if (!ThreatManager.instance) {
            ThreatManager.instance = new ThreatManager();
        }
        return ThreatManager.instance;
    }

    public reset() {
        this.targets.clear();
    }

    public registerCommander(id: string, entity: Phaser.Physics.Arcade.Sprite) {
        this.targets.set(id, {
            id,
            entity,
            threat: this.COMMANDER_BASE_THREAT,
            isCommander: true
        });
    }

    public registerCompanion(id: string, entity: Phaser.Physics.Arcade.Sprite) {
        this.targets.set(id, {
            id,
            entity,
            threat: this.COMPANION_BASE_THREAT,
            isCommander: false
        });
    }

    public unregister(id: string) {
        this.targets.delete(id);
    }

    // Add threat when a companion deals damage
    public addThreat(id: string, amount: number) {
        const target = this.targets.get(id);
        if (target && !target.isCommander) {
            target.threat += amount * this.THREAT_PER_DAMAGE;
        }
    }

    // Decay companion threat over time (commander threat never decays)
    public update(delta: number) {
        const decayAmount = this.THREAT_DECAY_RATE * (delta / 1000);

        this.targets.forEach(target => {
            if (!target.isCommander && target.threat > this.COMPANION_BASE_THREAT) {
                target.threat = Math.max(this.COMPANION_BASE_THREAT, target.threat - decayAmount);
            }
        });
    }

    // Get the highest threat target for an enemy at given position
    public getHighestThreatTarget(
        enemyX: number,
        enemyY: number,
        aggroRange: number = Infinity
    ): ThreatTarget | null {
        let highestThreat: ThreatTarget | null = null;
        let highestThreatValue = -1;

        this.targets.forEach(target => {
            if (!target.entity.active) return;

            const dist = Phaser.Math.Distance.Between(
                enemyX, enemyY,
                target.entity.x, target.entity.y
            );

            // Calculate effective threat based on distance
            // Closer targets get a bonus, commander always has priority at equal distance
            const distanceBonus = Math.max(0, (aggroRange - dist) / aggroRange) * 50;
            const effectiveThreat = target.threat + distanceBonus + (target.isCommander ? 100 : 0);

            if (effectiveThreat > highestThreatValue) {
                highestThreatValue = effectiveThreat;
                highestThreat = target;
            }
        });

        return highestThreat;
    }

    // Get commander position (enemies should always move toward commander area)
    public getCommanderPosition(): { x: number, y: number } | null {
        for (const target of this.targets.values()) {
            if (target.isCommander && target.entity.active) {
                return { x: target.entity.x, y: target.entity.y };
            }
        }
        return null;
    }

    // Get all active threat targets
    public getAllTargets(): ThreatTarget[] {
        return Array.from(this.targets.values()).filter(t => t.entity.active);
    }
}
