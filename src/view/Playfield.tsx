import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BoxGeometry, type Group, type Mesh } from 'three'
import { BAND } from '../sim/constants'
import { getWorld } from '../sim/world'

export function Playfield() {
  const width = BAND.maxX - BAND.minX
  const height = BAND.maxY - BAND.minY
  const cx = (BAND.minX + BAND.maxX) / 2
  const cy = (BAND.minY + BAND.maxY) / 2
  const bandGeo = useMemo(() => new BoxGeometry(width, height, 0.01), [width, height])

  return (
    <group>
      <mesh position={[0, 8, -0.08]}>
        <planeGeometry args={[28, 48]} />
        <meshStandardMaterial color="#0a1220" metalness={0.2} roughness={0.9} />
      </mesh>

      <mesh position={[cx, cy, -0.02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#123048" transparent opacity={0.35} />
      </mesh>

      <lineSegments position={[cx, cy, 0.02]}>
        <edgesGeometry args={[bandGeo]} />
        <lineBasicMaterial color="#3d8ec4" />
      </lineSegments>

      <StreamMarkers />
      <PlayerMesh />
    </group>
  )
}

function StreamMarkers() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const speed = getWorld().streamSpeed
    for (const child of g.children) {
      child.position.y -= speed * delta * 0.35
      if (child.position.y < -2) child.position.y += 18
    }
  })

  const markers = []
  for (let i = 0; i < 12; i++) {
    markers.push(
      <mesh key={i} position={[-5 + (i % 4) * 3.3, 6 + Math.floor(i / 4) * 5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#224466" emissive="#113344" emissiveIntensity={0.4} />
      </mesh>,
    )
  }

  return <group ref={group}>{markers}</group>
}

function PlayerMesh() {
  const mesh = useRef<Mesh>(null)

  useFrame(() => {
    const m = mesh.current
    if (!m) return
    const p = getWorld().player
    m.position.set(p.x, p.y, 0.2)
    const blink = p.iFrames > 0 && Math.floor(p.iFrames * 20) % 2 === 0
    m.visible = !blink
  })

  return (
    <mesh ref={mesh} position={[0, 3.5, 0.2]}>
      <boxGeometry args={[0.7, 1.0, 0.35]} />
      <meshStandardMaterial
        color="#7fd4ff"
        emissive="#2a88bb"
        emissiveIntensity={0.6}
        metalness={0.5}
        roughness={0.35}
      />
    </mesh>
  )
}
