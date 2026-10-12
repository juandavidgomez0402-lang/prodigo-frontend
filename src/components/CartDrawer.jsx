import { useEffect, useRef, useState } from "react"
import { useCart } from "../context/CartContext.jsx"
import { formatPrice } from "../format.js"

export default function CartDrawer({ whatsapp = "" }) {
  const { items, total, open, setOpen, setItemQuantity, removeItem } = useCart()
  const closeRef = useRef(null)
  const [checkout, setCheckout] = useState(false)
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" })
  const [formError, setFormError] = useState("")
  const digits = String(whatsapp).replace(/\D/g, "")

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, setOpen])

  useEffect(() => {
    if (!open) setCheckout(false)
  }, [open])

  function continuePurchase(event) {
    event.preventDefault()
    const name = customer.name.trim()
    const phone = customer.phone.replace(/\D/g, "")
    const address = customer.address.trim()
    if (name.length < 2) {
      setFormError("Escribe tu nombre.")
      return
    }
    if (phone.length < 10) {
      setFormError("Escribe tu teléfono con indicativo o los 10 dígitos.")
      return
    }
    if (!digits) {
      setFormError("Esta tienda todavía no tiene un WhatsApp configurado.")
      return
    }
    setFormError("")
    const orderText = [
      "Hola, quiero hacer este pedido:",
      "",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      address ? `Dirección: ${address}` : null,
      "",
      ...items.map(
        (item) => `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
      ),
      `Total: ${formatPrice(total)}`,
    ]
      .filter(Boolean)
      .join("\n")
    window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(orderText)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <>
      <button
        type="button"
        className={open ? "cart-backdrop open" : "cart-backdrop"}
        aria-label="Cerrar carrito"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />
      <aside
        className={open ? "cart-drawer open" : "cart-drawer"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <div className="cart-head">
          <h2 id="cart-title">{checkout ? "Tus datos" : "Tu carrito"}</h2>
          <button
            ref={closeRef}
            type="button"
            className="text-button"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>
        </div>

        <div className="cart-body">
        {items.length === 0 ? (
          <p className="cart-empty">Aún no agregas productos.</p>
        ) : (
          <ul className="cart-lines">
            {items.map((item) => (
              <li key={item.id}>
                <div className="cart-line-top">
                  <p>{item.name}</p>
                  <p>{formatPrice(item.price * item.quantity)}</p>
                </div>
                {!checkout ? (
                  <div className="cart-line-actions">
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 99}
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => removeItem(item.id)}
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <p className="cart-note cart-line-qty">Cantidad {item.quantity}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {checkout && items.length > 0 ? (
          <form id="checkout" className="checkout-form" onSubmit={continuePurchase}>
            <label>
              Nombre
              <input
                name="name"
                autoComplete="name"
                value={customer.name}
                onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Teléfono
              <input
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                value={customer.phone}
                onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
                required
              />
            </label>
            <label>
              Dirección
              <input
                name="address"
                autoComplete="street-address"
                value={customer.address}
                onChange={(event) =>
                  setCustomer((current) => ({ ...current, address: event.target.value }))
                }
              />
            </label>
            {formError ? <p className="checkout-error">{formError}</p> : null}
          </form>
        ) : null}
        </div>

        <div className="cart-foot">
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          {items.length === 0 ? (
            <button type="button" className="whatsapp-button" disabled>
              Continuar compra
            </button>
          ) : checkout ? (
            <>
              <button type="submit" form="checkout" className="whatsapp-button">
                Enviar pedido por WhatsApp
              </button>
              <button type="button" className="text-button" onClick={() => setCheckout(false)}>
                Volver al carrito
              </button>
            </>
          ) : (
            <button
              type="button"
              className="whatsapp-button"
              disabled={!digits}
              onClick={() => {
                setFormError("")
                setCheckout(true)
              }}
            >
              Continuar compra
            </button>
          )}
          <p className="cart-note">
            {digits
              ? "El pedido se abre en el WhatsApp de la tienda para cerrar la venta."
              : "La tienda todavía no tiene un WhatsApp para recibir pedidos."}
          </p>
        </div>
      </aside>
    </>
  )
}
