import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useStore } from '../store/useStore'
import { ALL_FACES, INNER_FACES, OUTER_FACES, defaultFaceBackground, faceLabelText, isInnerFace } from '../store/useStore'

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Impact', 'Courier New', 'Times New Roman', 'Verdana']
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96]

function clampPct(v) {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}

function rgbToHex(r, g, b) {
  const to2 = (n) => n.toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

function hexToRgb(hex) {
  const h = (hex ?? '').trim().replace('#', '')
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16)
    const g = parseInt(h[1] + h[1], 16)
    const b = parseInt(h[2] + h[2], 16)
    if ([r, g, b].some(n => Number.isNaN(n))) return null
    return { r, g, b }
  }
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some(n => Number.isNaN(n))) return null
  return { r, g, b }
}

function cmykToHex({ c, m, y, k }) {
  const C = clampPct(c) / 100
  const M = clampPct(m) / 100
  const Y = clampPct(y) / 100
  const K = clampPct(k) / 100
  const r = Math.round(255 * (1 - C) * (1 - K))
  const g = Math.round(255 * (1 - M) * (1 - K))
  const b = Math.round(255 * (1 - Y) * (1 - K))
  return rgbToHex(r, g, b)
}

function hexToCmyk(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return { c: 0, m: 0, y: 0, k: 0 }
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const k = 1 - Math.max(r, g, b)
  if (k >= 0.999) return { c: 0, m: 0, y: 0, k: 100 }
  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)
  return {
    c: clampPct(c * 100),
    m: clampPct(m * 100),
    y: clampPct(y * 100),
    k: clampPct(k * 100),
  }
}

function facesForTarget(targetId) {
  switch (targetId) {
    case 'all':
      return ALL_FACES
    case 'exterior':
      return OUTER_FACES
    case 'interior':
      return INNER_FACES
    default:
      return ALL_FACES.includes(targetId) ? [targetId] : []
  }
}

const CMYK_PALETTE = [
  { name: 'Rich Black', cmyk: { c: 60, m: 40, y: 40, k: 100 } },
  { name: 'Black', cmyk: { c: 0, m: 0, y: 0, k: 100 } },
  { name: 'Cool Gray', cmyk: { c: 0, m: 0, y: 0, k: 45 } },
  { name: 'White / No Ink', cmyk: { c: 0, m: 0, y: 0, k: 0 } },
  { name: 'Cyan', cmyk: { c: 100, m: 0, y: 0, k: 0 } },
  { name: 'Magenta', cmyk: { c: 0, m: 100, y: 0, k: 0 } },
  { name: 'Yellow', cmyk: { c: 0, m: 0, y: 100, k: 0 } },
  { name: 'Red', cmyk: { c: 0, m: 95, y: 85, k: 0 } },
  { name: 'Orange', cmyk: { c: 0, m: 55, y: 100, k: 0 } },
  { name: 'Green', cmyk: { c: 85, m: 0, y: 85, k: 0 } },
  { name: 'Blue', cmyk: { c: 100, m: 55, y: 0, k: 0 } },
  { name: 'Purple', cmyk: { c: 55, m: 95, y: 0, k: 0 } },
  { name: 'Navy', cmyk: { c: 100, m: 80, y: 30, k: 35 } },
  { name: 'Forest', cmyk: { c: 85, m: 25, y: 85, k: 35 } },
]

