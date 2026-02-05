# Debugging Authentication Issues with Swagger

## Problema Segnalato

```
POST https://password-vault-wqj8.onrender.com/api/auth/login 500 (Internal Server Error)

email: "lucaairoldi92@gmail.com"
password: "Admin2026!SecureP@ss"

{"error":"Internal server error","message":"Failed to login"}
```

## Soluzione Implementata

Sono stati implementati tre strumenti per debuggare e risolvere il problema:

### 1. Swagger UI - Interfaccia Interattiva

**URL:** https://password-vault-wqj8.onrender.com/swagger

Permette di:
- Testare l'endpoint di login direttamente dal browser
- Vedere esattamente cosa risponde il server
- Provare con diverse credenziali
- Ottenere informazioni dettagliate sugli errori

**Come usare:**
1. Aprire https://password-vault-wqj8.onrender.com/swagger
2. Trovare `POST /api/auth/login` nella sezione Authentication
3. Cliccare "Try it out"
4. Inserire:
   ```json
   {
     "email": "lucaairoldi92@gmail.com",
     "password": "Admin2026!SecureP@ss"
   }
   ```
5. Cliccare "Execute"
6. Vedere la risposta dettagliata

### 2. Documentazione HTML Personalizzata

**URL:** https://password-vault-wqj8.onrender.com/api-docs

Una documentazione completa in italiano con:
- Tutti gli endpoint disponibili
- Esempi di richieste e risposte
- Codici di errore e loro significati
- Note speciali per ogni endpoint

### 3. Logging Avanzato

Il controller di autenticazione ora registra ogni passaggio del processo di login:

```javascript
[login_1234567890_abc] Login attempt started
[login_1234567890_abc] Attempting login for email: lucaairoldi92@gmail.com
[login_1234567890_abc] Database query executed. Users found: 1
[login_1234567890_abc] User found - ID: 1, Username: admin, Role: admin, Active: true
[login_1234567890_abc] Verifying password...
[login_1234567890_abc] Password verification result: true
[login_1234567890_abc] Generating JWT token...
[login_1234567890_abc] Login successful for user: admin
```

In caso di errore:
```javascript
[login_1234567890_abc] Login error - Type: Error
[login_1234567890_abc] Error message: Connection refused
[login_1234567890_abc] Error stack: <stack trace completo>
```

## Come Investigare l'Errore 500

### Passo 1: Verificare lo Stato del Database

```bash
curl https://password-vault-wqj8.onrender.com/health/db
```

Risposta attesa (OK):
```json
{
  "status": "healthy",
  "database": "password_vault",
  "host": "<db-host>",
  "port": 3306,
  "timestamp": "2026-02-05T22:42:23.546Z"
}
```

Risposta in caso di problema:
```json
{
  "status": "unhealthy",
  "error": "Connection refused",
  "timestamp": "2026-02-05T22:42:23.546Z"
}
```

### Passo 2: Controllare i Log di Render.com

1. Accedere al dashboard di Render.com
2. Aprire il servizio `password-vault-wqj8`
3. Andare su "Logs"
4. Cercare i log che iniziano con `[login_...]`
5. Identificare dove si verifica l'errore

### Passo 3: Verificare le Variabili d'Ambiente

Controllare che queste variabili siano configurate in Render.com:

**Database:**
- `DB_HOST` - Indirizzo del server MySQL
- `DB_PORT` - Porta (default: 3306)
- `DB_USER` - Username database
- `DB_PASSWORD` - Password database
- `DB_NAME` - Nome database

**Sicurezza:**
- `JWT_SECRET` - Chiave segreta per JWT (minimo 32 caratteri)
- `ENCRYPTION_KEY` - Chiave AES-256 (esattamente 64 caratteri esadecimali)

**Admin Default:**
- `ADMIN_DEFAULT_USERNAME`
- `ADMIN_DEFAULT_PASSWORD`
- `ADMIN_DEFAULT_EMAIL`

### Passo 4: Testare la Connessione Database

Se il database è il problema, il log mostrerà:
```javascript
[login_xxx] Database error:
{
  "code": "ECONNREFUSED",
  "errno": -111,
  "sqlMessage": null
}
```

