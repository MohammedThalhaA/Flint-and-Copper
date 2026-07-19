from rembg import remove
from PIL import Image
import os
import io

folder = r"c:\Users\MOHAMMED THALHA A\OneDrive\Desktop\FlintandCopper\public\logo"
files = ["logo-icon.png", "shop-name.png", "slogan.png"]

for filename in files:
    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    print(f"Processing {filename}...")
    try:
        # 1. Read input image
        with open(filepath, 'rb') as i:
            input_data = i.read()
        
        # 2. Remove Background using rembg
        output_data = remove(input_data)
        
        # 3. Open the result with PIL from bytes
        img = Image.open(io.BytesIO(output_data))
        
        # 4. Auto-Crop (trim transparent pixels)
        # getbbox() returns (left, upper, right, lower) of the non-zero regions
        bbox = img.getbbox()
        if bbox:
            img_cropped = img.crop(bbox)
            img_cropped.save(filepath)
            print(f"Successfully removed background and cropped {filename}")
        else:
            print(f"Warning: {filename} resulted in an empty image.")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")
