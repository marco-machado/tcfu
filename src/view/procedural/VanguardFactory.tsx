import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  ExtrudeGeometry,
  type Group,
  LatheGeometry,
  type Material,
  Shape,
  Vector2,
} from 'three'
import type { DetailLevel } from './registry'
import { hasKitPart, kitRecipe } from './registry'
import { cloneRoleMaterial, getRoleMaterial } from './MaterialLibrary'
import { collectModelDiagnostics } from './ModelDiagnostics'
import { materialToken } from './materialTokens'
import { ThrusterPlume } from './ThrusterPlume'

type Props = {
  detail: DetailLevel
  /** When true, materials are clones so hit-flash can mutate safely. */
  mutableMaterials?: boolean
  liveThrust?: boolean
  onDiagnostics?: (d: ReturnType<typeof collectModelDiagnostics>) => void
}

function mat(role: Parameters<typeof getRoleMaterial>[0], mutable: boolean): Material {
  return mutable ? cloneRoleMaterial(role) : getRoleMaterial(role)
}

function makeWingGeometry(mirror: boolean): ExtrudeGeometry {
  const shape = new Shape()
  // Root at x=0, tip at x=1 (local); will scale/place
  shape.moveTo(0, 0.12)
  shape.lineTo(0.55, 0.18)
  shape.lineTo(1.0, 0.05)
  shape.lineTo(0.95, -0.08)
  shape.lineTo(0.5, -0.16)
  shape.lineTo(0.0, -0.14)
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
  geo.translate(mirror ? 0 : 0, 0, 0)
  geo.computeVertexNormals()
  return geo
}

