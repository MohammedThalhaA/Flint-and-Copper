from PIL import Image
import os

input_path = os.path.join('public', 'logo.png')
output_path = os.path.join('public', 'logo_no_slogan.png')

try:
    img = Image.open(input_path)
    width, height = img.size
    
    # Crop bottom 22% to safely remove the slogan
    new_height = int(height * 0.78)
    cropped = img.crop((0, 0, width, new_height))
    cropped.save(output_path)
    print(f"Successfully cropped and saved to {output_path}")
except Exception as e:
    print(f"Error: {e}")
