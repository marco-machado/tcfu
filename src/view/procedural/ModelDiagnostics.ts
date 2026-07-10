import type { Object3D } from 'three'
import { Mesh } from 'three'

export type ModelDiagnostics = {
  meshes: number
  materials: number
  geometries: number
  triangles: number
}

export function collectModelDiagnostics(root: Object3D): ModelDiagnostics {
  let meshes = 0
  let triangles = 0
  const materials = new Set<unknown>()
  const geometries = new Set<unknown>()

  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    meshes += 1
    const geo = obj.geometry
    if (geo) {
      geometries.add(geo.uuid)
      const index = geo.index
      if (index) triangles += index.count / 3
      else {
        const pos = geo.getAttribute('position')
        if (pos) triangles += pos.count / 3
      }
    }
    const mat = obj.material
    if (Array.isArray(mat)) mat.forEach((m) => materials.add(m.uuid))
    else if (mat) materials.add(mat.uuid)
  })

  return {
    meshes,
    materials: materials.size,
    geometries: geometries.size,
    triangles: Math.round(triangles),
  }
}
