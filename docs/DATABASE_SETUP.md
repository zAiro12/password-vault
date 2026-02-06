# Database Setup Guide - Password Vault

## ⚠️ IMPORTANTE: Devi installare e configurare MySQL tu stesso!

**Il database NON è fornito o hostato automaticamente.** Devi installare MySQL sul tuo computer o server.

---

## 📍 Dove si trova il database?

**OPZIONI DI DEPLOYMENT:**

### 1. 💻 Sviluppo Locale (Recommended per iniziare)
- MySQL installato **sul tuo computer**
- Connessione: `localhost:3306`
- Perfetto per development e testing
- **✅ Inizia con questa opzione**

### 2. 🏢 Server Interno (Produzione)
- MySQL su un **server dedicato** nella tua rete (es. Raspberry Pi)
- Connessione: `192.168.x.x:3306` (IP del server)
- Backup e sicurezza gestiti da te
- Accesso dalla rete locale

### 3. ☁️ Cloud Database (Produzione)
- MySQL su servizi cloud (AWS RDS, Google Cloud SQL, Azure, DigitalOcean)
- Connessione: hostname fornito dal cloud provider
- Backup automatici, alta disponibilità
- Costi mensili

### 4. 🐳 Docker Container (Development/Production)
- MySQL in container Docker
- Facile da configurare e distruggere
- Isolato dal sistema operativo

---

## 🚀 Installazione MySQL 8.0+

### Windows

**Opzione 1: MySQL Installer**
1. Scarica MySQL Installer da: https://dev.mysql.com/downloads/installer/
2. Esegui l'installer e scegli "MySQL Server 8.0+"
3. Durante l'installazione:
   - Scegli password per l'utente `root`
   - Configura MySQL come servizio Windows
   - Porta: `3306` (default)
4. Verifica l'installazione:
```cmd
mysql --version
```

**Opzione 2: XAMPP/WAMP**
- Installa XAMPP: https://www.apachefriends.org/
- Include MySQL, facile da gestire con GUI
- Avvia MySQL dal pannello di controllo

### macOS

**Opzione 1: Homebrew (Recommended)**
```bash
# Installa Homebrew se non ce l'hai: https://brew.sh/
brew install mysql

# Avvia MySQL
brew services start mysql

# Configura password root
mysql_secure_installation
```

**Opzione 2: MySQL DMG Package**
1. Scarica da: https://dev.mysql.com/downloads/mysql/
2. Installa il pacchetto .dmg
3. MySQL viene aggiunto alle System Preferences

### Linux (Ubuntu/Debian)

```bash
# Aggiorna i pacchetti
sudo apt update

# Installa MySQL Server 8.0
sudo apt install mysql-server

# Avvia il servizio
sudo systemctl start mysql
sudo systemctl enable mysql

# Configura sicurezza
sudo mysql_secure_installation
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Installa MySQL Repository
sudo dnf install mysql-server

# Avvia il servizio
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Configura sicurezza
sudo mysql_secure_installation
```

### Docker (Qualsiasi piattaforma)

```bash
# Scarica e avvia MySQL in container
docker run --name password-vault-mysql \
  -e MYSQL_ROOT_PASSWORD=your_root_password \
  -e MYSQL_DATABASE=password_vault \
  -e MYSQL_USER=vault_user \
  -e MYSQL_PASSWORD=vault_pass \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  -d mysql:8.0

# Verifica che sia in esecuzione
docker ps
```

---

## ✅ Verificare che MySQL sia in esecuzione

### Windows
```cmd
# Controlla il servizio
sc query MySQL80

# Oppure tramite Task Manager > Servizi > MySQL80
```

### macOS
```bash
# Controlla lo stato
brew services list | grep mysql

# O usa:
mysql.server status
```

### Linux
```bash
# Controlla lo stato del servizio
sudo systemctl status mysql

# O:
sudo service mysql status
```

### Docker
```bash
docker ps | grep mysql
```

### Test connessione
```bash
# Prova a connetterti
mysql -u root -p

# Se funziona, vedrai:
# mysql>
```

---

## 🔧 Configurazione Database per Password Vault

### 1. Crea il Database

```bash
# Connettiti a MySQL
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

### 2. Configura `.env` nel backend

```bash
cd backend
cp .env.example .env
```

Modifica `backend/.env`:
```env
# Database Configuration
DB_HOST=localhost           # o IP del tuo server MySQL
DB_PORT=3306
DB_USER=vault_user          # l'utente che hai creato
DB_PASSWORD=your_secure_password
DB_NAME=password_vault

# Admin User (primo accesso)
ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=ChangeMe123!
ADMIN_DEFAULT_EMAIL=admin@yourdomain.com

