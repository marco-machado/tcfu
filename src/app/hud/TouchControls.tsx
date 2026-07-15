import { useEffect, useRef, useState } from 'react'
import { queueTouchBomb, setTouchMove } from '../../input/sample'

const STICK_RADIUS = 52

type StickState = {
  pointerId: number
  originX: number
  originY: number
  dx: number
  dy: number
}

/**
 * Left half: relative virtual stick (touch anywhere, drag to steer).
 * Right edge: bomb button. Touch play autofires via the input layer.
 */
export function TouchControls() {
  const [stick, setStick] = useState<StickState | null>(null)
  const zoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => setTouchMove(false, 0, 0), [])

  const updateStick = (state: StickState | null) => {
    setStick(state)
    if (!state) {
      setTouchMove(false, 0, 0)
      return
    }
    const nx = Math.max(-1, Math.min(1, state.dx / STICK_RADIUS))
    const ny = Math.max(-1, Math.min(1, -state.dy / STICK_RADIUS))
    setTouchMove(true, nx, ny)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stick) return
    e.currentTarget.setPointerCapture(e.pointerId)
    updateStick({ pointerId: e.pointerId, originX: e.clientX, originY: e.clientY, dx: 0, dy: 0 })
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stick || e.pointerId !== stick.pointerId) return
    updateStick({ ...stick, dx: e.clientX - stick.originX, dy: e.clientY - stick.originY })
  }

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stick || e.pointerId !== stick.pointerId) return
    updateStick(null)
  }

  const zoneRect = zoneRef.current?.getBoundingClientRect()
  const stickLeft = stick && zoneRect ? stick.originX - zoneRect.left : 0
  const stickTop = stick && zoneRect ? stick.originY - zoneRect.top : 0
  const thumbX = stick ? Math.max(-STICK_RADIUS, Math.min(STICK_RADIUS, stick.dx)) : 0
  const thumbY = stick ? Math.max(-STICK_RADIUS, Math.min(STICK_RADIUS, stick.dy)) : 0

  const forced =
    import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('touch=1')

  return (
    <div className={`touch-controls${forced ? ' is-forced' : ''}`} aria-hidden="true">
      <div
        ref={zoneRef}
        className="touch-stick-zone"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
      >
        {stick ? (
          <div className="touch-stick" style={{ left: stickLeft, top: stickTop }}>
            <div className="touch-stick-base" />
            <div
              className="touch-stick-thumb"
              style={{ transform: `translate(${thumbX}px, ${thumbY}px)` }}
            />
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="touch-bomb-btn"
        onPointerDown={(e) => {
          e.preventDefault()
          queueTouchBomb()
        }}
      >
        ✦
      </button>
    </div>
  )
}
