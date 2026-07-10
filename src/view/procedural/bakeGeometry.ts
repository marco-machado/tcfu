import { BoxGeometry, type BufferGeometry, CylinderGeometry, SphereGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type BoxPart = {
  kind: 'box'
  sx: number
  sy: number
  sz: number
  x?: number
  y?: number
  z?: number
  rotZ?: number
}

export type SpherePart = {
  kind: 'sphere'
  r: number
  x?: number
  y?: number
  z?: number
  wSeg?: number
  hSeg?: number
}

export type CylinderPart = {
  kind: 'cylinder'
  rTop: number
  rBottom: number
  height: number
  x?: number
  y?: number
  z?: number
  rotX?: number
  rotZ?: number
  radialSeg?: number
}

export type GeoPart = BoxPart | SpherePart | CylinderPart

function buildPart(part: GeoPart): BufferGeometry {
  let geo: BufferGeometry
  if (part.kind === 'box') {
    geo = new BoxGeometry(part.sx, part.sy, part.sz)
  } else if (part.kind === 'sphere') {
    geo = new SphereGeometry(part.r, part.wSeg ?? 8, part.hSeg ?? 6)
  } else {
    geo = new CylinderGeometry(
      part.rTop,
      part.rBottom,
      part.height,
      part.radialSeg ?? 8,
    )
    if (part.rotX) geo.rotateX(part.rotX)
  }
  if ('rotZ' in part && part.rotZ) geo.rotateZ(part.rotZ)
  geo.translate(part.x ?? 0, part.y ?? 0, part.z ?? 0)
  return geo
}

/** Merge local parts into one BufferGeometry (caller owns disposal). */
export function bakeParts(parts: GeoPart[]): BufferGeometry {
  if (parts.length === 0) {
    return new BoxGeometry(0.01, 0.01, 0.01)
  }
  const geos = parts.map(buildPart)
  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  if (!merged) {
    return buildPart(parts[0]!)
  }
  merged.computeBoundingSphere()
  return merged
}
