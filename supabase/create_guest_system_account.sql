-- ════════════════════════════════════════════════════════════════
-- CREATE FITTRYBE GUEST SYSTEM ACCOUNT
-- Run this ONCE in Supabase SQL editor.
-- This creates a system user that all web guest bookings are tied to.
-- ════════════════════════════════════════════════════════════════

-- 1. Create system user in auth.users
INSERT INTO auth.users (
  id, email, role, aud,
  instance_id, created_at, updated_at,
  confirmation_sent_at, confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'guests@fittrybe.co.uk',
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000',
  now(), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Guest of FitTrybe"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create matching profile
INSERT INTO public.profiles (id, email, full_name, username, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'guests@fittrybe.co.uk',
  'Guest of FitTrybe',
  'fittrybe_guest',
  'https://api.multiavatar.com/fittrybe.png'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create wallet for the system user (needed for payment FK)
INSERT INTO public.wallets (user_id, balance_pence, pending_pence, total_earned, total_withdrawn)
VALUES ('00000000-0000-0000-0000-000000000001', 0, 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;
