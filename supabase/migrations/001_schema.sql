-- Esquema per al viatge a Escòcia
-- Executar al SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Nova Ruta Escòcia',
  code TEXT NOT NULL UNIQUE DEFAULT 'ESCOCIA2026',
  car_rental_from DATE,
  car_rental_to DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  label TEXT NOT NULL,
  base_city TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'city',
  lodging TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  sort_order INT NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, day_number)
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  time TEXT,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS day_notes (
  day_id UUID PRIMARY KEY REFERENCES days(id) ON DELETE CASCADE,
  text TEXT DEFAULT '',
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, key)
);

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  votes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  author TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índexs
CREATE INDEX IF NOT EXISTS idx_days_trip ON days(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_day ON activities(day_id);
CREATE INDEX IF NOT EXISTS idx_ideas_trip ON ideas(trip_id);
CREATE INDEX IF NOT EXISTS idx_checklist_trip ON checklist_items(trip_id);

-- RLS: obert per a app privada amb codi compartit
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_all" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "days_all" ON days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "activities_all" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "day_notes_all" ON day_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "trip_info_all" ON trip_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ideas_all" ON ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "checklist_all" ON checklist_items FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE days;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE day_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_info;
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;
