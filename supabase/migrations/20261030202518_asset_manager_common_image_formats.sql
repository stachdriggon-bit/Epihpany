-- Keep the existing character-art bucket compatible with the Asset Manager's approved common image formats.
update storage.buckets
set allowed_mime_types = array['image/png','image/jpeg','image/webp']::text[]
where id = 'character-art';
