import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'
import { Package } from 'lucide-react'
export default function Footer() {
  return (
    <div>
       <footer className="footer">
  <div className="footer-container">
    
    <div className="footer-brand">
      <div className="footer-logo-icon"><Package/></div>
      <h1 className="footer-logo-text">Packora</h1>
    </div>

    <div className="footer-description">
      © 2026 Packora • Made in Giza, Egypt.
      Premium custom packaging  <br/>
         • Real-time 3D preview <br/>
      • Ships worldwide in 7 days <br/>
     
     
    </div>

    <div className="footer-links">
      <Link href="#">Instagram</Link>
      <Link href="#">TikTok</Link>
      <Link href="/Support" to="/Support">Contact us</Link>
      <Link href="/Support" to="/Support">Support</Link>
    </div>

    <div className="footer-version">
      v24.04 • 3D hero box live
    </div>

  </div>
</footer>
    </div>
  )
}