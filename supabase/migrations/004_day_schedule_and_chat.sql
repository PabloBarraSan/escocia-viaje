-- Duració d'activitats i xat per dia.

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0);

CREATE TABLE IF NOT EXISTS day_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_day_messages_day ON day_messages(day_id, created_at);

ALTER TABLE day_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_messages_all" ON day_messages FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE day_messages;
