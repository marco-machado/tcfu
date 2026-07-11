import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'

let panelLines: CanvasTexture | null = null
let microNoise: CanvasTexture | null = null
let nebula: CanvasTexture | null = null
let streamFlow: CanvasTexture | null = null
let softGlow: CanvasTexture | null = null

/** Deterministic pseudo-random in [0, 1) from integer seed. */
function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Shared sci-fi panel line sheet (dark lines on transparent-ish mid gray). */
export function getPanelLineTexture(): CanvasTexture {
  if (panelLines) return panelLines
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#6a7a8c'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(12, 18, 28, 0.85)'
  ctx.lineWidth = 2
  // Panel grid
  for (let i = 0; i < 8; i++) {
    const p = (i + 0.5) * (size / 8)
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, p)
    ctx.lineTo(size, p)
    ctx.stroke()
  }
  // Hatch detail
  ctx.strokeStyle = 'rgba(20, 30, 45, 0.45)'
  ctx.lineWidth = 1
  for (let i = 0; i < 16; i++) {
    const y = i * (size / 16) + 4
    ctx.beginPath()
    ctx.moveTo(8, y)
    ctx.lineTo(size - 8, y)
    ctx.stroke()
  }
  // Access hatch squares
  ctx.strokeStyle = 'rgba(8, 12, 20, 0.9)'
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, 48, 36)
  ctx.strokeRect(160, 120, 56, 40)
  ctx.strokeRect(70, 170, 32, 32)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set(2, 2)
  tex.anisotropy = 4
  tex.needsUpdate = true
  panelLines = tex
  return tex
}

/**
 * Deep-space nebula backdrop: layered soft radial clouds over a vertical
 * gradient, with faint color variation. Rendered once, drifted slowly.
 */
export function getNebulaTexture(): CanvasTexture {
  if (nebula) return nebula
  const w = 512
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const base = ctx.createLinearGradient(0, 0, 0, h)
  base.addColorStop(0, '#101f38')
  base.addColorStop(0.45, '#080f20')
  base.addColorStop(1, '#03060e')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  const palettes = [
    ['rgba(48, 112, 168, 0.3)', 'rgba(48, 112, 168, 0)'],
    ['rgba(34, 80, 140, 0.34)', 'rgba(34, 80, 140, 0)'],
    ['rgba(110, 62, 150, 0.18)', 'rgba(110, 62, 150, 0)'],
    ['rgba(210, 120, 70, 0.1)', 'rgba(210, 120, 70, 0)'],
    ['rgba(52, 150, 172, 0.18)', 'rgba(52, 150, 172, 0)'],
  ] as const
  for (let i = 0; i < 26; i++) {
    const cx = hash01(i * 3 + 1) * w
    const cy = hash01(i * 3 + 2) * h
    const r = 40 + hash01(i * 3 + 3) * 190
    const [inner, outer] = palettes[i % palettes.length]!
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, inner)
    g.addColorStop(1, outer)
    ctx.fillStyle = g
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }

  // Dense faint starfield baked into the plate (big stars are instanced meshes).
  for (let i = 0; i < 420; i++) {
    const x = hash01(i * 5 + 11) * w
    const y = hash01(i * 5 + 12) * h
    const s = hash01(i * 5 + 13)
    const a = 0.12 + s * 0.5
    ctx.fillStyle = `rgba(${200 + Math.floor(s * 55)}, ${215 + Math.floor(s * 40)}, 255, ${a})`
    const px = s > 0.92 ? 2 : 1
    ctx.fillRect(x, y, px, px)
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.needsUpdate = true
  nebula = tex
  return tex
}

/**
 * Energy stream ribbon: directional flow filaments on a dark plate.
 * Scrolled along V by stream speed to sell forward motion.
 */
export function getStreamFlowTexture(): CanvasTexture {
  if (streamFlow) return streamFlow
  const w = 256
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#040a12'
  ctx.fillRect(0, 0, w, h)

  // Wide soft channels
  for (let i = 0; i < 9; i++) {
    const x = (i + 0.5) * (w / 9) + (hash01(i + 50) - 0.5) * 14
    const g = ctx.createLinearGradient(x - 13, 0, x + 13, 0)
    g.addColorStop(0, 'rgba(20, 60, 90, 0)')
    g.addColorStop(0.5, `rgba(34, 98, 140, ${0.2 + hash01(i + 60) * 0.14})`)
    g.addColorStop(1, 'rgba(20, 60, 90, 0)')
    ctx.fillStyle = g
    ctx.fillRect(x - 13, 0, 26, h)
  }

  // Bright flow filaments with varied dash lengths (wrap-safe verticals)
  for (let i = 0; i < 46; i++) {
    const x = hash01(i * 7 + 3) * w
    const y0 = hash01(i * 7 + 4) * h
    const len = 26 + hash01(i * 7 + 5) * 110
    const alpha = 0.16 + hash01(i * 7 + 6) * 0.36
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + len)
    grad.addColorStop(0, 'rgba(90, 200, 240, 0)')
    grad.addColorStop(0.35, `rgba(96, 205, 245, ${alpha})`)
    grad.addColorStop(1, 'rgba(60, 150, 200, 0)')
    ctx.fillStyle = grad
    const lw = hash01(i * 7 + 8) > 0.75 ? 2 : 1
    ctx.fillRect(x, y0, lw, len)
    if (y0 + len > h) ctx.fillRect(x, y0 - h, lw, len)
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.needsUpdate = true
  streamFlow = tex
  return tex
}

/** Radial soft sprite for glows, contact discs, and nebula wisps. */
export function getSoftGlowTexture(): CanvasTexture {
  if (softGlow) return softGlow
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 255, 255, 1)')
  g.addColorStop(0.35, 'rgba(255, 255, 255, 0.5)')
  g.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new CanvasTexture(canvas)
  tex.wrapS = ClampToEdgeWrapping
  tex.wrapT = ClampToEdgeWrapping
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.needsUpdate = true
  softGlow = tex
  return tex
}

/** Subtle roughness noise. */
export function getMicroNoiseTexture(): CanvasTexture {
  if (microNoise) return microNoise
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 180 + Math.floor(Math.random() * 50)
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = new CanvasTexture(canvas)
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.magFilter = NearestFilter
  tex.repeat.set(4, 4)
  tex.needsUpdate = true
  microNoise = tex
  return tex
}
