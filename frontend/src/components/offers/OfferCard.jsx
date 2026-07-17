import { Link } from 'react-router-dom'
import { Bookmark, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatSalary } from '@/lib/format'

export function OfferCard({ offer, to, showApply = false, onApply }) {
  const href = to || `/offers/${offer.id}`
  return (
    <Card className="p-4 transition hover:border-primary/50 md:p-5">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-peach text-sm font-bold text-primary-dark">
          {(offer.company?.name || 'S').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={href} className="font-heading text-base font-semibold text-text hover:text-primary-dark">
                {offer.title}
              </Link>
              <p className="mt-0.5 text-sm text-text-muted">
                {offer.company?.name || 'Entreprise'} · {offer.city}
              </p>
            </div>
            <button type="button" className="rounded-full p-1.5 text-text-muted hover:bg-bg-alt" aria-label="Sauvegarder">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="neutral">
              <MapPin className="h-3 w-3" />
              {offer.city}
            </Badge>
            <Badge tone={offer.contractType === 'Freelance' ? 'green' : 'success'}>
              {offer.contractType}
            </Badge>
            {offer.workMode && <Badge tone="primary">{offer.workMode}</Badge>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                Salaire
              </p>
              <p className="font-heading text-sm font-bold text-primary-dark">
                {formatSalary(offer.minSalary, offer.maxSalary)}
              </p>
            </div>
            {showApply ? (
              <Button variant="strong" size="sm" onClick={onApply}>
                Postuler
              </Button>
            ) : (
              <Link to={href}>
                <Button variant="strong" size="sm">
                  Voir l’offre
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
