import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'
import { formatDate } from '@/lib/format'

export function RecruiterOffersPage() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setOffers(await api.recruiter.listOffers())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function closeOffer(id) {
    await api.offers.close(id)
    load()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mes offres publiées</h1>
          <p className="mt-1 text-sm text-text-muted">Statuts, candidats et actions.</p>
        </div>
        <Link to="/app/recruiter/offers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" /> Nouvelle offre
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-text-muted">Chargement…</p>}
        {!loading && offers.length === 0 && (
          <EmptyState
            title="Aucune offre"
            description="Publiez votre première offre pour attirer des talents."
            actionLabel="Créer une offre"
            actionTo="/app/recruiter/offers/new"
          />
        )}
        {offers.map((o) => (
          <Card key={o.id} className="p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading font-semibold">{o.title}</h2>
                <p className="text-sm text-text-muted">
                  {o.city} · échéance {formatDate(o.deadline)} · {o.applicants || 0} candidats
                </p>
              </div>
              <Badge tone={o.status === 'active' ? 'success' : 'neutral'}>{o.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/app/recruiter/offers/${o.id}/applications`}>
                <Button size="sm" variant="strong">
                  Candidatures
                </Button>
              </Link>
              <Link to={`/app/recruiter/offers/${o.id}/edit`}>
                <Button size="sm" variant="outline">
                  Modifier
                </Button>
              </Link>
              {o.status === 'active' && (
                <Button size="sm" variant="ghost" onClick={() => closeOffer(o.id)}>
                  Clôturer
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
