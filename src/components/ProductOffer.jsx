import { formatPrice, readyLabel, salePrice } from "../format.js"

export function isAvailable(product) {
  return product?.available !== false
}

export default function ProductOffer({ product }) {
  const discount = Math.min(100, Math.max(0, Number(product.discount) || 0))
  const wait = readyLabel(product.readyDays)
  const soldOut = !isAvailable(product)

  return (
    <div className="product-offer">
      {discount > 0 ? (
        <p className="product-price">
          <span className="price-old">{formatPrice(product.price)}</span>
          <span>{formatPrice(salePrice(product))}</span>
        </p>
      ) : (
        <p className="product-price">{formatPrice(product.price)}</p>
      )}
      {soldOut ? <p className="product-wait">Agotado</p> : null}
      {!soldOut && wait ? <p className="product-wait">{wait}</p> : null}
    </div>
  )
}
