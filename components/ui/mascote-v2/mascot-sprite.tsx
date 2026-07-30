'use client'

/**
 * MascotSprite v2
 * Revisão para foco em performance e fidelidade, com mobile como secundário.
 *
 * O que mudou em relação à v1:
 *   - Folha em GRADE (cols x rows) em vez de tira, para caber mais frames
 *     sem estourar o limite de 16384 px de largura.
 *   - 25 frames por padrão, contra 15. Passo angular cai de 4,9° para 2,8°.
 *   - O portão de progressive enhancement continua existindo, mas agora
 *     serve para robustez, não para economia. Mobile recebe o poster porque
 *     não tem cursor, não porque o orçamento apertou.
 *
 * Continua valendo: zero WebGL, zero shader compile, e o rAF só roda enquanto
 * o valor está amortecendo. Cursor parado, custo zero.
 *
 * Assets esperados em `basePath`:
 *   poster.avif / poster.webp / poster.png
 *   sheet.avif  / sheet.webp    (grade cols x rows, ordem linha a linha)
 */

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function shouldEnhance(): boolean {
  if (typeof window === 'undefined') return false
  if (!window.matchMedia('(pointer: fine)').matches) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection

  if (conn?.saveData) return false
  if (conn?.effectiveType && /^(slow-)?2g$/.test(conn.effectiveType)) return false

  return true
}

/* ------------------------------------------------------------------ */

export interface MascotSpriteProps {
  /** Pasta pública com poster.* e sheet.*. */
  basePath?: string
  /** Total de frames na grade. Precisa bater com o build. */
  frames?: number
  /** Colunas da grade. Linhas são derivadas. */
  cols?: number
  className?: string
  /** Intensidade do acompanhamento do cursor. 0 desliga a interação. */
  follow?: number
  /** Flutuação em CSS. Custa zero JS. */
  idle?: boolean
  /**
   * Inclinação vertical em CSS, em graus no extremo.
   * A guinada horizontal é sprite de verdade. A inclinação é aproximação
   * em perspectiva CSS, porque uma grade 2D de guinada x inclinação
   * multiplicaria o número de frames sem ganho perceptual proporcional.
   */
  tilt?: number
  label?: string
  priority?: boolean
}

export function MascotSprite({
  basePath = '/mascote',
  frames = 25,
  cols = 5,
  className,
  follow = 1,
  idle = true,
  tilt = 3.4,
  label = 'Mascote 3D que acompanha o movimento do cursor',
  priority = false,
}: MascotSpriteProps) {
  const rows = Math.ceil(frames / cols)

  const rootRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const layerARef = useRef<HTMLImageElement>(null)
  const layerBRef = useRef<HTMLImageElement>(null)

  const targetRef = useRef({ x: 0, y: 0 })
  const [enhance, setEnhance] = useState(false)
  const [ready, setReady] = useState(false)

  /* Portão -------------------------------------------------------- */
  useEffect(() => {
    const el = rootRef.current
    if (!el || follow === 0) return
    if (!shouldEnhance()) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnhance(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [follow])

  /* Loop autoterminante ------------------------------------------- */
  useEffect(() => {
    if (!enhance || !ready) return
    const el = rootRef.current
    if (!el) return

    let raf = 0
    let last = 0
    let curX = 0
    let curY = 0
    let rect = el.getBoundingClientRect()

    const measure = () => {
      rect = el.getBoundingClientRect()
    }

    const place = (img: HTMLImageElement | null, index: number) => {
      if (!img) return
      const i = clamp(index, 0, frames - 1)
      const col = i % cols
      const row = Math.floor(i / cols)
      img.style.transform =
        `translate(${(-100 / cols) * col}%, ${(-100 / rows) * row}%)`
    }

    const paint = () => {
      const raw = ((curX + 1) / 2) * (frames - 1)
      const i0 = clamp(Math.floor(raw), 0, frames - 1)
      const i1 = clamp(i0 + 1, 0, frames - 1)
      const mix = raw - i0

      place(layerARef.current, i0)
      place(layerBRef.current, i1)
      if (layerBRef.current) layerBRef.current.style.opacity = String(mix)

      if (tiltRef.current) {
        tiltRef.current.style.transform =
          `perspective(900px) rotateX(${-curY * tilt}deg) translateY(${curY * 1.1}%)`
      }
    }

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016
      last = now

      const { x, y } = targetRef.current
      curX = damp(curX, x, 5.5, dt)
      curY = damp(curY, y, 5.0, dt)
      paint()

      if (Math.abs(curX - x) > 0.0012 || Math.abs(curY - y) > 0.0012) {
        raf = requestAnimationFrame(loop)
      } else {
        raf = 0
        last = 0
      }
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }

    let moveRaf = 0
    const onMove = (event: PointerEvent) => {
      if (moveRaf) return
      moveRaf = requestAnimationFrame(() => {
        moveRaf = 0
        targetRef.current.x =
          clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1) * follow
        targetRef.current.y =
          clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1) * follow
        kick()
      })
    }

    const onRest = () => {
      targetRef.current.x = 0
      targetRef.current.y = 0
      kick()
    }

    const onVisibility = () => {
      if (document.hidden) onRest()
    }

    paint()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', onRest)
    window.addEventListener('resize', measure, { passive: true })
    window.addEventListener('scroll', measure, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', onRest)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
      document.removeEventListener('visibilitychange', onVisibility)
      if (raf) cancelAnimationFrame(raf)
      if (moveRaf) cancelAnimationFrame(moveRaf)
    }
  }, [enhance, ready, frames, cols, rows, follow, tilt])

  const sheetStyle = {
    width: `${cols * 100}%`,
    height: `${rows * 100}%`,
    maxWidth: 'none',
    willChange: 'transform',
  } as const

  return (
    <div
      ref={rootRef}
      className={cn('relative aspect-square h-full w-full select-none', className)}
      role="img"
      aria-label={label}
    >
      <style>{
        '@keyframes mascot-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.4%)}}'
      }</style>

      <div
        ref={tiltRef}
        className="h-full w-full"
        style={{ transformOrigin: '50% 70%', willChange: 'transform' }}
      >
        <div
          className="relative h-full w-full overflow-hidden"
          style={
            idle
              ? { animation: 'mascot-bob 5.2s ease-in-out infinite', willChange: 'transform' }
              : undefined
          }
        >
          {/* Poster */}
          <picture>
            <source srcSet={`${basePath}/poster.avif`} type="image/avif" />
            <source srcSet={`${basePath}/poster.webp`} type="image/webp" />
            <img
              src={`${basePath}/poster.png`}
              alt=""
              aria-hidden
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
              style={{ opacity: ready ? 0 : 1 }}
            />
          </picture>

          {/* Grade de sprites, duas camadas em crossfade */}
          {enhance && (
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: ready ? 1 : 0 }}
            >
              <picture>
                <source srcSet={`${basePath}/sheet.avif`} type="image/avif" />
                <img
                  ref={layerARef}
                  src={`${basePath}/sheet.webp`}
                  alt=""
                  aria-hidden
                  decoding="async"
                  onLoad={() => setReady(true)}
                  className="absolute left-0 top-0"
                  style={sheetStyle}
                />
              </picture>

              <picture>
                <source srcSet={`${basePath}/sheet.avif`} type="image/avif" />
                <img
                  ref={layerBRef}
                  src={`${basePath}/sheet.webp`}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className="absolute left-0 top-0"
                  style={{ ...sheetStyle, opacity: 0 }}
                />
              </picture>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
