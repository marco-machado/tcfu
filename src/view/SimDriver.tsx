import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { sampleCommands } from '../input/sample'
import { presentationFxState } from '../presentation/fxState'
import { FIXED_DT, MAX_SIM_STEPS } from '../sim/constants'
import { isRunReadyForResults, stepWorld } from '../sim/step'
import { getWorld } from '../sim/world'
import { useSessionStore } from '../app/sessionStore'
import { debugTimeScale } from '../app/debugMode'
import { setMusicGamePaused } from '../audio/bus'

export function SimDriver() {
  const acc = useRef(0)
  const finished = useRef(false)
  const finishRunFromWorld = useSessionStore((s) => s.finishRunFromWorld)

  useFrame((_, delta) => {
    const world = getWorld()
    const commands = sampleCommands()

    if (commands.pause && !world.session.runOver) {
      world.session.paused = !world.session.paused
    }

    setMusicGamePaused(world.session.paused && !world.session.runOver)

    if (world.session.paused && !world.session.runOver) return

    if (world.session.runOver) {
      acc.current += Math.min(delta, 0.1)
      let steps = 0
      while (acc.current >= FIXED_DT && steps < MAX_SIM_STEPS) {
        stepWorld(world, FIXED_DT, commands)
        acc.current -= FIXED_DT
        steps++
      }

      if (isRunReadyForResults(world) && !finished.current) {
        finished.current = true
        finishRunFromWorld()
      }
      return
    }

    finished.current = false

    // Hitstop: gameplay accumulation slows; render/FX keep the real delta.
    const fx = presentationFxState
    let timeScale = 1
    if (fx.hitstopRemaining > 0) {
      fx.hitstopRemaining = Math.max(0, fx.hitstopRemaining - delta)
      timeScale = fx.hitstopRemaining > 0 ? fx.hitstopScale : 1
    }
    const autoFire = useSessionStore.getState().settings.autoFire

    acc.current += Math.min(delta, 0.1) * timeScale * debugTimeScale()
    let steps = 0
    let bombEdge = commands.bomb
    while (acc.current >= FIXED_DT && steps < MAX_SIM_STEPS) {
      stepWorld(world, FIXED_DT, { ...commands, fire: commands.fire || autoFire, bomb: bombEdge })
      bombEdge = false
      acc.current -= FIXED_DT
      steps++
      if (world.session.runOver) break
    }
  })

  return null
}
