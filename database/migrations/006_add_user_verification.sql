-- Add is_verified field to users table to support admin approval workflow
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false AFTER is_active;

-- Add index for querying pending users
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_is_verified (is_verified);

-- Add approved_by and approved_at fields to track who approved the user
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INT NULL AFTER is_verified;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved_by;

-- Add foreign key constraint for approved_by
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
