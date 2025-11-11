from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Date, Integer, ForeignKey
from typing import Optional
import uuid

class Base(DeclarativeBase):
    pass

def uuid_pk() -> str:
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = "tenants"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="employee")
    hire_date: Mapped[Optional[str]] = mapped_column(Date, nullable=True)

class PTOBalance(Base):
    __tablename__ = "pto_balances"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    employee_id: Mapped[str] = mapped_column(String, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    pto_days_remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
