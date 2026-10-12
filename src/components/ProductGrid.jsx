import ProductCard from "./ProductCard.jsx"

export default function ProductGrid({ products, status }) {
  return (
    <section className="catalog" id="tienda">
      <div className="container">
        <div className="catalog-head">
          <div>
            <p className="eyebrow">Tienda</p>
            <h2>Productos</h2>
          </div>
          {status === "ready" ? (
            <p className="catalog-count">
              {products.length} {products.length === 1 ? "pieza" : "piezas"}
            </p>
          ) : null}
        </div>
        <p className="catalog-note">
          Precio por pieza. Toca un producto para ver su descripción.
        </p>

        {status === "loading" ? <SkeletonGrid /> : null}
        {status === "error" ? (
          <p className="catalog-status" role="alert">
            No se pudo cargar el catálogo. Inicia el backend con npm run dev.
          </p>
        ) : null}
        {status === "ready" && products.length === 0 ? (
          <p className="catalog-status">Todavía no hay productos publicados.</p>
        ) : null}
        {status === "ready" && products.length > 0 ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function SkeletonGrid() {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="skeleton" key={index} />
      ))}
    </div>
  )
}
