import Phaser from 'phaser';
import { UnitInstance, UNIT_CATALOG } from '../data/GameData';
import { Enemy } from './Enemy';

export class Companion extends Phaser.Physics.Arcade.Sprite {
  public unitData: UnitInstance;
  private lastAttackTime: number = 0;
  private isDead: boolean = false;
  private respawnTime: number = 5000; // 5 seconds
  private respawnTimer: number = 0;

  // Stats
  private attackRange: number;
  private damage: number;
  private attackInterval: number; // ms
  private moveSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, unitInstance: UnitInstance) {
    super(scene, x, y, '');
    this.unitData = unitInstance;

    // Load stats from catalog based on ID and Star Level
    const template = UNIT_CATALOG[unitInstance.dataId];
    // Simple scaling for star level
    const multiplier = unitInstance.starLevel;

    this.attackRange = template.stats.range;
    this.damage = template.stats.damage * multiplier;
    this.attackInterval = (1000 / template.stats.attackSpeed);
    this.moveSpeed = template.stats.moveSpeed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Use base texture from factory
    this.setTexture('companion');
    this.play('companion_idle');
    // this.setScale(3);

    // Color code based on Unit Type (rudimentary support)
    if (template.tags.includes('Mage')) {
      this.setTint(0x4169E1); // Blue tint for mages
    } else if (template.tags.includes('Ranger')) {
      this.setTint(0x00FF00); // Green for rangers
    }

    // Star Level Visuals
    if (multiplier > 1) {
      this.setScale(3.5); // Bigger
      this.setTint(0xFFD700); // Gold tint for 2*
    }
    if (multiplier > 2) {
      this.setScale(4); // Even Bigger
      this.setTint(0xFF0000); // Red tint for 3*
    }
  }

  update(time: number, delta: number, commanderX: number, commanderY: number, enemies: Phaser.GameObjects.Group) {
    if (this.isDead) {
      this.respawnTimer += delta;
      if (this.respawnTimer >= this.respawnTime) {
        this.revive();
      }
      return;
    }

    // 1. Follow Commander (soft leash)
    const distToCommander = Phaser.Math.Distance.Between(this.x, this.y, commanderX, commanderY);
    if (distToCommander > 100) {
      this.scene.physics.moveTo(this, commanderX, commanderY, this.moveSpeed);
    } else {
      this.setVelocity(0, 0);
    }

    // 2. Auto Attack Logic
    if (time > this.lastAttackTime + this.attackInterval) {
      const target = this.findNearestEnemy(enemies);
      if (target) {
        this.attack(target);
        this.lastAttackTime = time;
      }
    }
  }

  private findNearestEnemy(enemies: Phaser.GameObjects.Group): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = this.attackRange;

    enemies.children.entries.forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist <= minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  private attack(target: Enemy) {
    // Visual: Draw a line
    const gfx = this.scene.add.graphics();
    gfx.lineStyle(2, 0xffff00);
    gfx.lineBetween(this.x, this.y, target.x, target.y);

    // Damage
    target.takeDamage(this.damage);

    // Fade out line
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 200,
      onComplete: () => gfx.destroy()
    });
  }

  public takeDamage(amount: number) {
    this.unitData.currentHp -= amount;
    if (this.unitData.currentHp <= 0) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
    this.respawnTimer = 0;
    this.setAlpha(0.3); // Ghost mode
    this.setVelocity(0, 0);
    // Disable collision
    (this.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;
  }

  private revive() {
    this.isDead = false;
    this.unitData.currentHp = UNIT_CATALOG[this.unitData.dataId].stats.hp * this.unitData.starLevel; // Reset HP
    this.setAlpha(1);
    (this.body as Phaser.Physics.Arcade.Body).checkCollision.none = false;
  }
}
