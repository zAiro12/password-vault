-- Set is_verified=true for all existing active users who were created before migration 006
-- This ensures existing users can login after the is_verified field was added
-- The verification workflow only applies to new users created after this migration
-- NOTE: This migration runs only once (tracked by migration system). New users created
-- after migration 007 will correctly follow the verification workflow (is_verified=false by default).
UPDATE users SET is_verified = true WHERE is_active = true;
