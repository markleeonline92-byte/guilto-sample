"""
Amruta Website — Python Image Setup Script
Run this once to copy generated images into the /images/ folder.

Usage:
  python setup-images.py
"""

import os
import shutil
import glob

artifacts_dir = r"C:\Users\user\.gemini\antigravity-ide\brain\16dcd075-eb3e-422e-a73e-a8a450420b03"
images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")

os.makedirs(images_dir, exist_ok=True)

mapping = [
    ("hero_product_platter_*.png", "hero_platter.png"),
    ("about_artisan_*.png",        "about_artisan.png"),
    ("gift_box_luxury_*.png",      "gift_box.png"),
    ("ingredients_flatlay_*.png",  "ingredients.png"),
    ("product_ladoo_*.png",        "product_ladoo.png"),
    ("product_kaju_katli_*.png",   "product_kaju_katli.png"),
    ("product_chocolate_*.png",    "product_chocolate.png"),
    ("product_barfi_*.png",        "product_barfi.png"),
]

for pattern, dest_name in mapping:
    matches = glob.glob(os.path.join(artifacts_dir, pattern))
    if matches:
        shutil.copy2(matches[0], os.path.join(images_dir, dest_name))
        print(f"  ✓ Copied {dest_name}")
    else:
        print(f"  ✗ Not found: {pattern}")

print("\nDone! Open index.html in your browser.")
