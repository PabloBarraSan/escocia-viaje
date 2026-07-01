-- Executar al SQL Editor de Supabase si falla crear/editar activitats (error PGRST204).
-- Afegeix totes les columnes noves d'activitats d'un cop.

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER
  CHECK (duration_minutes IS NULL OR duration_minutes > 0);

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS maps_url TEXT;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS place_name TEXT;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS place_address TEXT;

-- Xat per dia (si encara no existeix)
CREATE TABLE IF NOT EXISTS day_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_day_messages_day ON day_messages(day_id, created_at);

ALTER TABLE day_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "day_messages_all" ON day_messages;
CREATE POLICY "day_messages_all" ON day_messages FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE day_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
