'use client'
/**
 * SignaturePad — Pad de signature plug-and-play
 * 
 * Usage:
 *   <SignaturePad onSign={(dataUrl) => console.log(dataUrl)} />
 *   <SignaturePad onSign={(dataUrl) => setSignature(dataUrl)} width={400} height={180} label="Signature du patient" />
 * 
 * Renvoie une image PNG en base64 via onSign()
 * Compatible: tablette, souris, stylet (pointerId API)
 * Aucune dépendance externe — canvas natif
 */

import { useRef, useEffect, useState, useCallback } from 'react'

interface SignaturePadProps {
  onSign: (dataUrl: string | null) => void   // appelé à chaque trait + après effacement
  width?: number
  height?: number
  label?: string
  required?: boolean
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
  initialValue?: string    // dataUrl existant (mode édition)
  readOnly?: boolean
  className?: string
}

export default function SignaturePad({
  onSign,
  width = 460,
  height = 160,
  label = 'Signature',
  required = false,
  strokeColor = '#0f172a',
  strokeWidth = 2.5,
  backgroundColor = '#ffffff',
  initialValue,
  readOnly = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing   = useRef(false)
  const lastPos   = useRef<{ x: number; y: number } | null>(null)
  const [isEmpty, setIsEmpty] = useState(!initialValue)
  const [saved,   setSaved]   = useState(false)

  // ── Init canvas ────────────────────────────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    // Scale for retina/HiDPI
    const dpr = window.devicePixelRatio || 1
    canvas.width  = width  * dpr
    canvas.height = height * dpr
    canvas.style.width  = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth   = strokeWidth
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'

    if (initialValue) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, width, height)
      img.src = initialValue
    }
  }, [width, height, backgroundColor, strokeColor, strokeWidth, initialValue])

  useEffect(() => { initCanvas() }, [initCanvas])

  // ── Get position (mouse + touch + stylus) ─────────────────────────────
  const getPos = (e: MouseEvent | TouchEvent | PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top }
  }

  // ── Drawing handlers ───────────────────────────────────────────────────
  const startDraw = useCallback((e: MouseEvent | TouchEvent | PointerEvent) => {
    if (readOnly) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    drawing.current = true
    lastPos.current = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
  }, [readOnly])

  const draw = useCallback((e: MouseEvent | TouchEvent | PointerEvent) => {
    if (!drawing.current || readOnly) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    setIsEmpty(false)
    setSaved(false)
  }, [readOnly])

  const stopDraw = useCallback(() => {
    if (!drawing.current) return
    drawing.current = false
    lastPos.current = null
    const canvas = canvasRef.current!
    const dataUrl = canvas.toDataURL('image/png')
    onSign(isEmpty ? null : dataUrl)
  }, [onSign, isEmpty])

  // ── Attach events ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Pointer events (stylus, mouse, touch unified)
    canvas.addEventListener('pointerdown', startDraw, { passive: false })
    canvas.addEventListener('pointermove', draw,      { passive: false })
    canvas.addEventListener('pointerup',   stopDraw)
    canvas.addEventListener('pointerleave',stopDraw)
    return () => {
      canvas.removeEventListener('pointerdown', startDraw)
      canvas.removeEventListener('pointermove', draw)
      canvas.removeEventListener('pointerup',   stopDraw)
      canvas.removeEventListener('pointerleave',stopDraw)
    }
  }, [startDraw, draw, stopDraw])

  // ── Clear ──────────────────────────────────────────────────────────────
  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    setIsEmpty(true)
    setSaved(false)
    onSign(null)
  }

  // ── Save (confirmation) ────────────────────────────────────────────────
  const save = () => {
    if (isEmpty) return
    const canvas = canvasRef.current!
    const dataUrl = canvas.toDataURL('image/png')
    onSign(dataUrl)
    setSaved(true)
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>{label}</span>
        {required && <span style={{ color: '#dc2626', fontSize: 12 }}>*</span>}
        {saved && <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>✓ Enregistrée</span>}
      </div>

      {/* Canvas */}
      <div style={{
        position: 'relative',
        border: readOnly ? '1px solid #e2e8f0' : isEmpty ? '1.5px dashed #94a3b8' : '1.5px solid #1641C8',
        borderRadius: 10,
        overflow: 'hidden',
        background: backgroundColor,
        cursor: readOnly ? 'default' : 'crosshair',
        touchAction: 'none',  // critical for stylus/touch
        width: width,
        height: height,
        boxShadow: readOnly ? 'none' : '0 1px 4px rgba(22,65,200,0.08)',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />

        {/* Placeholder text */}
        {isEmpty && !readOnly && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 6,
          }}>
            <span style={{ fontSize: 28, opacity: 0.2 }}>✍️</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Signez ici</span>
          </div>
        )}

        {/* Baseline */}
        {!readOnly && (
          <div style={{
            position: 'absolute', bottom: 28, left: 20, right: 20,
            borderBottom: '1px solid #e2e8f0', pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={clear}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>
            ↺ Effacer
          </button>
          <button type="button" onClick={save} disabled={isEmpty}
            style={{ background: isEmpty ? '#f1f5f9' : '#1641C8', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: isEmpty ? 'not-allowed' : 'pointer', color: isEmpty ? '#94a3b8' : 'white' }}>
            ✓ Valider la signature
          </button>
        </div>
      )}

      {/* Hint */}
      {!readOnly && (
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          Compatible tablette, stylet, souris et écran tactile
        </div>
      )}
    </div>
  )
}
