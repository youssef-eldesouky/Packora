import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useStore } from '../../../store/useStore'
import { ALL_FACES, INNER_FACES, OUTER_FACES, defaultFaceBackground, faceLabelText, isInnerFace } from '../../../store/useStore'

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Impact', 'Courier New', 'Times New Roman', 'Verdana']
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96]



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

const PRESET_COLORS = [
  // Row 1: Neutrals & Core Brand
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Pearl', hex: '#F8F9FA' },
  { name: 'Almond Silk', hex: '#C9ADA7' },
  { name: 'Thistle', hex: '#CBC0D3' },
  { name: 'Lavender Grey', hex: '#8E9AAF' },
  { name: 'Vintage Grape', hex: '#5D536B' },
  { name: 'Deep Teal', hex: '#52796F' },
  
  // Row 2: Earth & Warm Tones
  { name: 'Kraft Brown', hex: '#C8935A' },
  { name: 'Warm Sand', hex: '#D4A373' },
  { name: 'Terracotta', hex: '#E29578' },
  { name: 'Coral', hex: '#E07A5F' },
  { name: 'Burnt Orange', hex: '#CA6702' },
  { name: 'Mustard', hex: '#E9C46A' },
  { name: 'Soft Olive', hex: '#A3B18A' },

  // Row 3: Cool & Dark Tones
  { name: 'Mint', hex: '#84A98C' },
  { name: 'Slate Blue', hex: '#457B9D' },
  { name: 'Navy', hex: '#1D3557' },
  { name: 'Warm Grey', hex: '#6C757D' },
  { name: 'Charcoal', hex: '#343A40' },
  { name: 'Rich Black', hex: '#1A1A1A' },
  { name: 'Pure Black', hex: '#000000' },
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

  const [localBgColor, setLocalBgColor] = useState(bgColor || '#ffffff')

  useEffect(() => {
    // Keep UI in sync when user selects another face.
    if (panelTarget === 'selected') setLocalBgColor(bgColor || '#ffffff')
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

  const applyHexToTargets = (hex) => {
    if (targetFaces.length <= 1) {
      const face = targetFaces[0] ?? selectedFace
      setFaceBackground(face, hex)
      return
    }
    setFacesBackground(targetFaces, hex)
  }

  const setHexLive = (hex) => {
    setLocalBgColor(hex)
    applyHexToTargets(hex)
  }

  const clearBackgroundForTargets = () => {
    if (targetFaces.length <= 1) {
      const face = targetFaces[0] ?? selectedFace
      const def = defaultFaceBackground(face)
      setFaceBackground(face, def)
      if (panelTarget === 'selected') setLocalBgColor(def)
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
        {/* Design Tools Section */}
      <div className="flex flex-col gap-4 p-5 border-b border-border/40">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Add to Face</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addTextElement(selectedFace)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white py-4 shadow-sm transition-all hover:border-[var(--deep-teal)] hover:text-[var(--deep-teal)] text-foreground/80"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
              </svg>
              <span className="text-xs font-semibold">Add Text</span>
            </button>
            
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white py-4 shadow-sm transition-all hover:border-[var(--deep-teal)] hover:text-[var(--deep-teal)] text-foreground/80">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className="text-xs font-semibold">Upload Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* Color Tools */}
      <div className="flex flex-col gap-4 p-5 border-b border-border/40">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Face Background</div>
          
          <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2 shadow-sm mb-4">
            <div
              className="h-6 w-6 rounded border border-border shadow-sm"
              style={{ backgroundColor: localBgColor }}
            />
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">#</span>
              <input
                type="text"
                value={localBgColor.replace('#', '')}
                onChange={(e) => setHexLive(`#${e.target.value}`)}
                className="w-20 bg-transparent text-sm font-bold uppercase focus:outline-none"
                maxLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {PRESET_COLORS.map(item => {
              const isActive = localBgColor.toLowerCase() === item.hex.toLowerCase()
              return (
                <button
                  key={item.name}
                  onClick={() => setHexLive(item.hex)}
                  className="w-full aspect-square rounded-md border-2 transition-all hover:scale-110 shadow-sm"
                  title={item.name}
                  style={{
                    backgroundColor: item.hex,
                    borderColor: isActive ? 'var(--deep-teal)' : 'rgba(128,128,128,0.2)',
                  }}
                />
              )
            })}
          </div>

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

          <button
            onClick={() => setFacesBackground(ALL_FACES, localBgColor)}
            className="w-full mt-3 py-2 text-xs font-semibold text-[var(--deep-teal)] bg-[var(--deep-teal)]/10 rounded-lg hover:bg-[var(--deep-teal)]/20 transition-colors"
          >
            Apply to All Sides
          </button>
        </div>
      </div>

          {/* Element Properties */}
          {selectedEl ? (
            <div className="space-y-4 p-5 panel-enter">
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
                        {['#000000', '#ffffff', '#1A1A1A', '#5D536B', '#52796F', '#1D3557', '#E07A5F', '#D4A373'].map(c => (
                          <button
                            key={c}
                            onClick={() => update('color', c)}
                            className="w-5 h-5 rounded border-2 transition-all hover:scale-110"
                            style={{ backgroundColor: c, borderColor: selectedEl.color === c ? 'var(--deep-teal)' : 'rgba(128,128,128,0.2)' }}
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
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-70">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-muted-foreground">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <div className="text-sm font-bold text-foreground">No element selected</div>
          <div className="mt-1 text-xs text-muted-foreground max-w-[180px]">
            Click an element on the canvas or in the layers panel
          </div>
          </div>
            </div>
          )}
        </div>
    </aside>
  )
}
