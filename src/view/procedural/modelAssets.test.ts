import { describe, expect, it } from 'vitest'
import {
  classifyModelRole,
  glbShipAsset,
  modelAsset,
  validateModelBounds,
} from './modelAssets'

describe('model asset contract', () => {
  it('keeps authored GLBs behind the same catalog-id registry as procedural fallbacks', () => {
    expect(modelAsset('ship', 'vanguard').source).toBe('glb')
    expect(modelAsset('ship', 'striker').source).toBe('procedural')
    expect(modelAsset('enemy', 'colossus').source).toBe('procedural')
  })

  it('provides the generic GLB renderer with authored fixups and gameplay attachments', () => {
    const asset = glbShipAsset('vanguard')
    expect(asset.url).toMatch(/vanguard\.glb$/)
    expect(asset.thrusters).toHaveLength(2)
    expect(asset.signals.some((signal) => signal.highOnly)).toBe(true)
    expect(() => glbShipAsset('striker')).toThrow(/No GLB registered/)
  })

  it('classifies future GLB node and material names into stable visual roles', () => {
    expect(classifyModelRole('Hull_Primary')).toBe('hull')
    expect(classifyModelRole('armor-panel_02')).toBe('panel')
    expect(classifyModelRole('ENG_glow_cyan')).toBe('emissive')
    expect(classifyModelRole('cockpit_glass')).toBe('glass')
    expect(classifyModelRole('mesh_42')).toBe('unknown')
  })

  it('rejects GLB bounds that erase the catalog silhouette', () => {
    expect(validateModelBounds('ship', 'aegis', { width: 1.9, length: 1.5 })).toEqual([])
    expect(validateModelBounds('ship', 'aegis', { width: 0.7, length: 1.8 })).toContain(
      'silhouette-aspect',
    )
    expect(validateModelBounds('enemy', 'colossus', { width: 3.8, length: 1.9 })).toEqual([])
  })
})