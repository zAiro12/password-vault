# Guida Rapida al Deployment

## Il Problema

Hai notato correttamente che:
- ✅ Il **frontend** è deployato su GitHub Pages → `https://zairo12.github.io/password-vault/`
- ❌ Il **backend** NON può essere su GitHub Pages
- ⚠️ Senza backend, l'app mostra l'errore: **"Cannot connect to server. Please ensure the backend is running on port 3000"**

**Perché?** GitHub Pages ospita solo file statici (HTML, CSS, JS). Il backend è un'applicazione Node.js che ha bisogno di un server vero.

## La Soluzione in 3 Passi

### Passo 1: Scegli Dove Hostare il Backend

Hai 4 opzioni principali:

#### Opzione A: 🏠 Raspberry Pi (CONSIGLIATO per uso aziendale interno)

**Pro:**
- Controllo totale
- Nessun costo mensile (solo elettricità ~€2/mese)
- Dati rimangono in azienda
- Perfetto per password sensibili

**Contro:**
- Richiede configurazione iniziale
- Devi gestire la manutenzione
- Serve un dominio (es. DuckDNS gratuito)

**Costo:** €30-50 per un Raspberry Pi 4, una tantum

---

#### Opzione B: ☁️ Railway.app (FACILE e veloce per iniziare)

**Pro:**
- Deploy automatico in 5 minuti
- Database MySQL incluso
- HTTPS automatico
- Free tier: $5/mese gratis

**Contro:**
- Free tier limitato, poi costa $5/mese
- Dati su server esterno (USA)

**Costo:** Gratis fino a $5/mese di utilizzo, poi pay-as-you-go

---

#### Opzione C: 🎨 Render.com (Alternativa gratuita)

**Pro:**
- Completamente gratis
- Deploy da GitHub
- SSL automatico

**Contro:**
- Server si spegne dopo 15 min di inattività (riavvio lento)
- PostgreSQL invece di MySQL (richiede modifiche al codice)

**Costo:** Gratis con limitazioni

---

#### Opzione D: 💰 DigitalOcean / AWS (Professionale)

**Pro:**
- Massima affidabilità
- Scalabile
- Controllo totale

**Contro:**
- Più costoso
- Richiede più competenze tecniche

**Costo:** Da $6/mese (DigitalOcean) a $10/mese (AWS)

---

### Passo 2: Deploya il Backend

#### Metodo A: Railway.app (Il più veloce) 🚀

