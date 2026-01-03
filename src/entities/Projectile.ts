import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    private damage: number;
    private duration: number;
    private speed: number = 400;

    constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, damage: number) {
        super(scene, x, y, '');
        this.damage = damage;
        this.duration = 2000; // 2 seconds life

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Graphics for projectile
        this.setTexture('projectile_texture');
        this.setScale(2);

        // Move towards target
        scene.physics.moveTo(this, targetX, targetY, this.speed);

        // Rotate towards target
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setRotation(angle);
    }

    update(_time: number, delta: number) {
        this.duration -= delta;
        if (this.duration <= 0) {
            this.destroy();
        }
    }

    public getDamage() {
        return this.damage;
    }

    public onHit() {
        // Maybe visual effect here
        this.destroy();
    }
}
