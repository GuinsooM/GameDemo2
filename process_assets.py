from PIL import Image
import os

def process_commander():
    try:
        if not os.path.exists('public/assets/sprites/commander.png'):
            print("Commander image not found.")
            return

        img = Image.open('public/assets/sprites/commander.png')
        # Find the bounding box of the non-transparent content
        bbox = img.getbbox()
        if bbox:
            print(f"Commander bbox: {bbox}")
            cropped = img.crop(bbox)
            cropped.save('public/assets/sprites/commander_processed.png')
            print(f"Processed Commander (Cropped to {cropped.size})")
        else:
            print("Commander image is empty?")
            img.save('public/assets/sprites/commander_processed.png')

    except Exception as e:
        print(f"Error processing commander: {e}")

def process_skeleton():
    try:
        if not os.path.exists('public/assets/sprites/enemy_basic.png'):
            print("Skeleton image not found.")
            return

        img = Image.open('public/assets/sprites/enemy_basic.png')
        # Crop a 3-frame walk cycle from row 9 (index 9)
        # Using row 9 seems to be the best guess for walking left/down
        frames = []
        row_y = 64 * 9 # Row 9
        for i in range(3):
            frame = img.crop((i*64, row_y, (i+1)*64, row_y+64))
            frames.append(frame)

        strip = Image.new('RGBA', (64*3, 64))
        for i, f in enumerate(frames):
            strip.paste(f, (i*64, 0))

        strip.save('public/assets/sprites/enemy_basic_processed.png')
        print("Processed Skeleton")
    except Exception as e:
        print(f"Error processing skeleton: {e}")

if __name__ == '__main__':
    process_commander()
    process_skeleton()
