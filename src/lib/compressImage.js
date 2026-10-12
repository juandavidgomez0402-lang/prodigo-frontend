const LIMITS = {
  product: { maxEdge: 640, maxChars: 160_000 },
  cover: { maxEdge: 1280, maxChars: 280_000 },
}

export function imageBytes(dataUrl) {
  const base64 = String(dataUrl).split(",")[1] || ""
  return Math.round((base64.length * 3) / 4)
}

export async function compressImage(file, kind) {
  const limits = LIMITS[kind]
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("El archivo tiene que ser una imagen")
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("La foto original supera 15 MB")
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("No se pudo leer esta foto. Prueba con JPG o PNG.")
  }

  try {
    let quality = 0.72
    let edge = limits.maxEdge
    let dataUrl = ""
    for (let attempt = 0; attempt < 7; attempt += 1) {
      dataUrl = await renderJpeg(bitmap, edge, quality)
      if (dataUrl.length <= limits.maxChars) return dataUrl
      quality = Math.max(0.42, quality - 0.08)
      edge = Math.round(edge * 0.82)
    }
    throw new Error("La foto sigue siendo muy pesada. Prueba con otra imagen.")
  } finally {
    bitmap.close?.()
  }
}

function renderJpeg(bitmap, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d", { alpha: false })
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la foto"))
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("No se pudo leer la foto comprimida"))
        reader.readAsDataURL(blob)
      },
      "image/jpeg",
      quality,
    )
  })
}
