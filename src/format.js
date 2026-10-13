const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatPrice(value) {
  return cop.format(value)
}

export function salePrice(product) {
  const price = Number(product?.price) || 0
  const discount = Math.min(100, Math.max(0, Number(product?.discount) || 0))
  return Math.round((price * (100 - discount)) / 100)
}

export function readyLabel(days) {
  const count = Math.floor(Number(days) || 0)
  if (count <= 0) return ""
  return count === 1 ? "Listo en 1 día" : `Listo en ${count} días`
}
