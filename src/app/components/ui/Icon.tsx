import type { SVGProps } from 'react'

export type IconName =
  | 'aegis'
  | 'arsenal'
  | 'audio'
  | 'back'
  | 'bomb'
  | 'bounty'
  | 'career'
  | 'controls'
  | 'display'
  | 'hull'
  | 'lance'
  | 'launch'
  | 'lock'
  | 'options'
  | 'overclock'
  | 'pause'
  | 'phantom'
  | 'salvage'
  | 'scrap'
  | 'shield'
  | 'striker'
  | 'thrust'
  | 'upgrade'
  | 'vanguard'
  | 'wcell'
  | 'wing'

type Props = SVGProps<SVGSVGElement> & {
  name: IconName
}

export function Icon({ name, className = '', ...props }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...props}
    >
      {name === 'career' && <><path d="M5 19V7l7-4 7 4v12" /><path d="M8 11h8M8 15h8" /><path d="M3 19h18" /></>}
      {name === 'scrap' && <><path d="m12 2 7 4v8l-7 8-7-8V6l7-4Z" /><path d="m8 7 4-2 4 2-2 9-2 3-2-3-2-9Z" /></>}
      {name === 'launch' && <><path d="m12 2 5 9-2 8-3-2-3 2-2-8 5-9Z" /><path d="M12 7v8M7 13H4l2 4M17 13h3l-2 4" /></>}
      {name === 'upgrade' && <><path d="M4 18h16M6 14h12M8 10h8" /><path d="m12 2 4 5h-8l4-5Z" /></>}
      {name === 'back' && <><path d="M20 12H5" /><path d="m10 6-6 6 6 6" /></>}
      {name === 'lock' && <><path d="M6 10h12v10H6z" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></>}
      {name === 'arsenal' && <><path d="M3 12h12M12 8l5 4-5 4" /><path d="M5 7v10M19 8v8M22 10v4" /></>}
      {name === 'hull' && <><path d="m12 2 8 4-2 10-6 6-6-6L4 6l8-4Z" /><path d="m12 6 4 2-1 6-3 3-3-3-1-6 4-2Z" /></>}
      {name === 'salvage' && <><path d="m12 3 7 5-3 9-4 4-4-4-3-9 7-5Z" /><path d="M8 10h8M10 7l-2 3 4 6 4-6-2-3" /></>}
      {name === 'thrust' && <><path d="m7 3 4 6-4 4-4-4 4-6ZM17 3l4 6-4 4-4-4 4-6Z" /><path d="m5 15 2 6 2-6M15 15l2 6 2-6" /></>}
      {name === 'shield' && <><path d="m12 2 8 4-2 10-6 6-6-6L4 6l8-4Z" /><path d="M12 6v11" /></>}
      {name === 'wing' && <><path d="m12 3 3 8 6 7-6-2-3 5-3-5-6 2 6-7 3-8Z" /><path d="M12 7v9" /></>}
      {name === 'bomb' && <><path d="m12 3 7 7-7 11-7-11 7-7Z" /><path d="m8 10 4-3 4 3-4 6-4-6ZM18 4l2-2M20 6h2" /></>}
      {name === 'lance' && <><path d="M12 2v20M8 7l4-5 4 5M6 12h12M8 17h8" /></>}
      {name === 'wcell' && <><path d="m12 2 7 5v10l-7 5-7-5V7l7-5Z" /><path d="m8 8 2 8 2-5 2 5 2-8" /></>}
      {name === 'overclock' && <><path d="m9 3 6 6-3 3 3 3-6 6" /><path d="m4 3 6 6-3 3 3 3-6 6" /></>}
      {name === 'options' && <><path d="M12 21V8M12 8 4 17M12 8l8 9" /><path d="M12 3v5M4 17v3M20 17v3" /></>}
      {name === 'display' && <><path d="M3 5h18v12H3V5Z" /><path d="M12 17v4M7 21h10" /></>}
      {name === 'audio' && <><path d="M4 9h4l5-5v16l-5-5H4V9Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /></>}
      {name === 'controls' && <><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" /><path d="M12 8v8M8 12h8" /></>}
      {name === 'pause' && <><path d="M9 4v16M15 4v16" /></>}
      {name === 'bounty' && <><path d="m12 2 8 7-3 10-5 3-5-3L4 9l8-7Z" /><path d="m8 9 4-3 4 3-4 8-4-8Z" /></>}
      {name === 'vanguard' && <><path d="m12 2 4 10 6 7-7-2-3 5-3-5-7 2 6-7 4-10Z" /><path d="M12 6v11" /></>}
      {name === 'striker' && <><path d="m12 3 3 7 7 7-8-2-2 6-2-6-8 2 7-7 3-7Z" /><path d="M6 10h12" /></>}
      {name === 'aegis' && <><path d="m12 4 4 6 6 5-7 1-3 5-3-5-7-1 6-5 4-6Z" /><path d="M7 11h10M12 7v10" /></>}
      {name === 'phantom' && <><path d="m12 2 3 9 7 4-8 1-2 6-2-6-8-1 7-4 3-9Z" /><path d="m5 18 4-7M19 18l-4-7" /></>}
    </svg>
  )
}
