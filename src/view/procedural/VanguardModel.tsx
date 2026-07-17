import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import { BufferAttribute, type BufferGeometry, type Group, type Mesh, type MeshStandardMaterial } from 'three'
import type { ShipId } from '../../sim/types'
import type { DetailLevel } from './registry'
import { hasKitPart, kitRecipe } from './registry'
import { cloneRoleMaterial, getRoleMaterial } from './MaterialLibrary'
import { materialToken } from './materialTokens'
import {
  classifyModelRole,
  glbShipAsset,
  modelAsset,
  validateModelObject,
} from './modelAssets'
import { ThrusterPlume } from './ThrusterPlume'

type Props = {
  shipId: ShipId
  detail: DetailLevel
  /** When true, materials are clones so hit-flash can mutate safely. */
  mutableMaterials?: boolean
  liveThrust?: boolean
  showThrusterPlumes?: boolean
  hideBakedThrusterCones?: boolean
}

const BAKED_THRUSTER_COMPONENT_MIN_X = 0.47

/** Remove disconnected exhaust components at the legacy Vanguard mesh's aft extreme. */
function withoutBakedThrusterCones(source: BufferGeometry): BufferGeometry {
  const geometry = source.clone()
  const index = geometry.getIndex()
  const position = geometry.getAttribute('position')
  if (!index || !position) return geometry

  const parent = new Int32Array(position.count)
  for (let vertex = 0; vertex < parent.length; vertex += 1) parent[vertex] = vertex
  const find = (vertex: number): number => {
    let root = vertex
    while (parent[root] !== root) root = parent[root]!
    while (parent[vertex] !== vertex) {
      const next = parent[vertex]!
      parent[vertex] = root
      vertex = next
    }
    return root
  }
  const union = (a: number, b: number) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootB] = rootA
  }

  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset)
    const b = index.getX(offset + 1)
    const c = index.getX(offset + 2)
    union(a, b)
    union(b, c)
  }

  const componentMinX = new Float32Array(position.count)
  componentMinX.fill(Number.POSITIVE_INFINITY)
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const root = find(vertex)
    componentMinX[root] = Math.min(componentMinX[root]!, position.getX(vertex))
  }

  const kept: number[] = []
  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset)
    if (componentMinX[find(a)]! > BAKED_THRUSTER_COMPONENT_MIN_X) continue
    kept.push(a, index.getX(offset + 1), index.getX(offset + 2))
  }
  geometry.setIndex(new BufferAttribute(new Uint32Array(kept), 1))
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

/** Catalog-driven GLB hull; gameplay-facing signals and plumes remain procedural. */
export function GlbShipModel({
  shipId,
  detail,
  mutableMaterials = false,
  liveThrust = false,
  showThrusterPlumes = true,
  hideBakedThrusterCones = false,
}: Props) {
  const model = glbShipAsset(shipId)
  const { scene } = useGLTF(model.url)

  const hull = useMemo(() => {
    const clone = scene.clone(true) as Group
    clone.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      if (hideBakedThrusterCones) mesh.geometry = withoutBakedThrusterCones(mesh.geometry)
      const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const materials = mutableMaterials ? source.map((mat) => mat.clone()) : source
      mesh.material = Array.isArray(mesh.material) ? materials : materials[0]!

      for (const material of materials) {
        const mat = material as MeshStandardMaterial
        if (!mat.isMeshStandardMaterial) continue
        const role = classifyModelRole(`${mesh.name} ${mat.name}`)
        if (role === 'emissive') {
          const signal = materialToken(kitRecipe(shipId).accentToken)
          mat.emissive.set(signal.emissive)
          mat.emissiveIntensity = signal.emissiveIntensity
          mat.toneMapped = false
        }
        mat.envMapIntensity = role === 'glass' ? 2.6 : role === 'panel' ? 1.5 : 2.2
      }
    })
    const validationWarnings = validateModelObject('ship', shipId, clone, model)
    clone.userData.modelValidationWarnings = validationWarnings
    if (import.meta.env.DEV && validationWarnings.length > 0) {
      console.warn(`[model:${shipId}] ${validationWarnings.join(', ')}`)
    }
    return clone
  }, [scene, mutableMaterials, shipId, model, hideBakedThrusterCones])

  useLayoutEffect(() => {
    return () => {
      hull.traverse((obj) => {
        const mesh = obj as Mesh
        if (!mesh.isMesh) return
        if (hideBakedThrusterCones) mesh.geometry.dispose()
        if (mutableMaterials) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          for (const material of materials) material.dispose()
        }
      })
    }
  }, [hideBakedThrusterCones, hull, mutableMaterials])

  const plumeMat = useMemo(() => {
    const t = materialToken(kitRecipe(shipId).thrusterToken)
    return {
      color: t.color,
      emissive: t.emissive,
      emissiveIntensity: t.emissiveIntensity,
      metalness: t.metalness,
      roughness: t.roughness,
      toneMapped: t.toneMapped,
    }
  }, [shipId])

  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart(shipId, detail, p)
  const signalMat = useMemo(
    () => (mutableMaterials ? cloneRoleMaterial('emissiveSignal') : getRoleMaterial('emissiveSignal')),
    [mutableMaterials],
  )

  useLayoutEffect(() => {
    if (!mutableMaterials) return
    return () => signalMat.dispose()
  }, [mutableMaterials, signalMat])

  return (
    <group name={`${shipId}Root`}>
      <group rotation={model.rotation} scale={model.scale} position={model.position}>
        <primitive object={hull} />
      </group>
      {show('signal') && (
        <group name="signalLights">
          {model.signals.filter((marker) => !marker.highOnly).map((marker, index) => (
            <mesh key={index} name={`signal${index}`} position={marker.position}>
              <boxGeometry args={marker.size} />
              <primitive object={signalMat} attach="material" />
            </mesh>
          ))}
        </group>
      )}
      {show('edgeGlow') && (
        <group name="highOnlySignals">
          {model.signals.filter((marker) => marker.highOnly).map((marker, index) => (
            <mesh key={index} name={`highSignal${index}`} position={marker.position}>
              <boxGeometry args={marker.size} />
              <primitive object={signalMat} attach="material" />
            </mesh>
          ))}
        </group>
      )}
      {showThrusterPlumes && show('thruster') && show('thrusterPlume') && (
        <group name="engines">
          {model.thrusters.map((thruster, index) => (
            <group key={index} name={`engine${index}`} position={thruster.position}>
              <ThrusterPlume
                scale={thruster.scale}
                dense={detail === 'high'}
                thruster={plumeMat}
                live={liveThrust}
              />
            </group>
          ))}
        </group>
      )}
    </group>
  )
}

const VANGUARD_MODEL = modelAsset('ship', 'vanguard')
if (VANGUARD_MODEL.source === 'glb') useGLTF.preload(VANGUARD_MODEL.url)
