-- Guest reservations table
-- Run this in the Supabase SQL editor to create the table.

CREATE TABLE IF NOT EXISTS guest_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | paid
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up reservations by session
CREATE INDEX IF NOT EXISTS idx_guest_reservations_session_id ON guest_reservations(session_id);

-- Index for looking up reservations by email
CREATE INDEX IF NOT EXISTS idx_guest_reservations_email ON guest_reservations(email);

-- Index for webhook lookups by stripe session id
CREATE INDEX IF NOT EXISTS idx_guest_reservations_stripe_session ON guest_reservations(stripe_session_id);
