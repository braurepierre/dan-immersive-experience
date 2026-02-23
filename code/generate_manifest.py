"""
Scans the /media folder recursively and generates manifest.js
with categorized lists of videos and images.

Usage: python generate_manifest.py
"""

import os
import json

MEDIA_DIR = "../media"
OUTPUT_FILE = "manifest.js"

VIDEO_EXTENSIONS = {".mp4", ".webm"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Folders to exclude from the images list (video frame extracts)
IMAGE_EXCLUDE_DIRS = {"video frames"}

def generate_manifest():
    videos = []
    images = []

    for root, dirs, files in os.walk(MEDIA_DIR):
        # Check if current path is inside an excluded directory
        rel_root = root.replace("\\", "/")
        in_excluded = any(excl in rel_root for excl in IMAGE_EXCLUDE_DIRS)

        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            rel_path = os.path.join(root, filename).replace("\\", "/")

            if ext in VIDEO_EXTENSIONS:
                videos.append(rel_path)
            elif ext in IMAGE_EXTENSIONS and not in_excluded:
                images.append(rel_path)

    videos.sort()
    images.sort()

    manifest = {
        "videos": videos,
        "images": images
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json_str = json.dumps(manifest, indent=2, ensure_ascii=False)
        f.write(f"var MANIFEST_DATA = {json_str};\n")

    print(f"manifest.js generated: {len(videos)} videos, {len(images)} images")

if __name__ == "__main__":
    generate_manifest()
