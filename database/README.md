# Database Migration System

## Overview

This directory contains the database migration and seeding system for the Password Vault application. The migration system provides an automated, versioned approach to managing database schema changes with minimal manual intervention.

## Directory Structure

```
database/
├── migrations/          # SQL migration files (executed in order)
│   ├── 001_create_users_table.sql
│   ├── 002_create_clients_table.sql
│   ├── 003_create_resources_table.sql
│   ├── 004_create_credentials_table.sql
│   └── 005_create_migrations_table.sql
├── seeds/              # Initial data seed files
│   └── 001_initial_admin.sql
└── README.md           # This file
```

## Quick Start

### Running Migrations

Execute all pending migrations:

```bash
cd backend
npm run migrate
```

This will:
- Create all necessary database tables
- Track which migrations have been executed
- Skip already-executed migrations (idempotent)
- Display detailed progress output

### Seeding the Database

Insert initial data (admin user):

```bash
cd backend
npm run seed
```

This will:
- Create the default admin user with a hashed password
- Skip if the admin user already exists (idempotent)

### Setup (Migrations + Seeds)

Run both migrations and seeds in one command:

```bash
cd backend
npm run db:setup
```

### Reset Database (Development Only)

⚠️ **CAUTION**: This will delete all tables and data!

```bash
cd backend
npm run db:reset
```

This will:
- Prompt for confirmation (type "yes")
- Drop all database tables
- Optionally re-run migrations
- Optionally re-seed data

**Note**: Cannot be run in production (NODE_ENV=production)

## Environment Variables

The migration system reads configuration from the `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=password_vault

# Admin User (for seeding)
# ⚠️ SECURITY: Set a strong password and keep it secret!
# Never commit .env file with real credentials to version control
ADMIN_DEFAULT_PASSWORD=YourSecurePasswordHere
```

⚠️ **IMPORTANT**: Always set `ADMIN_DEFAULT_PASSWORD` in your `.env` file before running seeds. Never use default passwords in production.

## Default Admin Credentials

After running seeds, you can log in with:

- **Username**: `admin`
- **Email**: `admin@password-vault.local`
- **Password**: Value from `ADMIN_DEFAULT_PASSWORD` environment variable

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## Creating New Migrations

### Naming Convention

Migration files must follow this naming pattern:

```
XXX_descriptive_name.sql
```

Where:
- `XXX` is a sequential number (e.g., 001, 002, 003)
- Use underscores for spaces
- Use descriptive names

Examples:
- `006_add_user_preferences_table.sql`
- `007_add_email_column_to_clients.sql`

### Migration File Structure

Create a new `.sql` file in `database/migrations/`:

```sql
-- 006_add_user_preferences_table.sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Best Practices

1. **Use `IF NOT EXISTS`**: Make migrations idempotent where possible
2. **One logical change per file**: Keep migrations focused
3. **Test locally first**: Always test new migrations before committing
4. **Don't modify executed migrations**: Create new migrations instead
5. **Use transactions**: Complex migrations should use explicit transactions

## Database Schema

### Core Tables

1. **users** - System users (admin, technician, viewer)
2. **clients** - Business clients
3. **resources** - Servers, VMs, databases, SaaS accounts
4. **credentials** - Encrypted credentials for resources
5. **migrations** - Tracks executed migrations

### Relationships

```
users (1) ──→ (N) clients (created_by)
clients (1) ──→ (N) resources
resources (1) ──→ (N) credentials
users (1) ──→ (N) resources (created_by)
users (1) ──→ (N) credentials (created_by)
```

## Migration Tracking

The `migrations` table tracks which migrations have been executed:

```sql
CREATE TABLE migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

Each migration is recorded when successfully executed, preventing duplicate runs.

## How It Works

### Migration Process

1. **Connect** to database using configuration from `.env`
2. **Ensure** migrations table exists
3. **Read** all `.sql` files from `database/migrations/`
4. **Sort** files alphabetically (ensuring correct order)
5. **Check** which migrations have already been executed
6. **Execute** pending migrations in order
7. **Record** each successful migration in the `migrations` table
8. **Rollback** on error (using transactions)

### Seed Process