1. Vai su [railway.app](https://railway.app)
2. Fai login con GitHub
3. Click su "New Project" → "Deploy from GitHub repo"
4. Seleziona il tuo repository `password-vault`
5. Railway rileva automaticamente che è un progetto Node.js
6. Aggiungi un database MySQL:
   - Click su "New" → "Database" → "Add MySQL"
7. Vai su "Variables" e aggiungi:
   ```
   DB_HOST → copia dal database MySQL su Railway
   DB_PORT → 3306
   DB_USER → copia dal database MySQL
   DB_PASSWORD → copia dal database MySQL
   DB_NAME → railway
   JWT_SECRET → (genera con: openssl rand -base64 32)
   ENCRYPTION_KEY → (genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ADMIN_DEFAULT_USERNAME → admin
   ADMIN_DEFAULT_PASSWORD → (scegli una password forte)
   ADMIN_DEFAULT_EMAIL → admin@tuaazienda.com
   PORT → 3000
   NODE_ENV → production
   ```
8. Railway farà il deploy automaticamente!
9. Ottieni l'URL: `https://password-vault-production-xxx.up.railway.app`

**Tempo totale: ~10 minuti**

---

#### Metodo B: Raspberry Pi (Per uso interno aziendale) 🏠

```bash
# 1. Sul Raspberry Pi, installa Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Installa MySQL
sudo apt install mysql-server

# 3. Configura MySQL
sudo mysql
```

```sql
CREATE DATABASE password_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vault_user'@'localhost' IDENTIFIED BY 'TuaPasswordSicura123!';
GRANT ALL PRIVILEGES ON password_vault.* TO 'vault_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 4. Clona il progetto
git clone https://github.com/zAiro12/password-vault.git
cd password-vault/backend

# 5. Installa dipendenze
npm install

# 6. Configura ambiente
cp .env.example .env
nano .env  # Modifica con i dati MySQL sopra
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=vault_user
DB_PASSWORD=TuaPasswordSicura123!
DB_NAME=password_vault

JWT_SECRET=genera_con_openssl_rand_base64_32
ENCRYPTION_KEY=genera_con_node_randomBytes_32_hex

ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=CambiaSubitoDopoPrimoLogin!
ADMIN_DEFAULT_EMAIL=admin@tuaazienda.com

PORT=3000
NODE_ENV=production
```

```bash
# 7. Esegui migrations
npm run migrate

# 8. Installa PM2 per mantenere attivo
sudo npm install -g pm2
pm2 start src/index.js --name password-vault
pm2 save
pm2 startup  # Segui le istruzioni

# 9. Configura Nginx per HTTPS
sudo apt install nginx certbot python3-certbot-nginx

# Crea config Nginx
sudo nano /etc/nginx/sites-available/password-vault
```

```nginx
server {
    listen 80;
    server_name tuodominio.duckdns.org;

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

```bash
# Attiva il sito
sudo ln -s /etc/nginx/sites-available/password-vault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Ottieni certificato SSL gratuito
sudo certbot --nginx -d tuodominio.duckdns.org

# Configura port forwarding sul router:
# Porta 80 → IP Raspberry Pi:80
# Porta 443 → IP Raspberry Pi:443
```

**Tempo totale: ~30-60 minuti**

---

### Passo 3: Connetti Frontend al Backend

Ora che il backend è attivo, devi dire al frontend dove trovarlo.

#### Modifica il Workflow GitHub Actions

Apri `.github/workflows/deploy-ui.yml` e trova la sezione "Build frontend":

```yaml
- name: Build frontend
  run: npm run build:frontend
  env:
    VITE_API_BASE_URL: https://tuo-backend-url.com  # ← Cambia questo!
```

**Sostituisci con l'URL del tuo backend:**

- **Railway:** `https://password-vault-production-xxx.up.railway.app`
- **Raspberry Pi:** `https://tuodominio.duckdns.org`
- **Render:** `https://password-vault-backend.onrender.com`

#### Esempio Completo:

```yaml
- name: Build frontend
  run: npm run build:frontend
  env:
    VITE_API_BASE_URL: https://password-vault-production-abc123.up.railway.app
```

#### Fai il Commit e Push

```bash
git add .github/workflows/deploy-ui.yml
git commit -m "Configure frontend to use deployed backend"
git push origin main
```

GitHub Actions farà automaticamente il re-deploy del frontend con la nuova configurazione!

---

## Verifica che Funzioni

1. Vai su `https://zairo12.github.io/password-vault/`
2. Dovresti vedere la pagina di login (senza errori di connessione)
3. Prova a fare login con:
   - Username: quello configurato in `ADMIN_DEFAULT_USERNAME`
   - Password: quella configurata in `ADMIN_DEFAULT_PASSWORD`
4. Se funziona: **Complimenti! 🎉** L'app è completamente deployata!

## Troubleshooting

### Errore "Cannot connect to server"

**Cause possibili:**

1. **Backend non è avviato**
   - Railway/Render: Controlla i log nel dashboard
   - Raspberry Pi: `pm2 status` e `pm2 logs password-vault`

2. **URL backend sbagliato nel frontend**
   - Controlla `.github/workflows/deploy-ui.yml`
   - L'URL deve essere HTTPS e completo

3. **CORS non configurato**
   - Il backend deve permettere richieste da `https://zairo12.github.io`
   - Già configurato in `backend/src/index.js`, controlla che sia presente:
     ```javascript
     /^https:\/\/zairo12\.github\.io\/password-vault\/?$/
     ```

4. **Backend non raggiungibile**
   - Testa con: `curl https://tuo-backend-url.com/health`
   - Dovrebbe rispondere con `{"status":"ok"}`

### Database non si connette

**Railway:**
- Controlla che il database sia "up" nel dashboard
- Verifica le variabili d'ambiente `DB_*`

**Raspberry Pi:**
- `sudo systemctl status mysql` → deve essere "active (running)"
- Testa connessione: `mysql -u vault_user -p password_vault`

### SSL/HTTPS non funziona

**Raspberry Pi:**
- Verifica certificato: `sudo certbot certificates`
- Rinnova se scaduto: `sudo certbot renew`
- Controlla port forwarding sul router

**Railway/Render:**
- HTTPS è automatico, nessuna configurazione necessaria

## Riassunto Costi

| Opzione | Costo Setup | Costo Mensile | Tempo Setup |
|---------|-------------|---------------|-------------|
| Railway.app | €0 | €0-5 | 10 min |
| Render.com | €0 | €0 | 15 min |
| Raspberry Pi | €30-50 | ~€2 (elettricità) | 60 min |
| DigitalOcean | €0 | €6 | 45 min |

## La Mia Raccomandazione

### Per Iniziare Subito (Test/Demo):
👉 **Railway.app** - Deploy in 10 minuti, $5/mese gratis

### Per Uso Aziendale Serio:
👉 **Raspberry Pi** - Controllo totale, dati in azienda, zero costi mensili

### Per Produzione con Traffico Alto:
👉 **DigitalOcean** - Affidabile, scalabile, supporto professionale

## Hai Bisogno di Aiuto?

📖 **Documentazione completa:** [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md)

**Risorse:**
- [DuckDNS](https://www.duckdns.org/) - Dominio gratuito per Raspberry Pi
- [Railway.app](https://railway.app) - Cloud hosting gratuito
- [Let's Encrypt](https://letsencrypt.org/) - Certificati SSL gratuiti
