"""
Seed script to attach sample employees and PTO to the two initial tenants.
Run once after the stack is up: docker compose exec backend python seed.py
"""
from sqlalchemy import text
from database import get_db

def get_tenant_ids():
    # tenants table is global (no RLS), so use no-tenant session
    with get_db(None) as db:
        res = db.execute(text("SELECT id::text AS id, name FROM tenants ORDER BY created_at ASC"))
        return [(row[0], row[1]) for row in res.fetchall()]

def upsert_employee(db, tenant_id, name, email, role, pto_days):
    # Insert employee (let Postgres generate UUIDs natively)
    emp = db.execute(
        text("""
            INSERT INTO employees (id, tenant_id, name, email, role)
            VALUES (gen_random_uuid(), :tenant_id, :name, :email, :role)
            RETURNING id::text
        """),
        dict(tenant_id=tenant_id, name=name, email=email, role=role)
    ).fetchone()
    emp_id = emp[0]

    # PTO row
    db.execute(
        text("""
            INSERT INTO pto_balances (id, tenant_id, employee_id, pto_days_remaining)
            VALUES (gen_random_uuid(), :tenant_id, :employee_id, :pto)
        """),
        dict(tenant_id=tenant_id, employee_id=emp_id, pto=pto_days)
    )

def main():
    tenants = get_tenant_ids()
    if not tenants:
        print("No tenants found. Did init.sql run?")
        return

    for tid, name in tenants:
        with get_db(tid) as db:
            print(f"Seeding tenant {name} ({tid})...")
            domain = name.replace(' ', '').lower()
            upsert_employee(db, tid, "Sarah Johnson", f"sarah@{domain}.com", "employee", 12)
            upsert_employee(db, tid, "David Lee", f"david@{domain}.com", "manager", 18)
            db.commit()
    print("Seed complete.")

if __name__ == "__main__":
    main()
