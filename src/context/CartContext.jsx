import { createContext, useContext, useEffect, useMemo, useState } from "react"

const CartContext = createContext(null)
const STORAGE_KEY = "prodigo-cart"

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function clamp(quantity) {
  const amount = Math.floor(Number(quantity))
  if (!Number.isFinite(amount) || amount < 1) return 1
  return Math.min(99, amount)
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  function addItem(product, quantity) {
    const qty = clamp(quantity)
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (!existing) {
        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            readyDays: Number(product.readyDays) || 0,
            image: product.image ?? null,
            quantity: qty,
          },
        ]
      }
      return current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              price: product.price,
              readyDays: Number(product.readyDays) || 0,
              quantity: Math.min(99, item.quantity + qty),
            }
          : item,
      )
    })
  }

  function setItemQuantity(id, quantity) {
    const qty = clamp(quantity)
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
    )
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const value = {
    items,
    addItem,
    setItemQuantity,
    removeItem,
    count,
    total,
    open,
    setOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider")
  }
  return context
}