function makeNoseLathe(): LatheGeometry {
  const pts = [
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

function makeCanopyLathe(): LatheGeometry {
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

function makeNozzleBell(): LatheGeometry {
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

/**
 * Authored Vanguard factory — hero vehicle recipe:
 * tapered lathe nose, extruded wings with bevel, lathe canopy, multi-part nozzles,
 * panel materials from shared kit, named meshes, separate from hitbox authority.
 */
export function VanguardFactory({
  detail,
  mutableMaterials = false,
  liveThrust = false,
  onDiagnostics,
}: Props) {
  const root = useRef<Group>(null)
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('vanguard', detail, p)
  const m = useMemo(
    () => ({
      body: mat('bodyPrimary', mutableMaterials),
      panel: mat('bodySecondary', mutableMaterials),
      trim: mat('trim', mutableMaterials),
      glass: mat('glass', mutableMaterials),
      glow: mat('emissiveSignal', mutableMaterials),
      nozzle: mat('nozzle', mutableMaterials),
      decal: mat('decalDark', mutableMaterials),
    }),
    [mutableMaterials],
  )
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

  const wingL = useMemo(() => makeWingGeometry(true), [])
  const wingR = useMemo(() => makeWingGeometry(false), [])
  const nose = useMemo(() => makeNoseLathe(), [])
  const canopy = useMemo(() => makeCanopyLathe(), [])
  const bell = useMemo(() => makeNozzleBell(), [])

  useLayoutEffect(() => {
    if (!root.current || !onDiagnostics) return
    onDiagnostics(collectModelDiagnostics(root.current))
  }, [detail, onDiagnostics])

  useLayoutEffect(() => {
    return () => {
      wingL.dispose()
      wingR.dispose()
      nose.dispose()
      canopy.dispose()
      bell.dispose()
    }
  }, [wingL, wingR, nose, canopy, bell])

  return (
    <group ref={root} name="vanguardRoot">
      {/* Core hull mass — stepped but beveled via secondary plates */}
      <mesh name="hullCore" position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.46, 0.78, 0.3]} />
        <primitive object={m.body} attach="material" />
      </mesh>
      <mesh name="hullMid" position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.38, 0.32, 0.26]} />
        <primitive object={m.body} attach="material" />
      </mesh>
      <mesh name="hullForward" position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.28, 0.28, 0.2]} />
        <primitive object={m.body} attach="material" />
      </mesh>

      {/* Lathe nose */}
      <mesh name="noseCone" position={[0, 0.92, 0]} geometry={nose} castShadow>
        <primitive object={m.body} attach="material" />
      </mesh>
      <mesh name="noseTip" position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <primitive object={m.panel} attach="material" />
      </mesh>

      {/* Recessed panels / belly */}
      <mesh name="bellyPlate" position={[0, 0.0, -0.14]}>
        <boxGeometry args={[0.38, 0.55, 0.06]} />
        <primitive object={m.panel} attach="material" />
      </mesh>
      <mesh name="spineRail" position={[0, 0.15, 0.155]}>
        <boxGeometry args={[0.07, 0.9, 0.03]} />
        <primitive object={m.decal} attach="material" />
      </mesh>
      <mesh name="sideIntakeL" position={[-0.28, 0.12, 0.02]}>
        <boxGeometry args={[0.12, 0.3, 0.16]} />
        <primitive object={m.panel} attach="material" />
      </mesh>
      <mesh name="sideIntakeR" position={[0.28, 0.12, 0.02]}>
        <boxGeometry args={[0.12, 0.3, 0.16]} />
        <primitive object={m.panel} attach="material" />
      </mesh>
      <mesh name="intakeDarkL" position={[-0.3, 0.2, 0.06]}>
        <boxGeometry args={[0.05, 0.12, 0.1]} />
        <primitive object={m.nozzle} attach="material" />
      </mesh>
      <mesh name="intakeDarkR" position={[0.3, 0.2, 0.06]}>
        <boxGeometry args={[0.05, 0.12, 0.1]} />
        <primitive object={m.nozzle} attach="material" />
      </mesh>

      {/* Fake bevel highlights */}
      <mesh name="bevelTop" position={[0, 0.25, 0.152]}>
        <boxGeometry args={[0.36, 0.5, 0.01]} />
        <primitive object={m.decal} attach="material" />
      </mesh>

      {show('wings') && (
        <group name="wings">
          <mesh
            name="wingL"
            geometry={wingL}
            position={[-0.32, -0.02, 0]}
            scale={[0.55, 1, 1]}
            castShadow
          >
            <primitive object={m.body} attach="material" />
          </mesh>
          <mesh
            name="wingR"
            geometry={wingR}
            position={[0.32, -0.02, 0]}
            scale={[0.55, 1, 1]}
            castShadow
          >
            <primitive object={m.body} attach="material" />
          </mesh>
          {/* Wing root fairings */}
          <mesh name="wingRootL" position={[-0.36, 0.02, 0]}>
            <boxGeometry args={[0.18, 0.22, 0.14]} />
            <primitive object={m.panel} attach="material" />
          </mesh>
          <mesh name="wingRootR" position={[0.36, 0.02, 0]}>
            <boxGeometry args={[0.18, 0.22, 0.14]} />
            <primitive object={m.panel} attach="material" />
          </mesh>
          {/* Thin emissive edge channels */}
          <mesh name="wingEdgeL" position={[-0.55, 0.04, 0.04]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.32, 0.016, 0.014]} />
            <primitive object={m.trim} attach="material" />
          </mesh>
          <mesh name="wingEdgeR" position={[0.55, 0.04, 0.04]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.32, 0.016, 0.014]} />
            <primitive object={m.trim} attach="material" />
          </mesh>
        </group>
      )}

      {show('thruster') && (
        <group name="engines" position={[0, -0.42, 0]}>
          <mesh name="engineBay" position={[0, 0.08, 0]}>
            <boxGeometry args={[0.48, 0.16, 0.26]} />
            <primitive object={m.panel} attach="material" />
          </mesh>
          {([-0.15, 0.15] as const).map((x) => (
            <group key={x} name={x < 0 ? 'leftEngine' : 'rightEngine'} position={[x, 0, 0]}>
              <mesh name="nozzleFlange" position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.11, 0.04, 14]} />
                <primitive object={m.nozzle} attach="material" />
              </mesh>
              <mesh name="nozzleBell" geometry={bell} position={[0, -0.02, 0]} scale={[1.15, 1.15, 1.2]}>
                <primitive object={m.nozzle} attach="material" />
              </mesh>
              <mesh name="nozzleThroat" position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.06, 0.1, 12]} />
                <primitive object={m.nozzle} attach="material" />
              </mesh>
              <mesh name="plasmaCore" position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.036, 0.03, 0.1, 10]} />
                <primitive object={m.glow} attach="material" />
              </mesh>
              <mesh name="exhaustNub" position={[0, -0.17, 0]}>
                <sphereGeometry args={[0.055, 12, 10]} />
                <primitive object={m.glow} attach="material" />
              </mesh>
              {show('thrusterPlume') && (
                <ThrusterPlume
                  scale={1.1}
                  dense={detail === 'high'}
                  thruster={plumeMat}
                  live={liveThrust}
                />
              )}
            </group>
          ))}
        </group>
      )}

      {show('canopy') && (
        <group name="cockpit" position={[0, 0.28, 0.1]}>
          <mesh name="canopyFrame" position={[0, -0.02, 0.02]}>
            <boxGeometry args={[0.24, 0.08, 0.14]} />
            <primitive object={m.nozzle} attach="material" />
          </mesh>
          <mesh name="cockpitGlass" geometry={canopy} position={[0, 0.02, 0.04]} castShadow>
            <primitive object={m.glass} attach="material" />
          </mesh>
          <mesh name="canopyRailL" position={[-0.1, 0.04, 0.06]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.03]} />
            <primitive object={m.nozzle} attach="material" />
          </mesh>
          <mesh name="canopyRailR" position={[0.1, 0.04, 0.06]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.03]} />
            <primitive object={m.nozzle} attach="material" />
          </mesh>
          <mesh name="canopyHighlight" position={[0, 0.06, 0.1]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.01]} />
            <primitive object={m.trim} attach="material" />
          </mesh>
        </group>
      )}

      {show('finDetail') && (
        <group name="detail">
          <mesh name="strakeL" position={[-0.15, 0.25, 0.02]}>
            <boxGeometry args={[0.035, 0.48, 0.09]} />
            <primitive object={m.panel} attach="material" />
          </mesh>
          <mesh name="strakeR" position={[0.15, 0.25, 0.02]}>
            <boxGeometry args={[0.035, 0.48, 0.09]} />
            <primitive object={m.panel} attach="material" />
          </mesh>
          <mesh name="panelGap1" position={[0, -0.05, -0.175]}>
            <boxGeometry args={[0.36, 0.01, 0.018]} />
            <primitive object={m.decal} attach="material" />
          </mesh>
          <mesh name="panelGap2" position={[0, 0.18, -0.16]}>
            <boxGeometry args={[0.3, 0.01, 0.018]} />
            <primitive object={m.decal} attach="material" />
          </mesh>
          {/* Vanguard identity sensor */}
          <mesh name="sensorSpike" position={[0.07, 0.98, 0.07]}>
            <cylinderGeometry args={[0.015, 0.02, 0.14, 8]} />
            <primitive object={m.nozzle} attach="material" />
          </mesh>
          <mesh name="sensorOrb" position={[0.07, 1.07, 0.07]}>
            <sphereGeometry args={[0.025, 10, 8]} />
            <primitive object={m.trim} attach="material" />
          </mesh>
        </group>
      )}

      {show('edgeGlow') && (
        <group name="highOnly">
          <mesh name="tipGlowL" position={[-0.82, -0.04, 0.03]}>
            <boxGeometry args={[0.1, 0.012, 0.01]} />
            <primitive object={m.glow} attach="material" />
          </mesh>
          <mesh name="tipGlowR" position={[0.82, -0.04, 0.03]}>
            <boxGeometry args={[0.1, 0.012, 0.01]} />
            <primitive object={m.glow} attach="material" />
          </mesh>
        </group>
      )}

      {/* Visual-only scale reference; collision stays sim hitbox */}
      <mesh name="collisionProxy" visible={false} position={[0, 0.15, 0]}>
        <boxGeometry args={[0.7, 1.1, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
