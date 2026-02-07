# ⚡ Render.com - Risposta Rapida

## 🎯 Configurazione per Render.com

### Valori da Inserire nel Form:

```
┌─────────────────────────────────────────────────────┐
│ Name:              password-vault-backend           │
│ Language:          Node                             │
│ Branch:            main                             │
│ Region:            Frankfurt (EU Central)           │
│ Root Directory:    backend                          │
│ Build Command:     npm install                      │
│ Start Command:     npm start                        │
└─────────────────────────────────────────────────────┘
```

### ⚠️ Correzioni ai tuoi valori:

❌ **Root Directory:** NON usare `/backend/` (con slash)
✅ **Usa:** `backend` (senza slash)

❌ **Build Command:** NON usare `npm install; npm run build`
✅ **Usa:** `npm install` (il backend non ha build)

✅ **Start Command:** `npm start`

## 🔐 Environment Variables (Dopo il Deploy)

Vai su **Environment** nel dashboard Render e aggiungi:

### Obbligatorie:

```bash
# Database (usa MySQL esterno - PlanetScale consigliato)
DB_HOST=<il-tuo-mysql-host>
DB_PORT=3306
DB_USER=<username>
DB_PASSWORD=<password>        # Marca come "secret"
DB_NAME=password_vault

# Security (genera con i comandi sotto)
JWT_SECRET=<generato>         # Marca come "secret"
ENCRYPTION_KEY=<generato>     # Marca come "secret"

# Admin
ADMIN_DEFAULT_USERNAME=lucaairoldi
ADMIN_DEFAULT_PASSWORD=<password-sicura>  # Marca come "secret"
ADMIN_DEFAULT_EMAIL=lucaairoldi92@gmail.com

# Node
NODE_ENV=production
PORT=3000
```

### 🔑 Genera le Chiavi di Sicurezza:

```bash
# JWT_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **IMPORTANTE:** Salva queste chiavi! Non cambiarle mai o perderai i dati!

## 🗄️ Database MySQL

Render NON offre MySQL gratis. Usa:

**Opzione 1 (CONSIGLIATO):** [PlanetScale](https://planetscale.com)
- MySQL serverless gratuito
- Crea account → Crea database → Copia credenziali
- Usa le credenziali come `DB_HOST`, `DB_USER`, `DB_PASSWORD`

**Opzione 2:** [Railway.app](https://railway.app)
- Crea solo database MySQL
- $5/mese gratis

**Opzione 3:** Il tuo server MySQL
- Raspberry Pi / VPS

## ✅ Dopo il Deploy

### 1. Esegui le Migrations

Nel dashboard Render → Il tuo servizio → **Shell**:
```bash
npm run migrate
```

### 2. Testa il Backend

```bash
curl https://password-vault-backend.onrender.com/health
# Risposta attesa: {"status":"ok"}
```

### 3. Configura il Frontend

Aggiorna `.github/workflows/deploy-ui.yml`:

```yaml
- name: Build frontend
  run: npm run build:frontend
  env:
    VITE_API_BASE_URL: https://password-vault-backend.onrender.com
```

## ⚠️ Piano Gratuito

- ✅ Gratis per sempre
- ⚠️ Si spegne dopo 15 min di inattività
- ⚠️ Riavvio lento (30-60 sec) alla prima richiesta

**Soluzione:** Usa [UptimeRobot](https://uptimerobot.com) per mantenerlo sveglio (gratis)

## 📖 Guida Completa

Per tutti i dettagli, troubleshooting e opzioni:
👉 Leggi [RENDER_COM_SETUP.md](./RENDER_COM_SETUP.md)

---

## 📝 Checklist Veloce

- [ ] Configurazione Render con valori corretti
- [ ] Environment variables tutte impostate
- [ ] Database MySQL esterno configurato
- [ ] Deploy completato
- [ ] Migrations eseguite (`npm run migrate` dalla Shell)
- [ ] Health check funziona
- [ ] Frontend configurato con URL backend

🎉 Fatto!
