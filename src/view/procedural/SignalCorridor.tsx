import { useFrame } from '@react-three/fiber'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  MeshBasicMaterial,
  Object3D,
  type InstancedMesh,
} from 'three'
import { useSessionStore } from '../../app/sessionStore'
import { BAND } from '../../sim/constants'
import { getWorld } from '../../sim/world'
import { bakeParts } from './bakeGeometry'
import { sceneryExtras, type DetailLevel } from './registry'
import {
  makeSignalChevronMarks,
  makeSignalRailMarks,
  streamedSignalY,
  type SignalSide,
} from './signalCorridorLayout'

type Props = {
  detail: DetailLevel
}

const proxy = new Object3D()
const SIGNAL_Z = 0.035

function edgeX(side: SignalSide, offset: number): number {
  return side === -1 ? BAND.minX - offset : BAND.maxX + offset
}

function writeInstance(
  mesh: InstancedMesh | null,
  index: number,
  x: number,
  y: number,
  sx: number,
  sy: number,
  rotZ = 0,
): void {
  if (!mesh) return
  proxy.position.set(x, y, SIGNAL_Z)
  proxy.scale.set(sx, sy, 1)
  proxy.rotation.set(0, 0, rotZ)
  proxy.updateMatrix()
  mesh.setMatrixAt(index, proxy.matrix)
}

function signalOpacity(detail: DetailLevel): number {
  if (detail === 'low') return 0.1
  if (detail === 'high') return 0.2
  return 0.17
}

export function SignalCorridor({ detail }: Props) {
  const reducedMotion = useSessionStore((state) => state.settings.reducedMotion)
  const extras = sceneryExtras(detail)
  const railMarks = useMemo(() => makeSignalRailMarks(extras.railDashCount), [extras.railDashCount])
  const chevronMarks = useMemo(
    () => makeSignalChevronMarks(extras.chevronCount),
    [extras.chevronCount],
  )

  const railRef = useRef<InstancedMesh>(null)
  const bracketRef = useRef<InstancedMesh>(null)
  const chevronRef = useRef<InstancedMesh>(null)
  const threatRef = useRef<InstancedMesh>(null)

  const railGeometry = useMemo(() => new BoxGeometry(0.045, 0.4, 0.018), [])
  const bracketGeometry = useMemo(() => new BoxGeometry(0.28, 0.038, 0.018), [])
  const chevronGeometry = useMemo(
    () =>
      bakeParts([
        { kind: 'box', sx: 0.028, sy: 0.13, sz: 0.018, x: -0.04, y: 0.035, rotZ: -0.52 },
        { kind: 'box', sx: 0.028, sy: 0.13, sz: 0.018, x: 0.04, y: 0.035, rotZ: 0.52 },
        { kind: 'box', sx: 0.025, sy: 0.11, sz: 0.018, x: -0.034, y: -0.075, rotZ: -0.52 },
        { kind: 'box', sx: 0.025, sy: 0.11, sz: 0.018, x: 0.034, y: -0.075, rotZ: 0.52 },
      ]),
    [],
  )
  const threatGeometry = useMemo(() => new BoxGeometry(0.032, 0.2, 0.018), [])

  const signalMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#5ee7ff',
        transparent: true,
        opacity: signalOpacity(detail),
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [detail],
  )
  const chevronMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#2a8cff',
        transparent: true,
        opacity: signalOpacity(detail) * 0.82,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [detail],
  )
  const threatMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ff9b42',
        transparent: true,
        opacity: 0.18,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  useLayoutEffect(
    () => () => {
      railGeometry.dispose()
      bracketGeometry.dispose()
      chevronGeometry.dispose()
      threatGeometry.dispose()
    },
    [bracketGeometry, chevronGeometry, railGeometry, threatGeometry],
  )
  useLayoutEffect(() => () => signalMaterial.dispose(), [signalMaterial])
  useLayoutEffect(() => () => chevronMaterial.dispose(), [chevronMaterial])
  useLayoutEffect(() => () => threatMaterial.dispose(), [threatMaterial])

  const writeMovingMarks = useCallback(
    (streamDistance: number) => {
      for (let index = 0; index < railMarks.length; index++) {
        const mark = railMarks[index]!
        const y = streamedSignalY(mark.y0, streamDistance, reducedMotion)
        writeInstance(
          railRef.current,
          index,
          edgeX(mark.side, 0.13),
          y,
          1,
          mark.lengthScale,
          mark.side * 0.045,
        )
        writeInstance(
          bracketRef.current,
          index,
          edgeX(mark.side, 0.015),
          y + 0.15,
          mark.bracket ? 1 : 0,
          mark.bracket ? 1 : 0,
        )
      }

      for (let index = 0; index < chevronMarks.length; index++) {
        const mark = chevronMarks[index]!
        const y = streamedSignalY(mark.y0, streamDistance, reducedMotion)
        const scale = 0.76 + mark.phase * 0.18
        writeInstance(
          chevronRef.current,
          index,
          edgeX(mark.side, 0.38),
          y,
          scale,
          scale,
        )
      }

      if (railRef.current) railRef.current.instanceMatrix.needsUpdate = true
      if (bracketRef.current) bracketRef.current.instanceMatrix.needsUpdate = true
      if (chevronRef.current) chevronRef.current.instanceMatrix.needsUpdate = true
    },
    [chevronMarks, railMarks, reducedMotion],
  )

  useLayoutEffect(() => {
    writeMovingMarks(getWorld().streamDistance)
  }, [writeMovingMarks])

  useFrame(() => {
    writeMovingMarks(getWorld().streamDistance)
  })

  useLayoutEffect(() => {
    let index = 0
    for (const side of [-1, 1] as const) {
      for (let row = 0; row < 2; row++) {
        writeInstance(
          threatRef.current,
          index++,
          edgeX(side, 0.13),
          BAND.maxY - 0.42 - row * 0.34,
          1,
          0.75 - row * 0.12,
          side * 0.12,
        )
      }
    }
    if (threatRef.current) threatRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={railRef}
        args={[railGeometry, signalMaterial, railMarks.length]}
        frustumCulled={false}
        renderOrder={-1}
      />
      <instancedMesh
        ref={bracketRef}
        args={[bracketGeometry, signalMaterial, railMarks.length]}
        frustumCulled={false}
        renderOrder={-1}
      />
      <instancedMesh
        ref={chevronRef}
        args={[chevronGeometry, chevronMaterial, chevronMarks.length]}
        frustumCulled={false}
        renderOrder={-1}
      />
      <instancedMesh
        ref={threatRef}
        args={[threatGeometry, threatMaterial, 4]}
        frustumCulled={false}
        renderOrder={-1}
      />
    </group>
  )
}
