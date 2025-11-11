from pydantic import BaseModel, EmailStr

class HealthResponse(BaseModel):
    status: str

class EmployeeOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    pto_days_remaining: int
