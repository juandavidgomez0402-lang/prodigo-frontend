import { useEffect, useRef, useState } from "react"
import { useCart } from "../context/CartContext.jsx"
import { salePrice } from "../format.js"
import ProductOffer, { isAvailable } from "./ProductOffer.jsx"

export default function ProductModal({ product, index, onClose }) {
  const { addItem } = useCart()
  const closeRef = useRef(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const description = product.description?.trim() || product.detail?.trim() || ""

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  function changeQty(next) {
    const amount = Math.floor(Number(next))
    if (!Number.isFinite(amount)) return
    setQty(Math.max(1, Math.min(99, amount)))
  }

  const soldOut = !isAvailable(product)
  const discount = Math.min(100, Math.max(0, Number(product.discount) || 0))

  function add() {
    if (soldOut) return
    addItem(
      { ...product, price: salePrice(product), readyDays: Number(product.readyDays) || 0 },
      qty,
    )
    setAdded(true)
  }

  const showImage = product.image && !imageFailed

  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="product-modal-bar">
        <button ref={closeRef} type="button" className="product-modal-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div className="product-modal-scroll">
        <div className="product-modal-hero">
          {soldOut ? <span className="product-badge">Agotado</span> : null}
          {!soldOut && discount > 0 ? <span className="product-badge off">-{discount}%</span> : null}
          {showImage ? (
            <img src={product.image} alt={product.name} onError={() => setImageFailed(true)} />
          ) : (
            <span>{String(index + 1).padStart(2, "0")}</span>
          )}
        </div>
        <div className="product-modal-body">
          <div className="product-top">
            <h2 id="product-modal-title">{product.name}</h2>
            <ProductOffer product={product} />
          </div>
          {product.description?.trim() && product.detail ? (
            <p className="product-detail">{product.detail}</p>
          ) : null}
          <div>
            <p className="eyebrow">Descripción</p>
            <p className="product-description">
              {description || "Este producto todavía no tiene descripción."}
            </p>
          </div>
          <div className="product-actions">
            <div className="qty-row">
              <span id={`${product.id}-modal-qty`}>Cantidad</span>
              <div className="qty">
                <button
                  type="button"
                  onClick={() => changeQty(qty - 1)}
                  disabled={soldOut || qty <= 1}
                  aria-label={`Disminuir cantidad de ${product.name}`}
                >
                  −
                </button>
                <input
                  aria-labelledby={`${product.id}-modal-qty`}
                  inputMode="numeric"
                  min="1"
                  max="99"
                  value={qty}
                  disabled={soldOut}
                  onChange={(event) => changeQty(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => changeQty(qty + 1)}
                  disabled={soldOut || qty >= 99}
                  aria-label={`Aumentar cantidad de ${product.name}`}
                >
                  +
                </button>
              </div>
            </div>
            <button type="button" className="add-button" onClick={add} disabled={soldOut}>
              {soldOut ? "Agotado" : added ? "Agregado" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
