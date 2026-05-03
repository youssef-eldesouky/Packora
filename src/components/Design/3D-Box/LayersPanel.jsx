import React, { useState } from 'react'
import { useStore } from '../../../store/useStore'
import { OUTER_FACES, INNER_FACES, isInnerFace, faceLabelText } from '../../../store/useStore'

const FACE_COLORS = {
  front: '#3563fa', back: '#8b5cf6', left: '#06b6d4',
  right: '#10b981', top: '#f59e0b', bottom: '#ef4444',
}

function getFaceColor(face) {
  const outer = isInnerFace(face) ? face.replace('inside_', '') : face
  return FACE_COLORS[outer] ?? '#64748b'
}

export default function LayersPanel() {
  const {
    selectedFace, setSelectedFace,
    designs, selectedElementId, setSelectedElement,
    deleteElement, toggleElementVisibility,
    isBoxOpen,
  } = useStore()

  const [tab, setTab] = useState('outside')

  const face = selectedFace
  const elements = [...designs[face].elements].reverse()
  const facesGroup = tab === 'outside' ? OUTER_FACES : INNER_FACES

  return (
    <div className="p-4 space-y-4 panel-enter">
      {/* Outside / Inside tabs */}
      <div className="flex rounded-lg overflow-hidden border border-border bg-muted">
        <button
          onClick={() => { setTab('outside'); if (isInnerFace(selectedFace)) setSelectedFace('front') }}
          className={`flex-1 py-1.5 text-xs font-semibold transition-all
            ${tab === 'outside' ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
        >
          Outside
        </button>
        <button
          onClick={() => { setTab('inside'); if (!isInnerFace(selectedFace)) setSelectedFace('inside_front') }}
          className={`flex-1 py-1.5 text-xs font-semibold transition-all relative
            ${tab === 'inside' ? 'bg-amber-500/80 text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
        >
          Inside
          {!isBoxOpen && tab !== 'inside' && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {!isBoxOpen && tab === 'inside' && (
        <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-center">
          Open the box to see inside faces in 3D
        </div>
      )}

      {/* Face Selector */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {tab === 'outside' ? 'Select Face' : 'Select Inner Face'}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {facesGroup.map(f => {
            const color = getFaceColor(f)
            const isSelected = selectedFace === f
            const label = isInnerFace(f) ? f.replace('inside_', '') : f
            return (
              <button
                key={f}
                onClick={() => setSelectedFace(f)}
                className="py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all"
                style={isSelected
                  ? { borderColor: color, color, background: `${color}18` }
                  : { borderColor: '#252d3f', color: '#64748b' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Elements List */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Elements
          </label>
          <span className="text-xs text-muted-foreground">{elements.length} items</span>
        </div>

        {elements.length === 0 ? (
          <div className="py-7 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="mx-auto text-muted-foreground mb-2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <p className="text-sm text-muted-foreground">No elements on this face</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add text or images from the right panel</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {elements.map(el => (
              <div
                key={el.id}
                onClick={() => setSelectedElement(el.id === selectedElementId ? null : el.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all group
                  ${selectedElementId === el.id
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border bg-card hover:border-border'
                  }`}
              >
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0
                  ${el.type === 'text' ? 'bg-primary/20 text-primary' : 'bg-purple-500/20 text-purple-400'}`}>
                  {el.type === 'text' ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">
                    {el.type === 'text' ? el.content.slice(0, 20) || 'Empty text' : 'Image'}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize">{el.type}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); toggleElementVisibility(face, el.id) }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    {el.visible ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteElement(face, el.id) }}
                    className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
