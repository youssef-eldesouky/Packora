import React, { useState } from 'react'
import { useStore } from '../../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'

export default function Navbar() {
  const { undo, redo, history, historyIndex, designs, boxDimensions, material, quantity, price } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const designCount = Object.values(designs).reduce((sum, face) => sum + face.elements.length, 0)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(false)
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designs, boxDimensions, material, quantity }),
      })
      if (!response.ok) {
        throw new Error(`Save failed with status ${response.status}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const canvas = Array.from(document.querySelectorAll('canvas')).find(node => {
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && node.width > 0 && node.height > 0
    })
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'packcraft-design.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleAddToCart = () => {
    let thumbnail = ''
    const canvas = Array.from(document.querySelectorAll('canvas')).find(node => {
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && node.width > 0 && node.height > 0
    })
    
    if (canvas) {
      thumbnail = canvas.toDataURL()
    }
    
    addToCart({
      productId: 'custom-3d-box',
      name: 'Custom 3D Box',
      image: thumbnail, // We save a snapshot of their 3D design
      price: price, // Derived from store price which is per unit
      quantity: quantity,
      size: `${boxDimensions.length}"x${boxDimensions.width}"x${boxDimensions.height}"`,
      material: material,
    })
    
    navigate('/Cart')
  }

  return (
    <nav className="glass-panel flex min-h-[84px] shrink-0 items-center justify-between gap-6 px-6 py-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-border/50">
      <div className="flex min-w-0 items-center gap-3">
        <button 
          onClick={() => navigate('/HomePage')}
          className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-card/60 border border-border text-foreground transition-all hover:bg-card hover:shadow-md"
          title="Back to Dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--deep-teal)] shadow-md">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 1V17M2 5L9 9L16 5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-foreground">
              PackCraft
            </span>
            <span className="hidden rounded-full border border-border bg-[var(--vintage-grape)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white md:inline-flex">
              Studio
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span>{boxDimensions.length}" × {boxDimensions.width}" × {boxDimensions.height}"</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
            <span className="hidden sm:inline">{material} stock</span>
            <span className="hidden h-1 w-1 rounded-full bg-border lg:inline-block" />
            <span className="hidden lg:inline">{designCount} design item{designCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-2xl border border-border bg-card/40 px-3 py-2 text-xs text-foreground/80 lg:flex">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Run</span>
          <span>{quantity.toLocaleString()} units</span>
        </div>

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className="flex h-11 items-center gap-1.5 rounded-2xl border border-border bg-card/40 px-3 text-sm font-medium text-foreground/90 transition-all hover:border-border/80 hover:bg-card/80 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6M3 13C5.8 7.3 10.9 4 16.5 4 20.6 4 24 7.4 24 11.5S20.6 19 16.5 19H12"/>
          </svg>
          <span className="hidden sm:inline">Undo</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className="flex h-11 items-center gap-1.5 rounded-2xl border border-border bg-card/40 px-3 text-sm font-medium text-foreground/90 transition-all hover:border-border/80 hover:bg-card/80 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6M21 13C18.2 7.3 13.1 4 7.5 4 3.4 4 0 7.4 0 11.5S3.4 19 7.5 19H12"/>
          </svg>
          <span className="hidden sm:inline">Redo</span>
        </button>

        <div className="mx-1 hidden h-6 w-px bg-card/80 md:block" />

        <button
          onClick={handleSave}
          disabled={saving}
          className="hidden h-11 items-center gap-1.5 rounded-2xl border border-border bg-card/40 px-4 text-sm font-medium text-foreground transition-all hover:border-border/80 hover:bg-card/80 hover:text-foreground md:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          <span>{saveError ? 'Save failed' : saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          onClick={handleExport}
          className="hidden h-11 items-center gap-1.5 rounded-2xl border border-border bg-card/40 px-4 text-sm font-medium text-foreground transition-all hover:border-border/80 hover:bg-card/80 hover:text-foreground md:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span className="hidden sm:inline">Export</span>
        </button>

        <button 
          onClick={handleAddToCart}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-[var(--deep-teal)] px-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--vintage-grape)] hover:translate-y-[-1px] hover:shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </button>
      </div>
    </nav>
  )
}
