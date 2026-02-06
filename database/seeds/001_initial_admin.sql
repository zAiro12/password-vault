-- Initial Admin User Seed
-- Password is hashed by bcrypt in the seed.js script
-- Default password is set via ADMIN_DEFAULT_PASSWORD environment variable
-- For security, set ADMIN_DEFAULT_PASSWORD in .env file before running seed
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
SELECT 'admin', 'admin@password-vault.local', 'PLACEHOLDER_HASH', 'System Administrator', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
