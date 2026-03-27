-- MindStress — schéma PostgreSQL (miroir logique Firestore / Inforge)
-- Exécuter avec : npm run db:init (voir scripts/run-pg.cjs)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Tenant (équivalent appId Inforge / NEXT_PUBLIC_APP_ID)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_app (
  app_id TEXT PRIMARY KEY,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Utilisateur (UID Firebase Auth — anonyme ou autre)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_user (
  app_id TEXT NOT NULL REFERENCES ms_app (app_id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, user_uid)
);

CREATE INDEX IF NOT EXISTS idx_ms_user_uid ON ms_user (user_uid);

-- ---------------------------------------------------------------------------
-- Profil privé (inscription formulaire)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_private_profile (
  app_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at_ms BIGINT NOT NULL,
  updated_at_ms BIGINT NOT NULL,
  PRIMARY KEY (app_id, user_uid),
  FOREIGN KEY (app_id, user_uid) REFERENCES ms_user (app_id, user_uid) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Pseudonyme public (Banc public)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_public_profile (
  app_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  pseudonym TEXT NOT NULL,
  updated_at_ms BIGINT NOT NULL,
  PRIMARY KEY (app_id, user_uid),
  FOREIGN KEY (app_id, user_uid) REFERENCES ms_user (app_id, user_uid) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Métriques agrégées (document metrics/main)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_user_metrics (
  app_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  first_seen_at_ms BIGINT NOT NULL,
  updated_at_ms BIGINT NOT NULL,
  last_login_at_ms BIGINT NOT NULL,
  last_logout_at_ms BIGINT,
  login_count INTEGER NOT NULL DEFAULT 0,
  logout_count INTEGER NOT NULL DEFAULT 0,
  session_opens INTEGER NOT NULL DEFAULT 0,
  last_active_day TEXT NOT NULL,
  active_streak_days INTEGER NOT NULL DEFAULT 0,
  profile_completed_at_ms BIGINT,
  PRIMARY KEY (app_id, user_uid),
  FOREIGN KEY (app_id, user_uid) REFERENCES ms_user (app_id, user_uid) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Progression quotidienne (Gnan + somatique)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_progress_day (
  app_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  day_id DATE NOT NULL,
  gnan SMALLINT NOT NULL CHECK (gnan >= 0 AND gnan <= 100),
  somatic JSONB NOT NULL,
  updated_at_ms BIGINT NOT NULL,
  PRIMARY KEY (app_id, user_uid, day_id),
  FOREIGN KEY (app_id, user_uid) REFERENCES ms_user (app_id, user_uid) ON DELETE CASCADE,
  CONSTRAINT somatic_shape CHECK (
    somatic ? 'tete'
    AND somatic ? 'coeur'
    AND somatic ? 'ventre'
    AND somatic ? 'dos'
  )
);

-- ---------------------------------------------------------------------------
-- Banc public
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ms_banc_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  app_id TEXT NOT NULL REFERENCES ms_app (app_id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL DEFAULT 'place-publique',
  author_uid TEXT NOT NULL,
  pseudonym TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at_ms BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_banc_app_created ON ms_banc_message (app_id, created_at_ms);
