# Password Vault

A secure password management application built with a modern monorepo architecture.

## Project Structure

```
password-vault/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── config/   # Database and configuration
│   │   ├── routes/   # API route handlers
│   │   └── index.js  # Express server
│   ├── .env.example  # Environment variables template
│   └── package.json
├── frontend/         # Vue 3 + Vite SPA
│   ├── src/
│   │   ├── views/    # Page components
│   │   ├── router/   # Vue Router configuration
│   │   └── App.vue   # Main app component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json      # Root workspace configuration
```

## Features

### Backend
- REST API built with Express.js
- **MySQL 8.0+ database** with complete schema:
  - Users (with bcrypt password hashing)
  - Clients (business customers)
  - Resources (servers, VMs, databases, SaaS)
  - Credentials (AES-256-CBC encrypted)
  - User-Client permissions
  - Audit logging (with JSON metadata)
- Database migrations with idempotent execution
- API routes for:
  - Authentication (`/api/auth`)
  - Clients management (`/api/clients`)
  - Resources management (`/api/resources`)
  - Credentials management (`/api/credentials`)
  - Audit logging (`/api/audit-log`)
- Connection pooling with automatic retry logic
- All configuration via `.env` files (no hardcoded secrets)
- **CORS configured** for frontend communication (see [CORS_SETUP.md](./CORS_SETUP.md))

### Frontend
- Vue 3 with Composition API
- Vue Router for navigation
- Pages:
  - Login page
  - Dashboard with stats overview
  - Client detail page
- Modern, responsive UI
- API proxy configured for backend communication

## Database

**Database System:** MySQL 8.0 or higher

**Key Features:**
- UTF-8 MB4 encoding (full Unicode support)
- InnoDB engine with ACID compliance
- Foreign key constraints with CASCADE/SET NULL
- Comprehensive indexes for performance
- Encrypted credential storage (AES-256-CBC)
- Password hashing with bcrypt (10 rounds)
- Audit logging with JSON metadata
- UTC timezone for all timestamps

**Tables:**
1. `users` - System users (admin, technician, viewer roles)
2. `clients` - Business clients
3. `resources` - IT resources (servers, VMs, databases, SaaS)
4. `credentials` - Encrypted credentials
5. `user_client_permissions` - Access control
6. `audit_log` - Activity tracking
7. `migrations` - Migration tracking

## Getting Started

### Prerequisites
- Node.js 18+ installed
- **MySQL 8.0+ database server** (YOU need to install this - see below)
- npm or yarn

### ⚠️ IMPORTANTE: Database Hosting

**IL DATABASE NON È INCLUSO!** Devi installare e configurare MySQL sul tuo computer o server.

📖 **Per istruzioni dettagliate sull'installazione di MySQL, consulta:**
👉 **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Guida completa in italiano

**Opzioni:**
- 💻 **Sviluppo locale:** MySQL sul tuo computer (per iniziare)
- 🏢 **Server interno:** MySQL su Raspberry Pi o server nella tua rete
- ☁️ **Cloud:** MySQL su AWS, Google Cloud, Azure, DigitalOcean
- 🐳 **Docker:** MySQL in container Docker

### Quick Start - MySQL Setup

**Se non hai MySQL installato:**

```bash
# Ubuntu/Debian
sudo apt install mysql-server

# macOS
brew install mysql
brew services start mysql

# Windows - Scarica da:
# https://dev.mysql.com/downloads/installer/

# Docker (qualsiasi piattaforma)
docker run --name password-vault-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=password_vault \
  -p 3306:3306 -d mysql:8.0
```

**Verifica che MySQL sia in esecuzione:**
```bash
mysql --version
mysql -u root -p  # Dovresti riuscire a connetterti
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd password-vault
```

2. Install all dependencies:
```bash
npm install
```

This will install dependencies for both backend and frontend workspaces.

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Copy `.env.example` to `.env` and configure your database:
```bash
cp .env.example .env
```

