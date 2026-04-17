import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Navbar() {
  const { undo, redo, history, historyIndex, designs, boxDimensions, material, quantity } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designs, boxDimensions, material, quantity }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'packcraft-design.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <nav className="h-[60px] flex items-center justify-between px-4 border-b border-[#252d3f] bg-[#161b27] shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 1V17M2 5L9 9L16 5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-white text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          PackCraft
        </span>
        <span className="text-[#3c4a68] text-xs font-medium ml-1 hidden sm:block">3D Box Configurator</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            text-[#94a3b8] hover:text-white hover:bg-[#252d3f]"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            text-[#94a3b8] hover:text-white hover:bg-[#252d3f]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6M21 13C18.2 7.3 13.1 4 7.5 4 3.4 4 0 7.4 0 11.5S3.4 19 7.5 19H12"/>
          </svg>
          <span className="hidden sm:inline">Redo</span>
        </button>

        <div className="w-px h-5 bg-[#252d3f] mx-1" />

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
            bg-[#252d3f] hover:bg-[#2d3650] text-[#94a3b8] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          <span>{saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
            bg-[#252d3f] hover:bg-[#2d3650] text-[#94a3b8] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span className="hidden sm:inline">Export</span>
        </button>

        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold transition-all
          bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500
          text-white shadow-lg shadow-brand-500/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
          </svg>
          Checkout
        </button>
      </div>
    </nav>
  )
}
