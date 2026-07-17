const variants = {
  primary: 'bg-primary text-text hover:opacity-90',
  strong: 'bg-primary-dark text-white hover:opacity-90',
  outline:
    'bg-transparent border border-border text-text hover:border-primary-dark',
  ghost: 'bg-transparent text-primary-dark hover:bg-peach/40',
  danger: 'bg-danger-bg text-danger-text hover:opacity-90',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
