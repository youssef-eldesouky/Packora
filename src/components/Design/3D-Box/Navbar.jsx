import React, { useState, useEffect } from 'react'
import { useStore } from '../../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { customBoxConfigApi, productApi } from '../../../utils/api'
import '../../../components/Design/3D-Box/Navbar.css'
import { Package } from 'lucide-react'

export default function Navbar() {
  const {
    undo, redo, history, historyIndex, designs, boxDimensions, material, quantity, price,
    savedConfigId, isDirty, setSavedConfigId, setIsDirty
  } = useStore()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [customBoxProductId, setCustomBoxProductId] = useState(null)

  const navigate = useNavigate()
  const { addToCart } = useCart()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const designCount = Object.values(designs).reduce((sum, face) => sum + face.elements.length, 0)

  // Fetch the sentinel "Custom 3D Box" product ID on mount
  useEffect(() => {
    productApi.getByCategory('custom')
      .then((products) => {
        const customBox = products.find(p => p.name === 'Custom 3D Box');
        if (customBox) {
          setCustomBoxProductId(Number(customBox.id));
        } else {
          console.warn('Custom 3D Box product not found in catalog.');
        }
      })
      .catch((err) => console.error('Failed to fetch custom box product:', err));
  }, []);

  // Internal function to sync configuration with the backend
  const syncConfig = async (explicitSave = false) => {
    // If it's already saved and not dirty, just return the existing ID
    if (savedConfigId && !isDirty && !explicitSave) {
      return savedConfigId;
    }

    const payload = JSON.stringify({ designs, boxDimensions, material, quantity });

    try {
      let config;
      if (savedConfigId) {
        // Update existing
        config = await customBoxConfigApi.update(savedConfigId, payload, explicitSave);
      } else {
        // Create new
        config = await customBoxConfigApi.create(payload, explicitSave);
      }

      setSavedConfigId(config.id);
      setIsDirty(false);
      return config.id;
    } catch (error) {
      console.error("Failed to sync config:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true)
    setSaveError(false)
    try {
      await syncConfig(true);
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
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

  const handleAddToCart = async () => {
    if (!customBoxProductId) {
      alert("Custom box product is not available. Please try again in a moment.");
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Sync config with backend first
      const configId = await syncConfig(false);

      // 2. Generate thumbnail
      let thumbnail = ''
      const canvas = Array.from(document.querySelectorAll('canvas')).find(node => {
        const style = window.getComputedStyle(node)
        return style.display !== 'none' && node.width > 0 && node.height > 0
      })

      if (canvas) {
        thumbnail = canvas.toDataURL()
      }

      // 3. Add to cart with real product ID and configId
      await addToCart({
        productId: customBoxProductId,
        name: 'Custom 3D Box',
        image: thumbnail,
        price: price,
        quantity: quantity,
        size: `${boxDimensions.length}"x${boxDimensions.width}"x${boxDimensions.height}"`,
        material: material,
        customBoxConfigId: configId
      })

      navigate('/Cart')
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add design to cart. Please try again.");
    } finally {
      setIsSyncing(false);
    }
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
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="logo flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--deep-teal)] shadow-md">
          <Package size={20} color='white' />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-foreground">
              Packora
            </span>
            <span className="hidden rounded-full border border-border bg-[var(--vintage-grape)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white md:inline-flex">
              Design
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
            <path d="M3 7v6h6M3 13C5.8 7.3 10.9 4 16.5 4 20.6 4 24 7.4 24 11.5S20.6 19 16.5 19H12" />
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
            <path d="M21 7v6h-6M21 13C18.2 7.3 13.1 4 7.5 4 3.4 4 0 7.4 0 11.5S3.4 19 7.5 19H12" />
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
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          <span>{saveError ? 'Save failed' : saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          onClick={handleExport}
          className="hidden h-11 items-center gap-1.5 rounded-2xl border border-border bg-card/40 px-4 text-sm font-medium text-foreground transition-all hover:border-border/80 hover:bg-card/80 hover:text-foreground md:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isSyncing}
          className={`flex h-11 items-center gap-1.5 rounded-2xl bg-[var(--deep-teal)] px-4 text-sm font-semibold text-white shadow-md transition-all ${isSyncing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[var(--vintage-grape)] hover:translate-y-[-1px] hover:shadow-lg'}`}
        >
          {isSyncing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
            </svg>
          )}
          {isSyncing ? 'Syncing...' : 'Add to Cart'}
        </button>
      </div>
    </nav>
  )
}
