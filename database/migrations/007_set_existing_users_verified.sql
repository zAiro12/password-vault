-- Set is_verified=true for all existing active users who were created before migration 006
-- This ensures existing users can login after the is_verified field was added
-- The verification workflow only applies to new users created after this migration
UPDATE users SET is_verified = true WHERE is_active = true;
