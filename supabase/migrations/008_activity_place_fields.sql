-- Lloc i adreça separats de l'activitat (què fem vs on anem).

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS place_name TEXT;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS place_address TEXT;
