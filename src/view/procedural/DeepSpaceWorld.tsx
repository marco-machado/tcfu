import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  BufferGeometry,
  Float32BufferAttribute,
  type Group,
  type InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  type Points,
  PointsMaterial,
} from 'three'
import type { VisualDebugMode } from '../../app/debugMode'
import { useSessionStore } from '../../app/sessionStore'
import { getWorld } from '../../sim/world'
import { bakeParts } from './bakeGeometry'
import {
  advanceWrappedY,
  DEEP_SPACE_STREAM_RATIOS,
  makeDeepSpaceField,
  type DeepSpacePoint,
} from './deepSpaceField'
import {
  getNebulaTexture,
  getNebulaWispTextures,
  getSoftGlowTexture,
} from './ProceduralTextures'
import type { DetailLevel } from './registry'
import { sceneryExtras } from './registry'

type Props = {
  detail: DetailLevel
  mode: VisualDebugMode
}

type MovingPoint = DeepSpacePoint & { y0: number }

const proxy = new Object3D()
const color = new Color()

function streamDistance(menuDistance: { current: number }, delta: number): number {
  const world = getWorld()
  const inRun = useSessionStore.getState().screen === 'run'
  if (inRun) return world.streamDistance
  menuDistance.current += world.streamSpeed * delta
  return menuDistance.current
}

function useDisposable<T extends BufferGeometry>(factory: () => T): T {
  // Geometry identity must remain stable for the component lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geometry = useMemo(factory, [])
  useLayoutEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function writePoints(mesh: InstancedMesh | null, points: MovingPoint[]): void {
  if (!mesh) return
  for (let index = 0; index < points.length; index++) {
    const point = points[index]!
    proxy.position.set(point.x, point.y, point.z)
    proxy.scale.setScalar(point.scale)
    proxy.rotation.set(0, 0, point.phase * Math.PI)
    proxy.updateMatrix()
    mesh.setMatrixAt(index, proxy.matrix)
  }
  mesh.count = points.length
  mesh.instanceMatrix.needsUpdate = true
}

function DeepVoidBackdrop() {
  const texture = getNebulaTexture()
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: texture,
        color: '#7898ad',
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        fog: false,
      }),
    [texture],
  )
  useLayoutEffect(() => () => material.dispose(), [material])
  const menuDistance = useRef(0)

  useFrame((_, delta) => {
    const distance = streamDistance(menuDistance, delta)
    texture.offset.y = distance * DEEP_SPACE_STREAM_RATIOS.depthVeils * 0.015
    texture.offset.x = 0
  })

  return (
    <mesh position={[0, 27, -7.4]} rotation={[0.3, 0, 0]} material={material} renderOrder={-20}>
      <planeGeometry args={[120, 138]} />
    </mesh>
  )
}

function StarLayer({
  count,
  seed,
  zMin,
  zSpan,
  scaleMin,
  scaleMax,
  ratio,
  opacity,
  tether,
}: {
  count: number
  seed: number
  zMin: number
  zSpan: number
  scaleMin: number
  scaleMax: number
  ratio: number
  opacity: number
  tether: number
}) {
  const group = useRef<Group>(null)
  const mesh = useRef<Points>(null)
  const points = useMemo<MovingPoint[]>(
    () =>
      makeDeepSpaceField(count, seed, {
        xSpan: 42,
        yMin: -9,
        ySpan: 50,
        zMin,
        zSpan,
        scaleMin,
        scaleMax,
      }).map((point) => ({ ...point, y0: point.y })),
    [count, scaleMax, scaleMin, seed, zMin, zSpan],
  )
  const geometry = useMemo(() => {
    const result = new BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    const colors = new Float32Array(points.length * 3)
    for (let index = 0; index < points.length; index++) {
      const point = points[index]!
      positions[index * 3] = point.x
      positions[index * 3 + 1] = point.y
      positions[index * 3 + 2] = point.z
      color.set(point.phase > 0.94 ? '#ffd2a0' : point.phase < 0.22 ? '#7ebcff' : '#d9efff')
      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
    }
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    result.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return result
  }, [points])
  useLayoutEffect(() => () => geometry.dispose(), [geometry])
  const material = useMemo(
    () =>
      new PointsMaterial({
        map: getSoftGlowTexture(),
        size: (scaleMin + scaleMax) * 0.9,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        vertexColors: true,
      }),
    [opacity, scaleMax, scaleMin],
  )
  useLayoutEffect(() => () => material.dispose(), [material])
  const menuDistance = useRef(0)

  useFrame((state, delta) => {
    const distance = streamDistance(menuDistance, delta) * ratio
    const positions = geometry.getAttribute('position')
    for (let index = 0; index < points.length; index++) {
      const point = points[index]!
      point.y = advanceWrappedY(point.y0, distance, -9, 50)
      positions.setXYZ(index, point.x, point.y, point.z)
    }
    positions.needsUpdate = true
    if (group.current) {
      group.current.position.x = state.camera.position.x * tether
      group.current.position.y = (state.camera.position.y - 0.55) * tether
    }
  })

  return (
    <group ref={group}>
      <points
        ref={mesh}
        geometry={geometry}
        material={material}
        frustumCulled={false}
        renderOrder={-16}
      />
    </group>
  )
}

