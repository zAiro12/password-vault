/**
 * Manual API Documentation Generator
 * Provides interactive documentation without standard swagger patterns
 */

export const apiEndpoints = {
  authentication: {
    prefix: '/api/auth',
    description: 'Gestione autenticazione e sessioni utente',
    routes: [
      {
        method: 'POST',
        path: '/register',
        auth: false,
        summary: 'Registrazione nuovo utente',
        requestBody: {
          username: { type: 'string', required: true, example: 'mario.rossi' },
          email: { type: 'string', required: true, example: 'mario@example.com' },
          password: { type: 'string', required: true, example: 'SecureP@ss123!' },
          full_name: { type: 'string', required: false, example: 'Mario Rossi' },
          role: { type: 'string', required: false, enum: ['admin', 'technician', 'viewer'], default: 'technician' }
        },
        responses: {
          201: { description: 'Utente creato con successo', returns: ['user', 'token'] },
          400: { description: 'Dati non validi' },
          409: { description: 'Username o email già esistenti' }
        }
      },
      {
        method: 'POST',
        path: '/login',
        auth: false,
        summary: 'Autenticazione utente esistente',
        requestBody: {
          email: { type: 'string', required: true, example: 'lucaairoldi92@gmail.com' },
          password: { type: 'string', required: true, example: 'Admin2026!SecureP@ss' }
        },
        responses: {
          200: { description: 'Login effettuato', returns: ['user', 'token'] },
          400: { description: 'Email o password mancanti' },
          401: { description: 'Credenziali non valide o utente disattivato' },
          500: { description: 'Errore del server (controllare connessione database)' }
        }
      },
      {
        method: 'GET',
        path: '/me',
        auth: true,
        summary: 'Ottieni profilo utente corrente',
        headers: { Authorization: 'Bearer <jwt_token>' },
        responses: {
          200: { description: 'Profilo utente', returns: ['user'] },
          401: { description: 'Token mancante o non valido' }
        }
      },
      {
        method: 'POST',
        path: '/logout',
        auth: false,
        summary: 'Logout (gestito lato client)',
        responses: {
          200: { description: 'Rimuovere il token dallo storage locale' }
        }
      }
    ]
  },
  clients: {
    prefix: '/api/clients',
    description: 'Gestione anagrafica clienti',
    routes: [
      {
        method: 'GET',
        path: '/',
        auth: false,
        summary: 'Elenco tutti i clienti',
        queryParams: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 },
          active_only: { type: 'boolean', default: false }
        },
        responses: {
          200: { description: 'Lista clienti con paginazione' }
        }
      },
      {
        method: 'GET',
        path: '/:id',
        auth: false,
        summary: 'Dettagli cliente specifico',
        responses: {
          200: { description: 'Dati del cliente' },
          404: { description: 'Cliente non trovato' }
        }
      },
      {
        method: 'POST',
        path: '/',
        auth: true,
        summary: 'Crea nuovo cliente',
        requestBody: {
          name: { type: 'string', required: true },
          description: { type: 'string', required: false },
          contact_email: { type: 'string', required: false },
          contact_phone: { type: 'string', required: false }
        },
        responses: {
          201: { description: 'Cliente creato' },
          400: { description: 'Nome mancante' },
          401: { description: 'Autenticazione richiesta' }
        }
      },
      {
        method: 'PUT',
        path: '/:id',
        auth: true,
        summary: 'Aggiorna cliente esistente',
        responses: {
          200: { description: 'Cliente aggiornato' },
          404: { description: 'Cliente non trovato' },
          401: { description: 'Autenticazione richiesta' }
        }
      },
      {
        method: 'DELETE',
        path: '/:id',
        auth: true,
        summary: 'Elimina cliente',
        responses: {
          200: { description: 'Cliente eliminato' },
          404: { description: 'Cliente non trovato' },
          401: { description: 'Autenticazione richiesta' }
        }
      }
    ]
  },
  resources: {
    prefix: '/api/resources',
    description: 'Gestione risorse (siti, server, database, ecc.)',
    routes: [
      {
        method: 'GET',
        path: '/',
        auth: true,
        summary: 'Elenco risorse per cliente',
        queryParams: {
          client_id: { type: 'integer', required: false },
          type: { type: 'string', enum: ['website', 'server', 'database', 'email', 'ftp', 'vpn', 'other'] }
        }
      },
      {
        method: 'POST',
        path: '/',
        auth: true,
        summary: 'Crea nuova risorsa',
        requestBody: {
          client_id: { type: 'integer', required: true },
          name: { type: 'string', required: true },
          type: { type: 'string', required: true },
          url: { type: 'string', required: false },
          description: { type: 'string', required: false }
        }
      }
    ]
  },
  credentials: {
    prefix: '/api/credentials',
    description: 'Gestione credenziali cifrate (username/password)',
    routes: [
      {
        method: 'GET',
        path: '/',
        auth: true,
        summary: 'Elenco credenziali per risorsa',
        queryParams: {
          resource_id: { type: 'integer', required: true }
        },
        note: 'Username e password sono cifrati con AES-256'
      },
      {
        method: 'POST',
        path: '/',
        auth: true,
        summary: 'Salva nuova credenziale',
        requestBody: {
          resource_id: { type: 'integer', required: true },
          username: { type: 'string', required: true },
          password: { type: 'string', required: true },
          notes: { type: 'string', required: false }
        },
        note: 'I dati verranno automaticamente cifrati prima del salvataggio'
      }
    ]
  },
  system: {
    prefix: '/',
    description: 'Endpoint di sistema e monitoraggio',
    routes: [
      {
        method: 'GET',
        path: '/health',
        auth: false,
        summary: 'Verifica stato API',
        responses: {
          200: { description: 'API funzionante' }
        }
      },
      {
        method: 'GET',
        path: '/health/db',
        auth: false,
        summary: 'Verifica connessione database',
        responses: {
          200: { description: 'Database raggiungibile' },
          500: { description: 'Database non disponibile' }
        }
      }
    ]
  }
};