# Genera queste chiavi!
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_jwt_secret_here
```

### 3. Esegui le Migrations

```bash
cd backend
npm install
npm run migrate
```

Dovresti vedere:
```
✓ Connected to database successfully
✓ Migration 001_initial_schema.sql executed successfully
✓ Migration 002_seed_initial_data.sql executed successfully
✓ All migrations completed successfully!
```

### 4. Verifica il Setup

```bash
# Controlla le tabelle create
mysql -u vault_user -p password_vault -e "SHOW TABLES;"
```

Dovresti vedere:
- audit_log
- clients
- credentials
- migrations
- resources
- user_client_permissions
- users

---

## 🌐 Deployment Scenarios

### Scenario 1: Development (Solo tu sul tuo PC)
```
Tu → Backend (localhost:3000) → MySQL (localhost:3306)
```
**Setup:** MySQL locale, tutto su localhost

### Scenario 2: LAN/Ufficio (Team su rete locale)
```
PC1 → Backend (server:3000) → MySQL (server:3306)
PC2 → Backend (server:3000) → MySQL (server:3306)
PC3 → Backend (server:3000) → MySQL (server:3306)
```
**Setup:** 
- MySQL su server/Raspberry Pi con IP fisso (es. 192.168.1.100)
- Backend sullo stesso server o separato
- Configura firewall per aprire porta 3306 (solo rete locale!)

### Scenario 3: Internet (Accesso remoto)
```
Internet → [Nginx/Apache + SSL] → Backend (3000) → MySQL (3306 solo locale)
```
**Setup:**
- MySQL su server cloud o VPS
- Backend su stesso server
- Reverse proxy con HTTPS
- MySQL NON esposto a internet (solo localhost)
- Configura firewall per bloccare porta 3306 dall'esterno

---

## 🔒 Security Best Practices

### NON fare:
❌ Esporre MySQL porta 3306 a Internet
❌ Usare password deboli o default
❌ Usare utente `root` per l'applicazione
❌ Committare file `.env` su git

### Fare:
✅ Usare utente MySQL dedicato con permessi limitati
✅ Password forti (min 16 caratteri, numeri, simboli)
✅ MySQL accessibile solo da localhost o rete fidata
✅ Backup regolari del database
✅ Aggiornare MySQL regolarmente
✅ Usare SSL/TLS per connessioni remote

---

## 🚨 Troubleshooting

### Errore: "Can't connect to MySQL server"

**Causa:** MySQL non è in esecuzione

**Soluzione:**
```bash
# Linux/macOS
sudo systemctl start mysql

# Windows
net start MySQL80

# Docker
docker start password-vault-mysql
```

### Errore: "Access denied for user"

**Causa:** Credenziali errate nel file `.env`

**Soluzione:**
1. Verifica username e password nel `.env`
2. Verifica che l'utente esista in MySQL:
```sql
SELECT User, Host FROM mysql.user WHERE User = 'vault_user';
```

### Errore: "Unknown database 'password_vault'"

**Causa:** Database non creato

**Soluzione:**
```sql
CREATE DATABASE password_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Errore: "Connection refused on port 3306"

**Causa:** MySQL non in ascolto o firewall

**Soluzione:**
```bash
# Verifica che MySQL sia in ascolto
sudo netstat -tlnp | grep 3306

# O:
sudo lsof -i :3306
```

### MySQL lento o crashes

**Causa:** Risorse insufficienti

**Soluzione:**
- Verifica RAM disponibile (min 512MB per MySQL)
- Ottimizza configurazione MySQL in `my.cnf`
- Considera di usare un server dedicato

---

## 📊 Backup del Database

### Backup Manuale

```bash
# Backup completo
mysqldump -u vault_user -p password_vault > backup_$(date +%Y%m%d).sql

# Restore
mysql -u vault_user -p password_vault < backup_20260204.sql
```

### Backup Automatico (Linux crontab)

```bash
# Modifica crontab
crontab -e

# Aggiungi backup giornaliero alle 2 AM
0 2 * * * mysqldump -u vault_user -p'your_password' password_vault > /backup/vault_$(date +\%Y\%m\%d).sql
```

---

## 📚 Risorse Utili

- **MySQL Documentation:** https://dev.mysql.com/doc/
- **MySQL Workbench** (GUI): https://dev.mysql.com/downloads/workbench/
- **phpMyAdmin** (Web GUI): https://www.phpmyadmin.net/
- **DBeaver** (Universal DB GUI): https://dbeaver.io/

---

## ❓ FAQ

**Q: Devo pagare per MySQL?**
A: No, MySQL Community Edition è gratuito e open source.

**Q: Posso usare MariaDB invece di MySQL?**
A: Sì, MariaDB è compatibile con MySQL 8.0. Usa MariaDB 10.5+

**Q: Dove salvo i backup?**
A: Su disco esterno, NAS, o cloud storage (Dropbox, Google Drive). MAI solo sul server database!

**Q: Quanto spazio serve?**
A: Inizialmente pochi MB. Per ~1000 credenziali: ~50-100MB. Pianifica almeno 1GB per crescita.

**Q: Posso usare PostgreSQL?**
A: No, l'applicazione è progettata per MySQL. Richiederebbe modifiche al codice.

**Q: MySQL su Raspberry Pi funziona?**
A: Sì! Raspberry Pi 3/4 con 2GB+ RAM è sufficiente per uffici piccoli/medi.

---

## 🆘 Hai ancora problemi?

1. Verifica che MySQL sia installato: `mysql --version`
2. Verifica che MySQL sia in esecuzione (vedi sopra)
3. Verifica connessione: `mysql -u root -p`
4. Controlla i log di MySQL:
   - Linux: `/var/log/mysql/error.log`
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - Docker: `docker logs password-vault-mysql`

---

**✅ Una volta completato questo setup, il database sarà pronto per l'uso!**
