import { Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './Button'

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-bg-alt/60 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-peach">
        <Sprout className="h-7 w-7 text-primary-dark" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-6">
          <Button variant="strong" size="sm">
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <div className="mt-6">
          <Button variant="strong" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
