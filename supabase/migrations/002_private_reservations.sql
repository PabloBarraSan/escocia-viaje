-- Reservas privadas para el grupo familiar.
-- Ejecutar en el SQL Editor de Supabase y sustituir los correos de ejemplo.

CREATE TABLE IF NOT EXISTS document_access (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_check_own_document_access"
ON document_access
FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- Bucket privado. Los PDF se suben desde el panel de Supabase Storage.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reservas',
  'reservas',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "family_can_read_reservations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'reservas'
  AND EXISTS (
    SELECT 1
    FROM public.document_access
    WHERE lower(document_access.email) = lower(auth.jwt() ->> 'email')
  )
);

-- Añade aquí los cinco correos y ejecuta estas líneas:
INSERT INTO document_access (email)
VALUES ('familia@escocia.local')
ON CONFLICT (email) DO NOTHING;
