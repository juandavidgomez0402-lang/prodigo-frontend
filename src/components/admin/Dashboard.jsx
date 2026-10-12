import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { fetchStore } from "../../api.js"
import { adminRequest } from "../../lib/adminApi.js"
import { compressImage, imageBytes } from "../../lib/compressImage.js"

export default function Dashboard({ user, onLogout }) {
  const [store, setStore] = useState(null)
  const [status, setStatus] = useState("loading")
  const [allowed, setAllowed] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const token = await user.getIdToken()
        await adminRequest("/api/me", token)
        const data = await fetchStore()
        if (!active) return
        setStore(data)
        setAllowed(true)
        setStatus("ready")
      } catch (caught) {
        if (!active) return
        setError(caught.message)
        setStatus("error")
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  async function save(path, options) {
    setError("")
    setMessage("")
    const token = await user.getIdToken()
    const next = await adminRequest(path, token, options)
    setStore(next)
    return next
  }

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div className="admin-wrap admin-top-bar">
          <Link className="brand" to="/">
            <img src="/mark.png" alt="" width="32" height="32" />
            <span>Pródigo</span>
          </Link>
          <button type="button" className="text-button" onClick={onLogout}>
            Salir
          </button>
        </div>
      </header>
      <main className="admin-wrap admin-main">
        <p className="eyebrow">Administración</p>
        <h1>Tienda</h1>
        <p className="admin-note">Solo el rol prodigo puede personalizar esta tienda.</p>
        {status === "loading" ? <p>Cargando catálogo…</p> : null}
        {message ? <p className="admin-note">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {allowed && store ? (
          <>
            <WhatsappEditor
              whatsapp={store.whatsapp || ""}
              onSave={save}
              onDone={(text) => setMessage(text)}
              onError={setError}
            />
            {store.whatsapp ? (
              <>
                <CoverEditor
                  cover={store.cover}
                  onSave={save}
                  onDone={(text) => setMessage(text)}
                  onError={setError}
                />
                <ProductCreator onSave={save} onDone={(text) => setMessage(text)} onError={setError} />
                <ProductList
                  products={store.products}
                  onSave={save}
                  onDone={(text) => setMessage(text)}
                  onError={setError}
                />
              </>
            ) : (
              <p className="admin-note">Guarda el WhatsApp para administrar la portada y los productos.</p>
            )}
          </>
        ) : null}
      </main>
    </div>
  )
}

function WhatsappEditor({ whatsapp, onSave, onDone, onError }) {
  const [value, setValue] = useState(whatsapp)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setValue(whatsapp)
  }, [whatsapp])

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    try {
      await onSave("/api/whatsapp", {
        method: "PUT",
        body: JSON.stringify({ whatsapp: value }),
      })
      onDone("WhatsApp guardado")
    } catch (caught) {
      onError(caught.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="admin-card" onSubmit={submit}>
      <h2>WhatsApp de la tienda</h2>
      <p>Obligatorio. Los pedidos del carrito se envían a este número para cerrar la venta.</p>
      <label>
        Número con indicativo
        <input
          inputMode="tel"
          autoComplete="tel"
          placeholder="573146081699"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </label>
      {!whatsapp ? <p className="admin-note">Todavía no hay un WhatsApp guardado.</p> : null}
      <button className="add-button" type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar WhatsApp"}
      </button>
    </form>
  )
}

function CoverEditor({ cover, onSave, onDone, onError }) {
  const frameRef = useRef(null)
  const dragRef = useRef(null)
  const naturalRef = useRef(null)
  const [image, setImage] = useState(cover.image)
  const [focus, setFocus] = useState({
    x: focusPercent(cover.focusX),
    y: focusPercent(cover.focusY),
  })
  const [dragging, setDragging] = useState(false)
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setImage(cover.image)
    setFocus({ x: focusPercent(cover.focusX), y: focusPercent(cover.focusY) })
  }, [cover.image, cover.focusX, cover.focusY])

  useEffect(() => {
    naturalRef.current = null
    if (!image) return undefined
    const photo = new Image()
    photo.onload = () => {
      naturalRef.current = { width: photo.naturalWidth, height: photo.naturalHeight }
    }
    photo.src = image
    return () => {
      photo.onload = null
    }
  }, [image])

  function beginDrag(event) {
    if (!image || !frameRef.current) return
    frameRef.current.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      focusX: focus.x,
      focusY: focus.y,
    }
    setDragging(true)
  }

  function moveDrag(event) {
    const drag = dragRef.current
    const frame = frameRef.current
    if (!drag || !frame) return
    const box = frame.getBoundingClientRect()
    setFocus({
      x: movedFocus(drag.focusX, event.clientX - drag.x, "x", box, naturalRef.current),
      y: movedFocus(drag.focusY, event.clientY - drag.y, "y", box, naturalRef.current),
    })
  }

  function endDrag() {
    dragRef.current = null
    setDragging(false)
  }

  async function choose(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setNote("Comprimiendo portada…")
    try {
      const compressed = await compressImage(file, "cover")
      setImage(compressed)
      setFocus({ x: 50, y: 50 })
      setNote(`Lista para guardar · ${formatBytes(imageBytes(compressed))}`)
    } catch (caught) {
      setNote("")
      onError(caught.message)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    try {
      await onSave("/api/cover", {
        method: "PUT",
        body: JSON.stringify({ image, focusX: focus.x, focusY: focus.y }),
      })
      setNote("")
      onDone(image ? "Portada actualizada" : "Portada quitada")
    } catch (caught) {
      onError(caught.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="admin-card" onSubmit={submit}>
      <h2>Portada</h2>
      <p>Arrastra la foto para elegir la parte que se ve en la tienda. Luego guárdala.</p>
      <div
        ref={frameRef}
        className={dragging ? "admin-cover is-dragging" : "admin-cover"}
        style={
          image
            ? {
                backgroundImage: `url("${image}")`,
                backgroundPosition: `${focus.x}% ${focus.y}%`,
              }
            : undefined
        }
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      <label>
        Foto de portada
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} />
      </label>
      {note ? <p className="admin-note">{note}</p> : null}
      <div className="admin-actions">
        <button className="add-button" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar portada"}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setImage(null)
            setNote("Se quitará al guardar")
          }}
        >
          Quitar foto
        </button>
      </div>
    </form>
  )
}

