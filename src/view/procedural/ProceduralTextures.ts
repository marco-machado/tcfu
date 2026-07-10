import { CanvasTexture, NearestFilter, RepeatWrapping, SRGBColorSpace } from 'three'

let panelLines: CanvasTexture | null = null
let microNoise: CanvasTexture | null = null

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
