from PIL import Image
import os
from collections import Counter

filepath = os.path.join('public', 'logo', 'logo-icon.png')
img = Image.open(filepath).convert('RGBA')
pixels = list(img.getdata())

# Find the most common colors that are not fully transparent
opaque_pixels = [p for p in pixels if p[3] > 200]
common = Counter(opaque_pixels).most_common(20)
print("Most common opaque pixels:", common)
