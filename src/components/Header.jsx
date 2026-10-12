import { brand } from "../brand.js"
import { useCart } from "../context/CartContext.jsx"

export default function Header() {
  const { count, setOpen } = useCart()

  return (
    <header className="site-header">
      <div className="container header-bar">
        <a className="brand" href="#inicio">
          <img src="/mark.png" alt="" width="36" height="36" />
          <span>{brand.name}</span>
        </a>
        <nav className="header-nav" aria-label="Principal">
          <a href="#tienda">Tienda</a>
          <button type="button" className="cart-button" onClick={() => setOpen(true)}>
            <BagIcon />
            <span>Carrito</span>
            <span className="cart-count">{count}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 8h12l-1 12H7L6 8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 8V7a3 3 0 0 1 6 0v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
