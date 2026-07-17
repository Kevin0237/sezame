import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'
import { formatDateTime } from '@/lib/format'

export function VerificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    try {
      setItems(await api.admin.listVerifications())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function resolve(userId, action) {
    await api.admin.resolveVerification(userId, { action })
    setMessage(action === 'approve' ? 'Entreprise approuvée.' : 'Demande refusée.')
    load()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">File de vérification recruteurs</h1>
      <p className="mt-1 text-sm text-text-muted">
        Examinez les documents et approuvez ou refusez.
      </p>
      {message && <p className="mt-3 text-sm text-success-text">{message}</p>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-text-muted">Chargement…</p>}
        {!loading && items.length === 0 && (
          <EmptyState title="File vide" description="Aucune demande en attente." />
        )}
        {items.map((v) => (
          <Card key={v.userId} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-heading font-semibold">{v.companyName}</h2>
                <p className="text-sm text-text-muted">
                  {v.city} · {v.email} · {formatDateTime(v.submitted_at)}
                </p>
                <a
                  href={v.doc_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-primary-dark"
                >
                  Voir le document →
                </a>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="strong" onClick={() => resolve(v.userId, 'approve')}>
                  Approuver
                </Button>
                <Button size="sm" variant="danger" onClick={() => resolve(v.userId, 'reject')}>
                  Refuser
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
