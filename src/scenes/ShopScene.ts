import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { UNIT_CATALOG } from '../data/GameData';

export class ShopScene extends Phaser.Scene {
  private shopSlots: { unitId: string, price: number, textObj: Phaser.GameObjects.Text, bgObj: Phaser.GameObjects.Rectangle }[] = [];
  private rerollCost: number = 2;
  private goldText!: Phaser.GameObjects.Text;
  private inventoryText!: Phaser.GameObjects.Text;

  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;
    const gm = GameManager.getInstance();

    this.add.text(width / 2, 50, 'SHOP PHASE', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
    
    this.goldText = this.add.text(width - 20, 20, `Gold: ${gm.state.gold}`, { fontSize: '24px', color: '#ffd700' }).setOrigin(1, 0);
    this.inventoryText = this.add.text(20, 20, `Units: ${gm.state.myUnits.length}/5`, { fontSize: '24px' });

    // Shop Container
    const startX = 200;
    const gap = 250;
    
    // Create 3 Shop Slots
    for (let i = 0; i < 3; i++) {
        const x = startX + (i * gap);
        const y = height / 2;
        
        const bg = this.add.rectangle(x, y, 200, 300, 0x444444).setInteractive();
        const text = this.add.text(x, y, 'Empty', { fontSize: '20px', align: 'center', wordWrap: { width: 180 } }).setOrigin(0.5);
        
        this.shopSlots.push({ unitId: '', price: 0, textObj: text, bgObj: bg });

        bg.on('pointerdown', () => {
            this.buyUnit(i);
        });
    }

    // Reroll Button
    const rerollBtn = this.add.text(width / 2 - 100, height - 100, `Reroll (${this.rerollCost}g)`, {
        fontSize: '28px', backgroundColor: '#880000', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    rerollBtn.on('pointerdown', () => {
        if (gm.spendGold(this.rerollCost)) {
            this.refreshShop();
            this.updateUI();
        }
    });

    // Next Wave Button
    const nextBtn = this.add.text(width / 2 + 100, height - 100, 'Next Wave', {
        fontSize: '28px', backgroundColor: '#008800', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    nextBtn.on('pointerdown', () => {
        gm.state.wave++;
        this.scene.start('GameArenaScene');
    });

    // Initial Roll
    this.refreshShop();
  }

  private refreshShop() {
    // Pick 3 random units from Catalog
    const keys = Object.keys(UNIT_CATALOG);
    
    this.shopSlots.forEach(slot => {
        const randomKey = keys[Phaser.Math.Between(0, keys.length - 1)];
        const data = UNIT_CATALOG[randomKey];
        
        slot.unitId = randomKey;
        slot.price = data.cost;
        slot.textObj.setText(`${data.name}\n${data.tags.join('/')}\n\nCost: ${data.cost}g`);
        slot.bgObj.setFillStyle(0x444444); // Reset color
    });
  }

  private buyUnit(index: number) {
    const slot = this.shopSlots[index];
    if (!slot.unitId) return; // Already bought

    const gm = GameManager.getInstance();
    
    if (gm.state.gold >= slot.price) {
        if (gm.addUnit(slot.unitId)) {
            gm.spendGold(slot.price);
            
            // Mark as sold
            slot.unitId = '';
            slot.textObj.setText('SOLD');
            slot.bgObj.setFillStyle(0x222222);
            
            this.updateUI();
        } else {
            // Anim: Shake or "Full" text
            this.cameras.main.shake(100, 0.01);
        }
    } else {
        // Not enough gold
        this.cameras.main.shake(100, 0.01);
    }
  }

  private updateUI() {
    const gm = GameManager.getInstance();
    this.goldText.setText(`Gold: ${gm.state.gold}`);
    this.inventoryText.setText(`Units: ${gm.state.myUnits.length}/5`);
  }
}
