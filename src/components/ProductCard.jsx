import { useEffect, useRef, useState } from "react"
import { useCart } from "../context/CartContext.jsx"
import { formatPrice } from "../format.js"

export default function ProductCard({ product, index }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function changeQty(next) {
    if (next === "") {
      setQty("")
      return
    }
    const amount = Math.floor(Number(next))
    if (!Number.isFinite(amount)) return
    setQty(Math.max(1, Math.min(99, amount)))
  }

  function add() {
    addItem(product, qty || 1)
    if (qty === "") setQty(1)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }

  const showImage = product.image && !imageFailed

  return (
    <article className="product-card">
      <div className="product-media">
        {showImage ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span>{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <div className="product-body">
        <div>
          <div className="product-top">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">{formatPrice(product.price)}</p>
          </div>
          {product.detail ? <p className="product-detail">{product.detail}</p> : null}
        </div>
        <div className="product-actions">
          <div className="qty-row">
            <span id={`${product.id}-qty`}>Cantidad</span>
            <div className="qty">
              <button
                type="button"
                onClick={() => changeQty(Math.max(1, (Number(qty) || 1) - 1))}
                aria-label={`Disminuir cantidad de ${product.name}`}
              >
                −
              </button>
              <input
                aria-labelledby={`${product.id}-qty`}
                inputMode="numeric"
                min="1"
                max="99"
                value={qty}
                onChange={(event) => changeQty(event.target.value)}
                onBlur={() => {
                  if (qty === "") setQty(1)
                }}
              />
              <button
                type="button"
                onClick={() => changeQty(Math.min(99, (Number(qty) || 1) + 1))}
                aria-label={`Aumentar cantidad de ${product.name}`}
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            className="add-button"
            aria-label={added ? `${product.name} agregado` : `Agregar ${product.name} al carrito`}
            onClick={add}
          >
            {added ? (
              "Agregado"
            ) : (
              <>
                <span className="add-long">Agregar al carrito</span>
                <span className="add-short">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
