-- This file will be processed by the seed script
-- Password will be hashed by bcrypt in the seed.js script
-- Default credentials: admin / Admin2026!SecureP@ss
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
SELECT 'admin', 'admin@password-vault.local', 'PLACEHOLDER_HASH', 'System Administrator', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
