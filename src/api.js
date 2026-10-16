const API_ORIGIN = (import.meta.env.VITE_API_URL || "https://prodigo-backend.onrender.com").replace(
  /\/$/,
  "",
)

export function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${API_ORIGIN}${normalized}`
}

export function mediaUrl(value) {
  if (!value) return ""
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }
  return apiUrl(value)
}

export async function fetchStore() {
  const response = await fetch(apiUrl("/api/store"))
  if (!response.ok) {
    throw new Error("No se pudo cargar la tienda")
  }
  return response.json()
}
