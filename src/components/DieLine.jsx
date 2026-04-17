import React, { useRef, useEffect, useCallback } from 'react'
import { useStore, OUTER_FACES, isInnerFace } from '../store/useStore'

const FACE_LABELS = {
  front: 'Front', back: 'Back', left: 'Left', right: 'Right', top: 'Top', bottom: 'Bottom',
}

const FACE_COLORS = {
  front: '#3563fa',
  back: '#8b5cf6',
  left: '#06b6d4',
  right: '#10b981',
  top: '#f59e0b',
  bottom: '#ef4444',
}

const CELL_SIZE = 160

const LAYOUT = {
  top:    { col: 1, row: 0 },
  left:   { col: 0, row: 1 },
  front:  { col: 1, row: 1 },
  right:  { col: 2, row: 1 },
  back:   { col: 3, row: 1 },
  bottom: { col: 1, row: 2 },
}

function FaceCell({ face, texture, isSelected, onSelect, design }) {
  const canvasRef = useRef(null)
  const color = FACE_COLORS[face]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CELL_SIZE, CELL_SIZE)
    ctx.fillStyle = design.backgroundColor
    ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE)

    if (texture) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CELL_SIZE, CELL_SIZE)
      }
      img.src = texture
    } else {
      ctx.fillStyle = '#00000015'
      ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE)
    }
  }, [texture, design.backgroundColor])

  return (
    <div
      onClick={() => onSelect(face)}
      className="absolute cursor-pointer transition-all duration-150 select-none"
      style={{
        left: LAYOUT[face].col * (CELL_SIZE + 4),
        top: LAYOUT[face].row * (CELL_SIZE + 4),
        width: CELL_SIZE,
        height: CELL_SIZE,
        border: `2px solid ${isSelected ? color : '#3c4a68'}`,
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: isSelected ? `0 0 0 2px ${color}60, 0 0 16px ${color}30` : 'none',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      <canvas
        ref={canvasRef}
        width={CELL_SIZE}
        height={CELL_SIZE}
        style={{ display: 'block', width: CELL_SIZE, height: CELL_SIZE }}
      />
      {/* Label overlay */}
      <div
        className="absolute inset-x-0 bottom-0 py-1 text-center text-xs font-semibold"
        style={{
          background: `linear-gradient(to top, ${color}ee, ${color}00)`,
          color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {FACE_LABELS[face]}
      </div>

      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none" style={{ border: `3px solid ${color}` }} />
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `${color}15` }}
      />
    </div>
  )
}

export default function DieLine() {
  const { selectedFace, setSelectedFace, designs, faceTextures, addTextElement } = useStore()

  const totalCols = 4
  const totalRows = 3
  const containerW = totalCols * (CELL_SIZE + 4) - 4
  const containerH = totalRows * (CELL_SIZE + 4) - 4

  const handleFaceSelect = useCallback((face) => {
    setSelectedFace(face)
  }, [setSelectedFace])

  const outerSelected = isInnerFace(selectedFace) ? 'front' : selectedFace

  return (
    <div className="flex-1 relative bg-[#0f1117] flex flex-col items-center justify-center overflow-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          2D Dieline Layout
        </h3>
        <p className="text-[#64748b] text-xs mt-1">Click any face to select and edit it</p>
      </div>

      {/* Grid container */}
      <div className="relative" style={{ width: containerW, height: containerH }}>
        {/* Connection lines between faces */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={containerW}
          height={containerH}
          style={{ zIndex: 0 }}
        >
          {/* Horizontal connections */}
          <line x1={CELL_SIZE} y1={(CELL_SIZE + 4) + CELL_SIZE / 2} x2={CELL_SIZE + 4} y2={(CELL_SIZE + 4) + CELL_SIZE / 2} stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
          <line x1={2 * (CELL_SIZE + 4)} y1={(CELL_SIZE + 4) + CELL_SIZE / 2} x2={2 * (CELL_SIZE + 4) + 4} y2={(CELL_SIZE + 4) + CELL_SIZE / 2} stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
          <line x1={3 * (CELL_SIZE + 4)} y1={(CELL_SIZE + 4) + CELL_SIZE / 2} x2={3 * (CELL_SIZE + 4) + 4} y2={(CELL_SIZE + 4) + CELL_SIZE / 2} stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
          <line x1={(CELL_SIZE + 4) + CELL_SIZE / 2} y1={CELL_SIZE} x2={(CELL_SIZE + 4) + CELL_SIZE / 2} y2={CELL_SIZE + 4} stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
          <line x1={(CELL_SIZE + 4) + CELL_SIZE / 2} y1={2 * (CELL_SIZE + 4)} x2={(CELL_SIZE + 4) + CELL_SIZE / 2} y2={2 * (CELL_SIZE + 4) + 4} stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
        </svg>

        {/* Face cells */}
        {OUTER_FACES.map(face => (
          <FaceCell
            key={face}
            face={face}
            texture={faceTextures[face]}
            isSelected={selectedFace === face}
            onSelect={handleFaceSelect}
            design={designs[face]}
          />
        ))}
      </div>

      {/* Fold indicators */}
      <div className="mt-6 flex items-center gap-4 text-xs text-[#64748b]">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
          </svg>
          Fold lines
        </div>
        <span className="w-px h-4 bg-[#252d3f]" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-[#3563fa]" />
          Selected face
        </div>
        <span className="w-px h-4 bg-[#252d3f]" />
        <span>Click face → switch to edit</span>
      </div>

      {/* Quick-add to selected */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-[#64748b]">Add to <span style={{ color: FACE_COLORS[outerSelected] }}>{FACE_LABELS[outerSelected]}</span>:</span>
        <button
          onClick={() => addTextElement(selectedFace)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2535] border border-[#3c4a68] text-xs text-[#94a3b8]
            hover:border-brand-500 hover:text-white transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
          </svg>
          Add Text
        </button>
      </div>
    </div>
  )
}
