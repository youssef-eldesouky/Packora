import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { ALL_FACES, isInnerFace } from '../store/useStore'

/* ─── camera positions per face ─── */
const FACE_CAMERA = {
  front:         [0,  0.4,  4.5],
  back:          [0,  0.4, -4.5],
  left:          [-4.5, 0.4,  0],
  right:         [4.5, 0.4,  0],
  top:           [0,  5.0,  0.5],
  bottom:        [0, -5.0,  0.5],
  inside_front:  [0,  0.3,  2.2],
  inside_back:   [0,  0.3, -2.2],
  inside_left:   [-2.2, 0.3,  0],
  inside_right:  [2.2, 0.3,  0],
  inside_bottom: [0,  2.5,  0],
  inside_top:    [0,  0.2,  0],
}

/* ─── emissive tints per face ─── */
const FACE_EM = {
  front:         [0.08, 0.18, 0.6],
  back:          [0.25, 0.05, 0.5],
  left:          [0.0,  0.28, 0.45],
  right:         [0.0,  0.38, 0.22],
  top:           [0.4,  0.28, 0.0],
  bottom:        [0.5,  0.05, 0.05],
  inside_front:  [0.08, 0.18, 0.6],
  inside_back:   [0.25, 0.05, 0.5],
  inside_left:   [0.0,  0.28, 0.45],
  inside_right:  [0.0,  0.38, 0.22],
  inside_bottom: [0.5,  0.05, 0.05],
  inside_top:    [0.4,  0.28, 0.0],
}

const KRAFT_OUTER  = '#ede8d8'
const KRAFT_INNER  = '#c8935a'
const KRAFT_EDGE   = '#c8b99a'
const WALL_T       = 0.055

/* ─── creates a solid-color MeshStandardMaterial ─── */
function solidMat(hex, rough = 0.65) {
  return new THREE.MeshStandardMaterial({
    color: hex,
    roughness: rough,
    metalness: 0.03,
    side: THREE.DoubleSide,
  })
}

