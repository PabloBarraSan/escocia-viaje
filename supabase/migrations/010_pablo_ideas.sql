-- Idees de Pablo (valencià) per a cada dia del viatge.

DELETE FROM activities
WHERE kind = 'idea' AND updated_by = 'Pablo';

INSERT INTO activities (day_id, time, text, place_name, place_address, description, kind, votes, sort_order, updated_by)
SELECT d.id, NULL, v.text, v.place_name, v.place_address, v.description, 'idea', '{}', v.sort_order, 'Pablo'
FROM trips t
JOIN days d ON d.trip_id = t.id
JOIN (VALUES
  -- Dia 1 · Edimburg (arribada)
  (1, 'Passeig pel Grassmarket i Victoria Street', 'Grassmarket', 'Grassmarket, Edinburgh', 'A prop del Old Town, molt xulo per fer fotos sense planificar res', 51),
  (1, 'Sopar al The Bow Bar', 'The Bow Bar', '6 Victoria Street, Edinburgh', 'Pub amb menjar bo al Old Town, alternativa al sopar genèric', 52),
  -- Dia 2 · Edimburg
  (2, 'Museu Nacional d''Escòcia', 'National Museum of Scotland', 'Chambers Street, Edinburgh', 'Entrada de franc i perfecte si plou', 51),
  (2, 'Dinar a Oink', 'Oink', '34 Victoria Street, Edinburgh', 'Entrepans de porc rostit al Royal Mile, ràpid i barat', 52),
  -- Dia 3 · Ruta cap a Inverness
  (3, 'Cafeteria dins del castell de Stirling', 'Stirling Castle', 'Castle Esplanade, Stirling', 'Alternativa al dinar de pícnic si volem algo calent', 51),
  (3, 'Sopar a Fiddler''s Highland Restaurant', 'Fiddler''s Highland Restaurant', 'Castle Street, Inverness', 'Cuina escocesa al centre d''Inverness, bona opció per la nit', 52),
  -- Dia 4 · Camí cap a Skye
  (4, 'Parada al Eilean Donan Castle', 'Eilean Donan Castle', 'Dornie, Kyle of Lochalsh', 'Parada fotogènica clàssica de camí a l''illa', 51),
  (4, 'Sopar a The Clay Oven', 'The Clay Oven', 'The Old Post Office, Broadford', 'Indi al Broadford, a prop de l''allotjament', 52),
  -- Dia 5 · Skye
  (5, 'Dinar a Café Arriba', 'Café Arriba', 'Bank Street, Portree', 'Menjar amb vistes al port de Portree', 51),
  (5, 'Neist Point al cap de vesprada', 'Neist Point Lighthouse', 'Glendale, Isle of Skye', 'Far i posta de sol si el temps acompanya', 52),
  -- Dia 6 · Fort William
  (6, 'Caminata fins a Steall Falls', 'Steall Falls', 'Glen Nevis, Fort William', 'Ruta a peu preciosa, uns 90 min anada i tornada', 51),
  (6, 'Sopar a Crannog Seafood Restaurant', 'Crannog Seafood Restaurant', 'Town Pier, Fort William', 'Marisc al moll, reserva recomanada', 52),
  -- Dia 7 · Tornada cap a Edimburg
  (7, 'Dinar a Clachaig Inn', 'Clachaig Inn', 'Glencoe, Ballachulish', 'Pub mític de Glencoe amb vistes a les muntanyes', 51),
  (7, 'Visita ràpida al Kelvingrove Museum', 'Kelvingrove Art Gallery and Museum', 'Argyle Street, Glasgow', 'Si tenim una hora a Glasgow, mereix la pena i és de franc', 52),
  -- Dia 8 · Darrer dia
  (8, 'Brunch a Loudons Café', 'Loudons Café', '94b Fountainbridge, Edinburgh', 'Esmorzar de fi de viatge abans de l''aeroport', 51),
  (8, 'Darrer passeig per Stockbridge', 'Stockbridge', 'Stockbridge, Edinburgh', 'Barri tranquil per acabar el viatge sense presses', 52)
) AS v(day_number, text, place_name, place_address, description, sort_order)
  ON v.day_number = d.day_number
WHERE t.code = 'ESCOCIA2026';
