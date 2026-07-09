import { emptyCommands, type Commands } from './commands'

const keys = new Set<string>()
let bombWasDown = false
let pauseWasDown = false
let padBombWasDown = false
let padPauseWasDown = false

function onKeyDown(e: KeyboardEvent): void {
  keys.add(e.code)
  if (
    e.code === 'ArrowUp' ||
    e.code === 'ArrowDown' ||
    e.code === 'ArrowLeft' ||
    e.code === 'ArrowRight' ||
    e.code === 'Space'
  ) {
    e.preventDefault()
  }
}

function onKeyUp(e: KeyboardEvent): void {
  keys.delete(e.code)
}

let listening = false

export function startInputListeners(): void {
  if (listening) return
  listening = true
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
}

export function stopInputListeners(): void {
  if (!listening) return
  listening = false
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  keys.clear()
}

function axisFromKeys(neg: boolean, pos: boolean): number {
  return (pos ? 1 : 0) + (neg ? -1 : 0)
}

function applyDeadzone(x: number, y: number, dead: number): { x: number; y: number } {
  const mag = Math.hypot(x, y)
  if (mag <= dead) return { x: 0, y: 0 }
  const scale = Math.min(1, (mag - dead) / (1 - dead)) / mag
  return { x: x * scale, y: y * scale }
}

function sampleGamepad(commands: Commands): void {
  const pads = navigator.getGamepads?.()
  if (!pads) return

  let padBomb = false
  let padPause = false

  for (const pad of pads) {
    if (!pad) continue
    const raw = applyDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0, 0.15)
    if (Math.abs(raw.x) > Math.abs(commands.moveX)) commands.moveX = raw.x
    // gamepad Y: up is negative
    const stickY = -raw.y
    if (Math.abs(stickY) > Math.abs(commands.moveY)) commands.moveY = stickY

    const buttons = pad.buttons
    if (buttons[12]?.pressed) commands.moveY = Math.max(commands.moveY, 1)
    if (buttons[13]?.pressed) commands.moveY = Math.min(commands.moveY, -1)
    if (buttons[14]?.pressed) commands.moveX = Math.min(commands.moveX, -1)
    if (buttons[15]?.pressed) commands.moveX = Math.max(commands.moveX, 1)

    if (buttons[7]?.pressed || buttons[0]?.pressed) commands.fire = true
    if (buttons[6]?.pressed || buttons[1]?.pressed) padBomb = true
    if (buttons[9]?.pressed) padPause = true
  }

  if (padBomb && !padBombWasDown) commands.bomb = true
  padBombWasDown = padBomb
  if (padPause && !padPauseWasDown) commands.pause = true
  padPauseWasDown = padPause
}

export function sampleCommands(): Commands {
  const c = emptyCommands()

  const left = keys.has('KeyA') || keys.has('ArrowLeft')
  const right = keys.has('KeyD') || keys.has('ArrowRight')
  const back = keys.has('KeyS') || keys.has('ArrowDown')
  const forward = keys.has('KeyW') || keys.has('ArrowUp')

  c.moveX = axisFromKeys(left, right)
  c.moveY = axisFromKeys(back, forward)
  c.fire = keys.has('Space') || keys.has('KeyJ')

  const bombDown = keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('KeyK')
  if (bombDown && !bombWasDown) c.bomb = true
  bombWasDown = bombDown

  const pauseDown = keys.has('Escape') || keys.has('KeyP')
  if (pauseDown && !pauseWasDown) c.pause = true
  pauseWasDown = pauseDown

  sampleGamepad(c)
  return c
}
