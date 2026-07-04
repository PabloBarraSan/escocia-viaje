-- Dades inicials del ODT "NOVA RUTA ESCOCIA"
-- Executar DESPRÉS de 001_schema.sql

DO $$
DECLARE
  v_trip_id UUID;
  d1 UUID; d2 UUID; d3 UUID; d4 UUID; d5 UUID; d6 UUID; d7 UUID; d8 UUID;
BEGIN
  INSERT INTO trips (title, code, car_rental_from, car_rental_to)
  VALUES ('Nova Ruta Escòcia', 'ESCOCIA2026', '2026-07-07', '2026-07-11')
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_trip_id;

  IF v_trip_id IS NULL THEN
    SELECT id INTO v_trip_id FROM trips WHERE code = 'ESCOCIA2026';
  END IF;

  DELETE FROM days WHERE trip_id = v_trip_id;

  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 1, '2026-07-05', 'Diumenge 5 juliol', 'Edimburg', 'city', 'Nit a Edimburg', 55.9533, -3.1883, 1) RETURNING id INTO d1;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 2, '2026-07-06', 'Dilluns 6 juliol', 'Edimburg', 'city', 'Nit a Edimburg', 55.9533, -3.1883, 2) RETURNING id INTO d2;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 3, '2026-07-07', 'Dimarts 7 juliol', 'Inverness', 'road', 'Nit a Inverness / Loch Ness', 57.4778, -4.2247, 3) RETURNING id INTO d3;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 4, '2026-07-08', 'Dimecres 8 juliol', 'Illa de Skye', 'nature', 'Nit a la Illa de Skye', 57.4127, -6.1940, 4) RETURNING id INTO d4;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 5, '2026-07-09', 'Dijous 9 juliol', 'Illa de Skye', 'nature', 'Nit a la Illa de Skye', 57.4127, -6.1940, 5) RETURNING id INTO d5;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 6, '2026-07-10', 'Divendres 10 juliol', 'Fort William', 'nature', 'Nit a Fort William i voltants', 56.8198, -5.1052, 6) RETURNING id INTO d6;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 7, '2026-07-11', 'Dissabte 11 juliol', 'Edimburg', 'road', 'Nit a Edimburg', 55.9533, -3.1883, 7) RETURNING id INTO d7;
  INSERT INTO days (trip_id, day_number, date, label, base_city, type, lodging, lat, lng, sort_order)
  VALUES (v_trip_id, 8, '2026-07-12', 'Diumenge 12 juliol', 'Edimburg', 'city', 'Vol de tornada 19:00h', 55.9533, -3.1883, 8) RETURNING id INTO d8;

  -- Dia 1
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d1, '12:00', 'Arribada a Edimburg a migdia', 1),
    (d1, '20:00', 'Sopar prompte en un pub d''Edimburg', 2);

  -- Dia 2
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d2, '10:00', 'Visitar els llocs d''Edimburg', 1);

  -- Dia 3
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d3, '09:00', 'Agafem el cotxe cap amunt', 1),
    (d3, '10:30', 'Parada: The Kelpies, Falkirk', 2),
    (d3, '12:00', 'Parada: Stirling Castle', 3),
    (d3, '13:30', 'Parada: Perth', 4),
    (d3, '14:00', 'Dinar de pícnic de camí', 5),
    (d3, '18:00', 'Arribada a Inverness / Loch Ness', 6);

  -- Dia 4
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d4, '09:00', 'De camí cap a la Illa de Skye', 1),
    (d4, '15:00', 'Caminata per la vesprada', 2),
    (d4, '20:00', 'Sopar i nit a la illa', 3);

  -- Dia 5
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d5, '10:00', 'Dia complet a la Illa de Skye', 1),
    (d5, '10:00', 'Rutes a peu o en cotxe — ja elegim algunes', 2);

  -- Dia 6
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d6, '10:00', 'Anem cap a Fort William i voltants', 1);

  -- Dia 7
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d7, '09:00', 'Eixida de Fort William cap a Edimburg', 1),
    (d7, '11:00', 'Parada: Glencoe', 2),
    (d7, '19:00', 'Sopar a Edimburg i tornar el cotxe', 4);

  -- Dia 8
  INSERT INTO activities (day_id, time, text, sort_order) VALUES
    (d8, '10:00', 'Mig dia a Edimburg', 1),
    (d8, '12:00', 'Esmorzar / dinar a Edimburg', 2),
    (d8, '15:00', 'Cap a l''aeroport', 3),
    (d8, '19:00', 'Vol de tornada', 4);

  -- Notes buides per a cada dia
  INSERT INTO day_notes (day_id, text) VALUES
    (d1, ''), (d2, ''), (d3, ''), (d4, ''), (d5, ''), (d6, ''), (d7, ''), (d8, '');

  -- Info general
  INSERT INTO trip_info (trip_id, key, value) VALUES
    (v_trip_id, 'nits_edimburg', '2 nits Edimburg (5 i 6 juliol) + 1 nit (11 juliol)'),
    (v_trip_id, 'nits_inverness', '1 nit Inverness (7 juliol)'),
    (v_trip_id, 'nits_skye', '2 nits Illa de Skye (8 i 9 juliol)'),
    (v_trip_id, 'nits_fort_william', '1 nit Fort William (10 juliol)'),
    (v_trip_id, 'cotxe', 'Lloguer cotxe dies 7, 8, 9, 10 i 11 (5 dies total)'),
    (v_trip_id, 'ruta_cotxe', 'Dia 7: Edimburg → Inverness | Dia 8: Inverness → Skye | Dia 10: Skye → Fort William | Dia 11: Fort William → Edimburg')
  ON CONFLICT (trip_id, key) DO UPDATE SET value = EXCLUDED.value;

  -- Checklist inicial
  DELETE FROM checklist_items WHERE trip_id = v_trip_id;
  INSERT INTO checklist_items (trip_id, text, sort_order) VALUES
    (v_trip_id, 'Passaport / DNI', 1),
    (v_trip_id, 'Targetes i efectiu (£)', 2),
    (v_trip_id, 'Adaptador enchufe UK', 3),
    (v_trip_id, 'Impermeable i bambes', 4),
    (v_trip_id, 'Reserva cotxe confirmada', 5),
    (v_trip_id, 'Reserves allotjament', 6),
    (v_trip_id, 'Assegurança de viatge', 7);

  -- Idees Skye inicials
  DELETE FROM ideas WHERE trip_id = v_trip_id;
  INSERT INTO ideas (trip_id, text, author) VALUES
    (v_trip_id, 'Old Man of Storr', 'Itinerari'),
    (v_trip_id, 'Fairy Pools', 'Itinerari'),
    (v_trip_id, 'Neist Point', 'Itinerari'),
    (v_trip_id, 'Quiraing', 'Itinerari');

END $$;
