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
- Placeholder routes for:
  - Authentication (`/api/auth`)
  - Clients management (`/api/clients`)
  - Resources management (`/api/resources`)
  - Credentials management (`/api/credentials`)
  - Audit logging (`/api/audit-log`)
- MySQL database integration (configured via `.env`)
- CORS enabled for frontend communication

### Frontend
- Vue 3 with Composition API
- Vue Router for navigation
- Pages:
  - Login page
  - Dashboard with stats overview
  - Client detail page
- Modern, responsive UI
- API proxy configured for backend communication

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MySQL database (for backend)
- npm or yarn

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

3. Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=password_vault
```

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