1. **Connect** to database
2. **Read** seed files from `database/seeds/`
3. **Hash** admin password using bcrypt
4. **Replace** placeholders in SQL
5. **Execute** seed SQL
6. **Check** if data was inserted (0 rows = already exists)
7. **Display** default credentials if inserted

## Console Output Format

### Successful Migration

```
🗄️  Database Migration System
════════════════════════════════════════

✓ Connected to database
✓ Migrations table ready

📋 Found 5 migration files
   - 001_create_users_table.sql
   - 002_create_clients_table.sql
   - 003_create_resources_table.sql
   - 004_create_credentials_table.sql
   - 005_create_migrations_table.sql

⏭️  Skipping: 001_create_users_table.sql (already executed)
✓ Executed: 002_create_clients_table.sql
✓ Executed: 003_create_resources_table.sql
✓ Executed: 004_create_credentials_table.sql
✓ Executed: 005_create_migrations_table.sql

════════════════════════════════════════
✅ Migration completed successfully!
   Executed: 4 new migrations
   Skipped: 1 already executed
```

### Successful Seeding

```
🌱 Database Seeding
════════════════════════════════════════

✓ Connected to database

📋 Found 1 seed file(s)
   - 001_initial_admin.sql

Processing: 001_initial_admin.sql
✓ Seeded: 001_initial_admin.sql

════════════════════════════════════════
✅ Seeding completed successfully!
   Inserted: 1 seed(s)
   Skipped: 0 (already exists)

📝 Default Admin Credentials:
   Username: admin
   Password: (from ADMIN_DEFAULT_PASSWORD environment variable)
   ⚠️  Change password immediately after first login!
```

## Troubleshooting

### Connection Errors

**Problem**: `Error: connect ECONNREFUSED` or `ER_ACCESS_DENIED_ERROR`

**Solution**:
1. Verify MySQL is running: `mysql --version`
2. Check `.env` configuration (DB_HOST, DB_USER, DB_PASSWORD)
3. Test connection: `mysql -u root -p -h localhost`

### Migration Already Executed

**Problem**: Migration was executed but table not created

**Solution**:
1. Check if migration failed midway
2. Manually remove from migrations table:
   ```sql
   DELETE FROM migrations WHERE name = '001_create_users_table.sql';
   ```
3. Re-run migration

### Foreign Key Constraint Errors

**Problem**: `Cannot add foreign key constraint`

**Solution**:
1. Ensure parent table exists first
2. Check migration execution order
3. Verify column types match exactly

### Reset Not Working

**Problem**: `db:reset` doesn't drop all tables

**Solution**:
1. Check NODE_ENV is not "production"
2. Manually drop tables:
   ```sql
   SET FOREIGN_KEY_CHECKS = 0;
   DROP TABLE IF EXISTS credentials, resources, clients, users, migrations;
   SET FOREIGN_KEY_CHECKS = 1;
   ```

## Production Deployment

### First Deployment

1. Set environment variables on production server
2. Run migrations:
   ```bash
   npm run migrate
   ```
3. Run seeds:
   ```bash
   npm run seed
   ```
4. **Immediately change admin password** after first login

### Subsequent Deployments

1. Deploy code changes
2. Run migrations (idempotent - safe to run):
   ```bash
   npm run migrate
   ```
3. Seeds are typically not re-run (data already exists)

## Development Workflow

### Adding a New Feature

1. Create new migration file (e.g., `006_add_feature.sql`)
2. Test locally:
   ```bash
   npm run migrate
   ```
3. Commit migration file
4. Push to repository
5. Run on production after deployment

### Testing Changes

```bash
# Reset database
npm run db:reset

# Re-run migrations
npm run migrate

# Re-seed data
npm run seed

# Or all at once
npm run db:reset  # Choose "yes" for migrations and seeds
```

## Security Notes

1. **Never commit `.env`** with production credentials
2. **Change admin password** immediately after first login
3. **Use strong passwords** for ADMIN_DEFAULT_PASSWORD
4. **Restrict db:reset** to development environments only
5. **Use SSL/TLS** for production database connections
6. **Rotate credentials** regularly

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js mysql2 Package](https://www.npmjs.com/package/mysql2)
- [Bcrypt Password Hashing](https://www.npmjs.com/package/bcrypt)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review error messages carefully
3. Check database connectivity
4. Verify environment variables
5. Open an issue in the repository
