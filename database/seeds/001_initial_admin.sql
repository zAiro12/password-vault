-- Initial Admin User Seed
-- Password is hashed by bcrypt in the seed.js script
-- Default password is set via ADMIN_DEFAULT_PASSWORD environment variable
-- For security, set ADMIN_DEFAULT_PASSWORD in .env file before running seed
INSERT INTO users (username, email, password_hash, full_name, role, is_active, is_verified)
SELECT 'lucaairoldi', 'lucaairoldi92@gmail.com', 'PLACEHOLDER_HASH', 'Luca Airoldi', 'admin', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lucaairoldi92@gmail.com');
