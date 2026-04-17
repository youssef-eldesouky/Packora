import React, { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { ALL_FACES, OUTER_FACES, isInnerFace, faceLabelText } from '../store/useStore'
import Box3D from './Box3D'
import FaceCanvas from './FaceCanvas'
import DieLine from './DieLine'
import WebGLErrorBoundary from './WebGLErrorBoundary'

const FACE_COLORS = {
  front: '#3563fa', back: '#8b5cf6', left: '#06b6d4',
  right: '#10b981', top: '#f59e0b', bottom: '#ef4444',
}

function getFaceColor(face) {
  if (isInnerFace(face)) {
    const outer = face.replace('inside_', '')
    return FACE_COLORS[outer] ?? '#64748b'
  }
  return FACE_COLORS[face] ?? '#64748b'
}

export default function Canvas3D() {
  const {
    selectedFace, setSelectedFace,
    setFaceTexture, viewMode, setViewMode,
    isBoxOpen, toggleBoxOpen,
  } = useStore()

  const [textures, setTextures] = useState(
    () => Object.fromEntries(ALL_FACES.map(f => [f, '']))
  )

  const handleTextureReady = useCallback((face, dataUrl) => {
    setTextures(prev => ({ ...prev, [face]: dataUrl }))
    setFaceTexture(face, dataUrl)
  }, [setFaceTexture])

  const faceColor = getFaceColor(selectedFace)
  const faceLabel = faceLabelText(selectedFace)
  const isInner = isInnerFace(selectedFace)

  return (
    <div className="flex-1 relative bg-[#0f1117] overflow-hidden flex flex-col">
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
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* 3D / 2D toggle */}
        <div className="flex rounded-lg overflow-hidden border border-[#252d3f] bg-[#161b27]/90 backdrop-blur-sm">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all
              ${viewMode === '3d' ? 'bg-brand-500 text-white' : 'text-[#64748b] hover:text-white hover:bg-[#252d3f]'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            3D View
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all
              ${viewMode === '2d' ? 'bg-brand-500 text-white' : 'text-[#64748b] hover:text-white hover:bg-[#252d3f]'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
            </svg>
            2D Layout
          </button>
        </div>

        {/* Open / Close box */}
        {viewMode === '3d' && (
          <button
            onClick={toggleBoxOpen}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all backdrop-blur-sm
              ${isBoxOpen
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-[#161b27]/90 border-[#252d3f] text-[#94a3b8] hover:text-white hover:border-[#3c4a68]'}`}
          >
            {isBoxOpen ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                </svg>
                Close Box
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                Open Box
              </>
            )}
          </button>
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
          <div className="text-[10px] text-[#3c4a68] uppercase tracking-wider font-semibold text-center mb-1">
            Outside
          </div>
          {OUTER_FACES.map(face => (
            <button
              key={face}
              onClick={() => setSelectedFace(face)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all backdrop-blur-sm border capitalize"
              style={{
                backgroundColor: selectedFace === face ? `${FACE_COLORS[face]}25` : 'rgba(22,27,39,0.85)',
                borderColor: selectedFace === face ? FACE_COLORS[face] : '#252d3f',
                color: selectedFace === face ? FACE_COLORS[face] : '#64748b',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FACE_COLORS[face] }} />
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
                return (
                  <button
                    key={face}
                    onClick={() => setSelectedFace(face)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all backdrop-blur-sm border"
                    style={{
                      backgroundColor: selectedFace === face ? `${FACE_COLORS[outer]}20` : 'rgba(22,27,39,0.7)',
                      borderColor: selectedFace === face ? `${FACE_COLORS[outer]}80` : '#1e2535',
                      color: selectedFace === face ? FACE_COLORS[outer] : '#4a5568',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: FACE_COLORS[outer] }} />
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
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#161b27]/80 backdrop-blur-sm border border-[#252d3f] text-xs text-[#64748b]">
            <span>Drag to rotate</span>
            <span className="w-px h-3 bg-[#252d3f]" />
            <span>Scroll to zoom</span>
            <span className="w-px h-3 bg-[#252d3f]" />
            <span>Click any face to edit</span>
          </div>
        </div>
      )}

      {/* ── MAIN VIEW ── */}
      {viewMode === '3d' ? (
        <WebGLErrorBoundary>
          <Canvas
            camera={{ position: [2.5, 2, 3.5], fov: 44 }}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            shadows
            style={{ background: 'radial-gradient(ellipse at center, #1a2035 0%, #0a0d14 100%)' }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={50}
              shadow-camera-left={-10} shadow-camera-right={10}
              shadow-camera-top={10} shadow-camera-bottom={-10}
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
