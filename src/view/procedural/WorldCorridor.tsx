import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  IcosahedronGeometry,
  type InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  type BufferGeometry,
} from 'three'
import { getWorld } from '../../sim/world'
import { bakeParts, type GeoPart } from './bakeGeometry'
import {
  getMicroNoiseTexture,
  getNebulaTexture,
  getPanelLineTexture,
  getSoftGlowTexture,
  getStreamFlowTexture,
} from './ProceduralTextures'
import type { DetailLevel } from './registry'
import { sceneryExtras } from './registry'

type Props = {
  detail: DetailLevel
}

const _proxy = new Object3D()
const _color = new Color()

/** Deterministic pseudo-random in [0, 1) from integer seed. */
function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

type ScrollItem = {
  x: number
  y: number
  z: number
  scale: number
  rotZ: number
  spin: number
  seed: number
}

function makeScrollItems(
  count: number,
  seedBase: number,
  make: (u: (k: number) => number, i: number) => Omit<ScrollItem, 'seed'>,
): ScrollItem[] {
  const items: ScrollItem[] = []
  for (let i = 0; i < count; i++) {
    const u = (k: number) => hash01(seedBase + i * 17 + k)
    items.push({ ...make(u, i), seed: u(99) })
  }
  return items
}

function scrollAndRecycle(items: ScrollItem[], dy: number, minY: number, span: number): void {
  for (const item of items) {
    item.y -= dy
    if (item.y < minY) item.y += span
    if (item.spin !== 0) item.rotZ += item.spin * dy
  }
}

function writeItems(inst: InstancedMesh | null, items: ScrollItem[]): void {
  if (!inst) return
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!
    _proxy.position.set(item.x, item.y, item.z)
    _proxy.scale.setScalar(item.scale)
    _proxy.rotation.set(0, 0, item.rotZ)
    _proxy.updateMatrix()
    inst.setMatrixAt(i, _proxy.matrix)
  }
  inst.count = items.length
  inst.instanceMatrix.needsUpdate = true
}

function useDisposable<T extends BufferGeometry>(factory: () => T): T {
  // Geometry identity must be stable for the component lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useMemo(factory, [])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  return geo
}

/* ------------------------------- Backdrop -------------------------------- */

function Backdrop() {
  const tex = getNebulaTexture()
  const material = useMemo(
    // fog: false — the sky plate must not dissolve into scene fog.
    () => new MeshBasicMaterial({ map: tex, depthWrite: false, fog: false }),
    [tex],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    const speed = getWorld().streamSpeed
    tex.offset.y += speed * delta * 0.0035
    tex.offset.x = Math.sin(tex.offset.y * 2.1) * 0.006
  })

  return (
    <mesh position={[0, 26, -3.4]} rotation={[0.35, 0, 0]} material={material} renderOrder={-10}>
      <planeGeometry args={[110, 130]} />
    </mesh>
  )
}

/* ------------------------------- Star field ------------------------------ */

function StarLayer({
  count,
  seedBase,
  z,
  factor,
  sizeMin,
  sizeMax,
  opacity,
}: {
  count: number
  seedBase: number
  z: number
  factor: number
  sizeMin: number
  sizeMax: number
  opacity: number
}) {
  const mesh = useRef<InstancedMesh>(null)
  const items = useMemo(
    () =>
      makeScrollItems(count, seedBase, (u) => ({
        x: (u(1) - 0.5) * 34,
        y: u(2) * 44 - 8,
        z,
        scale: sizeMin + u(3) * (sizeMax - sizeMin),
        rotZ: 0,
        spin: 0,
      })),
    [count, seedBase, z, sizeMin, sizeMax],
  )
  const geometry = useDisposable(() => new PlaneGeometry(1, 1))
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: getSoftGlowTexture(),
        color: '#bfe4ff',
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    [opacity],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    scrollAndRecycle(items, getWorld().streamSpeed * delta * factor, -8, 44)
    writeItems(mesh.current, items)
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, count]}
      frustumCulled={false}
      renderOrder={-9}
    />
  )
}

/* ------------------------------ Nebula wisps ----------------------------- */

const WISP_TINTS = ['#1c4a6e', '#274067', '#3a2a58', '#173f52', '#5a3018', '#1c4a6e'] as const

