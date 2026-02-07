# 🎨 Guida Completa Render.com - Password Vault Backend

## ⚙️ Configurazione Render.com - Risposta alle tue Domande

Ecco le impostazioni corrette per Render.com:

### ✅ Configurazione Base

| Campo | Valore | Note |
|-------|--------|------|
| **Name** | `password-vault` o `password-vault-backend` | Nome del servizio |
| **Language** | `Node` | ✓ Corretto |
| **Branch** | `main` | ✓ Corretto |
| **Region** | `Frankfurt (EU Central)` | ✓ Ottimo per l'Europa |
| **Root Directory** | `backend` | ✓ Corretto (senza `/` finale) |

### 🔨 Build Command

```bash
npm install
```

**Nota:** Il backend NON ha un processo di build. Nel `package.json` c'è:
```json
"build": "echo 'No build step required for backend'"
```

Quindi `npm install` è sufficiente. Non serve `npm run build`.

### 🚀 Start Command

```bash
npm start
```

Questo esegue il comando definito in `package.json`:
```json
"start": "node src/index.js"
```

## 📋 Riepilogo Configurazione Render.com

Copia questi valori esatti nel form di Render.com:

```
Name: password-vault-backend
Language: Node
Branch: main
Region: Frankfurt (EU Central)
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

## 🔐 Environment Variables (IMPORTANTE!)

Dopo aver creato il servizio, vai su **Environment** e aggiungi queste variabili:

### Variabili Obbligatorie

#### 1. Database Configuration

⚠️ **IMPORTANTE:** Render.com NON offre MySQL gratuito. Hai 2 opzioni:

**Opzione A: Usa PostgreSQL di Render (gratuito)**
- Crea un database PostgreSQL su Render
- ⚠️ Richiede modifiche al codice backend (da MySQL a PostgreSQL)

**Opzione B: Usa database MySQL esterno (RACCOMANDATO)**
- Usa un servizio MySQL esterno come:
  - [PlanetScale](https://planetscale.com) - Free tier, MySQL-compatible
  - [Railway.app](https://railway.app) - Solo per il database MySQL
  - Il tuo server MySQL (Raspberry Pi, VPS)

```
DB_HOST=<il-tuo-mysql-host>
DB_PORT=3306
DB_USER=<username>
DB_PASSWORD=<password>  # Marca come "secret"
DB_NAME=password_vault
```

#### 2. Node Environment

```
NODE_ENV=production
PORT=3000
```

#### 3. Security Keys (CRITICI!)

⚠️ **IMPORTANTE:** Genera chiavi sicure e salvale! Non cambiarle mai!

**Generate JWT_SECRET:**
```bash
# Su Linux/Mac
openssl rand -base64 32

# Output esempio: FokvxW39wcz341rMY4D0Zbp09ZW1cxWPSm1gHUo2wMA=
```

**Generate ENCRYPTION_KEY:**
```bash
# Su Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output esempio: ea1ad02dfa62df2183c9d336c7ee50034247c1a19759e98ead168b346fa3e321
```

Aggiungi a Render:
```
JWT_SECRET=<la-tua-chiave-generata>  # Marca come "secret"
ENCRYPTION_KEY=<la-tua-chiave-generata-64-char>  # Marca come "secret"
```

⚠️ **WARNING:** Se cambi queste chiavi:
- `JWT_SECRET` → Tutti gli utenti vengono disconnessi
- `ENCRYPTION_KEY` → Tutte le password criptate diventano illeggibili (PERDITA DATI!)

#### 4. Admin User

```
ADMIN_DEFAULT_USERNAME=lucaairoldi
ADMIN_DEFAULT_PASSWORD=<password-sicura>  # Marca come "secret"
ADMIN_DEFAULT_EMAIL=lucaairoldi92@gmail.com
```

### 📝 Lista Completa Environment Variables

```
NODE_ENV=production
PORT=3000

DB_HOST=<tuo-mysql-host>
DB_PORT=3306
DB_USER=<username>
DB_PASSWORD=<password>
DB_NAME=password_vault

