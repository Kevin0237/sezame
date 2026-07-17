export function Input({
  label,
  id,
  error,
  className = '',
  icon: Icon,
  ...props
}) {
  const inputId = id || props.name
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      )}
      <span className="relative block">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
        )}
        <input
          id={inputId}
          className={`w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-text outline-none transition focus:border-primary-dark ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-danger-text' : ''}`}
          {...props}
        />
      </span>
      {error && <span className="mt-1 block text-xs text-danger-text">{error}</span>}
    </label>
  )
}

export function Select({ label, id, error, className = '', children, ...props }) {
  const selectId = id || props.name
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      )}
      <select
        id={selectId}
        className={`w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-text outline-none transition focus:border-primary-dark ${
          error ? 'border-danger-text' : ''
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-danger-text">{error}</span>}
    </label>
  )
}

export function Textarea({ label, id, error, className = '', ...props }) {
  const areaId = id || props.name
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      )}
      <textarea
        id={areaId}
        className={`w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-text outline-none transition focus:border-primary-dark min-h-28 ${
          error ? 'border-danger-text' : ''
        }`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-danger-text">{error}</span>}
    </label>
  )
}
