export default function Cover({ cover }) {
  const title = cover?.title || "Pródigo"
  const subtitle = cover?.subtitle || "Tienda en línea."
  const image = cover?.image || ""

  return (
    <section
      className={image ? "cover has-image" : "cover"}
      id="inicio"
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
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
