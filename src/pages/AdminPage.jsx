import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Dashboard from "../components/admin/Dashboard.jsx"
import { clearSession, login, readSession, registerAdmin, setupAvailable } from "../lib/session.js"
import "../admin.css"

export default function AdminPage() {
  const [session, setSession] = useState(readSession)

  if (!session) return <LoginForm onSuccess={setSession} />
  return (
    <Dashboard
      user={session}
      onLogout={() => {
        clearSession()
        setSession(null)
      }}
    />
  )
}

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [canRegister, setCanRegister] = useState(false)

  useEffect(() => {
    let active = true
    setupAvailable()
      .then((available) => {
        if (active) setCanRegister(available)
      })
      .catch((caught) => {
        if (active) setError(caught.message)
      })
    return () => {
      active = false
    }
  }, [])

  function credentials(event) {
    const form = new FormData(event.currentTarget)
    const nextEmail = String(form.get("email") || email).trim()
    const nextPassword = String(form.get("password") || password)
    setEmail(nextEmail)
    setPassword(nextPassword)
    return { email: nextEmail, password: nextPassword }
  }

  async function submit(event) {
    event.preventDefault()
    const next = credentials(event)
    setError("")
    setPending(true)
    try {
      onSuccess(await login(next.email, next.password))
    } catch (caught) {
      setError(caught.message)
    } finally {
      setPending(false)
    }
  }

  async function register(event) {
    event.preventDefault()
    const form = event.currentTarget.form
    const nextEmail = String(new FormData(form).get("email") || email).trim()
    const nextPassword = String(new FormData(form).get("password") || password)
    setEmail(nextEmail)
    setPassword(nextPassword)
    setError("")
    setPending(true)
    try {
      onSuccess(await registerAdmin(nextEmail, nextPassword))
    } catch (caught) {
      setError(caught.message)
      if (caught.message.includes("ya está registrado")) setCanRegister(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="admin-gate">
      <form className="admin-panel" onSubmit={submit}>
        <img src="/mark.png" alt="" width="48" height="48" />
        <h1>Admin</h1>
        <p>
          {canRegister
            ? "Registra el perfil del administrador. Este botón solo se puede usar una vez."
            : "Entra con el correo y la contraseña del administrador."}
        </p>
        <label>
          Correo
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        {canRegister ? (
          <button className="add-button" type="button" onClick={register} disabled={pending}>
            {pending ? "Registrando…" : "Registrar administrador"}
          </button>
        ) : (
          <button className="add-button" type="submit" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </button>
        )}
        <Link to="/">Volver a la tienda</Link>
      </form>
    </main>
  )
}
