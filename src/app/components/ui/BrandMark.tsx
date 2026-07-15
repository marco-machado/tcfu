type BrandMarkProps = {
  className?: string
  decorative?: boolean
}

export function BrandMark({ className = '', decorative = false }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : 'TCFU corridor insignia'}
    >
      <path className="brand-mark-rail" d="M12 18h24v8H20v44h16v8H12z" />
      <path className="brand-mark-rail" d="M84 18H60v8h16v44H60v8h24z" />
      <path className="brand-mark-vector" d="m48 8 12 18-8 7v23l9 6-13 26-13-26 9-6V33l-8-7z" />
      <path className="brand-mark-cut" d="m48 24 4 6-4 4-4-4zm0 42 5 3-5 9-5-9z" />
      <path className="brand-mark-signal" d="M24 40h12v5H24zm36 0h12v5H60z" />
    </svg>
  )
}