function NebulaWisps({ count }: { count: number }) {
  const group = useRef<Array<{ y: number }>>([])
  const refs = useRef<Array<Object3D | null>>([])
  const placements = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash01(i * 31 + 400) - 0.5) * 30,
        y0: hash01(i * 31 + 401) * 44 - 8,
        z: -2.9,
        s: 7 + hash01(i * 31 + 402) * 11,
        tint: WISP_TINTS[i % WISP_TINTS.length]!,
        opacity: 0.16 + hash01(i * 31 + 403) * 0.14,
      })),
    [count],
  )

  useLayoutEffect(() => {
    group.current = placements.map((p) => ({ y: p.y0 }))
  }, [placements])

  useFrame((_, delta) => {
    const dy = getWorld().streamSpeed * delta * 0.05
    for (let i = 0; i < placements.length; i++) {
      const state = group.current[i]
      const obj = refs.current[i]
      if (!state || !obj) continue
      state.y -= dy
      if (state.y < -12) state.y += 48
      obj.position.y = state.y
    }
  })

  return (
    <>
      {placements.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[p.x, p.y0, p.z]}
          scale={[p.s * 1.5, p.s, 1]}
          renderOrder={-8}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={getSoftGlowTexture()}
            color={p.tint}
            transparent
            opacity={p.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      ))}
    </>
  )
}

/* ----------------------------- Asteroid field ---------------------------- */

