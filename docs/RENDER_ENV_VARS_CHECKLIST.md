# ✅ Checklist Environment Variables per Render.com

## 🎯 Dove Aggiungere le Variabili

Nel dashboard di Render.com:
1. Vai al tuo servizio `password-vault-backend`
2. Click sulla tab **"Environment"** nel menu laterale
3. Click su **"Add Environment Variable"**
4. Aggiungi le variabili una per una dalla lista sotto

## 📋 Lista Completa Variabili (11 totali)

### 1️⃣ Node.js Configuration (2 variabili)

```
Key: NODE_ENV
Value: production
```

```
Key: PORT  
Value: 3000
```

### 2️⃣ Database Configuration (5 variabili)

⚠️ **Usa database MySQL esterno** (PlanetScale o Railway - vedi sotto)

```
Key: DB_HOST
Value: <il-tuo-mysql-host>
Esempio: aws.connect.psdb.cloud
```

```
Key: DB_PORT
Value: 3306
```

```
Key: DB_USER
Value: <username-database>
```

```
Key: DB_PASSWORD
Value: <password-database>
🔒 Marca come SECRET (click sull'icona lucchetto)
```

```
Key: DB_NAME
Value: password_vault
```

### 3️⃣ Security Keys (2 variabili - CRITICHE!)

⚠️ **IMPORTANTE:** Genera chiavi nuove e SALVALE in un posto sicuro!

#### JWT_SECRET

**Come generare:**
```bash
openssl rand -base64 32
```

**Output esempio:**
```
FokvxW39wcz341rMY4D0Zbp09ZW1cxWPSm1gHUo2wMA=
```

**Aggiungi a Render:**
```
Key: JWT_SECRET
Value: <copia-output-comando-sopra>
🔒 Marca come SECRET
```

#### ENCRYPTION_KEY

**Come generare:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output esempio:**
```
ea1ad02dfa62df2183c9d336c7ee50034247c1a19759e98ead168b346fa3e321
```

**Aggiungi a Render:**
```
Key: ENCRYPTION_KEY
Value: <copia-output-comando-sopra>
🔒 Marca come SECRET
```

⚠️ **ATTENZIONE:** NON cambiare mai queste chiavi dopo il primo deploy!
- Se cambi `JWT_SECRET` → Tutti gli utenti vengono disconnessi
- Se cambi `ENCRYPTION_KEY` → Tutte le password salvate diventano illeggibili (PERDITA DATI!)

### 4️⃣ Admin User Configuration (3 variabili)

Questo utente admin viene creato automaticamente al primo avvio.

```
Key: ADMIN_DEFAULT_USERNAME
Value: admin
```

```
Key: ADMIN_DEFAULT_PASSWORD
Value: <scegli-password-sicura>
Esempio: MySecureP@ssw0rd123!
🔒 Marca come SECRET
```

```
Key: ADMIN_DEFAULT_EMAIL
Value: <tua-email>
Esempio: lucaairoldi92@gmail.com
```

## 🗄️ Setup Database MySQL Esterno

Render NON offre MySQL gratis. Devi usare un database esterno.

### Opzione A: PlanetScale (CONSIGLIATO)

**Vantaggi:** Gratis, serverless, MySQL-compatible

