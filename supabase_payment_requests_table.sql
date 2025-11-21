-- Script SQL para crear la tabla payment_requests en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

CREATE TABLE IF NOT EXISTS payment_requests (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  payment_date DATE NOT NULL,
  payment_time TIME NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_email ON payment_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at DESC);

-- Habilitar Row Level Security (RLS) - Opcional
-- Si quieres que cualquier usuario pueda insertar y leer solicitudes de pago:
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos los usuarios insertar solicitudes
CREATE POLICY "Allow public insert on payment_requests"
  ON payment_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política para permitir a todos los usuarios leer todas las solicitudes
CREATE POLICY "Allow public select on payment_requests"
  ON payment_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política para permitir a todos los usuarios actualizar solicitudes
CREATE POLICY "Allow public update on payment_requests"
  ON payment_requests
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

