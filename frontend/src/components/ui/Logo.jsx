export function LogoMark({ className = 'h-8 w-8', color = '#FDA067' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill={color}
        d="M14 8c-4 2-8 8-8 16s4 14 8 16c3-1 5-4 6-8 1-4 1-8 0-12-1-4-3-7-6-12z"
      />
      <path
        fill={color}
        d="M34 8c4 2 8 8 8 16s-4 14-8 16c-3-1-5-4-6-8-1-4-1-8 0-12 1-4 3-7 6-12z"
      />
      <path
        fill="currentColor"
        className="text-bg"
        style={{ fill: 'var(--color-bg, #FDF9EE)' }}
        d="M24 16c-2 0-4 1.5-4 4v6c0 1.5.8 2.5 2 3.2V34h4v-4.8c1.2-.7 2-1.7 2-3.2v-6c0-2.5-2-4-4-4z"
      />
    </svg>
  )
}

export function Logo({
  showTagline = false,
  className = '',
  markClassName = 'h-8 w-8',
  color = '#FDA067',
  textColor,
}) {
  const wordColor = textColor || color
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} color={color} />
      <div className="leading-none">
        <div
          className="font-heading text-lg font-bold tracking-wide uppercase"
          style={{ color: wordColor }}
        >
          SEZAME
        </div>
        {showTagline && (
          <div className="text-xs font-medium opacity-80" style={{ color: wordColor }}>
            ouvre toi
          </div>
        )}
      </div>
    </div>
  )
}
