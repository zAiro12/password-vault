/**
 * Swagger API Path Definitions
 * Centralized OpenAPI path specifications for all endpoints
 */

export const swaggerPaths = {
  // ==================== AUTHENTICATION ENDPOINTS ====================
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Registrazione nuovo utente (richiede approvazione admin)',
      description: 'Crea un nuovo account utente nel sistema. L\'utente deve essere approvato da un admin prima di poter effettuare il login. Solo ruoli technician e viewer sono consentiti per auto-registrazione.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'email', 'password'],
              properties: {
                username: {
                  type: 'string',
                  example: 'mario.rossi'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'mario@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'SecureP@ss123!'
                },
                full_name: {
                  type: 'string',
                  example: 'Mario Rossi'
                },
                role: {
                  type: 'string',
                  enum: ['technician', 'viewer'],
                  default: 'technician',
                  description: 'Solo technician e viewer sono consentiti. Admin può essere creato solo da altri admin.'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Utente creato con successo (in attesa di approvazione)'
        },
        400: {
          description: 'Dati non validi o ruolo non consentito'
        },
        409: {
          description: 'Username o email già esistenti'
        }
      }
    }
  },

  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Autenticazione utente esistente',
      description: 'Login con email e password, restituisce JWT token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'MySecurePassword123!'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login effettuato con successo'
        },
        400: {
          description: 'Email o password mancanti'
        },
        401: {
          description: 'Credenziali non valide o utente disattivato'
        },
        500: {
          description: 'Errore del server'
        }
      }
    }
  },

  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Ottieni profilo utente corrente',
      description: 'Restituisce i dati dell\'utente autenticato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Profilo utente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfile'
              }
            }
          }
        },
        401: {
          description: 'Token mancante o non valido'
        }
      }
    }
  },

  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout utente',
      description: 'Logout (gestito lato client rimuovendo il token)',
      responses: {
        200: {
          description: 'Logout effettuato'
        }
      }
    }
  },

  // ==================== CLIENT ENDPOINTS ====================
  '/api/clients': {
    get: {
      tags: ['Clients'],
      summary: 'Elenco tutti i clienti',
      description: 'Ottiene la lista di tutti i clienti con paginazione',
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            default: 1
          }
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10
          }
        },
        {
          in: 'query',
          name: 'active_only',
          schema: {
            type: 'boolean',
            default: false
          }
        }
      ],
      responses: {
        200: {
          description: 'Lista clienti con paginazione'
        }
      }
    },
    post: {
      tags: ['Clients'],
      summary: 'Crea nuovo cliente',
      description: 'Crea un nuovo cliente nel sistema (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  example: 'Acme Corp'
                },
                description: {
                  type: 'string',
                  example: 'Cliente importante'
                },
                contact_email: {
                  type: 'string',
                  format: 'email',
                  example: 'contact@acme.com'
                },
                contact_phone: {
                  type: 'string',
                  example: '+39 123 456 7890'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Cliente creato con successo'
        },
        400: {
          description: 'Nome mancante'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    }
  },

  '/api/clients/{id}': {
    get: {
      tags: ['Clients'],
      summary: 'Dettagli cliente specifico',
      description: 'Ottiene i dettagli di un cliente tramite ID',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Dati del cliente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ClientRecord'
              }
            }
          }
        },
        404: {
          description: 'Cliente non trovato'
        }
      }
    },
    put: {
      tags: ['Clients'],
      summary: 'Aggiorna cliente esistente',
      description: 'Modifica i dati di un cliente esistente (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                contact_email: {
                  type: 'string',
                  format: 'email'
                },
                contact_phone: {
                  type: 'string'
                },
                is_active: {
                  type: 'boolean'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Cliente aggiornato con successo'
        },
        404: {
          description: 'Cliente non trovato'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    delete: {
      tags: ['Clients'],
      summary: 'Elimina cliente',
      description: 'Elimina un cliente dal sistema (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Cliente eliminato con successo'
        },
        404: {
          description: 'Cliente non trovato'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    }
  },

  // ==================== RESOURCE ENDPOINTS ====================
  '/api/resources': {
    get: {
      tags: ['Resources'],
      summary: 'Elenco risorse per cliente',
      description: 'Ottiene la lista di tutte le risorse (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'client_id',
          schema: {
            type: 'integer'
          },
          description: 'Filtra per ID cliente'
        },
        {
          in: 'query',
          name: 'type',
          schema: {
            type: 'string',
            enum: ['website', 'server', 'database', 'email', 'ftp', 'vpn', 'other']
          },
          description: 'Filtra per tipo di risorsa'
        }
      ],
      responses: {
        200: {
          description: 'Lista risorse'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    post: {
      tags: ['Resources'],
      summary: 'Crea nuova risorsa',
      description: 'Crea una nuova risorsa per un cliente (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['client_id', 'name', 'type'],
              properties: {
                client_id: {
                  type: 'integer',
                  example: 1
                },
                name: {
                  type: 'string',
                  example: 'Website Production'
                },
                type: {
                  type: 'string',
                  enum: ['website', 'server', 'database', 'email', 'ftp', 'vpn', 'other'],
                  example: 'website'
                },
                url: {
                  type: 'string',
                  example: 'https://example.com'
                },
                description: {
                  type: 'string',
                  example: 'Sito web di produzione'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Risorsa creata con successo'
        },
        400: {
          description: 'Dati mancanti'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    }
  },

  '/api/resources/{id}': {
    get: {
      tags: ['Resources'],
      summary: 'Dettagli risorsa specifica',
      description: 'Ottiene i dettagli di una risorsa tramite ID (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Dati della risorsa',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ResourceRecord'
              }
            }
          }
        },
        404: {
          description: 'Risorsa non trovata'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    put: {
      tags: ['Resources'],
      summary: 'Aggiorna risorsa esistente',
      description: 'Modifica i dati di una risorsa esistente (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                type: {
                  type: 'string',
                  enum: ['website', 'server', 'database', 'email', 'ftp', 'vpn', 'other']
                },
                url: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                is_active: {
                  type: 'boolean'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Risorsa aggiornata con successo'
        },
        404: {
          description: 'Risorsa non trovata'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    delete: {
      tags: ['Resources'],
      summary: 'Elimina risorsa',
      description: 'Elimina una risorsa dal sistema (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Risorsa eliminata con successo'
        },
        404: {
          description: 'Risorsa non trovata'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    }
  },

  // ==================== CREDENTIAL ENDPOINTS ====================
  '/api/credentials': {
    get: {
      tags: ['Credentials'],
      summary: 'Elenco credenziali',
      description: 'Ottiene la lista di tutte le credenziali cifrate (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'resource_id',
          schema: {
            type: 'integer'
          },
          description: 'Filtra per ID risorsa'
        }
      ],
      responses: {
        200: {
          description: 'Lista credenziali cifrate'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    post: {
      tags: ['Credentials'],
      summary: 'Crea nuova credenziale',
      description: 'Crea una nuova credenziale cifrata per una risorsa (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['resource_id', 'username', 'password'],
              properties: {
                resource_id: {
                  type: 'integer',
                  example: 1
                },
                username: {
                  type: 'string',
                  example: 'admin'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'MySecurePassword123!'
                },
                notes: {
                  type: 'string',
                  example: 'Accesso amministrativo'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Credenziale creata con successo'
        },
        400: {
          description: 'Dati mancanti'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    }
  },

  '/api/credentials/{id}': {
    get: {
      tags: ['Credentials'],
      summary: 'Dettagli credenziale specifica',
      description: 'Ottiene i dettagli di una credenziale cifrata tramite ID (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Dati della credenziale',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EncryptedCredential'
              }
            }
          }
        },
        404: {
          description: 'Credenziale non trovata'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    put: {
      tags: ['Credentials'],
      summary: 'Aggiorna credenziale esistente',
      description: 'Modifica i dati di una credenziale cifrata esistente (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string'
                },
                password: {
                  type: 'string',
                  format: 'password'
                },
                notes: {
                  type: 'string'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Credenziale aggiornata con successo'
        },
        404: {
          description: 'Credenziale non trovata'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    },
    delete: {
      tags: ['Credentials'],
      summary: 'Elimina credenziale',
      description: 'Elimina una credenziale dal sistema (richiede autenticazione)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Credenziale eliminata con successo'
        },
        404: {
          description: 'Credenziale non trovata'
        },
        401: {
          description: 'Autenticazione richiesta'
        }
      }
    }
  },

  // ==================== AUDIT LOG ENDPOINTS ====================
  '/api/audit-log': {
    get: {
      tags: ['Audit Log'],
      summary: 'Elenco audit log',
      description: 'Ottiene la lista di tutte le voci del registro attività',
      responses: {
        200: {
          description: 'Lista voci audit log'
        }
      }
    },
    post: {
      tags: ['Audit Log'],
      summary: 'Crea voce audit log',
      description: 'Crea una nuova voce nel registro attività',
      responses: {
        201: {
          description: 'Voce audit log creata'
        }
      }
    }
  },

  '/api/audit-log/{id}': {
    get: {
      tags: ['Audit Log'],
      summary: 'Dettagli voce audit log',
      description: 'Ottiene i dettagli di una voce del registro attività tramite ID',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        200: {
          description: 'Dati della voce audit log'
        }
      }
    }
  },

  // ==================== USER MANAGEMENT ENDPOINTS ====================
  '/api/users/pending': {
    get: {
      tags: ['User Management'],
      summary: 'Lista utenti in attesa di approvazione (solo admin)',
      description: 'Ottiene l\'elenco di tutti gli utenti che hanno registrato un account ma non sono ancora stati approvati da un admin',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Lista utenti in attesa'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        }
      }
    }
  },

  '/api/users': {
    get: {
      tags: ['User Management'],
      summary: 'Lista tutti gli utenti (solo admin)',
      description: 'Ottiene l\'elenco completo di tutti gli utenti del sistema con il loro stato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Lista di tutti gli utenti'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        }
      }
    },
    post: {
      tags: ['User Management'],
      summary: 'Crea un nuovo utente (solo admin)',
      description: 'Permette a un admin di creare un nuovo utente direttamente. L\'utente creato è automaticamente attivo e verificato.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'email', 'password'],
              properties: {
                username: {
                  type: 'string',
                  example: 'nuovo.utente'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'nuovo@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'SecureP@ss123!'
                },
                full_name: {
                  type: 'string',
                  example: 'Nuovo Utente'
                },
                role: {
                  type: 'string',
                  enum: ['admin', 'technician', 'viewer'],
                  default: 'technician',
                  description: 'Admin può creare utenti con qualsiasi ruolo, incluso admin'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Utente creato con successo'
        },
        400: {
          description: 'Dati non validi'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        },
        409: {
          description: 'Username o email già esistenti'
        }
      }
    }
  },

  '/api/users/{id}/approve': {
    put: {
      tags: ['User Management'],
      summary: 'Approva un utente in attesa (solo admin)',
      description: 'Approva un utente in attesa, impostando is_active=true e is_verified=true. L\'utente può quindi effettuare il login.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID dell\'utente da approvare'
        }
      ],
      responses: {
        200: {
          description: 'Utente approvato con successo'
        },
        400: {
          description: 'Utente già approvato'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        },
        404: {
          description: 'Utente non trovato'
        }
      }
    }
  },

  '/api/users/{id}/reject': {
    delete: {
      tags: ['User Management'],
      summary: 'Rifiuta ed elimina un utente in attesa (solo admin)',
      description: 'Rifiuta una richiesta di registrazione ed elimina l\'utente dal sistema. Funziona solo con utenti non ancora verificati.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID dell\'utente da rifiutare'
        }
      ],
      responses: {
        200: {
          description: 'Utente rifiutato ed eliminato con successo'
        },
        400: {
          description: 'Non è possibile rifiutare un utente già approvato'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        },
        404: {
          description: 'Utente non trovato'
        }
      }
    }
  },

  '/api/users/{id}/deactivate': {
    put: {
      tags: ['User Management'],
      summary: 'Disattiva un utente (solo admin)',
      description: 'Disattiva un utente attivo. L\'utente non potrà più effettuare il login. Non è possibile disattivare se stessi.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID dell\'utente da disattivare'
        }
      ],
      responses: {
        200: {
          description: 'Utente disattivato con successo'
        },
        400: {
          description: 'Utente già inattivo o tentativo di disattivare se stesso'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        },
        404: {
          description: 'Utente non trovato'
        }
      }
    }
  },

  '/api/users/{id}/reactivate': {
    put: {
      tags: ['User Management'],
      summary: 'Riattiva un utente disattivato (solo admin)',
      description: 'Riattiva un utente precedentemente disattivato. L\'utente deve essere già verificato.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID dell\'utente da riattivare'
        }
      ],
      responses: {
        200: {
          description: 'Utente riattivato con successo'
        },
        400: {
          description: 'Utente già attivo o non verificato'
        },
        401: {
          description: 'Non autenticato'
        },
        403: {
          description: 'Accesso negato - richiede ruolo admin'
        },
        404: {
          description: 'Utente non trovato'
        }
      }
    }
  }
};
