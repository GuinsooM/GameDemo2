import Phaser from 'phaser';

export class Commander extends Phaser.Physics.Arcade.Sprite {
  public readonly id: string = 'commander';
  private speed: number = 200;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public hp: number = 300;
  public maxHp: number = 300;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'commander');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale is baked into the texture (4x), but let's make sure it's good size
    // Texture 36x48 (which is 9x12 * 4).

    this.play('commander_idle');

    this.setCollideWorldBounds(true);

    // Initialize input
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
    }
  }

  update(_time: number, _delta: number) {
    if (!this.active) return;
    this.handleMovement();
  }

  private handleMovement() {
    // If we're dead, don't move
    if (this.hp <= 0) return;

    const { left, right, up, down } = this.cursors;
    let velocityX = 0;
    let velocityY = 0;

    if (left.isDown) velocityX = -this.speed;
    else if (right.isDown) velocityX = this.speed;

    if (up.isDown) velocityY = -this.speed;
    else if (down.isDown) velocityY = this.speed;

    this.setVelocity(velocityX, velocityY);

    // Animation control
    if (velocityX !== 0 || velocityY !== 0) {
      if (this.anims.currentAnim?.key !== 'commander_run') {
        this.play('commander_run');
      }
      this.setFlipX(velocityX < 0);
    } else {
      if (this.anims.currentAnim?.key !== 'commander_idle') {
        this.play('commander_idle');
      }
    }
  }

  public takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  private die() {
    // Notify scene of Game Over
    this.scene.events.emit('commander-died');
    this.setTint(0x555555);
    this.setVelocity(0, 0);
  }
}
