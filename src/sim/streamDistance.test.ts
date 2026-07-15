import { describe, expect, it } from 'vitest'
import { emptyCommands } from '../input/commands'
import { FIXED_DT } from './constants'
import { stepWorld } from './step'
import { createWorld } from './world'

describe('world stream distance', () => {
  it('advances from fixed-step simulation time and freezes while paused', () => {
    const world = createWorld('vanguard')
    const distancePerStep = world.streamSpeed * FIXED_DT

    stepWorld(world, FIXED_DT, emptyCommands())
    expect(world.streamDistance).toBeCloseTo(distancePerStep)

    world.session.paused = true
    stepWorld(world, FIXED_DT, emptyCommands())
    expect(world.streamDistance).toBeCloseTo(distancePerStep)
  })

  it('continues deterministically through the death hold until paused', () => {
    const world = createWorld('vanguard')
    world.session.runOver = true

    stepWorld(world, FIXED_DT, emptyCommands())
    expect(world.streamDistance).toBeCloseTo(world.streamSpeed * FIXED_DT)

    world.session.paused = true
    stepWorld(world, FIXED_DT, emptyCommands())
    expect(world.streamDistance).toBeCloseTo(world.streamSpeed * FIXED_DT)
  })
})
