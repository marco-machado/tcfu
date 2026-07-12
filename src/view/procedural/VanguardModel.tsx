import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { DetailLevel } from './registry'
import { hasKitPart, kitRecipe } from './registry'
import { cloneRoleMaterial, getRoleMaterial } from './MaterialLibrary'
import { materialToken } from './materialTokens'
import { ThrusterPlume } from './ThrusterPlume'

const MODEL_URL = `${import.meta.env.BASE_URL}assets/models/vanguard.glb`

type Props = {
  detail: DetailLevel
  /** When true, materials are clones so hit-flash can mutate safely. */
  mutableMaterials?: boolean
  liveThrust?: boolean
}

/** Authored Vanguard GLB hull; plumes stay procedural so live thrust keeps working. */
export function VanguardModel({ detail, mutableMaterials = false, liveThrust = false }: Props) {
  const { scene } = useGLTF(MODEL_URL)

  const hull = useMemo(() => {
    const clone = scene.clone(true) as Group
    clone.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      if (mutableMaterials) {
        mesh.material = (mesh.material as MeshStandardMaterial).clone()
      }
      const mat = mesh.material as MeshStandardMaterial
      if (mat?.isMeshStandardMaterial) {
        // Textured PBR hull reads too dark under the dim run lighting rig.
        mat.envMapIntensity = 2.2
      }
    })
    return clone
  }, [scene, mutableMaterials])

  const plumeMat = useMemo(() => {
    const t = materialToken(kitRecipe('vanguard').thrusterToken)
    return {
      color: t.color,
      emissive: t.emissive,
      emissiveIntensity: t.emissiveIntensity,
      metalness: t.metalness,
      roughness: t.roughness,
      toneMapped: t.toneMapped,
    }
  }, [])

  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('vanguard', detail, p)
  const signalMat = useMemo(
    () => (mutableMaterials ? cloneRoleMaterial('emissiveSignal') : getRoleMaterial('emissiveSignal')),
    [mutableMaterials],
  )
  const trimMat = useMemo(
    () => (mutableMaterials ? cloneRoleMaterial('trim') : getRoleMaterial('trim')),
    [mutableMaterials],
  )

  return (
    <group name="vanguardRoot">
      {/* GLB is Y-up with its length along X; game ships fly nose toward +Y. */}
      <group rotation={[Math.PI / 2, Math.PI / 2, 0]} scale={1.95} position={[0, 0.15, 0]}>
        <primitive object={hull} />
      </group>
      {show('edgeGlow') && (
        <group name="signalLights">
          <mesh name="wingGlowL" position={[-0.6, -0.28, 0.08]}>
            <boxGeometry args={[0.14, 0.02, 0.02]} />
            <primitive object={signalMat} attach="material" />
          </mesh>
          <mesh name="wingGlowR" position={[0.6, -0.28, 0.08]}>
            <boxGeometry args={[0.14, 0.02, 0.02]} />
            <primitive object={signalMat} attach="material" />
          </mesh>
          <mesh name="spineGlow" position={[0, 0.28, 0.12]}>
            <boxGeometry args={[0.025, 0.5, 0.015]} />
            <primitive object={trimMat} attach="material" />
          </mesh>
        </group>
      )}
      {show('thruster') && show('thrusterPlume') && (
        <group name="engines" position={[0, -0.42, 0]}>
          {([-0.15, 0.15] as const).map((x) => (
            <group key={x} name={x < 0 ? 'leftEngine' : 'rightEngine'} position={[x, 0, 0]}>
              <ThrusterPlume
                scale={1.1}
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

useGLTF.preload(MODEL_URL)