const SILHOUETTE_GEOMETRIES = [
  [
    { kind: 'box' as const, sx: 2.8, sy: 0.36, sz: 0.3 },
    { kind: 'box' as const, sx: 1.1, sy: 0.28, sz: 0.26, x: -1.5, y: 0.22, rotZ: -0.3 },
    { kind: 'box' as const, sx: 0.8, sy: 0.42, sz: 0.25, x: 0.7, y: 0.3 },
  ],
  [
    { kind: 'box' as const, sx: 1.5, sy: 0.32, sz: 0.28 },
    { kind: 'box' as const, sx: 1.25, sy: 0.28, sz: 0.26, x: 1.08, y: 0.5, rotZ: 0.72 },
    { kind: 'box' as const, sx: 1.25, sy: 0.28, sz: 0.26, x: -1.08, y: 0.5, rotZ: -0.72 },
  ],
] as const

function DistantSilhouettes({ count, diagnostic }: { count: number; diagnostic: boolean }) {
  const refs = useRef<Array<InstancedMesh | null>>([])
  const geometries = useMemo(() => SILHOUETTE_GEOMETRIES.map((parts) => bakeParts([...parts])), [])
  useLayoutEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: diagnostic ? '#6ea8c7' : '#152c3d',
        transparent: true,
        opacity: diagnostic ? 0.9 : 0.68,
        depthWrite: false,
        fog: true,
      }),
    [diagnostic],
  )
  useLayoutEffect(() => () => material.dispose(), [material])
  const pointSets = useMemo(
    () =>
      geometries.map((_, variant) =>
        makeDeepSpaceField(Math.ceil(count / geometries.length), 6100 + variant * 977, {
          xSpan: 34,
          yMin: -10,
          ySpan: 54,
          zMin: -4.5,
          zSpan: 1.7,
          scaleMin: 0.55,
          scaleMax: 1.15,
        })
          .map((point, index) => {
            const side = (index + variant) % 2 === 0 ? -1 : 1
            return { ...point, x: side * (10.5 + Math.abs(point.x) * 0.42), y0: point.y }
          })
          .slice(0, Math.ceil(count / geometries.length)),
      ),
    [count, geometries],
  )
  const menuDistance = useRef(0)

  useFrame((_, delta) => {
    const distance =
      streamDistance(menuDistance, delta) * DEEP_SPACE_STREAM_RATIOS.distantSilhouettes
    pointSets.forEach((points, variant) => {
      for (const point of points) {
        point.y = advanceWrappedY(point.y0, distance, -10, 54)
      }
      writePoints(refs.current[variant] ?? null, points)
    })
  })

  return (
    <>
      {geometries.map((geometry, variant) => (
        <instancedMesh
          key={variant}
          ref={(value) => {
            refs.current[variant] = value
          }}
          args={[geometry, material, Math.max(1, pointSets[variant]?.length ?? 1)]}
          frustumCulled={false}
          renderOrder={-12}
        />
      ))}
    </>
  )
}

