import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'
import { formatDateTime } from '@/lib/format'
import { CheckCircle2, Flag, UserPlus } from 'lucide-react'

export function AdminDashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.admin.getDashboard().then(setData).catch(() => {})
  }, [])

  if (!data) return <p className="text-text-muted">Chargement…</p>

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Vue d’ensemble</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Utilisateurs actifs
          </p>
          <p className="mt-2 font-heading text-3xl font-bold">
            {(data.activeUsers / 1000).toFixed(1)}k
          </p>
          <p className="mt-2 text-xs text-success-text">+14% vs hier</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Offres à modérer
          </p>
          <p className="mt-2 font-heading text-3xl font-bold">{data.offersToModerate}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-border">
            <div className="h-full w-2/3 rounded-pill bg-primary" />
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Entreprises en attente
          </p>
          <p className="mt-2 font-heading text-3xl font-bold">{data.pendingCompanies}</p>
          <p className="mt-2 text-xs text-text-muted">Vérification prioritaire requise.</p>
        </Card>
        <Card className="bg-primary-dark p-5 text-white">
          <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
            Taux de conversion
          </p>
          <p className="mt-2 font-heading text-3xl font-bold">{data.conversionRate}%</p>
          <p className="mt-2 text-xs text-white/80">Objectif mensuel : 10%</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">
                Vérification des entreprises
              </h2>
              <Link to="/app/admin/verifications" className="text-sm text-primary-dark">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {data.verifications.slice(0, 4).map((v) => (
                <div key={v.userId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{v.companyName}</p>
                    <p className="text-xs text-text-muted">
                      {v.city} · {formatDateTime(v.submitted_at)}
                    </p>
                  </div>
                  <Badge tone="neutral">Document PDF</Badge>
                </div>
              ))}
              {data.verifications.length === 0 && (
                <p className="text-sm text-text-muted">Aucune demande en attente.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Modération des offres</h2>
              <Badge tone="warning">{data.reports.length} signalements</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wider text-text-muted uppercase">
                    <th className="pb-2">Titre</th>
                    <th className="pb-2">Motif</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reports
                    .filter((r) => r.targetType === 'offer')
                    .slice(0, 5)
                    .map((r) => (
                      <tr key={r.id} className="border-b border-border/70">
                        <td className="py-3">{r.title || r.targetId}</td>
                        <td className="py-3">
                          <span
                            className={
                              r.reason.toLowerCase().includes('spam')
                                ? 'text-danger-text'
                                : 'text-text-muted'
                            }
                          >
                            {r.reason}
                          </span>
                        </td>
                        <td className="py-3">
                          <Link
                            to="/app/admin/moderation"
                            className="text-primary-dark hover:underline"
                          >
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-heading text-lg font-semibold">Répartition géographique</h2>
            <div className="mt-4 space-y-3">
              {data.geo.map((g) => (
                <div key={g.city}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{g.city}</span>
                    <span className="text-text-muted">
                      {g.percent}% · {g.count.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-pill bg-border">
                    <div
                      className="h-full rounded-pill bg-primary-dark"
                      style={{ width: `${g.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-heading text-lg font-semibold">Logs d’activités</h2>
            <ul className="mt-4 space-y-3">
              {data.logs.slice(0, 6).map((l) => (
                <li key={l.id} className="flex gap-3 text-sm">
                  {l.type === 'verification' && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-text" />
                  )}
                  {l.type === 'report' && <Flag className="mt-0.5 h-4 w-4 text-warning-text" />}
                  {l.type === 'signup' && <UserPlus className="mt-0.5 h-4 w-4 text-primary-dark" />}
                  <div>
                    <p>{l.message}</p>
                    <p className="text-xs text-text-muted">{formatDateTime(l.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