/* ─── Face Panel ─── */
function Panel({
  face, w, h, position, rotation, material,
  selectedFace, hoveredFace, onClick, onHover,
  castShadow = false, receiveShadow = false,
}) {
  const ref = useRef(null)

  useFrame(() => {
    const mat = ref.current?.material
    if (!mat) return
    const sel = selectedFace === face
    const hov = hoveredFace === face
    const em = FACE_EM[face] ?? [0.08, 0.18, 0.6]
    if (sel) {
      mat.emissive.setRGB(em[0], em[1], em[2])
      mat.emissiveIntensity = 0.38
    } else if (hov) {
      mat.emissive.setRGB(em[0] * 0.55, em[1] * 0.55, em[2] * 0.55)
      mat.emissiveIntensity = 0.18
    } else {
      mat.emissiveIntensity = 0
    }
  })

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={rotation}
      material={material}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      onClick={e => { e.stopPropagation(); onClick(face) }}
      onPointerOver={e => { e.stopPropagation(); onHover(face) }}
      onPointerOut={() => onHover(null)}
    >
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

/* ─── Main Box3D ─── */
export default function Box3D({ textures }) {
  const {
    selectedFace, setSelectedFace,
    boxDimensions, isBoxOpen, cameraTarget, setCameraTarget,
  } = useStore()
  const { camera, gl } = useThree()
  const [hoveredFace, setHoveredFace] = useState(null)
  const isDragging = useRef(false)
  const mouseDown  = useRef({ x: 0, y: 0 })

  const { length: L, width: W, height: H } = boxDimensions
  const sx = L / 8; const sy = H / 8; const sz = W / 8
  const T  = WALL_T
  const hw = sx / 2, hh = sy / 2, hz = sz / 2

  /* ── one material per face, created once ── */
  const mats = useMemo(() => {
    const out = {}
    ALL_FACES.forEach(f => {
      const inner = isInnerFace(f)
      out[f] = solidMat(inner ? KRAFT_INNER : KRAFT_OUTER, inner ? 0.85 : 0.6)
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── track current texture per face so we can dispose old ones ── */
  const texMap = useRef({})

  /* ── TEXTURE SYNC: replace material.map whenever a dataUrl arrives ── */
  useEffect(() => {
    ALL_FACES.forEach(face => {
      const dataUrl = textures[face]
      if (!dataUrl) return

      const img = new Image()
      img.onload = () => {
        texMap.current[face]?.dispose()

        const tex = new THREE.Texture(img)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        texMap.current[face] = tex

        const mat = mats[face]
        mat.map = tex
        mat.needsUpdate = true
      }
      img.src = dataUrl
    })
  }, [textures, mats])

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: KRAFT_EDGE, roughness: 0.75, metalness: 0.02,
  }), [])

  /* ── lid animation ── */
  const lidAngle   = useRef(0)
  const lidRef     = useRef(null)

  /* ── camera animation ── */
  const camGoal    = useRef(null)
  const camMoving  = useRef(false)
  const camLook    = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    if (!cameraTarget) return
    const [tx, ty, tz] = FACE_CAMERA[cameraTarget]
    camGoal.current = new THREE.Vector3(
      tx * Math.max(sx, 0.7),
      ty * Math.max(sy, 0.7),
      tz * Math.max(sz, 0.7),
    )
    camMoving.current = true
    setCameraTarget(null)
  }, [cameraTarget, sx, sy, sz, setCameraTarget])

  useFrame(() => {
    if (camMoving.current && camGoal.current) {
      camera.position.lerp(camGoal.current, 0.07)
      camera.lookAt(camLook.current)
      if (camera.position.distanceTo(camGoal.current) < 0.015) camMoving.current = false
    }
    const target = isBoxOpen ? -Math.PI * 0.916 : 0
    lidAngle.current += (target - lidAngle.current) * 0.07
    if (lidRef.current) lidRef.current.rotation.x = lidAngle.current
  })

  /* ── pointer helpers ── */
  const handlePointerDown = useCallback((e) => {
    mouseDown.current = { x: e.pointer.x, y: e.pointer.y }
    isDragging.current = false
  }, [])
  const handlePointerMove = useCallback((e) => {
    const dx = e.pointer.x - mouseDown.current.x
    const dy = e.pointer.y - mouseDown.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 0.008) isDragging.current = true
  }, [])
  const handlePointerOver = useCallback(() => {
    gl.domElement.style.cursor = 'pointer'
  }, [gl])
  const handlePointerOut = useCallback(() => {
    gl.domElement.style.cursor = 'default'
    setHoveredFace(null)
  }, [gl])
  const handleFaceClick = useCallback((face) => {
    if (isDragging.current) return
    setSelectedFace(face)
  }, [setSelectedFace])
  const handleFaceHover = useCallback((face) => {
    setHoveredFace(face)
    gl.domElement.style.cursor = face ? 'pointer' : 'default'
  }, [gl])

  /* ── shorthand for Panel ── */
  const P = (face, w, h, pos, rot, shadow = false) => (
    <Panel
      key={face} face={face} w={w} h={h}
      position={pos} rotation={rot}
      material={mats[face]}
      selectedFace={selectedFace} hoveredFace={hoveredFace}
      onClick={handleFaceClick} onHover={handleFaceHover}
      castShadow={shadow} receiveShadow
    />
  )

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* ════════════════════════════════
          BOX BODY — 4 walls + floor
          ════════════════════════════════ */}

      {/* BOTTOM */}
      {P('bottom', sx, sz, [0, -hh, 0], [-Math.PI / 2, 0, 0], true)}
      {P('inside_bottom', sx - T * 2, sz - T * 2, [0, -hh + T * 0.6, 0], [Math.PI / 2, 0, 0])}

      {/* BACK */}
      {P('back', sx, sy, [0, 0, -hz], [0, Math.PI, 0], true)}
      {P('inside_back', sx - T * 2, sy - T, [0, T * 0.25, -hz + T * 0.6], [0, 0, 0])}

      {/* LEFT */}
      {P('left', sz, sy, [-hw, 0, 0], [0, Math.PI / 2, 0], true)}
      {P('inside_left', sz - T * 2, sy - T, [-hw + T * 0.6, T * 0.25, 0], [0, Math.PI / 2, 0])}

      {/* RIGHT */}
      {P('right', sz, sy, [hw, 0, 0], [0, -Math.PI / 2, 0], true)}
      {P('inside_right', sz - T * 2, sy - T, [hw - T * 0.6, T * 0.25, 0], [0, -Math.PI / 2, 0])}

      {/* FRONT */}
      {P('front', sx, sy, [0, 0, hz], [0, 0, 0], true)}
      {P('inside_front', sx - T * 2, sy - T, [0, T * 0.25, hz - T * 0.6], [0, Math.PI, 0])}

      {/* Wall edge slabs (give physical thickness) */}
      <mesh position={[0, -hh, 0]} material={edgeMat} castShadow receiveShadow>
        <boxGeometry args={[sx, T, sz]} />
      </mesh>
      <mesh position={[0, 0, -hz]} material={edgeMat}>
        <boxGeometry args={[sx, sy, T]} />
      </mesh>
      <mesh position={[-hw, 0, 0]} material={edgeMat}>
        <boxGeometry args={[T, sy, sz]} />
      </mesh>
      <mesh position={[hw, 0, 0]} material={edgeMat}>
        <boxGeometry args={[T, sy, sz]} />
      </mesh>
      <mesh position={[0, 0, hz]} material={edgeMat}>
        <boxGeometry args={[sx, sy, T]} />
      </mesh>
      {/* Top rim of body */}
      <mesh position={[0, hh, 0]} material={edgeMat}>
        <boxGeometry args={[sx, T * 0.4, sz]} />
      </mesh>

      {/* ════════════════════════════════
          LID — hinged at (0, hh, -hz)
          Swings 165° backward when open
          ════════════════════════════════ */}
      <group position={[0, hh, -hz]}>
        <group ref={lidRef}>

          {/* TOP outer face */}
          {P('top', sx, sz, [0, T * 0.5, hz], [Math.PI / 2, 0, 0], true)}

          {/* TOP inner face (inside_top) — faces downward so visible when lid is open */}
          {P('inside_top', sx - T * 2, sz - T * 2, [0, -T * 0.1, hz], [Math.PI / 2, 0, 0])}

          {/* Lid structural slab */}
          <mesh position={[0, 0, hz]} material={edgeMat} castShadow>
            <boxGeometry args={[sx, T, sz]} />
          </mesh>

          {/* Lid front lip */}
          <mesh position={[0, -sy * 0.15, hz * 2]} material={edgeMat} castShadow>
            <boxGeometry args={[sx, sy * 0.28, T]} />
          </mesh>

          {/* Lid left tab */}
          <mesh position={[-hw, -sy * 0.075, hz]} material={edgeMat}>
            <boxGeometry args={[T, sy * 0.22, sz]} />
          </mesh>
          {/* Lid right tab */}
          <mesh position={[hw, -sy * 0.075, hz]} material={edgeMat}>
            <boxGeometry args={[T, sy * 0.22, sz]} />
          </mesh>

        </group>
      </group>
    </group>
  )
}
