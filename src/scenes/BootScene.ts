import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load external assets
    this.load.image('commander_texture', 'assets/sprites/commander_texture.png');
    this.load.image('companion_base', 'assets/sprites/companion_base.png');
    this.load.image('enemy_basic', 'assets/sprites/enemy_basic.png');
    this.load.image('enemy_fast', 'assets/sprites/enemy_fast.png');
    this.load.image('enemy_tank', 'assets/sprites/enemy_tank.png');
    this.load.image('enemy_zigzag', 'assets/sprites/enemy_zigzag.png');
    this.load.image('enemy_flanker', 'assets/sprites/enemy_flanker.png');
    this.load.image('projectile_texture', 'assets/sprites/projectile_texture.png');
  }

  create() {
    // Assets are loaded, proceed to main menu
    this.scene.start('MainMenuScene');
  }
}
