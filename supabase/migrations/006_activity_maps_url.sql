-- Enllaç Google Maps per activitat (horari)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS maps_url TEXT;