3. **Edit `.env` with your configuration:**
```env
# Database Configuration (MySQL 8.0+)
# ⚠️ Assicurati che MySQL sia installato e in esecuzione!
DB_HOST=localhost              # o IP del tuo server MySQL
DB_PORT=3306
DB_USER=your_user              # crea un utente dedicato
DB_PASSWORD=your_secure_password
DB_NAME=password_vault

# Admin User (created during first migration)
ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=your_secure_admin_password_here
ADMIN_DEFAULT_EMAIL=admin@yourdomain.com

# Encryption Key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_generated_64_char_hex_key_here

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_here
```

**⚠️ SECURITY NOTES:**
- Never commit your `.env` file to version control
- Use strong, unique passwords for all credentials
- Generate secure random keys for ENCRYPTION_KEY and JWT_SECRET
- Change admin credentials immediately after first login

4. **Create the database and user in MySQL:**
```bash
mysql -u root -p
```
```sql
-- Crea il database
CREATE DATABASE password_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crea un utente dedicato (RECOMMENDED)
CREATE USER 'vault_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Assegna i permessi
GRANT ALL PRIVILEGES ON password_vault.* TO 'vault_user'@'localhost';
FLUSH PRIVILEGES;

-- Verifica
SHOW DATABASES LIKE 'password_vault';
EXIT;
```

**📖 Per istruzioni più dettagliate:** vedi [DATABASE_SETUP.md](./DATABASE_SETUP.md)

5. **Run database migrations** to create all tables and seed initial data:
```bash
npm run migrate
```

This will:
- Create all required tables (users, clients, resources, credentials, user_client_permissions, audit_log)
- Insert a default admin user (username from ADMIN_DEFAULT_USERNAME, password from ADMIN_DEFAULT_PASSWORD)
- Add sample clients and resources for testing
- Track executed migrations to prevent re-running

**✅ Expected output:**
```
✓ Connected to database successfully
✓ Migration 001_initial_schema.sql executed successfully
✓ Migration 002_seed_initial_data.sql executed successfully
✓ All migrations completed successfully!
```

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

6. **Verify the database setup**:
```bash
mysql -u your_user -p password_vault -e "SHOW TABLES;"
```

You should see:
- audit_log
- clients
- credentials
- migrations
- resources
- user_client_permissions
- users

### Frontend Setup (Optional)

The frontend uses Vite's proxy for API requests in development mode. For production or custom configurations:

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Copy `.env.example` to `.env` (optional - only needed for custom configuration):
```bash
cp .env.example .env
```

3. Configure environment variables if needed (defaults work for standard setup):
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

### Running the Application

#### Development Mode

Run both backend and frontend in development mode:
```bash
npm run dev
```

Or run them separately:

**Backend only:**
```bash
npm run dev:backend
```
Backend will run on `http://localhost:3000`

**Frontend only:**
```bash
npm run dev:frontend
```
Frontend will run on `http://localhost:5173`

#### Production Build

Build both projects:
```bash
npm run build
```

Or build them separately:
```bash
npm run build:backend
npm run build:frontend
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/verify`
- **Clients**: `/api/clients` (GET, POST, PUT, DELETE)
- **Resources**: `/api/resources` (GET, POST, PUT, DELETE)
- **Credentials**: `/api/credentials` (GET, POST, PUT, DELETE)
- **Audit Log**: `/api/audit-log` (GET, POST)
- **Health Check**: `/health`

## Frontend Routes

- `/` - Redirects to login
- `/login` - Login page
- `/dashboard` - Dashboard with stats and client list
- `/client/:id` - Client detail page with resources and credentials

## Development Notes

- The frontend Vite dev server proxies `/api` requests to the backend (`http://localhost:3000`)
- Backend uses ES modules (`"type": "module"`)
- No authentication/authorization is implemented yet - all routes are placeholders
- No encryption is implemented yet - this is a clean structural foundation

### Security Notes

- **Development dependencies**: There are known moderate security vulnerabilities in Vite 5.x (esbuild). These only affect the development server and do not impact production builds. To fully resolve, upgrade to Vite 6+ when ready (breaking change).
- The development server should only be run in trusted environments

## 🚨 Troubleshooting

