from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import get_db
from schemas import HealthResponse, EmployeeOut

app = FastAPI(title="HelixHR Backend", version="0.1.0")

# CORS (dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)

def require_tenant(tenant_id: str | None) -> str:
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Missing X-Tenant-ID header")
    return tenant_id

@app.get("/health", response_model=HealthResponse)
def health():
    return {"status": "ok"}

@app.get("/me", response_model=EmployeeOut)
def get_me(
    request: Request,
    x_tenant_id: str | None = Header(default=None, alias="X-Tenant-ID"),
    x_user_email: str | None = Header(default=None, alias="X-User-Email")
):
    """
    DEV endpoint: simulate a logged-in user by passing X-User-Email and X-Tenant-ID headers.
    In production, you'll replace this with real auth (JWT/SSO).
    """
    tenant_id = require_tenant(x_tenant_id)

    if not x_user_email:
        raise HTTPException(status_code=400, detail="Missing X-User-Email header")

    with get_db(tenant_id) as db:
        row = db.execute(
            text("""
                SELECT e.id, e.name, e.email, e.role, COALESCE(p.pto_days_remaining, 0) as pto
                FROM employees e
                LEFT JOIN pto_balances p ON p.employee_id = e.id AND p.tenant_id = e.tenant_id
                WHERE e.email = :email
                LIMIT 1
            """),
            {"email": x_user_email}
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="User not found in this tenant")

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3],
            "pto_days_remaining": row[4]
        }

@app.get("/employees")
def list_employees(
    x_tenant_id: str | None = Header(default=None, alias="X-Tenant-ID")
):
    """
    List employees for current tenant (RLS enforced).
    """
    tenant_id = require_tenant(x_tenant_id)
    with get_db(tenant_id) as db:
        rows = db.execute(
            text("""
                SELECT e.id, e.name, e.email, e.role
                FROM employees e
                ORDER BY e.name ASC
            """)
        ).fetchall()
        return [
            {"id": r[0], "name": r[1], "email": r[2], "role": r[3]}
        for r in rows]
