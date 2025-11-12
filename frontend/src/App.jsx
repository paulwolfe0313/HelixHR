import { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function App() {
  const [tenantId, setTenantId] = useState('')
  const [email, setEmail] = useState('')
  const [me, setMe] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loadingMe, setLoadingMe] = useState(false)
  const [loadingList, setLoadingList] = useState(false)

  // --- Chat state ---
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: "Hi! I’m your HelixHR assistant. Ask me about PTO, sick days, or your company policies."
    }
  ])

  async function loadMe() {
    if (!tenantId.trim()) return alert('Enter a Tenant ID (UUID).')
    if (!email.trim()) return alert('Enter a user email (e.g., sarah@acmeinc.com).')

    setLoadingMe(true); setMe(null)
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: {
          'X-Tenant-ID': tenantId.trim(),
          'X-User-Email': email.trim()
        }
      })
      if (!res.ok) {
        const err = await safeJson(res)
        alert(`Fetch /me failed: ${res.status} ${err.detail ?? ''}`)
        return
      }
      setMe(await res.json())
    } catch (e) {
      alert(`Network error calling /me: ${e.message}`)
    } finally {
      setLoadingMe(false)
    }
  }

  async function loadEmployees() {
    if (!tenantId.trim()) return alert('Enter a Tenant ID (UUID).')
    setLoadingList(true); setEmployees([])
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: { 'X-Tenant-ID': tenantId.trim() }
      })
      if (!res.ok) {
        const err = await safeJson(res)
        alert(`Fetch /employees failed: ${res.status} ${err.detail ?? ''}`)
        return
      }
      setEmployees(await res.json())
    } catch (e) {
      alert(`Network error calling /employees: ${e.message}`)
    } finally {
      setLoadingList(false)
    }
  }

  // --- Chat send (stubbed) ---
  async function sendMessage() {
    const text = chatInput.trim()
    if (!text) return
    if (!tenantId.trim()) return alert('Enter a Tenant ID first so I know which company to answer for.')
    if (!email.trim()) return alert('Enter your email so I know who you are.')

    const userMsg = { id: crypto.randomUUID(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      // TODO: replace with real /chat call (RAG) later
      // Example structure:
      // const res = await fetch(`${API_BASE}/chat`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Tenant-ID': tenantId.trim(),
      //     'X-User-Email': email.trim()
      //   },
      //   body: JSON.stringify({ messages: [...messages, userMsg] })
      // })
      // const data = await res.json()

      // Temporary assistant reply (stub)
      const hint =
        me?.pto_days_remaining != null
          ? `You currently have ${me.pto_days_remaining} PTO days remaining.`
          : `I can also tell you your PTO once you press "Fetch /me".`
      const reply = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `I’m HelixHR. You said: “${text}”. ${hint} (Policy Q&A coming soon.)`
      }
      await wait(400) // small delay for UX
      setMessages(prev => [...prev, reply])
    } catch (e) {
      const err = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `Sorry, I ran into a problem: ${e.message}`
      }
      setMessages(prev => [...prev, err])
    } finally {
      setChatLoading(false)
    }
  }

  function onEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white font-bold">H</div>
            <div>
              <h1 className="text-lg font-semibold leading-5">HelixHR</h1>
              <p className="text-xs text-slate-500 -mt-0.5">AI HR Assistant (MVP)</p>
            </div>
          </div>
          {me ? (
            <div className="flex items-center gap-3">
              <span className="badge">Signed in as</span>
              <div className="text-sm font-medium">{me.name}</div>
              <div className="text-xs text-slate-500">{me.email}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Not signed in</div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
        {/* Left column: Tenant & Employees */}
        <section className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Tenant & User</h2>
              <span className="text-xs text-slate-500">RLS-secured</span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Tenant ID</label>
                <input
                  className="input"
                  value={tenantId}
                  onChange={e => setTenantId(e.target.value)}
                  placeholder="Paste a tenant UUID"
                />
              </div>
              <div>
                <label className="label">User Email</label>
                <input
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@acmeinc.com"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={loadMe} className={clsx("btn btn-primary", loadingMe && "opacity-70")} disabled={loadingMe}>
                {loadingMe ? "Loading…" : "Fetch /me"}
              </button>
              <button onClick={loadEmployees} className={clsx("btn btn-ghost", loadingList && "opacity-70")} disabled={loadingList}>
                {loadingList ? "Loading…" : "List Employees"}
              </button>
            </div>

            {me && (
              <div className="mt-5 card p-4">
                <h3 className="mb-2 text-sm font-semibold">Me</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoRow label="Name" value={me.name} />
                  <InfoRow label="Email" value={me.email} />
                  <InfoRow label="Role" value={me.role} />
                  <InfoRow label="PTO Days Remaining" value={me.pto_days_remaining} />
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Employees</h2>
              <span className="text-xs text-slate-500">Tenant-scoped</span>
            </div>
            <div className="mt-4">
              {employees.length === 0 ? (
                <Empty
                  title="No employees loaded"
                  subtitle="Click “List Employees” to view employees for this tenant."
                />
              ) : (
                <ul className="divide-y divide-slate-200">
                  {employees.map(e => (
                    <li key={e.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{e.name}</div>
                        <div className="text-sm text-slate-500">{e.email}</div>
                      </div>
                      <span className="badge">{e.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Right column: Chat */}
        <section className="card flex h-[720px] flex-col overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-semibold">Chat with HelixHR</h2>
            <p className="text-sm text-slate-500">Ask about PTO, sick days, or policies. RAG-enabled answers coming soon.</p>
          </div>

          <ChatMessages messages={messages} />

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-end gap-3">
              <textarea
                className="input min-h-[52px] flex-1 resize-none"
                rows={2}
                placeholder="Type your question… (e.g., How many PTO days do I have?)"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={onEnter}
              />
              <button onClick={sendMessage} className={clsx("btn btn-primary", chatLoading && "opacity-70")} disabled={chatLoading}>
                {chatLoading ? "Sending…" : "Send"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tip: Press <span className="font-semibold">Enter</span> to send. Use <span className="font-semibold">Shift+Enter</span> for a line break.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{String(value ?? "")}</div>
    </div>
  )
}

function Empty({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">☁️</div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-sm text-slate-500">{subtitle}</div>
    </div>
  )
}

function ChatMessages({ messages }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages])

  return (
    <div ref={ref} className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map(m => (
        <div key={m.id} className={clsx("max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm", m.role === 'assistant'
          ? "bg-white border border-slate-200"
          : "ml-auto bg-primary text-white"
        )}>
          {m.text}
        </div>
      ))}
    </div>
  )
}

async function safeJson(res) {
  try { return await res.json() } catch { return {} }
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)) }
