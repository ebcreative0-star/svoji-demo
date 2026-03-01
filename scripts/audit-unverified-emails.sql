-- SEC-02: Email Audit for OAuth Readiness
-- Run this in Supabase SQL Editor BEFORE enabling Google OAuth provider
-- If any rows return, clean them up before enabling OAuth
--
-- Why: Supabase automatic identity linking only works for accounts where
-- email_confirmed_at IS NOT NULL. Unverified accounts will create duplicates
-- when the same email signs in via Google OAuth.

SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email_confirmed_at IS NULL
  AND email IS NOT NULL
ORDER BY created_at DESC;

-- If results appear:
-- Option A: Delete test accounts (if they're just test data):
--   DELETE FROM auth.users WHERE id IN ('uuid1', 'uuid2');
-- Option B: Manually confirm (if real users):
--   UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'uuid';
-- Option C: Send re-verification emails via Supabase Dashboard > Authentication > Users
