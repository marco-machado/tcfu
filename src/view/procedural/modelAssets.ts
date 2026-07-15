import type { EnemyKind, ShipId } from '../../sim/types'
import { Box3, Group, type Object3D, Vector3 } from 'three'
import {
  ENEMY_SILHOUETTE_PROFILES,
  SHIP_SILHOUETTE_PROFILES,
  type SilhouetteProfile,
} from './registry'

type ModelDomain = 'ship' | 'enemy'
type ModelId<D extends ModelDomain> = D extends 'ship' ? ShipId : EnemyKind

export type ModelRole = 'hull' | 'panel' | 'emissive' | 'glass' | 'unknown'

type ModelTransform = {
  /** Fixup from authored coordinates into game +Y-forward coordinates. */
  rotation: readonly [number, number, number]
  scale: number
  position: readonly [number, number, number]
}

export type ModelAttachment = {
  position: readonly [number, number, number]
  scale: number
}

export type ModelSignalMarker = {
  position: readonly [number, number, number]
  size: readonly [number, number, number]
  highOnly?: boolean
}

export type ModelAsset = ModelTransform &
  (
    | { source: 'procedural'; url: null }
    | {
        source: 'glb'
        url: string
        thrusters: readonly ModelAttachment[]
        signals: readonly ModelSignalMarker[]
      }
  )

const procedural: ModelAsset = {
  source: 'procedural',
  url: null,
  rotation: [0, 0, 0],
  scale: 1,
  position: [0, 0, 0],
}

const SHIP_MODELS: Record<ShipId, ModelAsset> = {
  vanguard: {
    source: 'glb',
    url: `${import.meta.env.BASE_URL}assets/models/vanguard.glb`,
    rotation: [Math.PI / 2, Math.PI / 2, 0],
    scale: 1.95,
    position: [0, 0.15, 0],
    thrusters: [
      { position: [-0.15, -0.42, 0], scale: 1.1 },
      { position: [0.15, -0.42, 0], scale: 1.1 },
    ],
    signals: [
      { position: [-0.6, -0.28, 0.08], size: [0.14, 0.02, 0.02] },
      { position: [0.6, -0.28, 0.08], size: [0.14, 0.02, 0.02] },
      { position: [0, 0.28, 0.12], size: [0.025, 0.5, 0.015], highOnly: true },
    ],
  },
  striker: procedural,
  aegis: procedural,
  phantom: procedural,
}

const ENEMY_MODELS: Record<EnemyKind, ModelAsset> = {
  drone: procedural,
  dart: procedural,
  gunner: procedural,
  sidecar: procedural,
  razor: procedural,
  prism: procedural,
  colossus: procedural,
}

export function modelAsset<D extends ModelDomain>(domain: D, id: ModelId<D>): ModelAsset {
  return domain === 'ship'
    ? SHIP_MODELS[id as ShipId]
    : ENEMY_MODELS[id as EnemyKind]
}

export function glbShipAsset(shipId: ShipId): Extract<ModelAsset, { source: 'glb' }> {
  const asset = SHIP_MODELS[shipId]
  if (asset.source !== 'glb') throw new Error(`No GLB registered for ship ${shipId}`)
  return asset
}

/** Stable semantic naming seam for generated GLB nodes and materials. */
export function classifyModelRole(name: string): ModelRole {
  const normalized = name.toLowerCase()
  if (/glow|emissive|signal|engine|thruster/.test(normalized)) return 'emissive'
  if (/glass|canopy|cockpit/.test(normalized)) return 'glass'
  if (/panel|armor|plate|secondary/.test(normalized)) return 'panel'
  if (/hull|body|primary/.test(normalized)) return 'hull'
  return 'unknown'
}

type Bounds = { width: number; length: number }
type BoundsWarning = 'invalid-bounds' | 'silhouette-aspect'

function profileFor<D extends ModelDomain>(
  domain: D,
  id: ModelId<D>,
): SilhouetteProfile<string> {
  return domain === 'ship'
    ? SHIP_SILHOUETTE_PROFILES[id as ShipId]
    : ENEMY_SILHOUETTE_PROFILES[id as EnemyKind]
}

/** Validates the authored top-view outline without ever changing sim hitboxes. */
export function validateModelBounds<D extends ModelDomain>(
  domain: D,
  id: ModelId<D>,
  bounds: Bounds,
): BoundsWarning[] {
  if (bounds.width <= 0 || bounds.length <= 0) return ['invalid-bounds']
  const target = profileFor(domain, id).widthToLength
  const actual = bounds.width / bounds.length
  const relativeError = Math.abs(actual - target) / target
  return relativeError > 0.28 ? ['silhouette-aspect'] : []
}

/** Measures a loaded object after its catalog fixup, without changing combat bounds. */
export function validateModelObject<D extends ModelDomain>(
  domain: D,
  id: ModelId<D>,
  root: Object3D,
  transform: ModelTransform,
): BoundsWarning[] {
  const wrapper = new Group()
  wrapper.rotation.set(...transform.rotation)
  wrapper.scale.setScalar(transform.scale)
  wrapper.position.set(...transform.position)
  wrapper.add(root)
  wrapper.updateMatrixWorld(true)

  const size = new Box3().setFromObject(wrapper).getSize(new Vector3())
  wrapper.remove(root)
  return validateModelBounds(domain, id, { width: size.x, length: size.y })
}