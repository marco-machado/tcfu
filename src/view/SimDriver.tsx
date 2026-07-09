import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { sampleCommands } from '../input/sample'
import { FIXED_DT, MAX_SIM_STEPS } from '../sim/constants'
import { stepWorld } from '../sim/step'
import { getWorld } from '../sim/world'
import { useSessionStore } from '../app/sessionStore'

export function SimDriver() {
  const acc = useRef(0)
  const finished = useRef(false)
  const finishRunFromWorld = useSessionStore((s) => s.finishRunFromWorld)

  useFrame((_, delta) => {
    const world = getWorld()
    const commands = sampleCommands()

    if (commands.pause) {
      world.session.paused = !world.session.paused
    }

    if (world.session.paused) return

    if (world.session.runOver) {
      if (!finished.current) {
        finished.current = true
        finishRunFromWorld()
      }
      return
    }

    finished.current = false

    acc.current += Math.min(delta, 0.1)
    let steps = 0
    let bombEdge = commands.bomb
    while (acc.current >= FIXED_DT && steps < MAX_SIM_STEPS) {
      stepWorld(world, FIXED_DT, { ...commands, bomb: bombEdge })
      bombEdge = false
      acc.current -= FIXED_DT
      steps++
      if (world.session.runOver) break
    }

    if (world.session.runOver && !finished.current) {
      finished.current = true
      finishRunFromWorld()
    }
  })

  return null
}
