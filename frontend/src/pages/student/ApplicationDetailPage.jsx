import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'
import {
  applicationStatusLabel,
  applicationStatusTone,
  formatDateTime,
} from '@/lib/format'

export function ApplicationDetailPage() {
  const { id } = useParams()
  const [app, setApp] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.applications
      .get(id)
      .then(setApp)
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-danger-text">{error}</p>
  if (!app) return <p className="text-text-muted">Chargement…</p>

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/app/student/applications"
        className="inline-flex items-center gap-1 text-sm text-text-muted"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <Card className="mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold">{app.offer?.title}</h1>
            <p className="mt-1 text-text-muted">{app.offer?.company?.name}</p>
          </div>
          <Badge tone={applicationStatusTone[app.status]}>
            {applicationStatusLabel[app.status]}
          </Badge>
        </div>

        <h2 className="mt-8 font-heading text-lg font-semibold">Historique des statuts</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-border pl-4">
          {(app.history || []).map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="font-medium">{applicationStatusLabel[h.status] || h.status}</p>
              <p className="text-xs text-text-muted">{formatDateTime(h.at)}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
