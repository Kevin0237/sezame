import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'
import {
  applicationStatusLabel,
  applicationStatusTone,
  formatDate,
} from '@/lib/format'

export function OfferApplicationsPage() {
  const { id } = useParams()
  const [apps, setApps] = useState([])
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [o, list] = await Promise.all([
        api.offers.get(id),
        api.applications.listForOffer(id),
      ])
      setOffer(o)
      setApps(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function changeStatus(appId, status) {
    await api.applications.updateStatus(appId, { status })
    load()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/app/recruiter/offers"
        className="inline-flex items-center gap-1 text-sm text-text-muted"
      >
        <ArrowLeft className="h-4 w-4" /> Mes offres
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold">
        Candidatures — {offer?.title || '…'}
      </h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-text-muted">Chargement…</p>}
        {!loading && apps.length === 0 && (
          <EmptyState title="Aucune candidature" description="Revenez plus tard." />
        )}
        {apps.map((a) => (
          <Card key={a.id} className="p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <img
                  src={
                    a.candidate?.avatar ||
                    `https://api.dicebear.com/9.x/initials/svg?seed=${a.candidate?.name || 'C'}`
                  }
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/app/recruiter/candidates/${a.userId}`}
                    className="font-heading font-semibold hover:text-primary-dark"
                  >
                    {a.candidate?.name}
                  </Link>
                  <p className="text-sm text-text-muted">
                    {a.profile?.title || 'Candidat'} · {formatDate(a.appliedAt)}
                  </p>
                  <Badge tone={applicationStatusTone[a.status]} className="mt-2">
                    {applicationStatusLabel[a.status]}
                  </Badge>
                </div>
              </div>
              <Select
                value={a.status}
                onChange={(e) => changeStatus(a.id, e.target.value)}
                className="w-44"
              >
                <option value="submitted">Envoyée</option>
                <option value="viewed">Vue</option>
                <option value="in_review">En cours</option>
                <option value="rejected">Refusée</option>
                <option value="accepted">Acceptée</option>
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
