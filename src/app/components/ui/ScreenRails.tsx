type Props = {
  code: string
}

export function ScreenRails({ code }: Props) {
  return (
    <div className="screen-rails" aria-hidden="true">
      <span>{code}</span>
      <span>TCFU flight OS 4.2</span>
    </div>
  )
}
