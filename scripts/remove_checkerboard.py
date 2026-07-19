from PIL import Image
import os

files = [
    os.path.join('public', 'logo.png'),
    os.path.join('public', 'logo', 'logo-icon.png')
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
        
    print(f"Processing {filepath}...")
    img = Image.open(filepath).convert('RGBA')
    pixels = img.load()

    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            if a > 0:
                cmax = max(r, g, b)
                cmin = min(r, g, b)
                
                # If the color is very close to gray and is light, it's the checkerboard
                if cmax - cmin <= 18 and cmax >= 150:
                    pixels[x, y] = (r, g, b, 0)
                # Anti-aliasing blending for edges of the checkerboard shadows
                elif cmax - cmin <= 25 and cmax >= 100:
                    # Calculate how "gray" and how "light" it is
                    grayness = 1.0 - ((cmax - cmin) / 25.0)
                    lightness = (cmax - 100) / 155.0
                    
                    # Reduce alpha
                    reduction = grayness * lightness
                    new_a = int(a * (1.0 - reduction))
                    pixels[x, y] = (r, g, b, new_a)

    img.save(filepath)
    print(f"Saved {filepath}")

print("Done!")