function makeAsteroidGeometry(seed: number): BufferGeometry {
  const geo = new IcosahedronGeometry(1, 1)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const n = 0.72 + hash01(seed + i * 3) * 0.55
    pos.setXYZ(i, pos.getX(i) * n, pos.getY(i) * n, pos.getZ(i) * n)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function AsteroidField({ count }: { count: number }) {
  const meshA = useRef<InstancedMesh>(null)
  const meshB = useRef<InstancedMesh>(null)
  const geoA = useDisposable(() => makeAsteroidGeometry(7))
  const geoB = useDisposable(() => makeAsteroidGeometry(41))
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#48586a',
        metalness: 0.25,
        roughness: 0.85,
        roughnessMap: getMicroNoiseTexture(),
        emissive: '#0a1420',
        emissiveIntensity: 0.22,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  const half = Math.ceil(count / 2)
  const itemsA = useMemo(
    () =>
      makeScrollItems(half, 900, (u) => {
        const side = u(0) > 0.5 ? 1 : -1
        return {
          x: side * (8.6 + u(1) * 7),
          y: u(2) * 42 - 6,
          z: -1.9 - u(3) * 0.9,
          scale: 0.35 + u(4) * 0.85,
          rotZ: u(5) * Math.PI * 2,
          spin: (u(6) - 0.5) * 0.35,
        }
      }),
    [half],
  )
  const itemsB = useMemo(
    () =>
      makeScrollItems(count - half, 1700, (u) => {
        const side = u(0) > 0.5 ? 1 : -1
        return {
          x: side * (9.4 + u(1) * 8),
          y: u(2) * 42 - 6,
          z: -2.4 - u(3) * 0.8,
          scale: 0.25 + u(4) * 0.6,
          rotZ: u(5) * Math.PI * 2,
          spin: (u(6) - 0.5) * 0.3,
        }
      }),
    [count, half],
  )

  useFrame((_, delta) => {
    const dy = getWorld().streamSpeed * delta
    scrollAndRecycle(itemsA, dy * 0.3, -6, 42)
    scrollAndRecycle(itemsB, dy * 0.22, -6, 42)
    writeItems(meshA.current, itemsA)
    writeItems(meshB.current, itemsB)
  })

  return (
    <>
      <instancedMesh ref={meshA} args={[geoA, material, half]} frustumCulled={false} />
      <instancedMesh
        ref={meshB}
        args={[geoB, material, Math.max(1, count - half)]}
        frustumCulled={false}
      />
    </>
  )
}

/* ----------------------------- Derelict fleet ---------------------------- */

type PropVariant = {
  hull: GeoPart[]
  accent: GeoPart[]
}

const DERELICT_VARIANTS: PropVariant[] = [
  {
    // Broken frigate: long hull, listing superstructure, snapped antenna
    hull: [
      { kind: 'box', sx: 2.6, sy: 0.5, sz: 0.45 },
      { kind: 'box', sx: 1.1, sy: 0.4, sz: 0.35, x: -0.4, y: 0.38, rotZ: 0.08 },
      { kind: 'box', sx: 0.5, sy: 0.7, sz: 0.3, x: 0.7, y: 0.4 },
      { kind: 'cylinder', rTop: 0.03, rBottom: 0.05, height: 0.9, x: 1.05, y: 0.85, radialSeg: 5 },
      { kind: 'box', sx: 0.8, sy: 0.25, sz: 0.3, x: -1.35, y: -0.1, rotZ: -0.2 },
    ],
    accent: [
      { kind: 'box', sx: 1.6, sy: 0.05, sz: 0.06, x: -0.2, y: 0.12, z: 0.24 },
      { kind: 'box', sx: 0.05, sy: 0.2, sz: 0.06, x: 0.72, y: 0.42, z: 0.18 },
    ],
  },
  {
    // Ring station segment: broken torus arc built from angled boxes
    hull: [
      { kind: 'box', sx: 1.5, sy: 0.4, sz: 0.4, rotZ: 0.0 },
      { kind: 'box', sx: 1.4, sy: 0.38, sz: 0.4, x: 1.15, y: 0.55, rotZ: 0.75 },
      { kind: 'box', sx: 1.4, sy: 0.38, sz: 0.4, x: -1.15, y: 0.55, rotZ: -0.75 },
      { kind: 'box', sx: 0.5, sy: 0.5, sz: 0.5, y: -0.05 },
      { kind: 'cylinder', rTop: 0.1, rBottom: 0.1, height: 1.2, y: 0.5, radialSeg: 6 },
    ],
    accent: [
      { kind: 'box', sx: 0.8, sy: 0.06, sz: 0.06, z: 0.22 },
      { kind: 'box', sx: 0.06, sy: 0.5, sz: 0.06, x: 1.3, y: 0.66, z: 0.2, rotZ: 0.75 },
    ],
  },
  {
    // Sensor spire: tapered tower with dishes
    hull: [
      { kind: 'cylinder', rTop: 0.08, rBottom: 0.3, height: 2.4, radialSeg: 6 },
      { kind: 'box', sx: 0.85, sy: 0.3, sz: 0.35, y: -1.05 },
      { kind: 'box', sx: 0.55, sy: 0.1, sz: 0.4, y: 0.3 },
      { kind: 'cylinder', rTop: 0.26, rBottom: 0.02, height: 0.24, y: 0.85, rotZ: 0.5, radialSeg: 8 },
    ],
    accent: [
      { kind: 'box', sx: 0.07, sy: 0.07, sz: 0.07, y: 1.28 },
      { kind: 'box', sx: 0.3, sy: 0.05, sz: 0.05, y: -0.95, z: 0.2 },
    ],
  },
]

function InstancedPropSet({
  variants,
  counts,
  seedBase,
  place,
  hullMaterial,
  accentMaterial,
  factor,
  minY,
  span,
}: {
  variants: PropVariant[]
  counts: number[]
  seedBase: number
  place: (u: (k: number) => number, i: number) => Omit<ScrollItem, 'seed'>
  hullMaterial: MeshStandardMaterial
  accentMaterial: MeshBasicMaterial
  factor: number
  minY: number
  span: number
}) {
  const hullRefs = useRef<Array<InstancedMesh | null>>([])
  const accentRefs = useRef<Array<InstancedMesh | null>>([])

  const geos = useMemo(
    () =>
      variants.map((v) => ({
        hull: bakeParts(v.hull),
        accent: bakeParts(v.accent),
      })),
    [variants],
  )
  useLayoutEffect(
    () => () => {
      for (const g of geos) {
        g.hull.dispose()
        g.accent.dispose()
      }
    },
    [geos],
  )

  const itemSets = useMemo(
    () =>
      counts.map((count, vi) =>
        makeScrollItems(count, seedBase + vi * 991, (u, i) => place(u, i + vi * 7)),
      ),
    [counts, seedBase, place],
  )

  useFrame((_, delta) => {
    const dy = getWorld().streamSpeed * delta * factor
    for (let vi = 0; vi < itemSets.length; vi++) {
      const items = itemSets[vi]!
      scrollAndRecycle(items, dy, minY, span)
      writeItems(hullRefs.current[vi] ?? null, items)
      writeItems(accentRefs.current[vi] ?? null, items)
    }
  })

  return (
    <>
      {geos.map((g, vi) => (
        <group key={vi}>
          <instancedMesh
            ref={(el) => {
              hullRefs.current[vi] = el
            }}
            args={[g.hull, hullMaterial, Math.max(1, counts[vi] ?? 1)]}
            frustumCulled={false}
          />
          <instancedMesh
            ref={(el) => {
              accentRefs.current[vi] = el
            }}
            args={[g.accent, accentMaterial, Math.max(1, counts[vi] ?? 1)]}
            frustumCulled={false}
          />
        </group>
      ))}
    </>
  )
}

function DerelictFleet({ count }: { count: number }) {
  const hullMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#54687e',
        map: getPanelLineTexture(),
        metalness: 0.7,
        roughness: 0.6,
        roughnessMap: getMicroNoiseTexture(),
        emissive: '#060c14',
        emissiveIntensity: 0.35,
      }),
    [],
  )
  const accentMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#5ab8e4',
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      }),
    [],
  )
  useLayoutEffect(
    () => () => {
      hullMaterial.dispose()
      accentMaterial.dispose()
    },
    [hullMaterial, accentMaterial],
  )

  const per = Math.max(1, Math.floor(count / DERELICT_VARIANTS.length))
  const counts = [per, per, Math.max(1, count - per * 2)]

  const place = useMemo(
    () => (u: (k: number) => number, i: number) => {
      const side = i % 2 === 0 ? -1 : 1
      return {
        x: side * (10.5 + u(1) * 6.5),
        y: u(2) * 46 - 8,
        z: -2.2 - u(3) * 0.9,
        scale: 0.9 + u(4) * 1.4,
        rotZ: (u(5) - 0.5) * 1.2,
        spin: (u(6) - 0.5) * 0.02,
      }
    },
    [],
  )

  return (
    <InstancedPropSet
      variants={DERELICT_VARIANTS}
      counts={counts}
      seedBase={2600}
      place={place}
      hullMaterial={hullMaterial}
      accentMaterial={accentMaterial}
      factor={0.14}
      minY={-10}
      span={46}
    />
  )
}

