import { useEffect, useRef, useState } from "react"
import { useCart } from "../context/CartContext.jsx"
import { formatPrice } from "../format.js"

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

  function add() {
    addItem(product, qty)
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
          {showImage ? (
            <img src={product.image} alt={product.name} onError={() => setImageFailed(true)} />
          ) : (
            <span>{String(index + 1).padStart(2, "0")}</span>
          )}
        </div>
        <div className="product-modal-body">
          <div className="product-top">
            <h2 id="product-modal-title">{product.name}</h2>
            <p className="product-price">{formatPrice(product.price)}</p>
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
                  disabled={qty <= 1}
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
                  onChange={(event) => changeQty(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => changeQty(qty + 1)}
                  disabled={qty >= 99}
                  aria-label={`Aumentar cantidad de ${product.name}`}
                >
                  +
                </button>
              </div>
            </div>
            <button type="button" className="add-button" onClick={add}>
              {added ? "Agregado" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