### CORS and Network Errors

**Error: "XMLHttpRequest cannot load... due to access control checks"**

This is a CORS (Cross-Origin Resource Sharing) error. See the complete guide:
👉 **[CORS_SETUP.md](./CORS_SETUP.md)** - Detailed CORS configuration and troubleshooting

**Quick fix:**
1. Ensure backend server is running on port 3000
2. Ensure frontend dev server is running on port 5173
3. The CORS configuration in `backend/src/index.js` already allows these origins
4. Clear browser cache and restart both servers

### Database Connection Issues

**Error: "Can't connect to MySQL server"**

MySQL non è in esecuzione. Avvia il servizio:
```bash
# Linux
sudo systemctl start mysql

# macOS
brew services start mysql

# Windows
net start MySQL80

# Docker
docker start password-vault-mysql
```

**Error: "Access denied for user"**

Credenziali errate nel file `.env`. Verifica:
1. Username e password corretti
2. L'utente esiste in MySQL
3. L'utente ha i permessi sul database

**Error: "Unknown database 'password_vault'"**

Il database non esiste. Crealo:
```sql
CREATE DATABASE password_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Error: "Migration failed" durante `npm run migrate`**

1. Verifica che MySQL sia in esecuzione
2. Verifica le credenziali nel `.env`
3. Controlla i log di MySQL per errori specifici

### Common Setup Issues

**Node.js version mismatch**
```bash
node --version  # Deve essere 18+
npm install -g n
sudo n 18
```

**Port already in use (3000 o 5173)**
```bash
# Trova il processo
lsof -i :3000
kill -9 <PID>

# O usa porte diverse nel .env
PORT=3001
```

**MySQL user doesn't have permissions**
```sql
GRANT ALL PRIVILEGES ON password_vault.* TO 'vault_user'@'localhost';
FLUSH PRIVILEGES;
```

### Need More Help?

📖 **Guida completa:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- Installazione MySQL passo-passo
- Configurazione per diversi scenari
- Troubleshooting avanzato
- FAQ e best practices

## Deployment

The frontend can be automatically deployed to GitHub Pages for testing. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Start:**
- Push to `main` branch to trigger automatic deployment
- The UI will be available at: `https://zairo12.github.io/password-vault/`
- Version tags are created automatically based on `frontend/package.json`

## Next Steps

Future enhancements to be implemented:
- [ ] Implement proper authentication with JWT
- [ ] Add password encryption/decryption
- [ ] Create database schema and migrations
- [ ] Implement CRUD operations for all entities
- [ ] Add form validation
- [ ] Implement proper error handling
- [ ] Add unit and integration tests
- [ ] Add API documentation (Swagger/OpenAPI)

## License

ISC
# Company Password Vault

Applicazione interna per la gestione centralizzata e sicura delle credenziali di clienti, server, VM, database e servizi SaaS, pensata per i tecnici dell’azienda.

> Progetto proprietario, tutti i diritti riservati. Nessun uso, modifica o ridistribuzione è consentito senza consenso scritto dell’autore.

---

## Obiettivi del progetto

- Tenere tutte le credenziali dei clienti in un unico posto sicuro e affidabile.
- Evitare che password e segreti siano salvati in chiaro (end‑to‑end encryption lato client).
- Consentire a ogni tecnico di accedere solo ai clienti per cui è abilitato.
- Tracciare gli eventi importanti: login, creazione/modifica/eliminazione di dati, gestione permessi.

---

## Architettura

Il progetto è organizzato come monorepo con due applicazioni separate:

- `backend/` – API REST in Node.js (Express) con MySQL come database.
- `frontend/` – SPA in Vue 3 (Vite) che consuma le API del backend.

Entrambe le parti usano file `.env` locali per la configurazione (non committati).  
Deploy previsto su Raspberry Pi con reverse proxy (es. Nginx/Apache) e HTTPS abilitato.

Struttura ad alto livello:

```text
password-vault/
  backend/
    src/
    package.json
    .env.example
  frontend/
    src/
    package.json
    .env.example
  .gitignore
  README.md
