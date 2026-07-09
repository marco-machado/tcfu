import { useEffect } from 'react'
import { startInputListeners, stopInputListeners } from '../../input/sample'
import { CanvasRoot } from '../../view/CanvasRoot'
import { RunHud } from '../hud/RunHud'

export function RunScreen() {
  useEffect(() => {
    startInputListeners()
    return () => stopInputListeners()
  }, [])

  return (
    <>
      <CanvasRoot />
      <RunHud />
    </>
  )
}
