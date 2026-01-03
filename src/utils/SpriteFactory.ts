import Phaser from 'phaser';

export class SpriteFactory {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createAllTextures() {
        this.createCommanderTexture();
        this.createEnemyTextures();
        this.createCompanionTexture();
        this.createProjectileTexture();
    }

    private createTextureFromData(key: string, data: string[], palette: Record<string, number>, pixelSize: number = 4) {
        if (this.scene.textures.exists(key)) return;

        const height = data.length;
        const width = data[0].length;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 } as any);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = data[y][x];
                if (char !== ' ') {
                    const color = palette[char];
                    if (color !== undefined) {
                        graphics.fillStyle(color, 1);
                        graphics.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        }

        graphics.generateTexture(key, width * pixelSize, height * pixelSize);
    }

    private createCommanderTexture() {
        // A simple knight/hero
        // . = helmet/armor (silver)
        // o = skin (peach)
        // x = belt/boots (brown)
        // + = blue cape
        const data = [
            "   ...   ",
            "  .....  ",
            "  .o.o.  ",
            "  .....  ",
            "   ooo   ",
            "  +++++  ",
            " +++..+++",
            " +++..+++",
            " + xxxx +",
            "   ....  ",
            "   x  x  ",
            "   x  x  "
        ];

        const palette = {
            '.': 0xC0C0C0, // Silver
            'o': 0xFFC0CB, // Skin
            'x': 0x8B4513, // Brown
            '+': 0x4169E1  // Royal Blue
        };

        this.createTextureFromData('commander_texture', data, palette, 4);
    }

    private createCompanionTexture() {
        // A smaller helper unit
        // g = green clothes
        // o = skin
        const data = [
            "  ggg  ",
            " gogog ",
            " ggggg ",
            "  ggg  ",
            " ggggg ",
            " g g g "
        ];

        const palette = {
            'g': 0x32CD32,
            'o': 0xFFC0CB
        };

        // Note: Companion changes texture based on ID, this is a fallback or base
        this.createTextureFromData('companion_base', data, palette, 4);
    }

    private createEnemyTextures() {
        // 1. Basic Enemy: Skeleton-ish
        // w = white (bone)
        // b = black (eyes)
        const basicData = [
            "  wwwww  ",
            " wbbwbbw ",
            " wwwwwww ",
            "  wwwww  ",
            "  wwwww  ",
            " w www w ",
            " w w w w ",
            " w w w w "
        ];
        this.createTextureFromData('enemy_basic', basicData, { 'w': 0xE0E0E0, 'b': 0x000000 }, 4);

        // 2. Fast Enemy: Bat-like
        // P = purple
        // r = red eyes
        const fastData = [
            "P       P",
            "PP     PP",
            " PPP PPP ",
            "  PPrPP  ",
            "   PPP   ",
            "    P    "
        ];
        this.createTextureFromData('enemy_fast', fastData, { 'P': 0x800080, 'r': 0xFF0000 }, 4);

        // 3. Tank Enemy: Golem/Ogre
        // G = dark green
        // R = red eyes
        const tankData = [
            "  GGGGG  ",
            " GGGGGGG ",
            " GGRGGRG ",
            " GGGGGGG ",
            " GGGGGGG ",
            "GG GGG GG",
            "GG GGG GG",
            "GG GGG GG",
            "GG GGG GG"
        ];
        this.createTextureFromData('enemy_tank', tankData, { 'G': 0x556B2F, 'R': 0xFF4500 }, 5);

        // 4. Zigzag Enemy: Ghost
        // c = cyan
        const zigzagData = [
            "  ccccc  ",
            " cccccc  ",
            "cc b cc  ",
            "ccccccc  ",
            "ccccccc  ",
            "c c c c  "
        ];
        this.createTextureFromData('enemy_zigzag', zigzagData, { 'c': 0x00FFFF, 'b': 0x000000 }, 4);

        // 5. Flanker Enemy: Wisp/Assassin
        // y = yellow
        const flankerData = [
            "   y   ",
            "  yyy  ",
            " yyyyy ",
            "yyyyyyy",
            " yyyyy ",
            "  yyy  ",
            "   y   "
        ];
        this.createTextureFromData('enemy_flanker', flankerData, { 'y': 0xFFD700 }, 4);
    }

    private createProjectileTexture() {
        // Fireball
        // O = Orange
        // Y = Yellow
        const data = [
            " O ",
            "OYO",
            " O "
        ];
        this.createTextureFromData('projectile_texture', data, { 'O': 0xFF4500, 'Y': 0xFFFF00 }, 4);
    }
}
