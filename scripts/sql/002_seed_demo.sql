-- Données de démo : « première inscription » + un message banc
-- Prérequis : avoir exécuté 001_mindstress_init.sql (npm run db:init).
-- Remplace demo-app par ton NEXT_PUBLIC_APP_ID Inforge si tu veux les mêmes clés qu’en prod.

INSERT INTO ms_app (app_id, label)
VALUES ('demo-app', 'MindStress démo')
ON CONFLICT (app_id) DO NOTHING;

INSERT INTO ms_user (app_id, user_uid)
VALUES ('demo-app', 'demo-user-uid-001')
ON CONFLICT (app_id, user_uid) DO NOTHING;

-- Horodatages ms (epoch)
INSERT INTO ms_private_profile (
  app_id,
  user_uid,
  full_name,
  phone,
  email,
  created_at_ms,
  updated_at_ms
)
VALUES (
  'demo-app',
  'demo-user-uid-001',
  'Pat Demo',
  '+225 07 00 00 00 00',
  'demo@example.com',
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
)
ON CONFLICT (app_id, user_uid) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  updated_at_ms = EXCLUDED.updated_at_ms;

INSERT INTO ms_public_profile (app_id, user_uid, pseudonym, updated_at_ms)
VALUES (
  'demo-app',
  'demo-user-uid-001',
  'Anonyme_Abidjan',
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
)
ON CONFLICT (app_id, user_uid) DO UPDATE
SET
  pseudonym = EXCLUDED.pseudonym,
  updated_at_ms = EXCLUDED.updated_at_ms;

INSERT INTO ms_user_metrics (
  app_id,
  user_uid,
  first_seen_at_ms,
  updated_at_ms,
  last_login_at_ms,
  last_logout_at_ms,
  login_count,
  logout_count,
  session_opens,
  last_active_day,
  active_streak_days,
  profile_completed_at_ms
)
VALUES (
  'demo-app',
  'demo-user-uid-001',
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  NULL,
  1,
  0,
  1,
  TO_CHAR(NOW() AT TIME ZONE 'Africa/Abidjan', 'YYYY-MM-DD'),
  1,
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
)
ON CONFLICT (app_id, user_uid) DO UPDATE
SET
  updated_at_ms = EXCLUDED.updated_at_ms,
  profile_completed_at_ms = EXCLUDED.profile_completed_at_ms;

INSERT INTO ms_progress_day (
  app_id,
  user_uid,
  day_id,
  gnan,
  somatic,
  updated_at_ms
)
VALUES (
  'demo-app',
  'demo-user-uid-001',
  (NOW() AT TIME ZONE 'Africa/Abidjan')::DATE,
  42,
  '{"tete": 1, "coeur": 0, "ventre": 1, "dos": 0}'::JSONB,
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
)
ON CONFLICT (app_id, user_uid, day_id) DO UPDATE
SET
  gnan = EXCLUDED.gnan,
  somatic = EXCLUDED.somatic,
  updated_at_ms = EXCLUDED.updated_at_ms;

INSERT INTO ms_banc_message (
  app_id,
  thread_id,
  author_uid,
  pseudonym,
  body,
  created_at_ms
)
VALUES (
  'demo-app',
  'place-publique',
  'demo-user-uid-001',
  'Anonyme_Abidjan',
  'Premier message test depuis le seed SQL — courage à toutes et tous.',
  (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);