/* ------------------------------ Beacon pylons ---------------------------- */

function BeaconPylons({ count }: { count: number }) {
  const hullRef = useRef<InstancedMesh>(null)
  const lampRef = useRef<InstancedMesh>(null)
  const hullGeo = useDisposable(() =>
    bakeParts([
      { kind: 'cylinder', rTop: 0.06, rBottom: 0.12, height: 1.5, radialSeg: 6 },
      { kind: 'box', sx: 0.34, sy: 0.14, sz: 0.34, y: -0.7 },
      { kind: 'box', sx: 0.1, sy: 0.28, sz: 0.1, y: 0.85 },
    ]),
  )
  const lampGeo = useDisposable(() => new BoxGeometry(0.16, 0.1, 0.16))
  const hullMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#2c3d4e',
        metalness: 0.75,
        roughness: 0.5,
        emissive: '#081018',
        emissiveIntensity: 0.3,
      }),
    [],
  )
  const lampMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        toneMapped: false,
      }),
    [],
  )
  useLayoutEffect(
    () => () => {
      hullMaterial.dispose()
      lampMaterial.dispose()
    },
    [hullMaterial, lampMaterial],
  )

  const items = useMemo(
    () =>
      makeScrollItems(count, 3600, (u, i) => ({
        x: (i % 2 === 0 ? -1 : 1) * (7.9 + u(1) * 1.1),
        y: (i / count) * 40 + u(2) * 4 - 4,
        z: -0.9 - u(3) * 0.5,
        scale: 0.8 + u(4) * 0.4,
        rotZ: (u(5) - 0.5) * 0.14,
        spin: 0,
      })),
    [count],
  )

  useFrame((state, delta) => {
    const dy = getWorld().streamSpeed * delta * 0.55
    scrollAndRecycle(items, dy, -4, 40)
    writeItems(hullRef.current, items)
    const lamp = lampRef.current
    if (lamp) {
      const t = state.clock.elapsedTime
      for (let i = 0; i < items.length; i++) {
        const item = items[i]!
        _proxy.position.set(item.x, item.y + item.scale * 1.02, item.z)
        _proxy.scale.setScalar(item.scale)
        _proxy.rotation.set(0, 0, 0)
        _proxy.updateMatrix()
        lamp.setMatrixAt(i, _proxy.matrix)
        const blink = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.4 + item.seed * 12))
        _color.setRGB(0.4 * blink + 0.15, 0.85 * blink + 0.1, blink + 0.15)
        lamp.setColorAt(i, _color)
      }
      lamp.count = items.length
      lamp.instanceMatrix.needsUpdate = true
      if (lamp.instanceColor) lamp.instanceColor.needsUpdate = true
    }
  })

  return (
    <>
      <instancedMesh ref={hullRef} args={[hullGeo, hullMaterial, count]} frustumCulled={false} />
      <instancedMesh ref={lampRef} args={[lampGeo, lampMaterial, count]} frustumCulled={false} />
    </>
  )
}