**Setup:**
1. Vai su [planetscale.com](https://planetscale.com)
2. Crea account gratuito
3. **Create new database** → Nome: `password-vault`
4. **Connect** → Seleziona "Node.js"
5. Copia le credenziali:
   ```
   Host: aws.connect.psdb.cloud
   Username: xxxxxxxxxx
   Password: pscale_pw_xxxxxxxxxx
   ```
6. Usa queste credenziali come `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Render

### Opzione B: Railway.app (Solo Database)

**Vantaggi:** Vero MySQL, $5/mese gratis

**Setup:**
1. Vai su [railway.app](https://railway.app)
2. Login con GitHub
3. **New Project** → **Add MySQL**
4. Click sul database → **Connect** → Copia credenziali
5. Usa le credenziali in Render

### Opzione C: Tuo Server MySQL

Se hai già un server MySQL (Raspberry Pi, VPS):
- Assicurati che accetti connessioni remote
- Usa l'IP pubblico come `DB_HOST`
- Configura firewall per permettere connessioni da Render

## ✅ Verifica Environment Variables

Dopo aver aggiunto tutte le variabili, dovresti avere **11 variabili** in totale:

- [ ] NODE_ENV
- [ ] PORT
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_USER
- [ ] DB_PASSWORD (marcata SECRET)
- [ ] DB_NAME
- [ ] JWT_SECRET (marcata SECRET)
- [ ] ENCRYPTION_KEY (marcata SECRET)
- [ ] ADMIN_DEFAULT_USERNAME
- [ ] ADMIN_DEFAULT_PASSWORD (marcata SECRET)
- [ ] ADMIN_DEFAULT_EMAIL

## 🚀 Dopo aver Aggiunto le Variabili

1. **Salva** le variabili
2. Render **riavvierà automaticamente** il servizio
3. Controlla i **Logs** per verificare che si avvii correttamente
4. Dovresti vedere:
   ```
   ✅ Environment Configuration Valid
   ✓ DB_HOST
   ✓ DB_USER
   ✓ DB_NAME
   ✓ JWT_SECRET
   ✓ ENCRYPTION_KEY
   ```

5. **Esegui le migrations:**
   - Dashboard Render → **Shell** (in alto)
   - Esegui: `npm run migrate`
   - Attendi: "✓ All migrations completed successfully!"

6. **Testa il backend:**
   ```bash
   curl https://tuo-backend.onrender.com/health
   ```
   
   Risposta attesa:
   ```json
   {"status":"ok"}
   ```

## ⚠️ Troubleshooting

### Errore: "Application failed to respond"

**Causa:** Variabili d'ambiente mancanti o errate.

**Soluzione:**
1. Vai su **Logs**
2. Cerca errori tipo:
   ```
   ❌ ENVIRONMENT CONFIGURATION ERROR
   ❌ JWT_SECRET
   ```
3. Aggiungi le variabili mancanti

### Errore: "Cannot connect to database"

**Causa:** Credenziali database errate o database non raggiungibile.

**Soluzione:**
1. Verifica `DB_HOST`, `DB_USER`, `DB_PASSWORD`
2. Testa connessione al database da un altro client
3. Controlla firewall del database (deve accettare connessioni da Render)

### Errore: "ENCRYPTION_KEY must be exactly 64 hexadecimal characters"

**Causa:** Chiave di cifratura nel formato sbagliato.

**Soluzione:**
1. Ri-genera la chiave con:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Copia ESATTAMENTE l'output (64 caratteri)
3. Incollalo in `ENCRYPTION_KEY`

## 💾 Salva le Tue Chiavi!

⚠️ **IMPORTANTE:** Salva queste chiavi in un password manager o file sicuro:

```
# Password Vault - Render.com Credentials
# Data: [data-di-oggi]

JWT_SECRET=<tua-chiave-jwt>
ENCRYPTION_KEY=<tua-chiave-encryption>
ADMIN_DEFAULT_PASSWORD=<tua-password-admin>

DB_HOST=<host-database>
DB_USER=<user-database>  
DB_PASSWORD=<password-database>
```

Non perdere queste chiavi! Specialmente `ENCRYPTION_KEY` - senza quella, non potrai più decifrare le password salvate.

## 📚 Link Utili

- **Guida Completa:** [RENDER_COM_SETUP.md](./RENDER_COM_SETUP.md)
- **Quick Reference:** [RENDER_QUICK_REFERENCE.md](./RENDER_QUICK_REFERENCE.md)
- **PlanetScale:** https://planetscale.com
- **Railway:** https://railway.app

---

## 🎉 Fatto!

Una volta aggiunte tutte le variabili e eseguite le migrations, il tuo backend sarà attivo e funzionante su Render.com!

Prossimo passo: Configura il frontend per usare l'URL del backend.
