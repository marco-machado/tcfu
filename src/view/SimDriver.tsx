import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { sampleCommands } from '../input/sample'
import { FIXED_DT, MAX_SIM_STEPS } from '../sim/constants'
import { stepWorld } from '../sim/step'
import { getWorld } from '../sim/world'
import { useSessionStore } from '../app/sessionStore'

export function SimDriver() {
  const acc = useRef(0)
  const endRun = useSessionStore((s) => s.endRun)

  useFrame((_, delta) => {
    const world = getWorld()
    const commands = sampleCommands()

    if (commands.pause) {
      world.session.paused = !world.session.paused
    }

    if (world.session.paused) return

    acc.current += Math.min(delta, 0.1)
    let steps = 0
    while (acc.current >= FIXED_DT && steps < MAX_SIM_STEPS) {
      stepWorld(world, FIXED_DT, commands)
      acc.current -= FIXED_DT
      steps++
    }

    // Scaffold: no death loop yet — endRun reserved for vertical slice
    void endRun
  })

  return null
}
