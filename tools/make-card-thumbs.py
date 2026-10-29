#!/usr/bin/env python3
"""Generate responsive WebP thumbnails for EPIPHANY collectible cards.

Run from the repository root with: python tools/make-card-thumbs.py
Requires Pillow (development-only): python -m pip install Pillow
"""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data-cards.js"
THUMB_DIR = ROOT / "assets" / "cards" / "art" / "thumb"
CARD_LINE = re.compile(r'id:"(?P<id>[^"]+)"[^\n]*?name:"(?P<name>[^"]+)"[^\n]*?image:"(?P<image>[^"]+)"')

def slugify(value: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return slug or fallback.lower()

def main() -> None:
    source = DATA_FILE.read_text(encoding="utf-8")
    catalog, suffix = source.split("];", 1)
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    generated = 0
    source_bytes = 0
    thumb_bytes = 0
    updated_lines = []
    used_names: set[str] = set()

    for line in catalog.splitlines():
        match = CARD_LINE.search(line)
        if not match:
            updated_lines.append(line)
            continue
        card_id, name, image_name = match.group("id", "name", "image")
        source_path = ROOT / image_name
        if not source_path.is_file():
            raise FileNotFoundError(f"{card_id}: card art not found: {source_path}")
        slug = slugify(name, card_id)
        if slug in used_names:
            slug = f"{slug}-{card_id.lower()}"
        used_names.add(slug)
        relative_thumb = f"assets/cards/art/thumb/{slug}.webp"
        output_path = ROOT / relative_thumb

        with Image.open(source_path) as original:
            image = ImageOps.exif_transpose(original)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            image.thumbnail((360, 504), Image.Resampling.LANCZOS)
            image.save(output_path, "WEBP", quality=78, method=6)

        source_bytes += source_path.stat().st_size
        thumb_bytes += output_path.stat().st_size
        generated += 1
        if 'thumb:"' not in line:
            line = line.replace(f'image:"{image_name}"', f'image:"{image_name}",thumb:"{relative_thumb}"', 1)
        updated_lines.append(line)

    DATA_FILE.write_text("\n".join(updated_lines) + "];" + suffix, encoding="utf-8")
    print(f"Generated {generated} card thumbnails.")
    print(f"Source art: {source_bytes:,} bytes; thumbnails: {thumb_bytes:,} bytes.")
    if source_bytes:
        print(f"Thumbnail byte reduction: {100 * (1 - thumb_bytes / source_bytes):.1f}%")

if __name__ == "__main__":
    main()
