import React, { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { ALL_FACES, OUTER_FACES, isInnerFace, faceLabelText } from '../store/useStore'
import Box3D from './Box3D'
import FaceCanvas from './FaceCanvas'
import DieLine from './DieLine'
import WebGLErrorBoundary from './WebGLErrorBoundary'

export default function Canvas3D() {
  const {
    selectedFace, setSelectedFace,
    setFaceTexture, viewMode, setViewMode,
    isBoxOpen, setBoxOpen,
    designs, isDraggingElement,
  } = useStore()

  const [textures, setTextures] = useState(
    () => Object.fromEntries(ALL_FACES.map(f => [f, '']))
  )

  const handleTextureReady = useCallback((face, dataUrl) => {
    setTextures(prev => ({ ...prev, [face]: dataUrl }))
    setFaceTexture(face, dataUrl)
  }, [setFaceTexture])

  const faceColor = designs[selectedFace]?.backgroundColor
    ?? designs[isInnerFace(selectedFace) ? selectedFace.replace('inside_', '') : selectedFace]?.backgroundColor
    ?? '#64748b'
  const faceLabel = faceLabelText(selectedFace)
  const isInner = isInnerFace(selectedFace)

  return (
    <div className="flex-1 relative bg-[#fff] overflow-hidden flex flex-col">
      {/* Hidden offscreen canvases — all 12 faces */}
      {ALL_FACES.map(face => (
        <FaceCanvas key={face} face={face} onTextureReady={handleTextureReady} />
      ))}

      {/* ── ACTIVE FACE BADGE ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border"
          style={{
            backgroundColor: `${faceColor}20`,
            borderColor: `${faceColor}50`,
            color: faceColor,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: faceColor }} />
          {isInner && (
            <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Inside
            </span>
          )}
          Editing: {faceLabel}
        </div>
      </div>

      {/* ── TOP-LEFT CONTROLS ── */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-[#fff] ">
        {/* 3D / 2D toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border bg-sidebar/90 backdrop-blur-sm">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all
              ${viewMode === '3d' ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            3D View
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all
              ${viewMode === '2d' ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
            </svg>
            2D Layout
          </button>
        </div>

        {/* Open / Close / Flat controls */}
        {viewMode === '3d' && (
          <div className="flex rounded-lg overflow-hidden border border-border bg-sidebar/90 backdrop-blur-sm">
            <button
              onClick={() => { setBoxOpen(false); setViewMode('3d') }}
              className={`px-3 py-2 text-xs font-semibold transition-all ${
                !isBoxOpen ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Close
            </button>
            <button
              onClick={() => { setBoxOpen(true); setViewMode('3d') }}
              className={`px-3 py-2 text-xs font-semibold transition-all ${
                isBoxOpen ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              Flat
            </button>
          </div>
        )}

        {/* Inside hint — shown when box is open */}
        {isBoxOpen && viewMode === '3d' && (
          <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <div className="font-semibold mb-0.5">Box is open</div>
            <div className="text-[10px] text-amber-200/70">Click inner walls to design the inside</div>
          </div>
        )}
      </div>

      {/* ── FACE JUMP BUTTONS — right side, 3D only ── */}
      {viewMode === '3d' && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold text-center mb-1">
            Outside
          </div>
          {OUTER_FACES.map(face => (
            <button
              key={face}
              onClick={() => setSelectedFace(face)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all backdrop-blur-sm border capitalize"
              style={{
                backgroundColor: selectedFace === face ? `${designs[face]?.backgroundColor ?? '#64748b'}25` : 'rgba(22,27,39,0.85)',
                borderColor: selectedFace === face ? (designs[face]?.backgroundColor ?? '#64748b') : '#252d3f',
                color: selectedFace === face ? (designs[face]?.backgroundColor ?? '#64748b') : '#64748b',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: designs[face]?.backgroundColor ?? '#64748b' }} />
              {face}
            </button>
          ))}

          {isBoxOpen && (
            <>
              <div className="text-[10px] text-amber-500/70 uppercase tracking-wider font-semibold text-center mt-2 mb-1">
                Inside
              </div>
              {['inside_front', 'inside_back', 'inside_left', 'inside_right', 'inside_bottom', 'inside_top'].map(face => {
                const outer = face.replace('inside_', '')
                const outerColor = designs[outer]?.backgroundColor ?? '#64748b'
                return (
                  <button
                    key={face}
                    onClick={() => setSelectedFace(face)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all backdrop-blur-sm border"
                    style={{
                      backgroundColor: selectedFace === face ? `${outerColor}20` : 'rgba(22,27,39,0.7)',
                      borderColor: selectedFace === face ? `${outerColor}80` : '#1e2535',
                      color: selectedFace === face ? outerColor : '#4a5568',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: outerColor }} />
                    <span className="capitalize">{outer} <span className="opacity-50">(in)</span></span>
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── HINTS ── */}
      {viewMode === '3d' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-sidebar/80 backdrop-blur-sm border border-border text-xs text-muted-foreground">
            <span>Drag to rotate</span>
            <span className="w-px h-3 bg-muted" />
            <span>Scroll to zoom</span>
            <span className="w-px h-3 bg-muted" />
            <span>Click any face to edit</span>
          </div>
        </div>
      )}

      {/* ── MAIN VIEW ── */}
      {viewMode === '3d' ? (
        <WebGLErrorBoundary>
          <Canvas
            camera={{ position: [2.5, 2, 3.5], fov: 44 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
            shadows
            style={{ background: 'var(--background)' }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={50}
              shadow-camera-left={-10} shadow-camera-right={10}
              shadow-camera-top={10} shadow-camera-bottom={-10}
              shadow-bias={-0.0005}
            />
            <directionalLight position={[-4, 3, -4]} intensity={0.3} />
            {/* Interior fill light — warm, helps see inside when open */}
            <pointLight position={[0, 0, 0]} intensity={isBoxOpen ? 0.8 : 0} color="#ffcb8a" />
            <pointLight position={[0, 6, 0]} intensity={0.35} color="#b0c4ff" />

            <Suspense fallback={null}>
              <Box3D textures={textures} />
            </Suspense>

            <Suspense fallback={null}>
              <ContactShadows position={[0, -1.5, 0]} opacity={0.45} scale={12} blur={3} far={5} />
            </Suspense>

            <OrbitControls
              makeDefault enableDamping dampingFactor={0.07}
              minDistance={1.2} maxDistance={10} enablePan={false}
              enabled={!isDraggingElement}
            />

            <Suspense fallback={null}>
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <DieLine />
      )}
    </div>
  )
}
