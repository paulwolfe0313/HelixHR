# HelixHR – AI-Powered HR Assistant (MVP)

HelixHR is a **multi-tenant SaaS platform** that automates and simplifies HR operations through AI-driven employee support.  
This MVP demonstrates secure multi-tenant architecture, expense/employee data isolation, and the foundation for an AI HR assistant.

---

## 🚀 Features

**Dockerized Architecture**
- FastAPI backend with PostgreSQL  
- React (Vite) frontend with Tailwind-ready styling  
- Clean Docker Compose setup for local or cloud environments  

**Multi-Tenant Database (RLS)**
- Row-Level Security ensures each company (tenant) accesses only its own data  
- Shared PostgreSQL instance for multiple organizations  

**Seeded Demo Data**
- Two tenants: `Acme Inc.` and `Magnolia Group`  
- Each with demo employees (Sarah Johnson, David Lee) and PTO data  

**API Endpoints**
| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/health` | GET | Health check for backend |
| `/me` | GET | Returns current employee info (requires tenant + email headers) |
| `/employees` | GET | Lists all employees for a tenant |

**Frontend UI**
- Simple developer interface for testing `/me` and `/employees`  
- Input fields for Tenant UUID and Employee Email  
- Hot reload enabled in Docker (via Vite)  

---

## Architecture Overview

```plaintext
frontend/  →  React + Vite app (Dockerized)
backend/   →  FastAPI app (Dockerized)
infra/db/  →  Postgres init SQL (with RLS + tenants)
```

Each tenant is isolated by `tenant_id`.  
RLS enforces this rule:

```sql
USING (tenant_id::text = current_setting('app.tenant_id', true))
```

---

## Running the App

### Prerequisites
- Docker Desktop  
- Git Bash or any terminal  

### Clone & Start
```bash
git clone https://github.com/<your-username>/helixhr.git
cd helixhr
docker compose up --build
```

### Seed the Demo Data
```bash
docker compose exec backend python seed.py
```

You should see:
```
Seeding tenant Acme Inc....
Seeding tenant Magnolia Group....
Seed complete.
```

### Get Tenant IDs
```bash
docker compose exec db psql -U helix -d helixhr -c "SELECT id, name FROM tenants;"
```

---

## Testing

### Backend Health
```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### Frontend
Visit → **[http://localhost:5173](http://localhost:5173)**  
Use:
- Tenant UUID (from above)
- Email: `sarah@acmeinc.com` or `sarah@magnoliagroup.com`
- Click “Fetch /me” or “List Employees”

### Isolation Check
Mix up tenant IDs and emails to confirm you get:
```
404: User not found in this tenant
```

---

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React (Vite), Docker, Fetch API |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, Docker |
| **Database** | PostgreSQL 16 with RLS |
| **Infra** | Docker Compose |
| **Language** | Python 3.12, Node 20 |
| **AI Ready** | Architecture supports adding RAG + embeddings per tenant |

---

## Next Steps (Roadmap)

1. **Auth Integration** – Replace headers with real login (Auth0 or Clerk)
2. **AI HR Chatbot** – Add `/chat` endpoint using LangChain + Pinecone/Chroma  
3. **ETL Integration** – Pull real HR data (Airbyte, dbt, or Pandas)
4. **Tenant Admin UI** – Create dashboard to view tenant data
5. **Deployment** – Push containers to AWS ECS Fargate or Render

---

## Useful Commands

| Action | Command |
|--------|----------|
| Start all containers | `docker compose up --build` |
| Rebuild backend only | `docker compose build backend` |
| Seed demo tenants | `docker compose exec backend python seed.py` |
| List tenants | `docker compose exec db psql -U helix -d helixhr -c "SELECT id, name FROM tenants;"` |
| View backend logs | `docker compose logs -f backend` |
| View frontend logs | `docker compose logs -f frontend` |

---

## License
MIT License © 2025 HelixHR (Praxis AI Consulting)

---

## Author
**Paul Wolfe**  
AI Engineer • Software Architect • Founder of Praxis LLC  