JWT_SECRET=<generato-con-openssl>
ENCRYPTION_KEY=<generato-con-node-64-char-hex>

ADMIN_DEFAULT_USERNAME=lucaairoldi
ADMIN_DEFAULT_PASSWORD=<password-sicura>
ADMIN_DEFAULT_EMAIL=lucaairoldi92@gmail.com
```

## 🗄️ Opzioni per il Database MySQL

### Opzione 1: PlanetScale (CONSIGLIATO per Render.com)

[PlanetScale](https://planetscale.com) offre MySQL serverless gratuito.

1. Crea account su planetscale.com
2. Crea un nuovo database
3. Ottieni le credenziali di connessione
4. Usa le credenziali in Render.com come `DB_HOST`, `DB_USER`, `DB_PASSWORD`

**Vantaggi:**
- Gratuito
- MySQL-compatible
- Serverless (scala automaticamente)
- Backup automatici

### Opzione 2: Railway.app (Solo per database)

1. Crea un progetto Railway solo con MySQL
2. Ottieni le credenziali
3. Usale in Render.com

**Vantaggi:**
- Vero MySQL
- $5/mese gratis
- Facile da configurare

### Opzione 3: Database Esterno

Usa il tuo MySQL su:
- Raspberry Pi (con DuckDNS per dominio)
- VPS (DigitalOcean, AWS)
- Server aziendale

**Vantaggi:**
- Controllo totale
- Dati in azienda
- Nessun limite

## 🔄 Dopo il Deploy

### 1. Esegui le Migrations

Il primo deploy **non esegue automaticamente le migrations**. Hai 2 opzioni:

**Opzione A: Shell di Render (raccomandato)**

Nel dashboard di Render:
1. Vai al tuo servizio
2. Click su **Shell** (nella barra superiore)
3. Esegui:
```bash
npm run migrate
```

**Opzione B: Localmente (se hai accesso al database)**

Sul tuo computer:
```bash
cd backend
# Configura .env con le credenziali del database Render
npm run migrate
```

### 2. Ottieni l'URL del Backend

Render ti darà un URL tipo:
```
https://password-vault-backend.onrender.com
```

Salvalo! Ti servirà per configurare il frontend.

### 3. Configura il Frontend

Aggiorna `.github/workflows/deploy-ui.yml`:

```yaml
- name: Build frontend
  run: npm run build:frontend
  env:
    VITE_API_BASE_URL: https://password-vault-backend.onrender.com
```

Poi:
```bash
git add .github/workflows/deploy-ui.yml
git commit -m "Configure frontend to use Render.com backend"
git push origin main
```

GitHub Actions farà automaticamente il re-deploy del frontend! 🎉

## ⚠️ Limitazioni del Piano Gratuito Render.com

### Free Tier Limits:

- ✅ 750 ore/mese gratis (abbastanza per uso continuo)
- ⚠️ **Il servizio si spegne dopo 15 minuti di inattività**
- ⚠️ **Riavvio lento (30-60 secondi)** alla prima richiesta dopo lo sleep
- ✅ 100 GB bandwidth/mese
- ✅ SSL automatico (HTTPS)

### Come Funziona lo Sleep:

1. Nessuna richiesta per 15 minuti → Server va in sleep
2. Prima richiesta dopo lo sleep → Attesa 30-60 secondi
3. Richieste successive → Veloci (server sveglio)

### Soluzioni per Evitare lo Sleep:

**Opzione A: Ping periodico (semplice)**

Usa un servizio come [UptimeRobot](https://uptimerobot.com) (gratuito):
- Ping ogni 5 minuti su `https://tuo-backend.onrender.com/health`
- Mantiene il server sempre sveglio
- Gratis fino a 50 monitor

**Opzione B: Upgrade al piano Starter ($7/mese)**

- Niente sleep
- Server sempre attivo
- Più risorse

## 🐛 Troubleshooting

### Errore: "Application failed to respond"

**Causa:** Il server non si avvia correttamente.

