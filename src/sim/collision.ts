export type Circle = { x: number; y: number; r: number }
export type Aabb = { x: number; y: number; w: number; h: number }

export function circleCircle(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const r = a.r + b.r
  return dx * dx + dy * dy <= r * r
}

export function circleAabb(c: Circle, b: Aabb): boolean {
  const nearestX = Math.max(b.x - b.w / 2, Math.min(c.x, b.x + b.w / 2))
  const nearestY = Math.max(b.y - b.h / 2, Math.min(c.y, b.y + b.h / 2))
  const dx = c.x - nearestX
  const dy = c.y - nearestY
  return dx * dx + dy * dy <= c.r * c.r
}
