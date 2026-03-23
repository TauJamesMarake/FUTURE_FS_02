-- ============================================================
-- Client Lead Management System — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- LEADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  company     TEXT,
  source      TEXT        DEFAULT 'website'
                          CHECK (source IN ('website','referral','ad','social','other')),
  status      TEXT        DEFAULT 'new'
                          CHECK (status IN ('new','contacted','converted')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================================
-- NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note_text   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  TEXT        DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);

-- ============================================================
-- IMPORTANT: Disable Row Level Security so the service role key
-- can read/write freely. (RLS is the #1 cause of silent 
-- "fetch failed" / empty results when using the service key.)
-- ============================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SAMPLE DATA (remove in production)
-- ============================================================
INSERT INTO leads (name, email, phone, company, source, status, created_at) VALUES
  ('Alice Johnson',  'alice@techcorp.com',   '+1-555-0101', 'TechCorp',     'website',  'new',       NOW() - INTERVAL '1 day'),
  ('Bob Martinez',   'bob@startupx.io',      '+1-555-0102', 'StartupX',     'referral', 'contacted', NOW() - INTERVAL '3 days'),
  ('Carol White',    'carol@designco.com',   '+1-555-0103', 'Design Co',    'ad',       'converted', NOW() - INTERVAL '7 days'),
  ('David Kim',      'david@cloudbase.net',  '+1-555-0104', 'CloudBase',    'social',   'new',       NOW() - INTERVAL '2 days'),
  ('Eva Patel',      'eva@innovate.io',      '+1-555-0105', 'Innovate Inc', 'website',  'contacted', NOW() - INTERVAL '5 days'),
  ('Frank Chen',     'frank@buildsmart.com', '+1-555-0106', 'BuildSmart',   'referral', 'new',       NOW() - INTERVAL '1 hour'),
  ('Grace Nguyen',   'grace@nextstep.co',    '+1-555-0107', 'NextStep Co',  'ad',       'new',       NOW() - INTERVAL '6 hours'),
  ('Henry Lopez',    'henry@bluewave.io',    '+1-555-0108', 'BlueWave',     'website',  'converted', NOW() - INTERVAL '10 days');
