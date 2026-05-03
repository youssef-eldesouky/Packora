import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../../store/useStore'
import { ALL_FACES, isInnerFace } from '../../../store/useStore'

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
    dithering: true,
  })
}

/* ─── Face Panel ─── */
function Panel({
  face, w, h, position, rotation, material,
  selectedFace, hoveredFace, onHover,
  onPointerDown, onPointerMove, onPointerUp,
  castShadow = false, receiveShadow = false,
}) {
  const ref = useRef(null)

  useFrame(() => {
    const mat = ref.current?.material
    if (!mat) return
    const sel = selectedFace === face
    const hov = hoveredFace === face
    if (sel) {
      mat.emissive.setRGB(1, 1, 1)
      mat.emissiveIntensity = 0.15
    } else if (hov) {
      mat.emissive.setRGB(1, 1, 1)
      mat.emissiveIntensity = 0.05
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
      onPointerDown={e => onPointerDown(e, face)}
      onPointerMove={e => onPointerMove(e, face)}
      onPointerUp={e => onPointerUp(e, face)}
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
    designs, updateElement, setSelectedElement, setIsDraggingElement
  } = useStore()
  const { camera, gl } = useThree()
  const [hoveredFace, setHoveredFace] = useState(null)
  const isDraggingCam = useRef(false)
  const mouseDown  = useRef({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const { length: L, width: W, height: H } = boxDimensions
  const sx = L / 20; const sy = H / 20; const sz = W / 20
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
  const texVersion = useRef({})

  /* ── COLOR SYNC: keep each face solid color from store ── */
  useEffect(() => {
    ALL_FACES.forEach(face => {
      const mat = mats[face]
      const color = designs[face]?.backgroundColor
      const hasElements = (designs[face]?.elements?.length ?? 0) > 0
      
      if (!mat || !color) return
      
      // If we are using a texture map (which now has the background color baked in),
      // we must set the material color to white to avoid multiplying colors.
      if (hasElements) {
        mat.color.set('#ffffff')
      } else {
        mat.color.set(color)
      }
      mat.needsUpdate = true
    })
  }, [designs, mats])

  /* ── TEXTURE SYNC: replace material.map whenever a dataUrl arrives ── */
  useEffect(() => {
    ALL_FACES.forEach(face => {
      const dataUrl = textures[face]
      const hasElements = (designs[face]?.elements?.length ?? 0) > 0
      if (!dataUrl || !hasElements) {
        const mat = mats[face]
        if (mat.map) {
          texMap.current[face]?.dispose()
          texMap.current[face] = null
          mat.map = null
          mat.needsUpdate = true
        }
        return
      }
      const version = (texVersion.current[face] ?? 0) + 1
      texVersion.current[face] = version

      const img = new Image()
      img.onload = () => {
        if (texVersion.current[face] !== version) return
        texMap.current[face]?.dispose()

        const tex = new THREE.Texture(img)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
        tex.anisotropy = gl.capabilities.getMaxAnisotropy()
        tex.needsUpdate = true
        texMap.current[face] = tex

        const mat = mats[face]
        mat.map = tex
        mat.needsUpdate = true
      }
      img.src = dataUrl
    })
  }, [textures, designs, mats, gl])

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: KRAFT_EDGE, roughness: 0.75, metalness: 0.02, dithering: true,
  }), [])

  useEffect(() => {
    const currentTexMap = texMap.current
    return () => {
      ALL_FACES.forEach(face => {
        currentTexMap[face]?.dispose()
      })
      Object.values(mats).forEach(mat => mat.dispose())
      edgeMat.dispose()
    }
  }, [mats, edgeMat])

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
  const handlePointerDown = useCallback((e, face) => {
    e.stopPropagation()
    mouseDown.current = { x: e.clientX, y: e.clientY }
    isDraggingCam.current = false
    
    setSelectedFace(face)
    if (!e.uv) return

    const elements = designs[face]?.elements || []
    if (elements.length === 0) return

    const clickX = e.uv.x * 1024
    const clickY = (1 - e.uv.y) * 1024

    const clickedEl = [...elements].reverse().find(el => {
      // Allow slight padding for grabbing
      return clickX >= el.x - 10 && clickX <= el.x + el.width + 10 &&
             clickY >= el.y - 10 && clickY <= el.y + el.height + 10
    })

    if (clickedEl) {
      setSelectedElement(clickedEl.id)
      setIsDraggingElement(true)
      dragRef.current = {
        face,
        elementId: clickedEl.id,
        offsetX: clickX - clickedEl.x,
        offsetY: clickY - clickedEl.y
      }
      e.target.setPointerCapture(e.pointerId)
    } else {
      setSelectedElement(null)
    }
  }, [designs, setSelectedFace, setSelectedElement, setIsDraggingElement])

  const handlePointerMove = useCallback((e, face) => {
    if (dragRef.current && e.uv) {
      e.stopPropagation()
      const { elementId, offsetX, offsetY } = dragRef.current
      const currentX = e.uv.x * 1024
      const currentY = (1 - e.uv.y) * 1024
      updateElement(dragRef.current.face, elementId, {
        x: currentX - offsetX,
        y: currentY - offsetY
      })
    } else {
      const dx = e.clientX - mouseDown.current.x
      const dy = e.clientY - mouseDown.current.y
      if (Math.sqrt(dx * dx + dy * dy) > 6) isDraggingCam.current = true
    }
  }, [updateElement])

  const handlePointerUp = useCallback((e, face) => {
    if (dragRef.current) {
      e.stopPropagation()
      dragRef.current = null
      setIsDraggingElement(false)
      if (e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId)
      }
    } else {
      // Normal click
      if (!isDraggingCam.current) setSelectedFace(face)
    }
  }, [setIsDraggingElement, setSelectedFace])

  const handleFaceHover = useCallback((face) => {
    setHoveredFace(face)
    gl.domElement.style.cursor = face ? (dragRef.current ? 'grabbing' : 'pointer') : 'default'
  }, [gl])

  /* ── shorthand for Panel ── */
  const P = (face, w, h, pos, rot, shadow = false) => (
    <Panel
      key={face} face={face} w={w} h={h}
      position={pos} rotation={rot}
      material={mats[face]}
      selectedFace={selectedFace} hoveredFace={hoveredFace}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onHover={handleFaceHover}
      castShadow={shadow} receiveShadow
    />
  )

  return (
    <group>
      {/* ════════════════════════════════
          BOX BODY — 4 walls + floor
          ════════════════════════════════ */}

      {/* BOTTOM */}
      {P('bottom', sx + T, sz + T, [0, -hh - (T / 2 + 0.001), 0], [Math.PI / 2, 0, 0], true)}
      {isBoxOpen && P('inside_bottom', sx - T, sz - T, [0, -hh + (T / 2 + 0.001), 0], [-Math.PI / 2, 0, 0])}

      {/* BACK */}
      {P('back', sx + T, sy + T, [0, 0, -hz - (T / 2 + 0.001)], [0, Math.PI, 0], true)}
      {isBoxOpen && P('inside_back', sx - T, sy - T, [0, 0, -hz + (T / 2 + 0.001)], [0, 0, 0])}

      {/* LEFT */}
      {P('left', sz + T, sy + T, [-hw - (T / 2 + 0.001), 0, 0], [0, -Math.PI / 2, 0], true)}
      {isBoxOpen && P('inside_left', sz - T, sy - T, [-hw + (T / 2 + 0.001), 0, 0], [0, Math.PI / 2, 0])}

      {/* RIGHT */}
      {P('right', sz + T, sy + T, [hw + (T / 2 + 0.001), 0, 0], [0, Math.PI / 2, 0], true)}
      {isBoxOpen && P('inside_right', sz - T, sy - T, [hw - (T / 2 + 0.001), 0, 0], [0, -Math.PI / 2, 0])}

      {/* FRONT */}
      {P('front', sx + T, sy + T, [0, 0, hz + (T / 2 + 0.001)], [0, 0, 0], true)}
      {isBoxOpen && P('inside_front', sx - T, sy - T, [0, 0, hz - (T / 2 + 0.001)], [0, Math.PI, 0])}

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
          {P('top', sx + T, sz + T, [0, T / 2 + 0.001, hz], [-Math.PI / 2, 0, 0], true)}

          {/* TOP inner face (inside_top) — faces downward so visible when lid is open */}
          {isBoxOpen && P('inside_top', sx - T, sz - T, [0, -(T / 2 + 0.001), hz], [Math.PI / 2, 0, 0])}

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
