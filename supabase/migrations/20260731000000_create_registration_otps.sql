-- Migration: Create registration_otps table with RLS and index
CREATE TABLE IF NOT EXISTS public.registration_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_registration_otps_email ON public.registration_otps(email);
CREATE INDEX IF NOT EXISTS idx_registration_otps_expires_at ON public.registration_otps(expires_at);

ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;

-- Deny all direct client/anon access; only service-role can query/manage OTPs
CREATE POLICY "Service role full access to registration_otps"
ON public.registration_otps
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
