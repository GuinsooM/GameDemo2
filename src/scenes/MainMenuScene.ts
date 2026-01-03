import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 3, 'Auto-Survivor Chess', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const startButton = this.add.text(width / 2, height / 2, 'START GAME', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      // Reset game state for a new game
      GameManager.getInstance().resetGame();
      // Start the game loop - first go to shop to buy units
      this.scene.start('ShopScene');
    });
  }
}
