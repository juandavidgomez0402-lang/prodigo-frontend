import { Link } from "react-router-dom"
import { brand } from "../brand.js"

export default function Footer({ whatsapp = "" }) {
  const digits = String(whatsapp).replace(/\D/g, "")
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <a className="brand" href="#inicio">
          <img src="/mark.png" alt="" width="32" height="32" />
          <span>{brand.name}</span>
        </a>
        <div className="footer-contacts">
          {digits ? (
            <a href={`tel:+${digits}`}>{`+${digits}`}</a>
          ) : (
            <a href={brand.phoneHref}>{brand.phoneDisplay}</a>
          )}
          {digits ? (
            <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : null}
          <a href={brand.instagramHref} target="_blank" rel="noreferrer">
            {brand.instagram}
          </a>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