/* ------------------------------- Gate arches ----------------------------- */

const GATE_VARIANT: PropVariant = {
  hull: [
    { kind: 'box', sx: 0.6, sy: 3.4, sz: 0.6, x: -7.7, rotZ: 0.05 },
    { kind: 'box', sx: 0.6, sy: 3.4, sz: 0.6, x: 7.7, rotZ: -0.05 },
    { kind: 'box', sx: 0.9, sy: 1.1, sz: 0.7, x: -7.7, y: 1.9 },
    { kind: 'box', sx: 0.9, sy: 1.1, sz: 0.7, x: 7.7, y: 1.9 },
    { kind: 'box', sx: 1.2, sy: 0.8, sz: 0.7, x: -7.7, y: -1.8 },
    { kind: 'box', sx: 1.2, sy: 0.8, sz: 0.7, x: 7.7, y: -1.8 },
    { kind: 'cylinder', rTop: 0.16, rBottom: 0.16, height: 1.1, x: -7.7, y: 2.7, radialSeg: 6 },
    { kind: 'cylinder', rTop: 0.16, rBottom: 0.16, height: 1.1, x: 7.7, y: 2.7, radialSeg: 6 },
  ],
  accent: [
    { kind: 'box', sx: 0.14, sy: 2.6, sz: 0.1, x: -7.36, z: 0.28 },
    { kind: 'box', sx: 0.14, sy: 2.6, sz: 0.1, x: 7.36, z: 0.28 },
    { kind: 'box', sx: 0.3, sy: 0.16, sz: 0.12, x: -7.7, y: 2.1, z: 0.34 },
    { kind: 'box', sx: 0.3, sy: 0.16, sz: 0.12, x: 7.7, y: 2.1, z: 0.34 },
  ],
}

function GateArches({ count }: { count: number }) {
  const hullMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#26394c',
        metalness: 0.8,
        roughness: 0.42,
        emissive: '#07101a',
        emissiveIntensity: 0.4,
      }),
    [],
  )
  const accentMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#2a9fd4',
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      }),
    [],
  )
  useLayoutEffect(
    () => () => {
      hullMaterial.dispose()
      accentMaterial.dispose()
    },
    [hullMaterial, accentMaterial],
  )

  const place = useMemo(
    () => (u: (k: number) => number, i: number) => ({
      x: 0,
      y: 5 + i * (58 / Math.max(1, count)) + u(1) * 2,
      z: -1.7,
      scale: 1,
      rotZ: 0,
      spin: 0,
    }),
    [count],
  )

  return (
    <InstancedPropSet
      variants={[GATE_VARIANT]}
      counts={[count]}
      seedBase={5100}
      place={place}
      hullMaterial={hullMaterial}
      accentMaterial={accentMaterial}
      factor={0.42}
      minY={-6}
      span={58}
    />
  )
}

/* ------------------------------ Stream ribbon ---------------------------- */

function StreamRibbon() {
  const tex = getStreamFlowTexture()
  const material = useMemo(() => {
    const m = new MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
    return m
  }, [tex])
  useLayoutEffect(() => () => material.dispose(), [material])

  useMemo(() => {
    // Deck must outrun the fog far plane so its end never silhouettes at wide FOV.
    tex.repeat.set(1, 2.9)
  }, [tex])

  useFrame((_, delta) => {
    tex.offset.y += (getWorld().streamSpeed * delta * tex.repeat.y) / 66
  })

  return (
    <mesh position={[0, 19, -0.42]} material={material} renderOrder={-6}>
      <planeGeometry args={[14.4, 66]} />
    </mesh>
  )
}