export default function RightSidebar() {
  const {
    selectedFace, selectedElementId, designs,
    addTextElement, addImageElement, updateElement, deleteElement,
    setFaceBackground,
    setFacesBackground,
    setSelectedFace,
  } = useStore()

  const [colorPickerOpen, setColorPickerOpen] = useState(null)
  const [panelTarget, setPanelTarget] = useState('selected')
  const fileRef = useRef(null)

  const elements = designs[selectedFace].elements
  const selectedEl = selectedElementId ? elements.find(el => el.id === selectedElementId) : null
  const bgColor = designs[selectedFace].backgroundColor

  const targetId = panelTarget === 'selected' ? selectedFace : panelTarget
  const targetFaces = useMemo(() => facesForTarget(targetId), [targetId])

  const [cmyk, setCmyk] = useState(() => hexToCmyk(bgColor))

  useEffect(() => {
    // Keep UI in sync when user selects another face.
    if (panelTarget === 'selected') setCmyk(hexToCmyk(bgColor))
  }, [bgColor, panelTarget])

  useEffect(() => {
    // If user had targeted a specific panel, but then clicks a different face in 3D/2D,
    // revert to "Selected panel" so the color tool always follows the active selection.
    if (panelTarget !== 'all' && panelTarget !== 'exterior' && panelTarget !== 'interior' && ALL_FACES.includes(panelTarget)) {
      setPanelTarget('selected')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFace])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result
      addImageElement(selectedFace, src)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const update = (key, value) => {
    if (!selectedElementId) return
    updateElement(selectedFace, selectedElementId, { [key]: value })
  }

  const previewHex = useMemo(() => cmykToHex(cmyk), [cmyk])

  const applyHexToTargets = (hex) => {
    if (targetFaces.length <= 1) {
      const face = targetFaces[0] ?? selectedFace
      setFaceBackground(face, hex)
      return
    }
    setFacesBackground(targetFaces, hex)
  }

  const setCmykLive = (next) => {
    const nextCmyk = {
      c: clampPct(next.c),
      m: clampPct(next.m),
      y: clampPct(next.y),
      k: clampPct(next.k),
    }
    setCmyk(nextCmyk)
    applyHexToTargets(cmykToHex(nextCmyk))
  }

  const setHexLive = (hex) => {
    setCmyk(hexToCmyk(hex))
    applyHexToTargets(hex)
  }

  const clearBackgroundForTargets = () => {
    if (targetFaces.length <= 1) {
      const face = targetFaces[0] ?? selectedFace
      const def = defaultFaceBackground(face)
      setFaceBackground(face, def)
      if (panelTarget === 'selected') setCmyk(hexToCmyk(def))
      return
    }
    // For groups, reset each face to its own default (outer vs inner).
    targetFaces.forEach(face => setFaceBackground(face, defaultFaceBackground(face)))
  }

  return (
    <aside className="h-full w-[300px] shrink-0 bg-sidebar border-l border-border flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isInnerFace(selectedFace) ? 'bg-amber-400' : 'bg-primary'}`} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Design Tools —{' '}
            <span className={`capitalize ${isInnerFace(selectedFace) ? 'text-amber-400' : 'text-primary'}`}>
              {faceLabelText(selectedFace)}
            </span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Add Elements */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Add to Face
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addTextElement(selectedFace)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card
                  hover:border-primary/50 hover:bg-primary/10 hover:text-primary
                  text-foreground/80 transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                </svg>
                <span className="text-xs font-medium">Add Text</span>
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card
                  hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400
                  text-foreground/80 transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span className="text-xs font-medium">Upload Image</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Face Background
            </label>
            <div className="rounded-xl border border-border bg-card p-3">
              {/* Toolbar row (matches screenshot style) */}
              <button
                onClick={() => setColorPickerOpen(colorPickerOpen === 'bg' ? null : 'bg')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background hover:border-border/60 transition-all"
                title="Select background color"
              >
                <div
                  className="w-6 h-6 rounded-md border border-border/80 shrink-0"
                  style={{ backgroundColor: previewHex }}
                />
                <span className="text-sm text-foreground font-mono">{previewHex}</span>
                <svg
                  className={`ml-auto transition-transform ${colorPickerOpen === 'bg' ? 'rotate-180' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </button>

              {/* Swatch strip */}
              <div className="mt-2 flex gap-1.5 flex-wrap">
                {CMYK_PALETTE.slice(0, 10).map(item => {
                  const hex = cmykToHex(item.cmyk)
                  const isActive =
                    cmyk.c === item.cmyk.c &&
                    cmyk.m === item.cmyk.m &&
                    cmyk.y === item.cmyk.y &&
                    cmyk.k === item.cmyk.k
                  return (
                    <button
                      key={item.name}
                      onClick={() => setCmykLive(item.cmyk)}
                      className="w-6 h-6 rounded-md border-2 transition-all hover:scale-110"
                      title={`${item.name} — C${item.cmyk.c} M${item.cmyk.m} Y${item.cmyk.y} K${item.cmyk.k}`}
                      style={{
                        backgroundColor: hex,
                        borderColor: isActive ? '#5f8aff' : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  )
                })}
              </div>

              {/* Advanced target (kept, but tucked below) */}
              <div className="mt-2 flex items-center justify-between">
                <div className="text-[10px] text-muted-foreground">
                  Applies to: <span className="text-foreground/80 font-semibold">{panelTarget === 'selected' ? 'selected panel' : panelTarget}</span>
                </div>
                <button
                  onClick={clearBackgroundForTargets}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear / reset to default panel stock color"
                >
                  Clear
                </button>
              </div>

              <div className="mt-2">
                <select
                  value={panelTarget}
                  onChange={(e) => {
                    const v = e.target.value
                    setPanelTarget(v)
                    if (ALL_FACES.includes(v)) setSelectedFace(v)
                  }}
                  className="w-full bg-muted border border-border/60 rounded-md px-2.5 py-2 text-xs text-foreground
                    focus:outline-none focus:border-primary"
                >
                  <option value="selected">Selected panel</option>
                  <option value="all">All Panels</option>
                  <option value="exterior">Exterior Only</option>
                  <option value="interior">Interior Only</option>
                  <optgroup label="Exterior panels">
                    {OUTER_FACES.map(f => <option key={f} value={f}>{faceLabelText(f)}</option>)}
                  </optgroup>
                  <optgroup label="Interior panels">
                    {INNER_FACES.map(f => <option key={f} value={f}>{faceLabelText(f)}</option>)}
                  </optgroup>
                </select>
              </div>

              {colorPickerOpen === 'bg' && (
                <div className="mt-3 panel-enter space-y-4">
                  {/* Hex Picker */}
                  <div>
                    <HexColorPicker
                      color={previewHex}
                      onChange={setHexLive}
                      style={{ width: '100%', height: '140px' }}
                    />
                  </div>
                  
                  <div className="h-px bg-muted w-full" />
                  
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-foreground/80 mb-1">CMYK Values (Print)</div>
                    {[
                      { key: 'c', label: 'C', hint: 'Cyan' },
                      { key: 'm', label: 'M', hint: 'Magenta' },
                      { key: 'y', label: 'Y', hint: 'Yellow' },
                      { key: 'k', label: 'K', hint: 'Black (Key)' },
                    ].map(row => (
                      <div key={row.key} className="grid grid-cols-[22px_1fr_58px] items-center gap-2">
                        <div className="text-xs font-semibold text-foreground/80" title={row.hint}>{row.label}</div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={cmyk[row.key]}
                          onChange={(e) => setCmykLive({ ...cmyk, [row.key]: parseInt(e.target.value, 10) })}
                          className="w-full"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={cmyk[row.key]}
                            onChange={(e) => setCmykLive({ ...cmyk, [row.key]: parseFloat(e.target.value) })}
                            className="w-full bg-muted border border-border/60 rounded-md pl-2 pr-6 py-1.5 text-xs text-foreground font-mono
                              focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                    <div className="mt-0.5 text-amber-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4m0 4h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      </svg>
                    </div>
                    <div className="text-[10px] text-amber-200/80 leading-snug">
                      <div title="Best practice: Use bold colors for best print results on corrugated material.">
                        Note: Printed colors may appear slightly different on screen vs. the final printed box. CMYK values are approximated.
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setColorPickerOpen(null)}
                      className="px-3 py-2 rounded-md border border-border/60 text-xs text-foreground/90 hover:text-foreground hover:border-primary/60 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Element Properties */}
          {selectedEl ? (
            <div className="space-y-4 panel-enter">
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Element Properties
                  </label>
                  <button
                    onClick={() => deleteElement(selectedFace, selectedEl.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Position */}
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">X</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.x)}
                        onChange={e => update('x', parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                          focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Y</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.y)}
                        onChange={e => update('y', parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                          focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">W</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.width)}
                        onChange={e => update('width', parseFloat(e.target.value) || 10)}
                        className="w-full bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                          focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">H</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.height)}
                        onChange={e => update('height', parseFloat(e.target.value) || 10)}
                        className="w-full bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                          focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-muted-foreground">Rotation</label>
                    <span className="text-xs text-foreground">{Math.round(selectedEl.rotation)}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedEl.rotation}
                    onChange={e => update('rotation', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <span className="text-xs text-foreground">{Math.round(selectedEl.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selectedEl.opacity}
                    onChange={e => update('opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Text-specific */}
                {selectedEl.type === 'text' && (
                  <>
                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Text Content</label>
                      <textarea
                        value={selectedEl.content}
                        onChange={e => update('content', e.target.value)}
                        rows={2}
                        className="w-full bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground resize-none
                          focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Font Family</label>
                      <select
                        value={selectedEl.fontFamily}
                        onChange={e => update('fontFamily', e.target.value)}
                        className="w-full bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                          focus:outline-none focus:border-primary"
                      >
                        {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Font Size</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedEl.fontSize}
                          onChange={e => update('fontSize', parseInt(e.target.value))}
                          className="flex-1 bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                            focus:outline-none focus:border-primary"
                        >
                          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
                        </select>
                        <input
                          type="number"
                          value={selectedEl.fontSize}
                          onChange={e => update('fontSize', parseInt(e.target.value) || 12)}
                          className="w-16 bg-muted border border-border/60 rounded px-2 py-1.5 text-xs text-foreground
                            focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Font Weight</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['normal', 'bold', '600'].map(w => (
                          <button
                            key={w}
                            onClick={() => update('fontWeight', w)}
                            className={`py-1.5 rounded text-xs transition-all
                              ${selectedEl.fontWeight === w
                                ? 'bg-primary text-foreground'
                                : 'bg-muted text-foreground/80 hover:bg-accent'
                              }`}
                          >
                            {w === 'normal' ? 'Regular' : w === 'bold' ? 'Bold' : 'Semi'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Alignment</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['left', 'center', 'right'].map(a => (
                          <button
                            key={a}
                            onClick={() => update('textAlign', a)}
                            className={`py-1.5 rounded text-xs transition-all flex items-center justify-center
                              ${selectedEl.textAlign === a
                                ? 'bg-primary text-foreground'
                                : 'bg-muted text-foreground/80 hover:bg-accent'
                              }`}
                          >
                            {a === 'left' && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                              </svg>
                            )}
                            {a === 'center' && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                              </svg>
                            )}
                            {a === 'right' && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Text Color</label>
                      <button
                        onClick={() => setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text')}
                        className="w-full flex items-center gap-3 p-2 rounded border border-border bg-card hover:border-border/60 transition-all"
                      >
                        <div className="w-5 h-5 rounded border border-border/80" style={{ backgroundColor: selectedEl.color }} />
                        <span className="text-xs text-foreground font-mono">{selectedEl.color}</span>
                      </button>
                      {colorPickerOpen === 'text' && (
                        <div className="mt-2 panel-enter">
                          <HexColorPicker
                            color={selectedEl.color}
                            onChange={c => update('color', c)}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                          <button
                            key={c}
                            onClick={() => update('color', c)}
                            className="w-5 h-5 rounded border-2 transition-all hover:scale-110"
                            style={{ backgroundColor: c, borderColor: selectedEl.color === c ? '#5f8aff' : 'rgba(255,255,255,0.1)' }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-border pt-4">
              <div className="py-6 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="mx-auto text-muted-foreground mb-3">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                <p className="text-sm text-muted-foreground">No element selected</p>
                <p className="text-xs text-muted-foreground mt-1">Click an element on the canvas or in the layers panel</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
