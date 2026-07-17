import { useEffect, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'
import { formatDateTime } from '@/lib/format'

export function ModerationPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('offer')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    try {
      setReports(await api.admin.listReports())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function disableOffer(id) {
    await api.admin.disableOffer(id)
    setMessage('Offre désactivée.')
    load()
  }

  const filtered = reports.filter((r) => r.targetType === tab)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold">Modération</h1>
      <p className="mt-1 text-sm text-text-muted">Offres et profils signalés.</p>
      {message && <p className="mt-3 text-sm text-success-text">{message}</p>}

      <div className="mt-6 flex gap-2">
        <Button
          size="sm"
          variant={tab === 'offer' ? 'strong' : 'outline'}
          onClick={() => setTab('offer')}
        >
          Offres
        </Button>
        <Button
          size="sm"
          variant={tab === 'profile' ? 'strong' : 'outline'}
          onClick={() => setTab('profile')}
        >
          Profils
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-text-muted">Chargement…</p>}
        {!loading && filtered.length === 0 && (
          <EmptyState title="Rien à modérer" description="Aucun signalement dans cette catégorie." />
        )}
        {filtered.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-heading font-semibold">
                  {r.title || (r.targetType === 'profile' ? `Profil ${r.targetId}` : r.targetId)}
                </h2>
                <p className="text-sm text-text-muted">
                  {r.companyName ? `${r.companyName} · ` : ''}
                  {formatDateTime(r.reportedAt)}
                </p>
                <Badge
                  tone={r.reason.toLowerCase().includes('spam') ? 'danger' : 'neutral'}
                  className="mt-2"
                >
                  {r.reason}
                </Badge>
              </div>
              <div className="flex gap-2">
                {r.targetType === 'offer' && (
                  <>
                    <Button size="sm" variant="outline" as-child={undefined}>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Voir
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => disableOffer(r.targetId)}
                    >
                      <Trash2 className="h-4 w-4" /> Désactiver
                    </Button>
                  </>
                )}
                {r.targetType === 'profile' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await api.admin.setAccountDisabled(r.targetId, true)
                      setMessage('Profil désactivé.')
                    }}
                  >
                    Désactiver le compte
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
