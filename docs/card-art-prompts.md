# EPIPHANY card artwork

## Source artwork and gallery thumbnails

Keep the approved full-resolution card artwork in the path referenced by each card's `image` field in `data-cards.js`. The detail dossier and reveal experience use this full image.

The collection gallery uses the optional `thumb` field when it exists, falling back to `image` so a newly added card never displays a broken image while thumbnails are being generated.

Generate the gallery WebP thumbnails after adding or replacing card art:

```bash
python -m pip install Pillow
python tools/make-card-thumbs.py
```

The development-only script reads card IDs, names, and image paths from `data-cards.js`, writes 360 × 504 maximum WebP images at quality 78 to `assets/cards/art/thumb/`, and adds the matching `thumb` path to each catalog record. It prints aggregate source and thumbnail byte counts. Commit both the generated `thumb/` files and the updated catalog file together.

Do not overwrite the full artwork with a thumbnail. The full image remains the source of truth for modal/reveal rendering and future reprocessing.

## Art prompt record

For each new character illustration, record the stable card ID, approved name and spelling, visual design notes, rarity frame treatment, source filename, and confirmation that the image matches the current character canon. Rarity controls the frame treatment only; it must not imply narrative importance, power, or moral worth.
