import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useStore, OUTER_FACES, INNER_FACES, isInnerFace, toOuterFace, faceLabelText } from '../../../store/useStore'

const FACE_LABELS = {
  front: 'Front', back: 'Back', left: 'Left', right: 'Right', top: 'Top', bottom: 'Bottom',
}

const CELL_SIZE = 160
const BLEED_PX = 10

const LAYOUT = {
  top:    { col: 1, row: 0 },
  left:   { col: 0, row: 1 },
  front:  { col: 1, row: 1 },
  right:  { col: 2, row: 1 },
  back:   { col: 3, row: 1 },
  bottom: { col: 1, row: 2 },
}

function DraggableOverlay({ el, face }) {
  const { updateElement, setSelectedElement, selectedElementId } = useStore()
  const isSelected = selectedElementId === el.id

  const handlePointerDown = (e) => {
    e.stopPropagation()
    setSelectedElement(el.id)
    
    if (e.target.dataset.action === 'resize') {
      const startX = e.clientX
      const startY = e.clientY
      const startW = el.width
      const startH = el.height

      const onPointerMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY
        const scale = 1024 / 160
        updateElement(face, el.id, {
          width: Math.max(20, startW + dx * scale),
          height: Math.max(20, startH + dy * scale)
        })
      }

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      return
    }

    const startX = e.clientX
    const startY = e.clientY
    const startElX = el.x
    const startElY = el.y

    const onPointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      // scale = 1024 / CELL_SIZE
      const scale = 1024 / 160
      updateElement(face, el.id, {
        x: startElX + dx * scale,
        y: startElY + dy * scale
      })
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const scale = 160 / 1024 // CELL_SIZE / CANVAS_SIZE

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: el.x * scale,
        top: el.y * scale,
        width: Math.max(20, el.width * scale),
        height: Math.max(20, el.height * scale),
        transformOrigin: 'center',
        transform: `rotate(${el.rotation}deg)`,
        border: isSelected ? '1.5px dashed #5f8aff' : '1px solid transparent',
        cursor: 'move',
        zIndex: isSelected ? 20 : 10,
      }}
      className="hover:border-[#5f8aff55] transition-colors group"
      title={el.type === 'text' ? el.content : 'Image'}
    >
      {isSelected && (
        <div
          data-action="resize"
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full cursor-se-resize shadow-sm"
        />
      )}
    </div>
  )
}

function FaceCell({ face, targetFace, texture, isSelected, onSelect, design }) {
  const canvasRef = useRef(null)
  const color = design.backgroundColor

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
        // Bleed lines on top of artwork.
        ctx.save()
        ctx.strokeStyle = '#ff3b3b'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.strokeRect(BLEED_PX, BLEED_PX, CELL_SIZE - BLEED_PX * 2, CELL_SIZE - BLEED_PX * 2)
        ctx.restore()
      }
      img.src = texture
    } else {
      ctx.fillStyle = '#00000015'
      ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE)
    }

    // Bleed lines (always visible).
    ctx.save()
    ctx.strokeStyle = '#ff3b3b'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.strokeRect(BLEED_PX, BLEED_PX, CELL_SIZE - BLEED_PX * 2, CELL_SIZE - BLEED_PX * 2)
    ctx.restore()
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
        {faceLabelText(targetFace)}
      </div>

      {/* Selection ring */}
      {isSelected && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ border: `3px solid ${color}` }} />
          {/* Draggable elements */}
          {design.elements.map(el => (
            <DraggableOverlay key={el.id} el={el} face={targetFace} />
          ))}
        </>
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
  const [surfaceMode, setSurfaceMode] = useState(isInnerFace(selectedFace) ? 'inside' : 'outside')

  const totalCols = 4
  const totalRows = 3
  const containerW = totalCols * (CELL_SIZE + 4) - 4
  const containerH = totalRows * (CELL_SIZE + 4) - 4

  const surfaceFaces = surfaceMode === 'outside' ? OUTER_FACES : INNER_FACES

  const handleFaceSelect = useCallback((face) => {
    setSelectedFace(face)
  }, [setSelectedFace])

  useEffect(() => {
    setSurfaceMode(isInnerFace(selectedFace) ? 'inside' : 'outside')
  }, [selectedFace])

  const outerSelected = isInnerFace(selectedFace) ? toOuterFace(selectedFace) : selectedFace
  const selectedColor = designs[selectedFace]?.backgroundColor ?? '#64748b'

  return (
    <div className="flex-1 relative bg-[#F4F5F7] flex flex-col items-center justify-center overflow-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-foreground font-semibold text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          2D Dieline Layout
        </h3>
        <p className="text-muted-foreground text-xs mt-1">Click any face to select and edit it</p>
        <div className="mt-3 inline-flex rounded-lg overflow-hidden border border-border bg-sidebar">
          <button
            onClick={() => {
              setSurfaceMode('outside')
              if (isInnerFace(selectedFace)) setSelectedFace('front')
            }}
            className={`px-3 py-1.5 text-xs font-semibold transition-all ${
              surfaceMode === 'outside' ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Outside
          </button>
          <button
            onClick={() => {
              setSurfaceMode('inside')
              if (!isInnerFace(selectedFace)) setSelectedFace('inside_front')
            }}
            className={`px-3 py-1.5 text-xs font-semibold transition-all ${
              surfaceMode === 'inside' ? 'bg-amber-500 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Inside
          </button>
        </div>
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
        {OUTER_FACES.map(face => {
          const targetFace = surfaceMode === 'outside' ? face : `inside_${face}`
          return (
            <FaceCell
              key={targetFace}
              face={face}
              targetFace={targetFace}
              texture={faceTextures[targetFace]}
              isSelected={selectedFace === targetFace}
              onSelect={() => handleFaceSelect(targetFace)}
              design={designs[targetFace]}
            />
          )
        })}
      </div>

      {/* Fold indicators */}
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#3c4a68" strokeWidth="2" strokeDasharray="4,3" />
          </svg>
          Fold lines
        </div>
        <span className="w-px h-4 bg-muted" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2" style={{ borderColor: selectedColor }} />
          Selected face
        </div>
        <span className="w-px h-4 bg-muted" />
        <span>{surfaceMode === 'outside' ? 'Editing outside faces' : 'Editing inside faces'}</span>
      </div>

      {/* Quick-add to selected */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Add to <span style={{ color: selectedColor }}>{faceLabelText(selectedFace)}</span>:</span>
        <button
          onClick={() => addTextElement(surfaceFaces.includes(selectedFace) ? selectedFace : surfaceFaces[0])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground/80
            hover:border-primary hover:text-foreground transition-all"
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
