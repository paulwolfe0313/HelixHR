import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function App() {
  const [tenantId, setTenantId] = useState('')
  const [email, setEmail] = useState('')
  const [me, setMe] = useState(null)
  const [employees, setEmployees] = useState([])

  async function loadMe() {
    setMe(null)
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        'X-Tenant-ID': tenantId,
        'X-User-Email': email
      }
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Error: ${res.status} ${err.detail || ''}`)
      return
    }
    setMe(await res.json())
  }

  async function loadEmployees() {
    setEmployees([])
    const res = await fetch(`${API_BASE}/employees`, {
      headers: { 'X-Tenant-ID': tenantId }
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Error: ${res.status} ${err.detail || ''}`)
      return
    }
    setEmployees(await res.json())
  }

  return (
    <div style={{fontFamily:'system-ui', padding:'24px', maxWidth: 900, margin:'0 auto'}}>
      <h1>HelixHR (MVP)</h1>
      <p>Dev helper UI: choose a tenant and a user email to simulate login.</p>

      <div style={{display:'grid', gap:12, gridTemplateColumns:'1fr 1fr'}}>
        <div>
          <label>Tenant ID</label>
          <input
            value={tenantId}
            onChange={e=>setTenantId(e.target.value)}
            placeholder="Paste a tenant ID"
            style={{width:'100%', padding:8, border:'1px solid #ccc', borderRadius:8}}
          />
          <small>Use one of the seeded tenant IDs (see instructions below).</small>
        </div>
        <div>
          <label>User Email</label>
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="sarah@acmeinc.com"
            style={{width:'100%', padding:8, border:'1px solid #ccc', borderRadius:8}}
          />
        </div>
      </div>

      <div style={{display:'flex', gap:12, marginTop:12}}>
        <button onClick={loadMe} style={{padding:'10px 14px'}}>Fetch /me</button>
        <button onClick={loadEmployees} style={{padding:'10px 14px'}}>List Employees</button>
      </div>

      {me && (
        <div style={{marginTop:24, padding:16, border:'1px solid #ddd', borderRadius:12}}>
          <h3>Me</h3>
          <pre>{JSON.stringify(me, null, 2)}</pre>
        </div>
      )}

      {employees.length > 0 && (
        <div style={{marginTop:24, padding:16, border:'1px solid #ddd', borderRadius:12}}>
          <h3>Employees</h3>
          <pre>{JSON.stringify(employees, null, 2)}</pre>
        </div>
      )}

      <div style={{marginTop:32, color:'#555'}}>
        <h3>How to use (dev)</h3>
        <ol>
          <li>Run the stack with Docker (see instructions).</li>
          <li>Run the seed script to create two tenants and users.</li>
          <li>Copy a tenant ID and an email into the fields above.</li>
          <li>Use the buttons to hit the API with the correct headers.</li>
        </ol>
      </div>
    </div>
  )
}