**Possibili cause:**
1. Database non raggiungibile (host/porta errati)
2. Credenziali database errate
3. Database non avviato
4. Firewall che blocca la connessione

### Passo 5: Verificare che l'Utente Esista

Se l'errore è "No user found", il log mostrerà:
```javascript
[login_xxx] No user found with email: lucaairoldi92@gmail.com
```

**Soluzione:**
1. Verificare che le migrazioni siano state eseguite: `npm run migrate`
2. Controllare nel database se l'utente esiste
3. Se non esiste, registrare l'utente o usare le credenziali admin di default

### Passo 6: Problemi con JWT o Bcrypt

Se l'errore è nella generazione del token o verifica password:
```javascript
[login_xxx] JWT generation error: JWT_SECRET not defined
```
o
```javascript
[login_xxx] Bcrypt error: data and salt must be strings
```

**Soluzioni:**
- Verificare che `JWT_SECRET` sia configurato
- Verificare che `ENCRYPTION_KEY` sia configurato (64 caratteri esadecimali)
- Controllare che le dipendenze npm siano installate correttamente

## Possibili Cause dell'Errore 500

### 1. Database Non Connesso (Più Probabile)

Render.com free tier non include MySQL. È necessario usare un servizio esterno come:
- **PlanetScale** (consigliato, free tier disponibile)
- **Railway.app**
- **AWS RDS**
- **DigitalOcean Managed Database**

**Verifica:** Controllare se `DB_HOST` punta a un database MySQL valido e raggiungibile.

### 2. Variabili d'Ambiente Mancanti

JWT_SECRET o ENCRYPTION_KEY potrebbero non essere configurati correttamente.

**Verifica:** Il server dovrebbe bloccarsi all'avvio se mancano, ma controllare comunque.

### 3. Utente Non Esiste

L'email `lucaairoldi92@gmail.com` potrebbe non essere registrata nel database.

**Verifica:** Provare prima con l'utente admin di default configurato in `ADMIN_DEFAULT_EMAIL`.

### 4. Password Hash Incompatibile

Se il database è stato migrato o la password è stata inserita manualmente, l'hash potrebbe non essere valido.

**Verifica:** Controllare che la password sia stata hashata con bcrypt rounds corretti.

## Test Rapidi da Eseguire

### Test 1: Verifica che il server sia attivo
```bash
curl https://password-vault-wqj8.onrender.com/health
```
Deve restituire: `{"status":"ok","message":"Password Vault API is running"}`

### Test 2: Verifica connessione database
```bash
curl https://password-vault-wqj8.onrender.com/health/db
```
Se restituisce status 500 o "unhealthy", il problema è il database.

### Test 3: Test login con curl (con logging)
```bash
curl -X POST https://password-vault-wqj8.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lucaairoldi92@gmail.com","password":"Admin2026!SecureP@ss"}' \
  -v
```

### Test 4: Prova con admin di default
```bash
curl -X POST https://password-vault-wqj8.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@passwordvault.local","password":"<ADMIN_DEFAULT_PASSWORD>"}' \
  -v
```

## Prossimi Passi

1. ✅ Aprire Swagger UI e testare il login endpoint
2. ✅ Controllare `/health/db` per verificare connessione database
3. ✅ Guardare i log di Render.com per vedere l'errore dettagliato
4. ⏳ Identificare la causa specifica (molto probabilmente database)
5. ⏳ Risolvere il problema identificato
6. ⏳ Testare nuovamente con Swagger UI

## Note Importanti

- **ENABLE_API_DOCS**: Per sicurezza, la documentazione API può essere disabilitata in produzione impostando `ENABLE_API_DOCS=false`
- **Request ID**: Ogni tentativo di login genera un ID univoco nei log per facilitare il tracking
- **Debug Mode**: In modalità development, gli errori 500 includono informazioni di debug aggiuntive nella risposta

## Supporto

Dopo aver eseguito questi test, sarà possibile identificare con precisione la causa dell'errore 500 e risolverlo rapidamente. I log dettagliati mostreranno esattamente dove si verifica il problema nel processo di autenticazione.
