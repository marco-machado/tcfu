import {
  BoxGeometry,
  type BufferGeometry,
  CylinderGeometry,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type BoxPart = {
  kind: 'box'
  sx: number
  sy: number
  sz: number
  x?: number
  y?: number
  z?: number
  rotX?: number
  rotY?: number
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
  rotY?: number
  rotZ?: number
  radialSeg?: number
}

export type OctahedronPart = {
  kind: 'octahedron'
  r: number
  x?: number
  y?: number
  z?: number
  sx?: number
  sy?: number
  sz?: number
  rotX?: number
  rotY?: number
  rotZ?: number
  detail?: number
}

export type TorusPart = {
  kind: 'torus'
  r: number
  tube: number
  x?: number
  y?: number
  z?: number
  rotX?: number
  rotY?: number
  rotZ?: number
  radialSeg?: number
  tubularSeg?: number
}

export type GeoPart = BoxPart | SpherePart | CylinderPart | OctahedronPart | TorusPart

function buildPart(part: GeoPart): BufferGeometry {
  let geo: BufferGeometry
  if (part.kind === 'box') {
    geo = new BoxGeometry(part.sx, part.sy, part.sz)
  } else if (part.kind === 'sphere') {
    geo = new SphereGeometry(part.r, part.wSeg ?? 8, part.hSeg ?? 6)
  } else if (part.kind === 'octahedron') {
    geo = new OctahedronGeometry(part.r, part.detail ?? 0)
    geo.scale(part.sx ?? 1, part.sy ?? 1, part.sz ?? 1)
  } else if (part.kind === 'torus') {
    geo = new TorusGeometry(part.r, part.tube, part.radialSeg ?? 8, part.tubularSeg ?? 24)
  } else {
    geo = new CylinderGeometry(
      part.rTop,
      part.rBottom,
      part.height,
      part.radialSeg ?? 8,
    )
  }
  if ('rotX' in part && part.rotX) geo.rotateX(part.rotX)
  if ('rotY' in part && part.rotY) geo.rotateY(part.rotY)
  if ('rotZ' in part && part.rotZ) geo.rotateZ(part.rotZ)
  geo.translate(part.x ?? 0, part.y ?? 0, part.z ?? 0)
  return geo
}

/** Merge local parts into one BufferGeometry (caller owns disposal). */
export function bakeParts(parts: GeoPart[]): BufferGeometry {
  if (parts.length === 0) {
    return new BoxGeometry(0.01, 0.01, 0.01)
  }
  // Polyhedron-based parts are non-indexed; normalize so merge never mixes.
  const geos = parts.map((part) => {
    const built = buildPart(part)
    if (!built.index) return built
    const nonIndexed = built.toNonIndexed()
    built.dispose()
    return nonIndexed
  })
  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  if (!merged) {
    return buildPart(parts[0]!)
  }
  merged.computeBoundingSphere()
  return merged
}
