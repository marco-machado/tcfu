import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { getWorld } from '../sim/world'

type RendererCounts = {
  calls: number
  triangles: number
  geometries: number
  textures: number
}

type Diagnostics = RendererCounts & {
  renderer: RendererCounts
  programs: number
  dpr: number
  fps: number
  wave: number
  enemies: number
  enemyBullets: number
  playerBullets: number
  powerups: number
}

declare global {
  interface Window {
    __THREE_GAME_DIAGNOSTICS__?: Diagnostics
  }
}

/** Publishes renderer + sim counts once per second for QA tooling. */
export function QualityDiagnostics() {
  const gl = useThree((s) => s.gl)
  const lastPublish = useRef(0)
  const frames = useRef(0)
  const windowStart = useRef(performance.now())

  // useFrame runs before render, so autoReset would zero the counters we
  // want to read. Read last frame's accumulation, then reset manually.
  useFrame(() => {
    gl.info.autoReset = false
    frames.current += 1
    const now = performance.now()
    if (now - lastPublish.current < 1000) {
      gl.info.reset()
      return
    }
    lastPublish.current = now
    const elapsed = (now - windowStart.current) / 1000
    const fps = elapsed > 0 ? frames.current / elapsed : 0
    frames.current = 0
    windowStart.current = now

    const world = getWorld()
    const info = gl.info
    const renderer: RendererCounts = {
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    }
    window.__THREE_GAME_DIAGNOSTICS__ = {
      ...renderer,
      renderer,
      programs: info.programs?.length ?? 0,
      dpr: gl.getPixelRatio(),
      fps: Math.round(fps * 10) / 10,
      wave: world.session.wave,
      enemies: world.enemies.filter((e) => e.active).length,
      enemyBullets: world.enemyBullets.filter((b) => b.active).length,
      playerBullets: world.playerBullets.filter((b) => b.active).length,
      powerups: world.powerups.filter((p) => p.active).length,
    }
    gl.info.reset()
  })

  return null
}
