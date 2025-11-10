-- Database initialization for HelixHR (multi-tenant, pooled, RLS)

-- Safety: enable pgcrypto so we can use gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- App setting used by RLS to know the current tenant on this connection
-- We'll SET app.tenant_id = '<uuid>' in the app per request
-- (No explicit object here; we use current_setting('app.tenant_id', true))

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- PTO balances (simple example)
CREATE TABLE IF NOT EXISTS pto_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pto_days_remaining INTEGER NOT NULL DEFAULT 0
);

-- Simple audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    actor_id UUID,
    action TEXT NOT NULL,
    object_type TEXT,
    object_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy: only rows with tenant_id == app.tenant_id are visible
-- Using current_setting('app.tenant_id', true) returns NULL if unset; compare safely
CREATE POLICY employees_isolate_tenant
    ON employees
    USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY pto_isolate_tenant
    ON pto_balances
    USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY audit_isolate_tenant
    ON audit_logs
    USING (tenant_id::text = current_setting('app.tenant_id', true));

-- A helper function: write an audit row
CREATE OR REPLACE FUNCTION log_audit(_tenant UUID, _actor UUID, _action TEXT, _object_type TEXT, _object_id TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs(tenant_id, actor_id, action, object_type, object_id)
  VALUES (_tenant, _actor, _action, _object_type, _object_id);
END;
$$ LANGUAGE plpgsql;

-- Seed two tenants (IDs will be generated here then we'll reference them via app seed script)
-- We only insert names now; the backend seed script will upsert employees & PTO.
INSERT INTO tenants (name) VALUES ('Acme Inc.') ON CONFLICT DO NOTHING;
INSERT INTO tenants (name) VALUES ('Magnolia Group') ON CONFLICT DO NOTHING;
