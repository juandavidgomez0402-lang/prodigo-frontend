import { useEffect, useState } from "react"
import { fetchStore } from "../api.js"
import CartDrawer from "../components/CartDrawer.jsx"
import Cover from "../components/Cover.jsx"
import Footer from "../components/Footer.jsx"
import Header from "../components/Header.jsx"
import ProductGrid from "../components/ProductGrid.jsx"
import { CartProvider } from "../context/CartContext.jsx"

export default function StorePage() {
  const [store, setStore] = useState(null)
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    let active = true
    fetchStore()
      .then((data) => {
        if (!active) return
        setStore(data)
        setStatus("ready")
      })
      .catch(() => {
        if (!active) return
        setStatus("error")
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <CartProvider>
      <Header />
      <main>
        <Cover cover={store?.cover} />
        <ProductGrid products={store?.products ?? []} status={status} />
      </main>
      <Footer whatsapp={store?.whatsapp || ""} />
      <CartDrawer whatsapp={store?.whatsapp || ""} />
    </CartProvider>
  )
}
