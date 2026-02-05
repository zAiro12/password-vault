# Backend Deployment Guide

## ⚠️ IMPORTANTE: Il Backend NON può essere hostato su GitHub Pages!

**GitHub Pages può hostare SOLO file statici (HTML, CSS, JavaScript).** Il backend è un'applicazione Node.js/Express che richiede un server per essere eseguito.

### Perché GitHub Pages non funziona per il backend?

- ✅ GitHub Pages: File statici (HTML, CSS, JS) - **FRONTEND OK**
- ❌ GitHub Pages: Applicazioni Node.js, Python, database - **BACKEND NO**

Il backend ha bisogno di:
- Un server che esegue Node.js
- Una connessione a un database MySQL
- Capacità di gestire richieste API dinamiche
- Variabili d'ambiente e segreti

## Opzioni di Deployment per il Backend

### 1. 🐳 Docker (RACCOMANDATO - Più facile e portable)

**Vantaggi:**
- Setup più semplice e veloce
- Funziona ovunque (Raspberry Pi, VPS, cloud)
- Include database MySQL
- Isolamento e sicurezza
- Facile da aggiornare

**Setup con Docker Compose:**

```bash
# 1. Installa Docker e Docker Compose
# Su Raspberry Pi / Ubuntu:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose

# 2. Clona il repository
git clone https://github.com/zAiro12/password-vault.git
cd password-vault

# 3. Configura le variabili d'ambiente
cp .env.docker.example .env
nano .env  # Modifica con le tue credenziali

# 4. Avvia i containers
docker-compose up -d

# 5. Verifica che sia attivo
docker-compose ps
curl http://localhost:3000/health

# 6. Esegui le migrations (prima volta)
docker-compose exec backend npm run migrate

# 7. Visualizza i logs
docker-compose logs -f backend
```

**Gestione:**
```bash
# Stop
docker-compose down

# Restart
docker-compose restart

# Update (dopo pull del codice)
docker-compose down
git pull
docker-compose up -d --build

# Backup database
docker-compose exec mysql mysqldump -u vault_user -p password_vault > backup.sql
```

### 2. 🏠 Raspberry Pi / Server Locale (Setup manuale)

**Vantaggi:**
- Controllo totale
- Nessun costo mensile
- Dati rimangono in azienda
- Ideale per password aziendali

**Setup:**

```bash
# 1. Installa Node.js sul Raspberry Pi
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Installa MySQL
sudo apt install mysql-server

# 3. Clona il repository
git clone https://github.com/zAiro12/password-vault.git
cd password-vault/backend

# 4. Installa le dipendenze
npm install

# 5. Configura .env
cp .env.example .env
nano .env  # Modifica con le tue credenziali

# 6. Esegui le migrations
npm run migrate

# 7. Installa PM2 per mantenere il server attivo
sudo npm install -g pm2

# 8. Avvia il server
pm2 start src/index.js --name password-vault-backend
pm2 save
pm2 startup  # Segui le istruzioni per l'avvio automatico
```

**Configurazione Nginx (per HTTPS e reverse proxy):**

```nginx
server {
    listen 80;
    server_name tuodominio.duckdns.org;  # Usa DuckDNS per dominio gratuito

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Certificato SSL gratuito con Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tuodominio.duckdns.org
```

**Port forwarding sul router:**
- Porta 80 → Raspberry Pi IP:80
- Porta 443 → Raspberry Pi IP:443

### 3. ☁️ Railway.app (Gratuito per progetti piccoli)

**Vantaggi:**
- Deploy automatico da GitHub
- Database MySQL/PostgreSQL integrato
- HTTPS automatico
- Free tier: $5/mese di crediti gratuiti

**Setup:**

