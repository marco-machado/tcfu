/** Map player velocity to thruster plume intensity (view-only, not sim authority). */
export function thrustIntensity(vx: number, vy: number, maxSpeed = 8): number {
  const speed = Math.hypot(vx, vy)
  const norm = maxSpeed > 0 ? speed / maxSpeed : 0
  const forward = maxSpeed > 0 ? Math.max(0, vy) / maxSpeed : 0
  const lateral = maxSpeed > 0 ? Math.min(1, Math.abs(vx) / maxSpeed) : 0
  return Math.min(1.45, 0.48 + norm * 0.55 + forward * 0.28 + lateral * 0.12)
}

/** Steady plume level for Hangar preview (no live velocity). */
export const PREVIEW_THRUST = 0.88
