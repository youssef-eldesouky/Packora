import { useEffect, useRef, useCallback } from 'react'
import { useStore, isInnerFace } from '../../../store/useStore'

const CANVAS_SIZE = 1024



export default function FaceCanvas({ face, onTextureReady }) {
  const canvasRef = useRef(null)
  const designs = useStore(s => s.designs)
  const imgCache = useRef(new Map())
  const redrawVersion = useRef(0)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const version = redrawVersion.current + 1
    redrawVersion.current = version

    const { elements, backgroundColor } = designs[face]

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    
    // Draw solid background color to prevent black pixels when used as a texture
    ctx.fillStyle = backgroundColor || (isInnerFace(face) ? '#c8935a' : '#ede8d8')
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const imageElements = elements.filter(el => el.type === 'image' && el.visible)

    const loadImages = imageElements.map(el => {
      return new Promise(resolve => {
        if (imgCache.current.has(el.content)) {
          resolve()
          return
        }
        const img = new Image()
        img.onload = () => {
          imgCache.current.set(el.content, img)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = el.content
      })
    })

    Promise.all(loadImages).then(() => {
      if (redrawVersion.current !== version) return

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      ctx.fillStyle = backgroundColor || (isInnerFace(face) ? '#c8935a' : '#ede8d8')
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      elements.forEach(el => {
        if (!el.visible) return
        ctx.save()
        ctx.globalAlpha = el.opacity

        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        ctx.translate(cx, cy)
        ctx.rotate((el.rotation * Math.PI) / 180)
        ctx.translate(-el.width / 2, -el.height / 2)

        if (el.type === 'text') {
          ctx.font = `${el.fontWeight} ${el.fontSize}px ${el.fontFamily}, sans-serif`
          ctx.fillStyle = el.color
          ctx.textAlign = el.textAlign
          ctx.textBaseline = 'top'
          const lines = el.content.split('\n')
          lines.forEach((line, i) => {
            const x = el.textAlign === 'left' ? 0 : el.textAlign === 'right' ? el.width : el.width / 2
            ctx.fillText(line, x, i * el.fontSize * 1.3)
          })
        } else if (el.type === 'image') {
          const img = imgCache.current.get(el.content)
          if (img) {
            ctx.drawImage(img, 0, 0, el.width, el.height)
          }
        }

        // Draw selection highlight directly in the 3D texture!
        const isSelected = useStore.getState().selectedElementId === el.id
        if (isSelected) {
          ctx.strokeStyle = '#5f8aff'
          ctx.lineWidth = 4
          ctx.setLineDash([12, 12])
          ctx.strokeRect(0, 0, el.width, el.height)
        }

        ctx.restore()
      })

      onTextureReady(face, canvas.toDataURL('image/png'))
    })
  }, [face, designs, onTextureReady])

  useEffect(() => {
    const timer = setTimeout(redraw, 30)
    return () => clearTimeout(timer)
  }, [redraw])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{ display: 'none' }}
    />
  )
}
