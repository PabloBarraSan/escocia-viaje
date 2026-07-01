-- Sugerencias colaborativas y gastos del viaje.

CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('comer', 'cenar', 'cafe', 'veure', 'passeig', 'compra', 'parada')),
  note TEXT NOT NULL DEFAULT '',
  maps_url TEXT,
  author TEXT NOT NULL,
  votes TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'selected', 'discarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID REFERENCES days(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  paid_by TEXT NOT NULL,
  participants TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_trip_day ON suggestions(trip_id, day_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggestions_all" ON suggestions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "expenses_all" ON expenses FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

INSERT INTO trip_info (trip_id, key, value)
SELECT id, key, ''
FROM trips
CROSS JOIN (VALUES
  ('vols'),
  ('matricula_cotxe'),
  ('telefon_emergencia'),
  ('asseguranca')
) AS practical(key)
WHERE code = 'ESCOCIA2026'
ON CONFLICT (trip_id, key) DO NOTHING;
