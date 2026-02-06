-- Resources Table: Stores IT resources (servers, VMs, databases, etc.) for each client
-- Each resource belongs to a client and can have multiple credentials
-- The 'type' field is flexible to accommodate various resource types
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,                    -- Links to client who owns this resource
  name VARCHAR(100) NOT NULL,                -- Resource name (e.g., "Production Web Server")
  type VARCHAR(50),                          -- Resource type (e.g., "server", "database", "vm", "saas")
  description TEXT,                          -- Additional resource details
  ip_address VARCHAR(45),                    -- IPv4 or IPv6 address
  hostname VARCHAR(100),                     -- DNS hostname or domain
  is_active BOOLEAN DEFAULT true,            -- Soft delete flag
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,                            -- User who created this resource
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,  -- Delete resources when client is deleted
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_client (client_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
