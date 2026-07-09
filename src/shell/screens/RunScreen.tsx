import { useEffect } from 'react'
import { startInputListeners, stopInputListeners } from '../../input/sample'
import { getWorld } from '../../sim/world'
import { CanvasRoot } from '../../view/CanvasRoot'
import { RunHud } from '../hud/RunHud'

export function RunScreen() {
  useEffect(() => {
    startInputListeners()
    const onBlur = () => {
      getWorld().session.paused = true
    }
    window.addEventListener('blur', onBlur)
    return () => {
      stopInputListeners()
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return (
    <>
      <CanvasRoot />
      <RunHud />
    </>
  )
}