function EdgeRails({ dashCount }: { dashCount: number }) {
  const dashRef = useRef<InstancedMesh>(null)
  const railGeo = useDisposable(() => new BoxGeometry(0.09, 66, 0.09))
  const dashGeo = useDisposable(() => new BoxGeometry(0.13, 0.85, 0.12))
  const railMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#12303f',
        metalness: 0.5,
        roughness: 0.4,
        emissive: '#2288b2',
        emissiveIntensity: 0.75,
        toneMapped: false,
      }),
    [],
  )
  const dashMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#54d8ff',
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )
  useLayoutEffect(
    () => () => {
      railMaterial.dispose()
      dashMaterial.dispose()
    },
    [railMaterial, dashMaterial],
  )

  const items = useMemo(
    () =>
      makeScrollItems(dashCount, 6400, (u, i) => ({
        x: i % 2 === 0 ? -6.42 : 6.42,
        y: (i / dashCount) * 42 + u(1) * 2 - 2,
        z: -0.3,
        scale: 0.7 + u(2) * 0.7,
        rotZ: 0,
        spin: 0,
      })),
    [dashCount],
  )

  useFrame((_, delta) => {
    scrollAndRecycle(items, getWorld().streamSpeed * delta * 1.25, -2, 42)
    writeItems(dashRef.current, items)
  })

  return (
    <>
      <mesh position={[-6.42, 19, -0.3]} geometry={railGeo} material={railMaterial} />
      <mesh position={[6.42, 19, -0.3]} geometry={railGeo} material={railMaterial} />
      <instancedMesh
        ref={dashRef}
        args={[dashGeo, dashMaterial, dashCount]}
        frustumCulled={false}
      />
    </>
  )
}

