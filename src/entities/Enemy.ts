import Phaser from 'phaser';
import { ThreatManager } from '../managers/ThreatManager';

export type EnemyType = 'basic' | 'fast' | 'tank' | 'zigzag' | 'flanker';

interface EnemyConfig {
  speed: number;
  hp: number;
  damage: number;
  color: number;
  size: number;
  reward: number;
}

const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  basic: { speed: 70, hp: 20, damage: 2, color: 0xff0000, size: 10, reward: 3 },
  fast: { speed: 130, hp: 10, damage: 1, color: 0xff6600, size: 8, reward: 4 },
  tank: { speed: 40, hp: 80, damage: 5, color: 0x880000, size: 16, reward: 8 },
  zigzag: { speed: 95, hp: 15, damage: 2, color: 0xff00ff, size: 9, reward: 5 },
  flanker: { speed: 90, hp: 25, damage: 3, color: 0xffff00, size: 11, reward: 6 }
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private hp: number;
  private damage: number;
  private reward: number;
  private enemyType: EnemyType;

  // Movement behavior variables
  private zigzagTimer: number = 0;
  private zigzagDirection: number = 1;
  private flankerAngle: number = 0;
  private flankerPhase: 'circle' | 'attack' = 'circle';
  private flankerTimer: number = 0;
  private dashCooldown: number = 0;
  private isDashing: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'basic') {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;
    const config = ENEMY_CONFIGS[type];
    this.speed = config.speed;
    this.hp = config.hp;
    this.damage = config.damage;
    this.reward = config.reward;

    const textureKey = `enemy_${type}`;
    this.setTexture(textureKey);
    // this.setScale(3); // Textures are already scaled up by 4 in asset generation
    this.setScale(1); // Reset scale to 1

    // Play move animation
    this.play(`enemy_${type}_move`);

    // Initialize flanker angle
    if (type === 'flanker') {
      this.flankerAngle = Math.random() * Math.PI * 2;
    }
  }

  update(delta: number = 16) {
    if (!this.active) return;

    // Get target from threat system - enemies always prioritize moving toward commander area
    const threatMgr = ThreatManager.getInstance();
    const commanderPos = threatMgr.getCommanderPosition();

    if (!commanderPos) {
      this.setVelocity(0, 0);
      return;
    }

    // Use commander position as primary direction for all movement patterns
    const targetX = commanderPos.x;
    const targetY = commanderPos.y;

    switch (this.enemyType) {
      case 'basic':
        this.moveBasic(targetX, targetY);
        break;
      case 'fast':
        this.moveFast(targetX, targetY, delta);
        break;
      case 'tank':
        this.moveTank(targetX, targetY);
        break;
      case 'zigzag':
        this.moveZigzag(targetX, targetY, delta);
        break;
      case 'flanker':
        this.moveFlanker(targetX, targetY, delta);
        break;
    }
  }

  // Basic: Direct chase with slight acceleration
  private moveBasic(commanderX: number, commanderY: number) {
    this.scene.physics.moveTo(this, commanderX, commanderY, this.speed);

    // Flip based on direction
    this.setFlipX(this.body!.velocity.x < 0);
  }

  // Fast: Quick with occasional dashes
  private moveFast(commanderX: number, commanderY: number, delta: number) {
    this.dashCooldown -= delta;

    if (this.dashCooldown <= 0 && !this.isDashing) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, commanderX, commanderY);
      if (dist < 200 && dist > 50) {
        // Start dash
        this.isDashing = true;
        this.scene.physics.moveTo(this, commanderX, commanderY, this.speed * 2.5);
        this.scene.time.delayedCall(300, () => {
          this.isDashing = false;
          this.dashCooldown = 1500 + Math.random() * 1000;
        });
        return;
      }
    }

    if (!this.isDashing) {
      this.scene.physics.moveTo(this, commanderX, commanderY, this.speed);
    }
  }

  // Tank: Slow but relentless
  private moveTank(commanderX: number, commanderY: number) {
    this.scene.physics.moveTo(this, commanderX, commanderY, this.speed);
  }

  // Zigzag: Moves in a wavy pattern toward the target
  private moveZigzag(commanderX: number, commanderY: number, delta: number) {
    this.zigzagTimer += delta;

    // Change direction every 300ms
    if (this.zigzagTimer > 300) {
      this.zigzagTimer = 0;
      this.zigzagDirection *= -1;
    }

    // Calculate direction to commander
    const angle = Phaser.Math.Angle.Between(this.x, this.y, commanderX, commanderY);

    const moveAngle = angle + Math.sin(this.zigzagTimer / 100) * 0.8;

    this.setVelocity(
      Math.cos(moveAngle) * this.speed,
      Math.sin(moveAngle) * this.speed
    );
  }

  // Flanker: Circles around then attacks
  private moveFlanker(commanderX: number, commanderY: number, delta: number) {
    this.flankerTimer += delta;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, commanderX, commanderY);

    if (this.flankerPhase === 'circle') {
      // Circle around the commander
      this.flankerAngle += delta * 0.002;
      const orbitRadius = 150;
      const targetX = commanderX + Math.cos(this.flankerAngle) * orbitRadius;
      const targetY = commanderY + Math.sin(this.flankerAngle) * orbitRadius;

      this.scene.physics.moveTo(this, targetX, targetY, this.speed);

      // Switch to attack after 2-4 seconds
      if (this.flankerTimer > 2000 + Math.random() * 2000) {
        this.flankerPhase = 'attack';
        this.flankerTimer = 0;
      }
    } else {
      // Attack phase - rush toward commander
      this.scene.physics.moveTo(this, commanderX, commanderY, this.speed * 1.5);

      // Return to circling after 1.5 seconds or if too close
      if (this.flankerTimer > 1500 || dist < 30) {
        this.flankerPhase = 'circle';
        this.flankerTimer = 0;
      }
    }
  }

  public takeDamage(amount: number) {
    this.hp -= amount;

    // Flash white on hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  private die() {
    this.scene.events.emit('enemy-died', this.reward);
    this.destroy();
  }

  public getDamage(): number {
    return this.damage;
  }

  public getEnemyType(): EnemyType {
    return this.enemyType;
  }
}

