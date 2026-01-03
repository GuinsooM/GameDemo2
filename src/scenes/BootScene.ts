import Phaser from 'phaser';
// SpriteFactory removed in favor of asset loading

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.setPath('assets/sprites/');

    // Commander: 9x12 original, scaled x4 = 36x48.
    // But we saved them scaled up by 4 in the script.
    // The frames in script are:
    // Commander: Processed into single frame (75x77)
    this.load.spritesheet('commander', 'commander_processed.png', { frameWidth: 75, frameHeight: 77 });

    // Companion: Use the generated one (unchanged) or maybe the bat?
    // Let's stick to the generated one for companion for now, or use the bat as companion?
    // No, keep generated companion.
    this.load.spritesheet('companion', 'companion.png', { frameWidth: 28, frameHeight: 24 });

    // Enemy Basic: Skeleton. Processed into a 3-frame strip (64x64).
    this.load.spritesheet('enemy_basic', 'enemy_basic_processed.png', { frameWidth: 64, frameHeight: 64 });

    // Enemy Fast: Bat. 128x128. 32x32 frames.
    this.load.spritesheet('enemy_fast', 'enemy_fast.png', { frameWidth: 32, frameHeight: 32 });

    // Enemy Tank: Golem. 448x256. 7 cols, 4 rows. 64x64 frames.
    this.load.spritesheet('enemy_tank', 'enemy_tank.png', { frameWidth: 64, frameHeight: 64 });

    // Enemy Zigzag: 6 rows, 9 cols. Scale 4 -> 36x24.
    this.load.spritesheet('enemy_zigzag', 'enemy_zigzag.png', { frameWidth: 36, frameHeight: 24 });

    // Enemy Flanker: 7 rows, 7 cols. Scale 4 -> 28x28.
    this.load.spritesheet('enemy_flanker', 'enemy_flanker.png', { frameWidth: 28, frameHeight: 28 });

    // Projectile: 3 rows, 3 cols. Scale 4 -> 12x12.
    this.load.spritesheet('projectile', 'projectile.png', { frameWidth: 12, frameHeight: 12 });
  }

  create() {
    // Create Animations
    this.createAnimations();

    this.scene.start('MainMenuScene');
  }

  private createAnimations() {
    this.anims.create({
      key: 'commander_idle',
      frames: this.anims.generateFrameNumbers('commander', { frames: [0] }),
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'commander_run',
      frames: this.anims.generateFrameNumbers('commander', { frames: [0] }), // No run anim for static
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'companion_idle',
      frames: this.anims.generateFrameNumbers('companion', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_basic_move',
      // We extracted 3 frames.
      frames: this.anims.generateFrameNumbers('enemy_basic', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_fast_move',
      // Bat has 4 rows. Row 1 (index 4-7) is usually Left.
      frames: this.anims.generateFrameNumbers('enemy_fast', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_tank_move',
      // Golem. Row 0 (0-6) Up? Row 2 (14-20) Down?
      frames: this.anims.generateFrameNumbers('enemy_tank', { start: 14, end: 20 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_zigzag_move',
      frames: this.anims.generateFrameNumbers('enemy_zigzag', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_flanker_move',
      frames: this.anims.generateFrameNumbers('enemy_flanker', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'projectile_spin',
      frames: this.anims.generateFrameNumbers('projectile', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
  }
}
