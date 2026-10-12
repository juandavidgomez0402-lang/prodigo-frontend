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
        {image ? (
          <h1>{title}</h1>
        ) : (
          <>
            <img className="cover-logo" src="/logo.png" alt="" />
            <h1 className="sr-only">{title}</h1>
          </>
        )}
        <p className="lede">{subtitle}</p>
        <a className="cover-link" href="#tienda">
          Ver tienda
        </a>
      </div>
    </section>
  )
}
