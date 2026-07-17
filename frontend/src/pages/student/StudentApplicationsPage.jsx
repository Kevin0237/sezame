import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'
import {
  applicationStatusLabel,
  applicationStatusTone,
  formatDate,
} from '@/lib/format'

export function StudentApplicationsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.applications
      .listMine()
      .then(setApps)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold">Mes candidatures</h1>
      <p className="mt-1 text-sm text-text-muted">Suivez le statut de chaque candidature.</p>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-text-muted">Chargement…</p>}
        {!loading && apps.length === 0 && (
          <EmptyState
            title="Pas encore de candidature"
            description="Explorez les offres et postulez en un clic."
            actionLabel="Voir les offres"
            actionTo="/app/student/offers"
          />
        )}
        {apps.map((a) => (
          <Card key={a.id} className="p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  to={`/app/student/applications/${a.id}`}
                  className="font-heading font-semibold hover:text-primary-dark"
                >
                  {a.offer?.title}
                </Link>
                <p className="text-sm text-text-muted">
                  {a.offer?.company?.name} · {formatDate(a.appliedAt)}
                </p>
              </div>
              <Badge tone={applicationStatusTone[a.status]}>
                {applicationStatusLabel[a.status]}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
