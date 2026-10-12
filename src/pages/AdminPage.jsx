import { onAuthStateChanged, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Dashboard from "../components/admin/Dashboard.jsx"
import { auth, authReady, firebaseReady, signInAdmin } from "../lib/firebase.js"
import "../admin.css"

const authErrors = {
  "auth/invalid-email": "El correo no es válido",
  "auth/user-not-found": "Correo o contraseña incorrectos",
  "auth/wrong-password": "Correo o contraseña incorrectos",
  "auth/invalid-credential": "Correo o contraseña incorrectos. Usa la cuenta creada en Firebase Authentication.",
  "auth/missing-password": "Escribe la contraseña.",
  "auth/invalid-password": "Correo o contraseña incorrectos. Usa la cuenta creada en Firebase Authentication.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento.",
  "auth/network-request-failed": "No hay conexión con Firebase",
  "auth/operation-not-allowed": "Activa el acceso con correo y contraseña en Firebase Authentication",
  "auth/configuration-not-found": "Authentication no está activado en el proyecto de Firebase",
}

export default function AdminPage() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      return undefined
    }
    let unsubscribe = () => {}
    let active = true
    authReady.then(() => {
      if (!active) return
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        if (active) setUser(nextUser)
      })
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  if (!firebaseReady) return <SetupNotice />
  if (user === undefined) {
    return (
      <main className="admin-gate">
        <p>Cargando sesión…</p>
      </main>
    )
  }
  if (!user) return <LoginForm />
  return <Dashboard user={user} onLogout={() => signOut(auth)} />
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const nextEmail = String(form.get("email") || email).trim()
    const nextPassword = String(form.get("password") || password)
    setEmail(nextEmail)
    setPassword(nextPassword)
    setError("")
    setPending(true)
    try {
      await signInAdmin(nextEmail, nextPassword)
    } catch (caught) {
      setError(authErrors[caught.code] || "No se pudo iniciar sesión")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="admin-gate">
      <form className="admin-panel" onSubmit={submit}>
        <img src="/mark.png" alt="" width="48" height="48" />
        <h1>Admin</h1>
        <p>Entra con la cuenta de Firebase para editar la tienda.</p>
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
        <button className="add-button" type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
        <Link to="/">Volver a la tienda</Link>
      </form>
    </main>
  )
}

function SetupNotice() {
  return (
    <main className="admin-gate">
      <section className="admin-panel">
        <img src="/mark.png" alt="" width="48" height="48" />
        <h1>Admin</h1>
        <p>Falta conectar Firebase Authentication.</p>
        <p>
          En <code>prodigo-frontend/.env</code> agrega la configuración web del proyecto. En{" "}
          <code>prodigo-backend/.env</code> agrega el mismo <code>FIREBASE_PROJECT_ID</code>.
        </p>
        <Link to="/">Volver a la tienda</Link>
      </section>
    </main>
  )
}
