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
