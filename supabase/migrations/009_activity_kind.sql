-- Tipus d'activitat: pla confirmat o idea proposada (amb vots).

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'plan'
  CHECK (kind IN ('plan', 'idea'));

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS votes TEXT[] NOT NULL DEFAULT '{}';
