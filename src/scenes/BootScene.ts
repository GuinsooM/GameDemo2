import Phaser from 'phaser';
import { SpriteFactory } from '../utils/SpriteFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No external assets needed - using programmatic textures
  }

  create() {
    // Generate all textures programmatically
    const factory = new SpriteFactory(this);
    factory.createAllTextures();

    this.scene.start('MainMenuScene');
  }
}
