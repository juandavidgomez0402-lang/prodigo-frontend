export async function fetchStore() {
  const response = await fetch("/api/store")
  if (!response.ok) {
    throw new Error("No se pudo cargar la tienda")
  }
  return response.json()
}
