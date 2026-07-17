const tones = {
  primary: 'bg-peach text-primary-dark',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger-text',
  neutral: 'bg-neutral-tag text-text-muted',
  green: 'bg-accent-green/40 text-success-text',
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
