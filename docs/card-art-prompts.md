# EPIPHANY card artwork

## Cloud artwork storage

Character artwork is served exclusively from the public Supabase Storage bucket `character-art`.

Each character record in `data-cards.js` keeps two **object filenames**, not local file paths:

- `image`: the original artwork filename stored under `originals/`.
- `thumb`: the gallery thumbnail filename stored under `thumbs/`.

For example, `image: "mira99.png"` maps to `character-art/originals/mira99.png`, while `thumb: "mira.webp"` maps to `character-art/thumbs/mira.webp`.

The browser builds the public Supabase URL from these names. It does not request character portraits from the repository, and there is no local fallback. Do not add local character image files or a thumbnail-generation step to the app or CI.

## Adding or replacing character artwork

1. Prepare the approved full-resolution illustration and an optimized WebP gallery thumbnail.
2. Upload the original to the Supabase Storage `character-art/originals/` folder.
3. Upload the thumbnail to `character-art/thumbs/`.
4. Update the corresponding `image` and `thumb` object filenames in `data-cards.js`.
5. Use Developer Mode → Assets to scan the bucket and test the public image URLs.
6. Confirm both the gallery thumbnail and full-size dossier image load before publishing.

Keep the stable card ID and approved character spelling. Rarity controls frame treatment only; it must not imply narrative importance, power, or moral worth.

## Retained vector artwork

The repository SVG files `assets/cards/epiphany-portraits.svg` and `assets/cards/card-ornaments.svg` are separate vector UI assets used by the card renderer. They are not local copies of the uploaded character portrait files and must remain unless their code references are deliberately replaced.
