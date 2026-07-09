import { describe, expect, it } from 'vitest'
import {
  ALL_PATTERN_IDS,
  EASY_LINE_DRONES,
  INTRO_01,
  INTRO_02,
  INTRO_03,
  isSetPieceWave,
  MID_ELITE_RAZOR,
  MID_PRISM_BURST,
  patternForWave,
  SET_COLOSSUS,
  SET_COLOSSUS_PRISM,
} from './patterns'

describe('wave playlist', () => {
  it('exposes all 24 catalog pattern ids', () => {
    expect(new Set(ALL_PATTERN_IDS).size).toBe(24)
  })

  it('uses fixed intro for waves 1–3', () => {
    expect(patternForWave(1).id).toBe(INTRO_01.id)
    expect(patternForWave(2).id).toBe(INTRO_02.id)
    expect(patternForWave(3).id).toBe(INTRO_03.id)
  })

  it('keeps wave 5 in the easy pool without elite force', () => {
    const p = patternForWave(5)
    expect(p.id.startsWith('easy_')).toBe(true)
    expect(p.id).not.toMatch(/razor|prism|colossus/)
  })

  it('cycles easy patterns for early non-set-piece waves', () => {
    expect(patternForWave(4).id).toBe(EASY_LINE_DRONES.id)
    expect(patternForWave(4).id).toBe(patternForWave(4).id)
    for (const w of [4, 5, 6, 7, 8, 9]) {
      expect(patternForWave(w).id.startsWith('easy_')).toBe(true)
    }
  })

  it('schedules set-pieces on wave 10/20/30 alternating patterns', () => {
    expect(isSetPieceWave(10)).toBe(true)
    expect(isSetPieceWave(20)).toBe(true)
    expect(isSetPieceWave(30)).toBe(true)
    expect(isSetPieceWave(5)).toBe(false)
    expect(patternForWave(10).id).toBe(SET_COLOSSUS.id)
    expect(patternForWave(20).id).toBe(SET_COLOSSUS_PRISM.id)
    expect(patternForWave(30).id).toBe(SET_COLOSSUS.id)
    expect(patternForWave(40).id).toBe(SET_COLOSSUS_PRISM.id)
  })

  it('uses mid pool for 11–19 and elite-tagged mid on wave 15', () => {
    for (const w of [11, 12, 13, 14, 16, 17, 18, 19]) {
      expect(patternForWave(w).id.startsWith('mid_')).toBe(true)
    }
    const elite = patternForWave(15)
    expect([MID_ELITE_RAZOR.id, MID_PRISM_BURST.id]).toContain(elite.id)
  })

  it('uses late pool for 21+ non-set-piece and elite-tagged on wave 25', () => {
    expect(patternForWave(21).id.startsWith('late_')).toBe(true)
    expect(patternForWave(22).id.startsWith('late_')).toBe(true)
    const elite = patternForWave(25)
    expect(elite.id.startsWith('late_')).toBe(true)
    expect(['late_razor_pair', 'late_mixed_elites', 'late_prism_grid']).toContain(elite.id)
  })

  it('is deterministic for the same wave index', () => {
    for (const w of [7, 15, 25, 33]) {
      expect(patternForWave(w).id).toBe(patternForWave(w).id)
    }
  })
})
