# Come Deployare Password Vault - Risposta alla Tua Domanda

## La Tua Domanda

> "una domanda: io penso che il backend lo debba pubblicare da qualche parte, no? non è hostato su github pages, sbaglio?"

## La Risposta Breve

**Hai ragione al 100%! 🎯**

Il backend **NON può** essere hostato su GitHub Pages. GitHub Pages ospita solo file statici (HTML, CSS, JavaScript).

## Cosa È Già Fatto

✅ **Frontend deployato** → `https://zairo12.github.io/password-vault/`
- Automatico tramite GitHub Actions
- Ogni push su `main` fa il deploy

❌ **Backend NON deployato** → Devi farlo tu!
- Il backend è un'applicazione Node.js/Express
- Ha bisogno di un server vero
- Non può stare su GitHub Pages

## Cosa Devi Fare Ora

### Soluzione Più Semplice: Docker (5-10 minuti)

Se hai un computer o Raspberry Pi con Docker installato:

```bash
# 1. Clona il progetto
git clone https://github.com/zAiro12/password-vault.git
cd password-vault

# 2. Crea configurazione
cp .env.docker.example .env
nano .env  # Modifica password e chiavi

# 3. Avvia tutto (backend + database MySQL)
docker compose up -d

# 4. Esegui migrations
docker compose exec backend npm run migrate

# ✅ Fatto! Backend su http://localhost:3000
```

### Soluzione Cloud Gratuita: Railway.app (10 minuti)

Se preferisci non gestire un server:

1. Vai su [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Seleziona `password-vault`
5. Aggiungi database MySQL
6. Configura variabili d'ambiente
7. ✅ Fatto! Railway ti dà un URL tipo `https://password-vault-production-xxx.up.railway.app`

### Dopo aver Deployato il Backend

Devi dire al frontend dove trovare il backend.

**Modifica `.github/workflows/deploy-ui.yml`:**

```yaml
- name: Build frontend
  run: npm run build:frontend
  env:
    VITE_API_BASE_URL: https://TUO-BACKEND-URL-QUI  # ← Cambia questo!
```

Poi fai commit e push su `main` → GitHub Actions rifarà il deploy del frontend con la configurazione corretta!

## Architettura Completa

```
┌────────────────────────────┐
│  GitHub Pages (Frontend)   │
│  zairo12.github.io/        │
│  password-vault/           │
└────────────┬───────────────┘
             │
             │ API Calls (HTTPS)
             │
             ▼
┌────────────────────────────┐
│  Backend (Scegli dove)     │
│  - Docker su tuo server    │
│  - Railway.app (cloud)     │
│  - Render.com (cloud)      │
│  - DigitalOcean (VPS)      │
└────────────┬───────────────┘
             │
             │ MySQL Connection
             │
             ▼
┌────────────────────────────┐
│  MySQL Database            │
│  (Incluso con Docker)      │
└────────────────────────────┘
```

## Quale Soluzione Scegliere?

| Opzione | Ideale Per | Tempo Setup | Costo |
|---------|-----------|-------------|-------|
| **Docker locale** | Test veloce, hai già un server | 5-10 min | Gratis |
| **Railway.app** | Non vuoi gestire un server | 10 min | $5/mese gratis |
| **Raspberry Pi + Docker** | Uso aziendale, dati in azienda | 30 min | €30-50 una tantum |
| **DigitalOcean** | Produzione professionale | 45 min | $6/mese |

## La Mia Raccomandazione

### 🏠 Per Uso Aziendale (Password Sensibili):
👉 **Raspberry Pi + Docker** 
- I dati restano in azienda
- Controllo totale
- Costo: solo il Raspberry Pi (€30-50)
- Setup: ~30 minuti

### ☁️ Per Test/Demo:
👉 **Railway.app**
- Deploy in 10 minuti
- $5/mese gratis
- Zero configurazione server

## Documentazione Completa

📖 Ho creato 3 guide dettagliate per te:

1. **[QUICK_START_DEPLOYMENT_IT.md](./QUICK_START_DEPLOYMENT_IT.md)**
   - Guida passo-passo in italiano
   - Tutti i metodi di deployment
   - Esempi concreti

2. **[BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md)**
   - Documentazione tecnica completa
   - Configurazione Nginx, SSL, sicurezza
   - FAQ e troubleshooting

3. **README.md** (aggiornato)
   - Sezione deployment riscritta
   - Chiarisce frontend vs backend

## File Aggiunti per Te

Per rendere il deployment più facile, ho aggiunto:

- `docker-compose.yml` - Avvia tutto con un comando
- `backend/Dockerfile` - Containerizza il backend
- `.env.docker.example` - Template per configurazione
- `railway.json` - Configurazione per Railway.app
- `render.yaml` - Configurazione per Render.com

## TL;DR (Troppo Lungo; Non L'ho Letto)

1. **Hai ragione:** Backend non può stare su GitHub Pages
2. **Soluzione veloce:** Usa Docker (`docker compose up -d`)
3. **Soluzione cloud:** Usa Railway.app (10 min di setup)
4. **Leggi:** [QUICK_START_DEPLOYMENT_IT.md](./QUICK_START_DEPLOYMENT_IT.md) per guida completa
5. **Dopo il deploy:** Modifica `.github/workflows/deploy-ui.yml` con URL del backend

## Hai Bisogno di Aiuto?

Se hai domande o problemi durante il deployment, controlla:
- [QUICK_START_DEPLOYMENT_IT.md](./QUICK_START_DEPLOYMENT_IT.md) - Troubleshooting
- [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md) - FAQ

Oppure apri una issue su GitHub! 🚀