function ProductCreator({ onSave, onDone, onError }) {
  const [name, setName] = useState("")
  const [detail, setDetail] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState(null)
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)

  async function choose(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setNote("Comprimiendo foto…")
    try {
      const compressed = await compressImage(file, "product")
      setImage(compressed)
      setNote(`Foto lista · ${formatBytes(imageBytes(compressed))}`)
    } catch (caught) {
      setNote("")
      onError(caught.message)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    try {
      await onSave("/api/products", {
        method: "POST",
        body: JSON.stringify({ name, detail, description, price, image }),
      })
      setName("")
      setDetail("")
      setDescription("")
      setPrice("")
      setImage(null)
      setNote("")
      onDone("Producto creado")
    } catch (caught) {
      onError(caught.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="admin-card" onSubmit={submit}>
      <h2>Nuevo producto</h2>
      <div className="admin-fields">
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Precio
          <input
            inputMode="numeric"
            placeholder="320000"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>
        <label>
          Detalle
          <input value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>
        <label>
          Descripción
          <textarea
            rows="5"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          Foto
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} />
        </label>
      </div>
      {image ? <img className="admin-thumb" src={image} alt="" /> : null}
      {note ? <p className="admin-note">{note}</p> : null}
      <button className="add-button" type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear producto"}
      </button>
    </form>
  )
}

function ProductList({ products, onSave, onDone, onError }) {
  if (products.length === 0) {
    return (
      <section className="admin-card">
        <h2>Productos</h2>
        <p>Todavía no hay productos.</p>
      </section>
    )
  }

  return (
    <section className="admin-card">
      <h2>Productos</h2>
      <div className="admin-list">
        {products.map((product) => (
          <ProductEditor
            key={product.id}
            product={product}
            onSave={onSave}
            onDone={onDone}
            onError={onError}
          />
        ))}
      </div>
    </section>
  )
}

function ProductEditor({ product, onSave, onDone, onError }) {
  const [name, setName] = useState(product.name)
  const [detail, setDetail] = useState(product.detail || "")
  const [description, setDescription] = useState(product.description || "")
  const [price, setPrice] = useState(String(product.price))
  const [image, setImage] = useState(product.image)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setName(product.name)
    setDetail(product.detail || "")
    setDescription(product.description || "")
    setPrice(String(product.price))
    setImage(product.image)
  }, [product])

  async function choose(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      setImage(await compressImage(file, "product"))
    } catch (caught) {
      onError(caught.message)
    }
  }

  async function save(event) {
    event.preventDefault()
    setPending(true)
    try {
      await onSave(`/api/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, detail, description, price, image }),
      })
      onDone("Producto actualizado")
    } catch (caught) {
      onError(caught.message)
    } finally {
      setPending(false)
    }
  }

  async function remove() {
    if (!window.confirm(`¿Eliminar ${product.name}?`)) return
    setPending(true)
    try {
      await onSave(`/api/products/${product.id}`, { method: "DELETE" })
      onDone("Producto eliminado")
    } catch (caught) {
      onError(caught.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="admin-product" onSubmit={save}>
      {image ? <img src={image} alt="" /> : <span aria-hidden="true" />}
      <div className="admin-fields">
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Precio
          <input
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>
        <label>
          Detalle
          <input value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>
        <label>
          Descripción
          <textarea
            rows="5"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          Foto
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} />
        </label>
        <div className="admin-actions">
          <button className="add-button" type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </button>
          <button className="text-button" type="button" onClick={remove} disabled={pending}>
            Eliminar
          </button>
        </div>
      </div>
    </form>
  )
}

function focusPercent(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 50
  return Math.min(100, Math.max(0, number))
}

function movedFocus(start, delta, axis, box, natural) {
  const span = axis === "x" ? box.width : box.height
  let extra = span
  if (natural?.width && natural?.height && box.width && box.height) {
    const scale = Math.max(box.width / natural.width, box.height / natural.height)
    const covered = (axis === "x" ? natural.width : natural.height) * scale
    extra = covered - span
  }
  if (extra <= 1) return start
  const next = ((start / 100) * extra - delta) / extra * 100
  return Math.min(100, Math.max(0, Math.round(next * 10) / 10))
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
