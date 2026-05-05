import React, { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei'
import { useStore } from '../../../store/useStore'
import { ALL_FACES, OUTER_FACES, isInnerFace, faceLabelText } from '../../../store/useStore'
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
    ?? '#fff'
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
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2  ">
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
          <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-700/40 text-xs text-amber-300">
            <div className="font-semibold mb-0.5">Box is open</div>
            <div className="text-[10px] text-amber-700/70">Click inner walls to design the inside</div>
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
                backgroundColor: selectedFace === face ? `${designs[face]?.backgroundColor ?? '#fff'}25` : 'rgba(22,27,39,0.85)',
                borderColor: selectedFace === face ? (designs[face]?.backgroundColor ?? '#fff') : '#252d3f',
                color: selectedFace === face ? (designs[face]?.backgroundColor ?? '#fff') : '#fff',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: designs[face]?.backgroundColor ?? '#fff' }} />
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
                const outerColor = designs[outer]?.backgroundColor ?? '#fff'
                return (
                  <button
                    key={face}
                    onClick={() => setSelectedFace(face)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all backdrop-blur-sm border"
                    style={{
                      backgroundColor: selectedFace === face ? `${outerColor}20` : 'rgba(22,27,39,0.7)',
                      borderColor: selectedFace === face ? `${outerColor}80` : '#1e2535',
                      color: selectedFace === face ? outerColor : '#310808ff',
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none ">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-border text-xs text-muted-foreground">
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
            style={{ background: '#F4F5F7' }}
          >
            <color attach="background" args={['#F4F5F7']} />
            
            {/* High ambient light to make colors look uniform across sides */}
            <ambientLight intensity={1.8} />
            
            {/* Subtle directional light just to give a slight 3D edge definition and cast floor shadow */}
            <directionalLight position={[5, 10, 5]} intensity={0.6} castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={50}
              shadow-camera-left={-10} shadow-camera-right={10}
              shadow-camera-top={10} shadow-camera-bottom={-10}
              shadow-bias={-0.0002}
            />
            {/* Soft backfill light to prevent the back from looking too dark */}
            <directionalLight position={[-4, 5, -4]} intensity={0.6} color="#ffffff" />

            {/* UPWARD light to perfectly illuminate the BOTTOM side of the box! */}
            <directionalLight position={[0, -10, 0]} intensity={1.2} color="#ffffff" />
            
            {/* Interior fill light — neutral, helps see inside when open */}
            <pointLight position={[0, 0, 0]} intensity={isBoxOpen ? 0.5 : 0} color="#ffffff" />
            <pointLight position={[0, 6, 0]} intensity={0.2} color="#ffffff" />

            <Suspense fallback={null}>
              <Box3D textures={textures} />
            </Suspense>

            <Suspense fallback={null}>
              <Grid infiniteGrid fadeDistance={30} sectionColor="#cbd5e1" cellColor="#f1f5f9" sectionSize={1} cellSize={0.5} position={[0, -1.49, 0]} />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.7} scale={15} blur={2.5} far={4.5} color="#1e293b" />
            </Suspense>

            <OrbitControls
              makeDefault enableDamping dampingFactor={0.03}
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