1. Vai su [railway.app](https://railway.app)
2. Collegati con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Seleziona `zAiro12/password-vault`
5. Aggiungi un servizio MySQL
6. Configura le variabili d'ambiente:

```env
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_USER=<railway-mysql-user>
DB_PASSWORD=<railway-mysql-password>
DB_NAME=railway
JWT_SECRET=<genera-con-openssl>
ENCRYPTION_KEY=<genera-con-node>
PORT=3000
NODE_ENV=production
```

7. Railway farà il deploy automatico!

**URL backend:** `https://password-vault-backend-production.up.railway.app`

### 4. 🎨 Render.com (Alternativa a Heroku)

**Vantaggi:**
- Free tier permanente (con limitazioni)
- Deploy da GitHub automatico
- Database PostgreSQL gratuito
- Certificati SSL automatici

**Setup:**

1. Vai su [render.com](https://render.com)
2. "New +" → "Web Service"
3. Collega il repository GitHub
4. Configurazione:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

5. Aggiungi un database PostgreSQL (free tier)
6. Configura le variabili d'ambiente nel dashboard

**Nota:** Se usi PostgreSQL invece di MySQL, dovrai modificare le query e il driver nel backend.

### 5. 💰 DigitalOcean / AWS / Azure (Professionale)

**Vantaggi:**
- Massima flessibilità
- Scalabilità
- Controllo completo

**Costi:**
- DigitalOcean Droplet: $6/mese
- AWS EC2 t2.micro: Free tier per 12 mesi, poi ~$10/mese
- Azure: Free tier limitato

**Setup generale (es. DigitalOcean):**

```bash
# Su droplet Ubuntu
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs mysql-server nginx certbot python3-certbot-nginx

# Configura firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# Deploy il backend (come per Raspberry Pi)
```

## Configurare il Frontend per il Backend Deployato

### Opzione 1: Durante il Build (Vite)

Nel workflow di GitHub Actions (`.github/workflows/deploy-ui.yml`), modifica la variabile d'ambiente:

```yaml
- name: Build frontend
  run: npm run build:frontend
  env:
    VITE_API_BASE_URL: https://tuo-backend-url.com  # URL del backend deployato
```

### Opzione 2: Runtime Configuration (più flessibile)

Crea un file `frontend/public/config.js`:

```javascript
window.APP_CONFIG = {
  apiBaseUrl: 'https://tuo-backend-url.com'
};
```

Modifica `frontend/src/plugins/axios.js`:

```javascript
const api = axios.create({
  baseURL: window.APP_CONFIG?.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  // ...
});
```

E includi in `frontend/index.html`:

```html
<head>
  <script src="/config.js"></script>
  <!-- ... -->
</head>
```

### Configurare CORS nel Backend

Assicurati che il backend permetta richieste dal frontend GitHub Pages.

In `backend/src/index.js`, verifica che sia presente:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  /^https:\/\/zairo12\.github\.io\/password-vault\/?$/  // ✓ Già configurato
];
```

## Architettura Finale

```
┌─────────────────────────────────────┐
│   Frontend (GitHub Pages)           │
│   https://zairo12.github.io/        │
│   password-vault/                   │
└──────────────┬──────────────────────┘
               │
               │ HTTPS API Calls
               ▼
┌─────────────────────────────────────┐
│   Backend (Scegli una opzione)      │
│   - Raspberry Pi + DuckDNS          │
│   - Railway.app                     │
│   - Render.com                      │
│   - DigitalOcean/AWS/Azure          │
└──────────────┬──────────────────────┘
               │
               │ MySQL Connection
               ▼
┌─────────────────────────────────────┐
│   MySQL Database                    │
│   (Stesso server o separato)        │
└─────────────────────────────────────┘
```

## Raccomandazioni per la Sicurezza

### 1. Usa HTTPS Ovunque

- Backend: Usa Nginx con Let's Encrypt o un provider che offre HTTPS automatico
- Frontend: GitHub Pages fornisce HTTPS automaticamente

### 2. Variabili d'Ambiente Sensibili

**NON committare mai nel repository:**
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- Password del database
- Credenziali API

Usa sempre file `.env` o segreti del provider di hosting.

### 3. Genera Chiavi Sicure

```bash
# JWT_SECRET (almeno 32 caratteri random)
openssl rand -base64 32

# ENCRYPTION_KEY (64 caratteri hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Limita Accesso al Database

- Crea un utente MySQL dedicato con solo i privilegi necessari
- Non usare `root` in produzione
- Abilita connessioni solo da IP autorizzati

### 5. Rate Limiting

Considera l'aggiunta di rate limiting al backend:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // max 100 richieste per IP
});

app.use('/api/', limiter);
```

## FAQ

### Q: Quanto costa hostare il backend?

**A:** Dipende dall'opzione scelta:
- Raspberry Pi: €30-100 una tantum + costi elettricità (minimo)
- Railway.app: Gratis fino a $5/mese di utilizzo
- Render.com: Gratis con limitazioni (server si spegne dopo 15 min di inattività)
- DigitalOcean: $6/mese
- AWS: Gratis per 12 mesi, poi ~$10/mese

### Q: Quale opzione scegliere?

**A:** Dipende dalle tue esigenze:
- **Uso interno aziendale con pochi utenti:** Raspberry Pi (più controllo, dati in azienda)
- **Prototipo/Demo:** Railway o Render (veloce da configurare)
- **Produzione con molti utenti:** DigitalOcean/AWS (più affidabile e scalabile)

### Q: Il database può essere separato dal backend?

**A:** Sì! Puoi:
- Usare un database cloud (es. PlanetScale, Railway Database)
- Mantenere MySQL su Raspberry Pi e backend su cloud
- Usare un servizio managed come AWS RDS

### Q: Come faccio il backup del database?

**A:**
```bash
# Backup manuale
mysqldump -u user -p password_vault > backup.sql

# Backup automatico (cron job ogni giorno alle 2 AM)
0 2 * * * mysqldump -u user -p password_vault > /backup/vault_$(date +\%Y\%m\%d).sql

# Restore
mysql -u user -p password_vault < backup.sql
```

### Q: Posso usare sia Raspberry Pi che cloud?

**A:** Sì! Puoi usare:
- Raspberry Pi come server principale (interno alla rete aziendale)
- Cloud come backup o per accesso esterno
- Load balancer per distribuire il traffico

## Risorse Utili

- [DuckDNS](https://www.duckdns.org/) - DNS dinamico gratuito
- [Let's Encrypt](https://letsencrypt.org/) - Certificati SSL gratuiti
- [Railway.app](https://railway.app) - Hosting gratuito
- [Render.com](https://render.com) - Hosting gratuito
- [PM2 Documentation](https://pm2.keymetrics.io/) - Process manager per Node.js

## Prossimi Passi

1. **Scegli una piattaforma** di deployment dal menu sopra
2. **Deploya il backend** seguendo le istruzioni specifiche
3. **Ottieni l'URL del backend** deployato (es. `https://tuo-backend.railway.app`)
4. **Configura il frontend** per usare l'URL del backend (modifica workflow o config)
5. **Testa l'applicazione** su GitHub Pages

Buon deployment! 🚀
