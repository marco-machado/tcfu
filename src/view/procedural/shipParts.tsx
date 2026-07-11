import { useLayoutEffect, useMemo } from 'react'
import {
  ExtrudeGeometry,
  LatheGeometry,
  type Material,
  Shape,
  Vector2,
} from 'three'
import { cloneRoleMaterial, getRoleMaterial, type MaterialRole } from './MaterialLibrary'
import { materialToken } from './materialTokens'
import { ThrusterPlume } from './ThrusterPlume'

export function roleMat(role: MaterialRole, mutable: boolean): Material {
  return mutable ? cloneRoleMaterial(role) : getRoleMaterial(role)
}

export type RoleMats = {
  body: Material
  panel: Material
  trim: Material
  glass: Material
  glow: Material
  nozzle: Material
  decal: Material
}

export function useRoleMats(mutable: boolean): RoleMats {
  return useMemo(
    () => ({
      body: roleMat('bodyPrimary', mutable),
      panel: roleMat('bodySecondary', mutable),
      trim: roleMat('trim', mutable),
      glass: roleMat('glass', mutable),
      glow: roleMat('emissiveSignal', mutable),
      nozzle: roleMat('nozzle', mutable),
      decal: roleMat('decalDark', mutable),
    }),
    [mutable],
  )
}

export type WingProfile = 'delta' | 'swept' | 'broad'

export function makeWingGeometry(mirror: boolean, profile: WingProfile = 'delta'): ExtrudeGeometry {
  const shape = new Shape()
  if (profile === 'swept') {
    shape.moveTo(0, 0.1)
    shape.lineTo(0.7, -0.06)
    shape.lineTo(1.0, -0.3)
    shape.lineTo(0.92, -0.4)
    shape.lineTo(0.45, -0.26)
    shape.lineTo(0.0, -0.16)
  } else if (profile === 'broad') {
    shape.moveTo(0, 0.2)
    shape.lineTo(0.65, 0.16)
    shape.lineTo(1.0, -0.04)
    shape.lineTo(0.96, -0.22)
    shape.lineTo(0.5, -0.3)
    shape.lineTo(0.0, -0.26)
  } else {
    shape.moveTo(0, 0.12)
    shape.lineTo(0.55, 0.18)
    shape.lineTo(1.0, 0.05)
    shape.lineTo(0.95, -0.08)
    shape.lineTo(0.5, -0.16)
    shape.lineTo(0.0, -0.14)
  }
  shape.closePath()
  const geo = new ExtrudeGeometry(shape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 1,
  })
  geo.rotateX(-Math.PI / 2)
  if (mirror) geo.scale(-1, 1, 1)
  geo.computeVertexNormals()
  return geo
}

export function makeNoseLathe(slim = false): LatheGeometry {
  const pts = slim
    ? [
        new Vector2(0.0, 0.0),
        new Vector2(0.06, 0.03),
        new Vector2(0.075, 0.16),
        new Vector2(0.05, 0.32),
        new Vector2(0.02, 0.42),
        new Vector2(0.0, 0.46),
      ]
    : [
        new Vector2(0.0, 0.0),
        new Vector2(0.09, 0.02),
        new Vector2(0.11, 0.12),
        new Vector2(0.08, 0.22),
        new Vector2(0.04, 0.28),
        new Vector2(0.0, 0.3),
      ]
  const geo = new LatheGeometry(pts, 16)
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

export function makeCanopyLathe(): LatheGeometry {
  const pts = [
    new Vector2(0.0, 0.0),
    new Vector2(0.1, 0.02),
    new Vector2(0.12, 0.1),
    new Vector2(0.1, 0.18),
    new Vector2(0.05, 0.22),
    new Vector2(0.0, 0.24),
  ]
  const geo = new LatheGeometry(pts, 20)
  geo.rotateX(0.55)
  geo.computeVertexNormals()
  return geo
}

export function makeNozzleBell(): LatheGeometry {
  const pts = [
    new Vector2(0.06, 0.0),
    new Vector2(0.07, 0.04),
    new Vector2(0.09, 0.1),
    new Vector2(0.11, 0.14),
  ]
  const geo = new LatheGeometry(pts, 14)
  geo.rotateX(Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

export function useLatheSet() {
  const nose = useMemo(() => makeNoseLathe(), [])
  const slimNose = useMemo(() => makeNoseLathe(true), [])
  const canopy = useMemo(() => makeCanopyLathe(), [])
  const bell = useMemo(() => makeNozzleBell(), [])
  useLayoutEffect(
    () => () => {
      nose.dispose()
      slimNose.dispose()
      canopy.dispose()
      bell.dispose()
    },
    [nose, slimNose, canopy, bell],
  )
  return { nose, slimNose, canopy, bell }
}

export function usePlumeMat(shipToken: 'thrusterPlayer' | 'thrusterHot' = 'thrusterPlayer') {
  return useMemo(() => {
    const t = materialToken(shipToken)
    return {
      color: t.color,
      emissive: t.emissive,
      emissiveIntensity: t.emissiveIntensity,
      metalness: t.metalness,
      roughness: t.roughness,
      toneMapped: t.toneMapped,
    }
  }, [shipToken])
}

/** Multi-part engine: flange, bell, throat, plasma core, exhaust nub, plume. */
export function EngineAssembly({
  x,
  y,
  z = 0,
  scale = 1,
  mats,
  bell,
  plume,
  dense,
  liveThrust,
  plumeMat,
}: {
  x: number
  y: number
  z?: number
  scale?: number
  mats: RoleMats
  bell: LatheGeometry
  plume: boolean
  dense: boolean
  liveThrust: boolean
  plumeMat: ReturnType<typeof usePlumeMat>
}) {
  const s = scale
  return (
    <group position={[x, y, z]}>
      <mesh name="nozzleFlange" position={[0, 0.06 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11 * s, 0.11 * s, 0.04 * s, 14]} />
        <primitive object={mats.nozzle} attach="material" />
      </mesh>
      <mesh name="nozzleBell" geometry={bell} position={[0, -0.02 * s, 0]} scale={[1.15 * s, 1.15 * s, 1.2 * s]}>
        <primitive object={mats.nozzle} attach="material" />
      </mesh>
      <mesh name="nozzleThroat" position={[0, -0.06 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05 * s, 0.06 * s, 0.1 * s, 12]} />
        <primitive object={mats.nozzle} attach="material" />
      </mesh>
      <mesh name="plasmaCore" position={[0, -0.11 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.036 * s, 0.03 * s, 0.1 * s, 10]} />
        <primitive object={mats.glow} attach="material" />
      </mesh>
      <mesh name="exhaustNub" position={[0, -0.17 * s, 0]}>
        <sphereGeometry args={[0.055 * s, 12, 10]} />
        <primitive object={mats.glow} attach="material" />
      </mesh>
      {plume && (
        <ThrusterPlume scale={1.1 * s} dense={dense} thruster={plumeMat} live={liveThrust} />
      )}
    </group>
  )
}
