-- Descripció opcional per a cada activitat.

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
