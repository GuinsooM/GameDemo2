import Phaser from 'phaser';
import { Commander } from '../entities/Commander';
import { Companion } from '../entities/Companion';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { GameManager } from '../managers/GameManager';
import { SynergyManager } from '../managers/SynergyManager';
import { ThreatManager } from '../managers/ThreatManager';

import { UnitInstance } from '../data/GameData';

export class GameArenaScene extends Phaser.Scene {
    private commander!: Commander;
    private companions!: Phaser.GameObjects.Group;
    private enemies!: Phaser.GameObjects.Group;
    private projectiles!: Phaser.GameObjects.Group;

    // Wave Logic
    private waveTimer: number = 30; // 30 seconds per wave
    private spawnTimer!: Phaser.Time.TimerEvent;
    private remainingTimeText!: Phaser.GameObjects.Text;
    private goldText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameArenaScene');
    }

    create() {
        const { width, height } = this.scale;
        const gm = GameManager.getInstance();
        const threatMgr = ThreatManager.getInstance();

        // Reset threat system for new game
        threatMgr.reset();

        // 1. Setup World
        this.physics.world.setBounds(0, 0, width, height);

        // 2. Setup Groups
        this.enemies = this.add.group({ runChildUpdate: true });
        this.projectiles = this.add.group({ runChildUpdate: true });
        this.companions = this.add.group();

        // 3. Spawn Commander
        this.commander = new Commander(this, width / 2, height / 2);

        // Register commander in threat system (highest base threat)
        threatMgr.registerCommander(this.commander.id, this.commander);

        // 4. Spawn Companions (from GameState)
        gm.state.myUnits.forEach((unitInst: UnitInstance) => {
            // Random offset around commander
            const ox = Phaser.Math.Between(-50, 50);
            const oy = Phaser.Math.Between(-50, 50);
            const comp = new Companion(this, this.commander.x + ox, this.commander.y + oy, unitInst);
            this.companions.add(comp);

            // Register companion in threat system
            threatMgr.registerCompanion(unitInst.instanceId, comp);
        });

        // 5. Collisions
        // Commander vs Enemy
        this.physics.add.collider(this.commander, this.enemies, this.onCommanderHit, undefined, this);
        // Companion vs Enemy
        this.physics.add.collider(this.companions, this.enemies, this.onCompanionHit, undefined, this);
        // Projectile vs Enemy
        this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, undefined, this);
        // Enemy vs Enemy (prevent stacking)
        this.physics.add.collider(this.enemies, this.enemies);

        // 6. UI
        this.remainingTimeText = this.add.text(width / 2, 20, `Time: ${this.waveTimer}`, { fontSize: '32px' }).setOrigin(0.5);
        this.goldText = this.add.text(20, 20, `Gold: ${gm.state.gold}`, { fontSize: '24px', color: '#ffD700' });

        // Commander HP Display
        this.add.text(20, 60, 'Commander HP:', { fontSize: '18px' });
        const hpBar = this.add.rectangle(160, 70, 200, 20, 0x00ff00).setOrigin(0, 0.5);

        // Update HP Bar in update loop or via event
        this.events.on('update-hp', () => {
            const percent = Math.max(0, this.commander.hp / this.commander.maxHp);
            hpBar.width = 200 * percent;
            hpBar.fillColor = percent < 0.3 ? 0xff0000 : 0x00ff00;
        });

        // Synergies Display
        const synergies = SynergyManager.calculateSynergies(gm.state.myUnits);
        const synText = SynergyManager.getActiveSynergyText(synergies).join('\n');
        this.add.text(width - 20, 20, synText, { fontSize: '16px', align: 'right' }).setOrigin(1, 0);

        // Apply Buffs
        SynergyManager.applyBuffs(this.companions.getChildren() as Companion[], synergies);

        // 7. Spawning Logic - Balanced for better gameplay
        const baseSpawnDelay = Math.max(1000, 2000 - gm.state.wave * 100); // Gets faster each wave, but starts much slower
        this.spawnTimer = this.time.addEvent({
            delay: baseSpawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Spawn initial wave of enemies (reduced for easier start)
        for (let i = 0; i < 1 + Math.floor(gm.state.wave / 2); i++) {
            this.time.delayedCall(i * 500, () => this.spawnEnemy());
        }

        // 8. Wave Timer
        this.time.addEvent({
            delay: 1000,
            repeat: this.waveTimer,
            callback: () => {
                this.waveTimer--;
                this.remainingTimeText.setText(`Time: ${this.waveTimer}`);
                if (this.waveTimer <= 0) {
                    this.endWave();
                }
            }
        });

        // Listen to events
        this.events.on('enemy-died', (reward: number) => {
            gm.addGold(reward);
            this.goldText.setText(`Gold: ${gm.state.gold}`);
        });

        this.events.on('commander-died', () => {
            this.scene.start('MainMenuScene'); // Or Game Over Scene
        });
    }

    update(time: number, delta: number) {
        if (!this.commander.active) return;

        // Update threat manager
        ThreatManager.getInstance().update(delta);

        this.commander.update(time, delta);

        // Update companions
        this.companions.getChildren().forEach(child => {
            (child as Companion).update(time, delta, this.commander.x, this.commander.y, this.enemies);
        });

        // Update enemies - they now use ThreatManager internally
        this.enemies.getChildren().forEach(child => {
            (child as Enemy).update(delta);
        });
    }

    private spawnEnemy() {
        const { width, height } = this.scale;
        const gm = GameManager.getInstance();

        // Spawn at random edge
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -20 : width + 20;
            y = Math.random() * height;
        } else {
            x = Math.random() * width;
            y = Math.random() < 0.5 ? -20 : height + 20;
        }

        // Choose enemy type based on wave and randomness
        let availableTypes: EnemyType[] = ['basic'];

        // Unlock more enemy types as waves progress
        if (gm.state.wave >= 1) availableTypes.push('fast');
        if (gm.state.wave >= 2) availableTypes.push('zigzag');
        if (gm.state.wave >= 3) availableTypes.push('flanker');
        if (gm.state.wave >= 4) availableTypes.push('tank');

        // Weighted random selection (basic is more common)
        const weights = availableTypes.map((type) =>
            type === 'basic' ? 3 : (type === 'tank' ? 0.5 : 1.5)
        );
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        let selectedType: EnemyType = 'basic';
        for (let i = 0; i < availableTypes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedType = availableTypes[i];
                break;
            }
        }

        const enemy = new Enemy(this, x, y, selectedType);
        this.enemies.add(enemy);
    }

    private onCommanderHit(obj1: any, obj2: any) {
        const commander = obj1 as Commander;
        const enemy = obj2 as Enemy;
        commander.takeDamage(enemy.getDamage());
        this.events.emit('update-hp');
    }

    private onCompanionHit(obj1: any, obj2: any) {
        const companion = obj1 as Companion;
        const enemy = obj2 as Enemy;
        companion.takeDamage(enemy.getDamage());
    }

    private onProjectileHit(obj1: any, obj2: any) {
        const projectile = obj1 as Projectile;
        const enemy = obj2 as Enemy;

        if (enemy.active && projectile.active) {
            enemy.takeDamage(projectile.getDamage());
            projectile.onHit();
        }
    }

    private endWave() {
        this.spawnTimer.remove();
        this.enemies.clear(true, true); // Kill all enemies

        // Go to Shop
        this.scene.start('ShopScene');
    }
}
