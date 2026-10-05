-- S.kosif Capabilities v2 D1 schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_members (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  subject TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','partner','manager','senior','viewer')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, subject)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  business_year INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR' CHECK (length(currency)=3),
  status TEXT NOT NULL CHECK (status IN ('active','archived')),
  schema_version TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT
);
CREATE INDEX IF NOT EXISTS workspaces_tenant_idx ON workspaces(tenant_id,status);
CREATE UNIQUE INDEX IF NOT EXISTS workspaces_tenant_id_uq ON workspaces(tenant_id,id);

CREATE TABLE IF NOT EXISTS workspace_revisions (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  revision INTEGER NOT NULL CHECK (revision > 0),
  state_json TEXT NOT NULL CHECK (json_valid(state_json)),
  state_hash TEXT NOT NULL CHECK (length(state_hash)=64),
  saved_by TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id, revision)
);
CREATE INDEX IF NOT EXISTS workspace_revisions_latest_idx ON workspace_revisions(workspace_id,revision DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  at TEXT NOT NULL,
  canonical_version TEXT NOT NULL DEFAULT 'SKOSIF-C14N-v2',
  prev_hash TEXT NOT NULL CHECK (length(prev_hash)=64),
  entry_hash TEXT NOT NULL UNIQUE CHECK (length(entry_hash)=64)
);
CREATE INDEX IF NOT EXISTS audit_log_workspace_seq_idx ON audit_log(workspace_id,seq);

CREATE TRIGGER IF NOT EXISTS archived_workspace_is_read_only
BEFORE INSERT ON workspace_revisions
WHEN EXISTS (SELECT 1 FROM workspaces WHERE id=NEW.workspace_id AND archived_at IS NOT NULL)
BEGIN
  SELECT RAISE(ABORT,'archived_workspace_is_read_only');
END;


-- Per-workspace access. Existing workspaces without a security row keep tenant-level behavior.
CREATE TABLE IF NOT EXISTS workspace_security (
  workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  access_mode TEXT NOT NULL CHECK (access_mode IN ('tenant','explicit')),
  sensitivity TEXT NOT NULL CHECK (sensitivity IN ('standard','sensitive')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS workspace_security_tenant_idx ON workspace_security(tenant_id,sensitivity);

CREATE TABLE IF NOT EXISTS workspace_access (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  subject TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','partner','manager','senior','viewer')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id, subject)
);
CREATE INDEX IF NOT EXISTS workspace_access_subject_idx ON workspace_access(tenant_id,subject,workspace_id);
