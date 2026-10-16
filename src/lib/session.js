import { apiUrl } from "../api.js"

const STORAGE_KEY = "prodigo-admin"

export function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed?.token || !parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export async function setupAvailable() {
  const response = await fetch(apiUrl("/api/admin/setup"))
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || "No se pudo consultar el registro del administrador")
  }
  return Boolean(data.available)
}

export async function registerAdmin(email, password) {
  const response = await fetch(apiUrl("/api/admin/setup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || "No se pudo registrar el administrador")
  }
  const session = { email: data.email, token: data.token }
  saveSession(session)
  return session
}

export async function login(email, password) {
  const response = await fetch(apiUrl("/api/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || "No se pudo iniciar sesión")
  }
  const session = { email: data.email, token: data.token }
  saveSession(session)
  return session
}
