import React, { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { faceLabelText, isInnerFace } from '../store/useStore'
import { HexColorPicker } from 'react-colorful'

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Impact', 'Courier New', 'Times New Roman', 'Verdana']
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96]

export default function RightSidebar() {
  const {
    selectedFace, selectedElementId, designs,
    addTextElement, addImageElement, updateElement, deleteElement,
    setFaceBackground,
  } = useStore()

  const [colorPickerOpen, setColorPickerOpen] = useState(null)
  const fileRef = useRef(null)

  const elements = designs[selectedFace].elements
  const selectedEl = selectedElementId ? elements.find(el => el.id === selectedElementId) : null
  const bgColor = designs[selectedFace].backgroundColor

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

  return (
    <aside className="w-[300px] shrink-0 bg-[#161b27] border-l border-[#252d3f] flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[#252d3f]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isInnerFace(selectedFace) ? 'bg-amber-400' : 'bg-brand-500'}`} />
          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            Design Tools —{' '}
            <span className={`capitalize ${isInnerFace(selectedFace) ? 'text-amber-400' : 'text-brand-400'}`}>
              {faceLabelText(selectedFace)}
            </span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Add Elements */}
          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Add to Face
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addTextElement(selectedFace)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#252d3f] bg-[#1e2535]
                  hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-400
                  text-[#94a3b8] transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                </svg>
                <span className="text-xs font-medium">Add Text</span>
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#252d3f] bg-[#1e2535]
                  hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400
                  text-[#94a3b8] transition-all group"
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
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Face Background
            </label>
            <button
              onClick={() => setColorPickerOpen(colorPickerOpen === 'bg' ? null : 'bg')}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-[#252d3f] bg-[#1e2535] hover:border-[#3c4a68] transition-all"
            >
              <div
                className="w-6 h-6 rounded-md border border-white/20 shrink-0"
                style={{ backgroundColor: bgColor }}
              />
              <span className="text-sm text-white font-mono">{bgColor}</span>
              <svg className={`ml-auto transition-transform ${colorPickerOpen === 'bg' ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            {colorPickerOpen === 'bg' && (
              <div className="mt-2 panel-enter">
                <HexColorPicker
                  color={bgColor}
                  onChange={c => setFaceBackground(selectedFace, c)}
                  style={{ width: '100%' }}
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => setFaceBackground(selectedFace, e.target.value)}
                  className="mt-2 w-full bg-[#252d3f] border border-[#3c4a68] rounded-md px-3 py-2 text-sm text-white font-mono
                    focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {/* Quick colors — context-aware */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {(isInnerFace(selectedFace)
                ? ['#d4a66a', '#c8935a', '#ede8d8', '#f5e6c8', '#ffffff', '#000000', '#7c5c3a', '#4a3728', '#1a0f00']
                : ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
              ).map(c => (
                <button
                  key={c}
                  onClick={() => setFaceBackground(selectedFace, c)}
                  className="w-6 h-6 rounded-md border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: bgColor === c ? '#5f8aff' : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Element Properties */}
          {selectedEl ? (
            <div className="space-y-4 panel-enter">
              <div className="border-t border-[#252d3f] pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
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
                  <label className="text-xs text-[#64748b] mb-1.5 block">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#64748b]">X</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.x)}
                        onChange={e => update('x', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                          focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b]">Y</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.y)}
                        onChange={e => update('y', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                          focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-3">
                  <label className="text-xs text-[#64748b] mb-1.5 block">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#64748b]">W</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.width)}
                        onChange={e => update('width', parseFloat(e.target.value) || 10)}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                          focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b]">H</span>
                      <input
                        type="number"
                        value={Math.round(selectedEl.height)}
                        onChange={e => update('height', parseFloat(e.target.value) || 10)}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                          focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-[#64748b]">Rotation</label>
                    <span className="text-xs text-white">{Math.round(selectedEl.rotation)}°</span>
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
                    <label className="text-xs text-[#64748b]">Opacity</label>
                    <span className="text-xs text-white">{Math.round(selectedEl.opacity * 100)}%</span>
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
                      <label className="text-xs text-[#64748b] mb-1.5 block">Text Content</label>
                      <textarea
                        value={selectedEl.content}
                        onChange={e => update('content', e.target.value)}
                        rows={2}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white resize-none
                          focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-[#64748b] mb-1.5 block">Font Family</label>
                      <select
                        value={selectedEl.fontFamily}
                        onChange={e => update('fontFamily', e.target.value)}
                        className="w-full bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                          focus:outline-none focus:border-brand-500"
                      >
                        {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-[#64748b] mb-1.5 block">Font Size</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedEl.fontSize}
                          onChange={e => update('fontSize', parseInt(e.target.value))}
                          className="flex-1 bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                            focus:outline-none focus:border-brand-500"
                        >
                          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
                        </select>
                        <input
                          type="number"
                          value={selectedEl.fontSize}
                          onChange={e => update('fontSize', parseInt(e.target.value) || 12)}
                          className="w-16 bg-[#252d3f] border border-[#3c4a68] rounded px-2 py-1.5 text-xs text-white
                            focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-[#64748b] mb-1.5 block">Font Weight</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['normal', 'bold', '600'].map(w => (
                          <button
                            key={w}
                            onClick={() => update('fontWeight', w)}
                            className={`py-1.5 rounded text-xs transition-all
                              ${selectedEl.fontWeight === w
                                ? 'bg-brand-500 text-white'
                                : 'bg-[#252d3f] text-[#94a3b8] hover:bg-[#2d3650]'
                              }`}
                          >
                            {w === 'normal' ? 'Regular' : w === 'bold' ? 'Bold' : 'Semi'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-[#64748b] mb-1.5 block">Alignment</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['left', 'center', 'right'].map(a => (
                          <button
                            key={a}
                            onClick={() => update('textAlign', a)}
                            className={`py-1.5 rounded text-xs transition-all flex items-center justify-center
                              ${selectedEl.textAlign === a
                                ? 'bg-brand-500 text-white'
                                : 'bg-[#252d3f] text-[#94a3b8] hover:bg-[#2d3650]'
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
                      <label className="text-xs text-[#64748b] mb-1.5 block">Text Color</label>
                      <button
                        onClick={() => setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text')}
                        className="w-full flex items-center gap-3 p-2 rounded border border-[#252d3f] bg-[#1e2535] hover:border-[#3c4a68] transition-all"
                      >
                        <div className="w-5 h-5 rounded border border-white/20" style={{ backgroundColor: selectedEl.color }} />
                        <span className="text-xs text-white font-mono">{selectedEl.color}</span>
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
            <div className="border-t border-[#252d3f] pt-4">
              <div className="py-6 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="mx-auto text-[#3c4a68] mb-3">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                <p className="text-sm text-[#64748b]">No element selected</p>
                <p className="text-xs text-[#3c4a68] mt-1">Click an element on the canvas or in the layers panel</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