/** Subtle tonal plates breaking up the big dark lane plane. */
function LanePlates({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const geometry = useDisposable(() => new PlaneGeometry(1, 1))
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#1a3a52',
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  const items = useMemo(
    () =>
      makeScrollItems(count, 8700, (u, i) => ({
        x: (u(1) - 0.5) * 9,
        y: (i / count) * 40 + u(2) * 3 - 2,
        z: -0.38,
        scale: 1.8 + u(3) * 2.6,
        rotZ: 0,
        spin: 0,
      })),
    [count],
  )

  useFrame((_, delta) => {
    scrollAndRecycle(items, getWorld().streamSpeed * delta, -3, 40)
    writeItems(mesh.current, items)
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
  )
}

/** Cross seams: lane plate joints scrolling with the stream (structure read). */
function LaneSeams({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const geometry = useDisposable(() => new BoxGeometry(12.6, 0.05, 0.02))
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#1d4a62',
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
        depthWrite: false,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  const items = useMemo(
    () =>
      makeScrollItems(count, 7900, (u, i) => ({
        x: 0,
        y: (i / count) * 40 + u(1) * 1.2 - 2,
        z: -0.34,
        scale: 1,
        rotZ: 0,
        spin: 0,
      })),
    [count],
  )

  useFrame((_, delta) => {
    scrollAndRecycle(items, getWorld().streamSpeed * delta, -2, 40)
    writeItems(mesh.current, items)
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
  )
}

function makeChevronGeometry(): ShapeGeometry {
  const shape = new Shape()
  shape.moveTo(-0.34, 0.3)
  shape.lineTo(0, 0.08)
  shape.lineTo(0.34, 0.3)
  shape.lineTo(0.34, 0.06)
  shape.lineTo(0, -0.18)
  shape.lineTo(-0.34, 0.06)
  shape.closePath()
  return new ShapeGeometry(shape)
}

function LaneChevrons({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const geometry = useDisposable(makeChevronGeometry)
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#2f7c9c',
        transparent: true,
        opacity: 0.4,
        toneMapped: false,
        depthWrite: false,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  const items = useMemo(() => {
    const lanes = [-4.5, 0, 4.5]
    return makeScrollItems(count, 7300, (u, i) => ({
      x: lanes[i % lanes.length]!,
      y: (i / count) * 40 + u(1) * 1.5 - 2,
      z: -0.36,
      scale: 0.9 + u(2) * 0.3,
      rotZ: 0,
      spin: 0,
    }))
  }, [count])

  useFrame((_, delta) => {
    scrollAndRecycle(items, getWorld().streamSpeed * delta, -2, 40)
    writeItems(mesh.current, items)
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
  )
}

/* ------------------------------- Near field ------------------------------ */

function SpeedStreaks({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const geometry = useDisposable(() => new BoxGeometry(0.035, 1, 0.03))
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#7ecfec',
        transparent: true,
        opacity: 0.5,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  const items = useMemo(
    () =>
      makeScrollItems(count, 8200, (u) => {
        const insideBand = u(0) < 0.35
        const x = insideBand ? (u(1) - 0.5) * 12 : (u(1) > 0.5 ? 1 : -1) * (7 + u(2) * 6)
        return {
          x,
          y: u(3) * 30 - 3,
          z: insideBand ? -0.25 : 0.4 + u(4) * 0.5,
          scale: 0.5 + u(5) * 0.9,
          rotZ: 0,
          spin: 0,
        }
      }),
    [count],
  )

  useFrame((_, delta) => {
    const world = getWorld()
    const speed = world.streamSpeed
    const stretch = 0.75 + (speed / 4) * 0.85
    const dy = speed * delta * 1.5
    for (const item of items) {
      item.y -= dy * (0.8 + item.seed * 0.5)
      if (item.y < -3) item.y += 30
    }
    const inst = mesh.current
    if (!inst) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      _proxy.position.set(item.x, item.y, item.z)
      _proxy.scale.set(1, item.scale * stretch, 1)
      _proxy.rotation.set(0, 0, 0)
      _proxy.updateMatrix()
      inst.setMatrixAt(i, _proxy.matrix)
    }
    inst.count = items.length
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
  )
}

function DustMotes({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const geometry = useDisposable(() => new PlaneGeometry(0.05, 0.05))
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: getSoftGlowTexture(),
        color: '#9fc8dd',
        transparent: true,
        opacity: 0.5,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])

  const items = useMemo(
    () =>
      makeScrollItems(count, 9100, (u) => ({
        x: (u(1) - 0.5) * 20,
        y: u(2) * 28 - 3,
        z: 0.5 + u(3) * 1.2,
        scale: 0.5 + u(4) * 1.4,
        rotZ: 0,
        spin: 0,
      })),
    [count],
  )

  useFrame((_, delta) => {
    const dy = getWorld().streamSpeed * delta * 1.8
    for (const item of items) {
      item.y -= dy * (0.7 + item.seed * 0.6)
      if (item.y < -3) item.y += 28
    }
    writeItems(mesh.current, items)
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
  )
}

/* --------------------------------- Root ---------------------------------- */

export function WorldCorridor({ detail }: Props) {
  const extras = sceneryExtras(detail)

  return (
    <group>
      <Backdrop />
      <StarLayer
        count={Math.floor(extras.starCount * 0.65)}
        seedBase={100}
        z={-3}
        factor={0.06}
        sizeMin={0.05}
        sizeMax={0.11}
        opacity={0.75}
      />
      <StarLayer
        count={Math.ceil(extras.starCount * 0.35)}
        seedBase={220}
        z={-2.5}
        factor={0.13}
        sizeMin={0.09}
        sizeMax={0.2}
        opacity={0.95}
      />
      {extras.wispCount > 0 && <NebulaWisps count={extras.wispCount} />}
      {extras.asteroidCount > 0 && <AsteroidField count={extras.asteroidCount} />}
      {extras.derelictCount > 0 && <DerelictFleet count={extras.derelictCount} />}
      {extras.pylonCount > 0 && <BeaconPylons count={extras.pylonCount} />}
      {extras.gateCount > 0 && <GateArches count={extras.gateCount} />}
      <StreamRibbon />
      <EdgeRails dashCount={extras.railDashCount} />
      <LanePlates count={10} />
      <LaneSeams count={12} />
      <LaneChevrons count={extras.chevronCount} />
      <SpeedStreaks count={extras.streakCount} />
      {extras.dustCount > 0 && <DustMotes count={extras.dustCount} />}
    </group>
  )
}
