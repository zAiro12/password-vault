-- Add is_verified field to users table to support admin approval workflow
-- Add approved_by and approved_at fields to track who approved the user
ALTER TABLE users 
  ADD COLUMN is_verified BOOLEAN DEFAULT false AFTER is_active,
  ADD COLUMN approved_by INT NULL AFTER is_verified,
  ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
  ADD INDEX idx_is_verified (is_verified),
  ADD CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
