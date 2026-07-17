import { visualDebugMode } from '../../app/debugMode'
import { DeepSpaceWorld } from './DeepSpaceWorld'
import type { DetailLevel } from './registry'
import { SignalCorridor } from './SignalCorridor'

type Props = {
  detail: DetailLevel
}

export function WorldCorridor({ detail }: Props) {
  return (
    <>
      <DeepSpaceWorld detail={detail} mode={visualDebugMode()} />
      <SignalCorridor detail={detail} />
    </>
  )
}
