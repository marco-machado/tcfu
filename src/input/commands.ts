export type Commands = {
  moveX: number
  moveY: number
  fire: boolean
  bomb: boolean
  pause: boolean
  confirm: boolean
  cancel: boolean
}

export function emptyCommands(): Commands {
  return {
    moveX: 0,
    moveY: 0,
    fire: false,
    bomb: false,
    pause: false,
    confirm: false,
    cancel: false,
  }
}
