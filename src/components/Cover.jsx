function focusPercent(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 50
  return Math.min(100, Math.max(0, number))
}

export default function Cover({ cover }) {
  const title = cover?.title || "Pródigo"
  const subtitle = cover?.subtitle || "Tienda en línea."
  const image = cover?.image || ""
  const focusX = focusPercent(cover?.focusX)
  const focusY = focusPercent(cover?.focusY)

  return (
    <section
      className={image ? "cover has-image" : "cover"}
      id="inicio"
      style={
        image
          ? {
              backgroundImage: `url("${image}")`,
              backgroundPosition: `${focusX}% ${focusY}%`,
            }
          : undefined
      }
    >
      <div className="cover-inner">
        <h1 className="sr-only">{title}</h1>
        <p className="sr-only">{subtitle}</p>
        <a className="cover-link" href="#tienda">
          Ver tienda
        </a>
      </div>
    </section>
  )
}