**Soluzione:**
1. Vai su **Logs** nel dashboard Render
2. Cerca errori come "missing environment variable"
3. Verifica che tutte le variabili d'ambiente siano impostate

### Errore: "Cannot connect to database"

**Causa:** Credenziali database errate o database non accessibile.

**Soluzione:**
1. Verifica `DB_HOST`, `DB_USER`, `DB_PASSWORD`
2. Se usi database esterno, assicurati che accetti connessioni da Render
3. Controlla i firewall

### Errore: "Port already in use"

**Non dovrebbe succedere su Render.** Se succede:
- Render assegna automaticamente la porta
- Non usare `PORT=3000` hardcoded, usa `process.env.PORT`
- Il codice attuale è già corretto: `const PORT = process.env.PORT || 3000;`

### Il server si riavvia continuamente (CrashLoopBackOff)

**Causa:** Validation delle variabili d'ambiente fallisce.

**Soluzione:**
1. Il backend valida le env vars all'avvio
2. Controlla i log per vedere quale variabile manca
3. Aggiungi la variabile mancante in Environment

## 📊 Monitoraggio

### Health Check

Render monitora automaticamente `/health`:

```bash
# Testa che il backend sia attivo
curl https://password-vault-backend.onrender.com/health

# Risposta attesa:
{"status":"ok"}
```

### Logs

Per vedere i log in tempo reale:
1. Dashboard Render → Il tuo servizio
2. Click su **Logs**
3. Vedi output del server

## 💰 Costi Previsti

| Scenario | Costo |
|----------|-------|
| **Free tier + UptimeRobot** | €0/mese |
| **Free tier (con sleep)** | €0/mese |
| **Starter plan (no sleep)** | $7/mese (~€6.50) |

**+ Costi Database:**
- PlanetScale: Gratis (5 GB storage)
- Railway MySQL: $5/mese gratis poi pay-as-you-go
- Database proprio: Variabile

## ✅ Checklist Deploy

Prima di considerare il deploy completo:

- [ ] Servizio creato su Render con configurazione corretta
- [ ] Tutte le environment variables impostate
- [ ] Database MySQL configurato e accessibile
- [ ] Migrations eseguite (`npm run migrate`)
- [ ] Health check funziona (`/health` risponde `{"status":"ok"}`)
- [ ] Frontend configurato con URL del backend
- [ ] Test di login funziona dal frontend GitHub Pages

## 🎓 Confronto: Render vs Railway

| Feature | Render.com | Railway.app |
|---------|------------|-------------|
| **MySQL incluso** | ❌ No (solo PostgreSQL) | ✅ Sì |
| **Sleep gratis** | ⚠️ Sì (dopo 15 min) | ✅ No |
| **Free tier** | ✅ 750 ore/mese | ✅ $5/mese utilizzo |
| **Setup** | ⚠️ Serve MySQL esterno | ✅ Tutto incluso |
| **Velocità deploy** | 🟢 3-5 min | 🟢 2-4 min |

**Raccomandazione:** 
- **Render:** Se hai già un database MySQL o vuoi usare PlanetScale
- **Railway:** Se vuoi tutto incluso senza pensieri

## 🚀 Prossimi Passi

1. ✅ Completa la configurazione su Render con i valori sopra
2. ✅ Aggiungi tutte le environment variables
3. ✅ Fai il deploy (Render lo farà automaticamente)
4. ✅ Controlla i log per verificare che si avvii correttamente
5. ✅ Esegui `npm run migrate` dalla Shell di Render
6. ✅ Testa con `curl https://tuo-backend.onrender.com/health`
7. ✅ Configura il frontend con l'URL del backend
8. ✅ Testa l'applicazione completa!

## 📖 Risorse Utili

- [Render.com Docs](https://render.com/docs)
- [PlanetScale](https://planetscale.com) - MySQL serverless
- [UptimeRobot](https://uptimerobot.com) - Keep-alive gratuito
- [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md) - Altre opzioni di deploy

Buon deploy! 🎉
