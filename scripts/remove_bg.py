from rembg import remove
from PIL import Image
import os

input_path = os.path.join('public', 'logo.jpeg')
output_path = os.path.join('public', 'logo.png')

print(f"Removing background from {input_path}...")
try:
    input_img = Image.open(input_path)
    output_img = remove(input_img)
    output_img.save(output_path)
    print(f"Saved background-free logo to {output_path}")
except Exception as e:
    print(f"Error removing background: {e}")