function DepthVeils({
  count,
  diagnostic,
  motionScale,
}: {
  count: number
  diagnostic: boolean
  motionScale: number
}) {
  const textures = getNebulaWispTextures()
  const refs = useRef<Array<Group | null>>([])
  const placements = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: (index % 2 === 0 ? -1 : 1) * (7 + (index % 3) * 3.4),
        y: -5 + (index / Math.max(1, count)) * 48,
        z: -3.5 - (index % 3) * 0.55,
        width: 11 + (index % 2) * 6,
        height: 5 + (index % 3) * 2.5,
      })),
    [count],
  )
  const menuDistance = useRef(0)

  useFrame((_, delta) => {
    const distance =
      streamDistance(menuDistance, delta) * DEEP_SPACE_STREAM_RATIOS.depthVeils * motionScale
    for (let index = 0; index < placements.length; index++) {
      const group = refs.current[index]
      const placement = placements[index]
      if (!group || !placement) continue
      group.position.y = advanceWrappedY(placement.y, distance, -8, 50)
    }
  })

  return (
    <>
      {placements.map((placement, index) => (
        <group
          key={index}
          ref={(value) => {
            refs.current[index] = value
          }}
          position={[placement.x, placement.y, placement.z]}
          renderOrder={-14}
        >
          <mesh scale={[placement.width, placement.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={textures[index % textures.length]}
              color={diagnostic ? '#4fa8c8' : index % 2 === 0 ? '#5a8296' : '#476f86'}
              transparent
              opacity={diagnostic ? 0.34 : 0.16}
              blending={AdditiveBlending}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function NearStreaks({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const geometry = useDisposable(() => new BoxGeometry(0.028, 1, 0.02))
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#8ad8f2',
        transparent: true,
        opacity: 0.32,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])
  const points = useMemo<MovingPoint[]>(
    () =>
      makeDeepSpaceField(count, 9200, {
        xSpan: 30,
        yMin: -4,
        ySpan: 34,
        zMin: -0.7,
        zSpan: 1.2,
        scaleMin: 0.35,
        scaleMax: 0.9,
      }).map((point) => ({ ...point, y0: point.y })),
    [count],
  )
  const menuDistance = useRef(0)

  useFrame((_, delta) => {
    const world = getWorld()
    const speed = world.streamSpeed
    const distance = streamDistance(menuDistance, delta) * DEEP_SPACE_STREAM_RATIOS.nearStreaks
    const instance = mesh.current
    if (!instance) return
    for (let index = 0; index < points.length; index++) {
      const point = points[index]!
      const y = advanceWrappedY(point.y0, distance * (0.8 + point.phase * 0.35), -4, 34)
      proxy.position.set(point.x, y, point.z)
      proxy.scale.set(1, point.scale * (0.8 + speed * 0.16), 1)
      proxy.rotation.set(0, 0, 0)
      proxy.updateMatrix()
      instance.setMatrixAt(index, proxy.matrix)
    }
    instance.count = points.length
    instance.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
}

export function DeepSpaceWorld({ detail, mode }: Props) {
  const extras = sceneryExtras(detail)
  const reducedMotion = useSessionStore((state) => state.settings.reducedMotion)
  const starDiagnostic = mode === 'stars'
  const silhouetteDiagnostic = mode === 'silhouettes'
  const depthDiagnostic = mode === 'depth'
  const isolated = starDiagnostic || silhouetteDiagnostic || depthDiagnostic
  const silhouetteCount = extras.distantSilhouettes ? extras.derelictCount : 0
  const veilCount = extras.wispCount

  return (
    <group>
      {!starDiagnostic && !silhouetteDiagnostic && <DeepVoidBackdrop />}
      {!silhouetteDiagnostic && !depthDiagnostic && (
        <>
          <StarLayer
            count={Math.floor(extras.starCount * 0.72)}
            seed={1337}
            zMin={-5.8}
            zSpan={1.4}
            ratio={DEEP_SPACE_STREAM_RATIOS.farStars}
            scaleMin={0.045}
            scaleMax={0.095}
            opacity={0.76}
            tether={1}
          />
          <StarLayer
            count={Math.ceil(extras.starCount * 0.28)}
            seed={7331}
            zMin={-3.8}
            zSpan={1.2}
            ratio={DEEP_SPACE_STREAM_RATIOS.midStars}
            scaleMin={0.08}
            scaleMax={0.16}
            opacity={0.92}
            tether={0.55}
          />
        </>
      )}
      {!starDiagnostic && !silhouetteDiagnostic && (
        <DepthVeils
          count={veilCount}
          diagnostic={depthDiagnostic}
          motionScale={reducedMotion ? 0 : 1}
        />
      )}
      {!starDiagnostic && !depthDiagnostic && silhouetteCount > 0 && (
        <DistantSilhouettes count={silhouetteCount} diagnostic={silhouetteDiagnostic} />
      )}
      {!isolated && !reducedMotion && (
        <NearStreaks count={Math.max(8, Math.floor(extras.streakCount * 0.72))} />
      )}
    </group>
  )
}
