import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  MirroredRepeatWrapping,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three'

let panelLines: CanvasTexture | null = null
let microNoise: CanvasTexture | null = null
let nebula: Texture | null = null
let streamFlow: Texture | null = null
let softGlow: CanvasTexture | null = null
let hullTrim: Texture | null = null
let asteroidRock: Texture | null = null
let wispQuads: Texture[] | null = null

const loader = new TextureLoader()

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`
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
 * Deep-space nebula backdrop plate, drifted slowly behind the scene.
 */
export function getNebulaTexture(): Texture {
  if (nebula) return nebula
  const tex = loader.load(assetUrl('textures/nebula-backdrop.png'))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  // Mirrored along V: the plate does not tile top-to-bottom, so a plain repeat
  // shows a hard horizontal seam sweeping with the scroll.
  tex.wrapT = MirroredRepeatWrapping
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  nebula = tex
  return tex
}

/**
 * Energy stream ribbon: directional flow filaments on a dark plate.
 * Scrolled along V by stream speed to sell forward motion.
 */
export function getStreamFlowTexture(): Texture {
  if (streamFlow) return streamFlow
  const tex = loader.load(assetUrl('textures/stream-flow.png'))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  streamFlow = tex
  return tex
}

/** Sci-fi hull trim sheet for ship body materials. */
export function getHullTrimTexture(): Texture {
  if (hullTrim) return hullTrim
  const tex = loader.load(assetUrl('textures/hull-trim-sheet.png'))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.anisotropy = 4
  hullTrim = tex
  return tex
}

/** Dark basalt albedo for the asteroid field. */
export function getAsteroidRockTexture(): Texture {
  if (asteroidRock) return asteroidRock
  const tex = loader.load(assetUrl('textures/asteroid-rock.png'))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.anisotropy = 4
  asteroidRock = tex
  return tex
}

/**
 * Four nebula wisp sprites sliced from a 2x2 sheet (teal, indigo, violet,
 * ember). Each quadrant is a clone sharing the loaded source, so the onLoad
 * callback must flag every clone for upload.
 */
export function getNebulaWispTextures(): Texture[] {
  if (wispQuads) return wispQuads
  const base = loader.load(assetUrl('textures/nebula-wisps.png'), () => {
    for (const q of quads) q.needsUpdate = true
  })
  base.colorSpace = SRGBColorSpace
  // UV origin is bottom-left: top row (teal, indigo) sits at oy = 0.5.
  const corners: Array<[number, number]> = [
    [0, 0.5],
    [0.5, 0.5],
    [0, 0],
    [0.5, 0],
  ]
  const quads = corners.map(([ox, oy]) => {
    const q = base.clone()
    q.colorSpace = SRGBColorSpace
    q.repeat.set(0.5, 0.5)
    q.offset.set(ox, oy)
    return q
  })
  wispQuads = quads
  return wispQuads
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
