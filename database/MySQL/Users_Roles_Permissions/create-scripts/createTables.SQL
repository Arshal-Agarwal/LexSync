use Users_Roles_Permissions;

-- Use Function UUID_TO_BIN() AND BIN_TO_UUID() to insert

-- user table
CREATE TABLE users (
  id BINARY(16) PRIMARY KEY,
  org_id BINARY(16) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  bar_council_id VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- roles table
CREATE TABLE roles (
  id BINARY(16) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- permissions table
CREATE TABLE permissions (
  id BINARY(16) PRIMARY KEY,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  UNIQUE(resource, action)
);

-- role_permissions table
CREATE TABLE role_permissions (
  role_id BINARY(16),
  permission_id BINARY(16),
  PRIMARY KEY(role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE, -- Assuming you want to delete role_permissions if a role is deleted.
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE -- Assuming you want to delete role_permissions if a permission is deleted.
);

-- teams table
CREATE TABLE teams (
  id BINARY(16) PRIMARY KEY,
  org_id BINARY(16) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by BINARY(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL, -- Setting to NULL if the user who created the team is deleted.
  UNIQUE(org_id, name)
);

-- team_memberships table
CREATE TABLE team_memberships (
  team_id BINARY(16),
  user_id BINARY(16),
  role_in_team ENUM('lead', 'member', 'observer') DEFAULT 'member',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- user_delegations table
CREATE TABLE user_delegations (
  id BINARY(16) PRIMARY KEY,
  delegator_id BINARY(16) NOT NULL,
  delegatee_id BINARY(16) NOT NULL,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delegator_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (delegatee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- session_tokens table
CREATE TABLE session_tokens (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  refresh_token_hash VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- permission_overrides table
CREATE TABLE permission_overrides (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16),
  resource_type VARCHAR(100),
  resource_id BINARY(16),
  action VARCHAR(100),
  allow BOOLEAN,
  set_by BINARY(16),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (set_by) REFERENCES users(id) ON DELETE SET NULL -- Set to NULL if the user who set the override is deleted.
);

-- user_login_logs table
CREATE TABLE user_login_logs (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16),
  ip_address VARCHAR(45),
  device_info TEXT,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('success', 'failure') DEFAULT 'success',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);