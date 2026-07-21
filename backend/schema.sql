-- Sezame MVP — PostgreSQL schema (v1)
-- Run with: npm run db:migrate

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (students, recruiters, admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'recruiter', 'admin')),
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  name TEXT DEFAULT '',
  avatar TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  recruiter_status TEXT CHECK (recruiter_status IN ('pending', 'verified', 'rejected')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Add columns that may be missing from a previous migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Email verification tokens (US-01)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens (token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens (user_id);

-- Add columns that may be missing from a previous migration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS field_of_study TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_history JSONB NOT NULL DEFAULT '[]';

-- Student profiles (created empty on register for students — US-03 will fill)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  title TEXT,
  city TEXT,
  education TEXT,
  school TEXT,
  field_of_study TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  education_history JSONB NOT NULL DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  completion_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Achievements (portfolio — US-03)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE achievements ADD COLUMN IF NOT EXISTS project_url TEXT;

ALTER TABLE offers ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Companies (recruiters — US-09)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT,
  city TEXT,
  description TEXT,
  verification_doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offers (US-05 / US-06)
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('employment', 'freelance')),
  contract_type TEXT,
  city TEXT NOT NULL,
  work_mode TEXT,
  sector TEXT,
  min_salary INTEGER NOT NULL,
  max_salary INTEGER NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'disabled', 'expired')),
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications (US-07 / US-08)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'viewed', 'in_review', 'rejected', 'accepted')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (offer_id, profile_id)
);

CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications (US-11)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports / moderation (US-12)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('offer', 'profile')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh tokens (US-02)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);
