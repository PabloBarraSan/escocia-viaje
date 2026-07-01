-- Direcciones de los alojamientos extraídas de las confirmaciones.
-- No se guardan números de reserva ni códigos PIN.

ALTER TABLE days ADD COLUMN IF NOT EXISTS lodging_name TEXT;
ALTER TABLE days ADD COLUMN IF NOT EXISTS lodging_address TEXT;
ALTER TABLE days ADD COLUMN IF NOT EXISTS lodging_phone TEXT;

UPDATE days
SET
  lodging_name = 'Drummond Condo',
  lodging_address = '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
  lodging_phone = '+44 7738 940365'
WHERE trip_id = (SELECT id FROM trips WHERE code = 'ESCOCIA2026')
  AND day_number IN (1, 2);

UPDATE days
SET
  lodging_name = 'Bayview Hostel',
  lodging_address = 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
  lodging_phone = '+44 1471 250300'
WHERE trip_id = (SELECT id FROM trips WHERE code = 'ESCOCIA2026')
  AND day_number IN (4, 5);

UPDATE days
SET
  lodging_name = '3 Bedroom Apartment - Loch Linnhe Views',
  lodging_address = '13 Ross Place, Fort William, PH33 6JZ, United Kingdom',
  lodging_phone = '+44 7708 008880'
WHERE trip_id = (SELECT id FROM trips WHERE code = 'ESCOCIA2026')
  AND day_number = 6;

UPDATE days
SET
  lodging_name = 'JOIVY Royal Mile',
  lodging_address = '149 Cowgate, Old Town, Edinburgh, EH1 1JT, United Kingdom',
  lodging_phone = '+44 7506 822438'
WHERE trip_id = (SELECT id FROM trips WHERE code = 'ESCOCIA2026')
  AND day_number = 7;