export function generateHtmlDocs() {
  const htmlParts = ['<!DOCTYPE html><html><head><meta charset="UTF-8">'];
  htmlParts.push('<title>Password Vault API - Documentazione</title>');
  htmlParts.push('<style>');
  htmlParts.push('body{font-family:Arial,sans-serif;margin:40px;background:#f5f5f5}');
  htmlParts.push('.container{max-width:1200px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}');
  htmlParts.push('h1{color:#2c3e50;border-bottom:3px solid #3498db;padding-bottom:10px}');
  htmlParts.push('h2{color:#34495e;margin-top:30px;background:#ecf0f1;padding:10px;border-radius:4px}');
  htmlParts.push('.endpoint{margin:20px 0;padding:15px;background:#fff;border-left:4px solid #3498db;box-shadow:0 1px 3px rgba(0,0,0,0.1)}');
  htmlParts.push('.method{display:inline-block;padding:5px 10px;border-radius:3px;font-weight:bold;margin-right:10px}');
  htmlParts.push('.method.post{background:#27ae60;color:white}');
  htmlParts.push('.method.get{background:#3498db;color:white}');
  htmlParts.push('.method.put{background:#f39c12;color:white}');
  htmlParts.push('.method.delete{background:#e74c3c;color:white}');
  htmlParts.push('.auth-required{background:#e74c3c;color:white;padding:3px 8px;border-radius:3px;font-size:12px;margin-left:10px}');
  htmlParts.push('.params{background:#ecf0f1;padding:10px;margin:10px 0;border-radius:4px;font-family:monospace;font-size:14px}');
  htmlParts.push('.note{background:#fff3cd;border-left:4px solid:#ffc107;padding:10px;margin:10px 0}');
  htmlParts.push('</style></head><body><div class="container">');
  htmlParts.push('<h1>🔐 Password Vault API - Documentazione Interattiva</h1>');
  htmlParts.push('<p><strong>Base URL:</strong> <code>http://localhost:3000</code> | <code>https://password-vault-wqj8.onrender.com</code></p>');
  htmlParts.push('<p><strong>Autenticazione:</strong> JWT Bearer Token nel header <code>Authorization: Bearer &lt;token&gt;</code></p>');

  for (const [sectionKey, section] of Object.entries(apiEndpoints)) {
    htmlParts.push(`<h2>${section.description}</h2>`);
    htmlParts.push(`<p><em>Base: ${section.prefix}</em></p>`);
    
    for (const route of section.routes) {
      htmlParts.push('<div class="endpoint">');
      htmlParts.push(`<div><span class="method ${route.method.toLowerCase()}">${route.method}</span>`);
      htmlParts.push(`<code>${section.prefix}${route.path}</code>`);
      if (route.auth) htmlParts.push('<span class="auth-required">🔒 AUTH</span>');
      htmlParts.push('</div>');
      htmlParts.push(`<p>${route.summary}</p>`);
      
      if (route.requestBody) {
        htmlParts.push('<div class="params"><strong>Request Body:</strong><br>');
        htmlParts.push(JSON.stringify(route.requestBody, null, 2));
        htmlParts.push('</div>');
      }
      
      if (route.queryParams) {
        htmlParts.push('<div class="params"><strong>Query Parameters:</strong><br>');
        htmlParts.push(JSON.stringify(route.queryParams, null, 2));
        htmlParts.push('</div>');
      }
      
      if (route.responses) {
        htmlParts.push('<div class="params"><strong>Responses:</strong><br>');
        for (const [code, desc] of Object.entries(route.responses)) {
          htmlParts.push(`${code}: ${desc.description}<br>`);
        }
        htmlParts.push('</div>');
      }
      
      if (route.note) {
        htmlParts.push(`<div class="note"><strong>Nota:</strong> ${route.note}</div>`);
      }
      
      htmlParts.push('</div>');
    }
  }
  
  htmlParts.push('</div></body></html>');
  return htmlParts.join('');
}
