import os
from PIL import Image, ImageDraw

def create_sprite_sheet(filename, frames_data, palette, scale=4):
    """
    frames_data: List of 2D arrays (strings) representing frames.
    palette: Dict mapping char to (R, G, B, A).
    scale: Pixel scaling factor.
    """
    if not frames_data:
        return

    frame_height = len(frames_data[0])
    frame_width = len(frames_data[0][0])
    num_frames = len(frames_data)

    # Create sheet image
    sheet_width = frame_width * scale * num_frames
    sheet_height = frame_height * scale

    img = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    for f_idx, frame in enumerate(frames_data):
        offset_x = f_idx * frame_width * scale
        for y, row in enumerate(frame):
            for x, char in enumerate(row):
                if char in palette:
                    color = palette[char]
                    # Draw a rectangle scaled up
                    draw.rectangle(
                        [offset_x + x * scale, y * scale, offset_x + (x + 1) * scale - 1, (y + 1) * scale - 1],
                        fill=color
                    )

    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename)
    print(f"Saved {filename}")

# --- Data Definitions ---

# Palette
PALETTE = {
    ' ': (0, 0, 0, 0),       # Transparent
    '.': (192, 192, 192, 255), # Silver
    'o': (255, 200, 150, 255), # Skin
    'x': (139, 69, 19, 255),   # Brown
    '+': (65, 105, 225, 255),  # Royal Blue
    'g': (50, 205, 50, 255),   # Lime Green
    'w': (240, 240, 240, 255), # White (Bone)
    'b': (0, 0, 0, 255),       # Black
    'P': (128, 0, 128, 255),   # Purple
    'r': (255, 0, 0, 255),     # Red
    'G': (85, 107, 47, 255),   # Dark Olive Green
    'R': (255, 69, 0, 255),    # Orange Red
    'c': (0, 255, 255, 255),   # Cyan
    'y': (255, 215, 0, 255),   # Gold
    'O': (255, 69, 0, 255),    # Orange
    'Y': (255, 255, 0, 255),   # Yellow
    'B': (0, 0, 255, 255)      # Blue
}

# Commander: Idle and Run (2 frames for simplicity)
commander_idle = [
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
]
commander_run = [
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
    "   x  .  ",
    "   .  x  "
]
# Create 4 frames: Idle, Run1, Idle, Run2 (bouncing)
create_sprite_sheet(
    'public/assets/sprites/commander.png',
    [commander_idle, commander_run, commander_idle, commander_run],
    PALETTE
)

# Companion
companion_f1 = [
    "  ggg  ",
    " gogog ",
    " ggggg ",
    "  ggg  ",
    " ggggg ",
    " g g g "
]
companion_f2 = [
    "  ggg  ",
    " gogog ",
    " ggggg ",
    "  ggg  ",
    " ggggg ",
    " g   g "
]
create_sprite_sheet(
    'public/assets/sprites/companion.png',
    [companion_f1, companion_f2],
    PALETTE
)

# Enemy: Basic (Skeleton)
enemy_basic_f1 = [
    "  wwwww  ",
    " wbbwbbw ",
    " wwwwwww ",
    "  wwwww  ",
    "  wwwww  ",
    " w www w ",
    " w w w w ",
    " w w w w "
]
enemy_basic_f2 = [
    "  wwwww  ",
    " wbbwbbw ",
    " wwwwwww ",
    "  wwwww  ",
    "  wwwww  ",
    " w www w ",
    " w w w w ",
    "  w   w  " # Legs move
]
create_sprite_sheet(
    'public/assets/sprites/enemy_basic.png',
    [enemy_basic_f1, enemy_basic_f2],
    PALETTE
)

# Enemy: Fast (Bat)
enemy_fast_f1 = [
    "P       P",
    "PP     PP",
    " PPP PPP ",
    "  PPrPP  ",
    "   PPP   ",
    "    P    "
]
enemy_fast_f2 = [
    "         ",
    "P       P",
    "PPP   PPP",
    " PPrrPP  ",
    "  PPPPP  ",
    "    P    "
]
create_sprite_sheet(
    'public/assets/sprites/enemy_fast.png',
    [enemy_fast_f1, enemy_fast_f2],
    PALETTE
)

# Enemy: Tank (Golem)
enemy_tank_f1 = [
    "  GGGGG  ",
    " GGGGGGG ",
    " GGRGGRG ",
    " GGGGGGG ",
    " GGGGGGG ",
    "GG GGG GG",
    "GG GGG GG",
    "GG GGG GG",
    "GG GGG GG"
]
enemy_tank_f2 = [
    "  GGGGG  ",
    " GGGGGGG ",
    " GGRGGRG ",
    " GGGGGGG ",
    " GGGGGGG ",
    "GG GGG GG",
    "GG GGG GG",
    "GG GGG GG",
    " G G G G " # Feet lift
]
create_sprite_sheet(
    'public/assets/sprites/enemy_tank.png',
    [enemy_tank_f1, enemy_tank_f2],
    PALETTE
)

# Enemy: Zigzag (Ghost)
enemy_zigzag_f1 = [
    "  ccccc  ",
    " cccccc  ",
    "cc b cc  ",
    "ccccccc  ",
    "ccccccc  ",
    "c c c c  "
]
enemy_zigzag_f2 = [
    "  ccccc  ",
    " cccccc  ",
    "cc b cc  ",
    "ccccccc  ",
    "ccccccc  ",
    " c c c c "
]
create_sprite_sheet(
    'public/assets/sprites/enemy_zigzag.png',
    [enemy_zigzag_f1, enemy_zigzag_f2],
    PALETTE
)

# Enemy: Flanker (Wisp)
enemy_flanker_f1 = [
    "   y   ",
    "  yyy  ",
    " yyyyy ",
    "yyyyyyy",
    " yyyyy ",
    "  yyy  ",
    "   y   "
]
enemy_flanker_f2 = [
    "       ",
    "   y   ",
    "  yyy  ",
    " yyyyy ",
    "  yyy  ",
    "   y   ",
    "       "
]
create_sprite_sheet(
    'public/assets/sprites/enemy_flanker.png',
    [enemy_flanker_f1, enemy_flanker_f2],
    PALETTE
)

# Projectile
projectile_f1 = [
    " O ",
    "OYO",
    " O "
]
projectile_f2 = [
    " Y ",
    "YOY",
    " Y "
]
create_sprite_sheet(
    'public/assets/sprites/projectile.png',
    [projectile_f1, projectile_f2],
    PALETTE
)
