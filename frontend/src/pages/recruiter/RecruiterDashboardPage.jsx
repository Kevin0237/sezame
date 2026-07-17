import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Eye, Plus, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function RecruiterDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.dashboard.recruiter().then(setData).catch(() => {})
  }, [])

  if (!data) return <p className="text-text-muted">Chargement…</p>

  const blocked = user?.verificationStatus !== 'verified'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">
            Bonjour, {user?.name || 'Recruteur'}
          </h1>
          <p className="mt-1 text-text-muted">
            Gérez vos offres et candidatures depuis un seul endroit.
          </p>
        </div>
        <Link to={blocked ? '/app/recruiter/verification' : '/app/recruiter/offers/new'}>
          <Button variant="primary">
            <Plus className="h-4 w-4" /> Créer une nouvelle offre
          </Button>
        </Link>
      </div>

      {blocked && (
        <Card className="mt-4 border-warning-text/30 bg-warning-bg/40 p-4 text-sm">
          Votre entreprise n’est pas encore vérifiée.{' '}
          <Link to="/app/recruiter/verification" className="font-semibold text-primary-dark">
            Voir le statut →
          </Link>
        </Card>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5 md:col-span-1">
          <div className="flex items-center gap-2 text-text-muted">
            <Users className="h-4 w-4" /> Total candidatures
          </div>
          <p className="mt-2 font-heading text-3xl font-bold">{data.totalApplications}</p>
          <p className="mt-2 text-xs text-success-text">
            {data.newApplications} nouvelles · {data.inInterview} en entretien
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-text-muted">
            <Briefcase className="h-4 w-4" /> Offres actives
          </div>
          <p className="mt-2 font-heading text-3xl font-bold">{data.activeOffers}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-text-muted">
            <Eye className="h-4 w-4" /> Vues
          </div>
          <p className="mt-2 font-heading text-3xl font-bold">
            {(data.views / 1000).toFixed(1)}k
          </p>
          <p className="mt-2 text-xs text-text-muted">Sur les 30 derniers jours</p>
        </Card>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Offres récentes</h2>
            <Link to="/app/recruiter/offers" className="text-sm text-primary-dark">
              Tout voir
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wider text-text-muted uppercase">
                  <th className="pb-2 font-medium">Poste</th>
                  <th className="pb-2 font-medium">Candidats</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOffers.map((o) => (
                  <tr key={o.id} className="border-b border-border/70">
                    <td className="py-3">
                      <Link
                        to={`/app/recruiter/offers/${o.id}/applications`}
                        className="font-medium hover:text-primary-dark"
                      >
                        {o.title}
                      </Link>
                    </td>
                    <td className="py-3">{o.applicants}</td>
                    <td className="py-3">
                      <Badge tone={o.status === 'active' ? 'success' : 'neutral'}>
                        {o.status === 'active' ? 'Actif' : o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold">Talents suggérés</h2>
          <div className="mt-4 space-y-4">
            {data.suggestedTalents.map((t) => (
              <div key={t.id} className="flex gap-3">
                <img
                  src={
                    t.user?.avatar ||
                    `https://api.dicebear.com/9.x/initials/svg?seed=${t.user?.name || 'T'}`
                  }
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <Link
                    to={`/app/recruiter/candidates/${t.userId}`}
                    className="font-medium hover:text-primary-dark"
                  >
                    {t.user?.name}
                  </Link>
                  <p className="text-xs text-text-muted">{t.title || 'Candidat'}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(t.skills || []).slice(0, 3).map((s) => (
                      <Badge key={s} tone="neutral">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
