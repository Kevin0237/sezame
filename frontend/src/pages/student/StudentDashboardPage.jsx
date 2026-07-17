import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Shield } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/api/client'
import { applicationStatusLabel, applicationStatusTone, formatSalary } from '@/lib/format'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [apps, setApps] = useState([])
  const [offers, setOffers] = useState([])

  useEffect(() => {
    api.profile.getMe().then(setProfile).catch(() => {})
    api.applications.listMine().then(setApps).catch(() => {})
    api.offers.list({}).then((r) => setOffers(r.offers.slice(0, 3))).catch(() => {})
  }, [])

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Ami'
  const score = profile?.completionScore ?? 0

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">
        Bonjour, {firstName} !
      </h1>
      <p className="mt-1 text-text-muted">Prêt pour une nouvelle opportunité ?</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
            <Shield className="h-4 w-4" /> Votre profil
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-text">{score}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-pill bg-border">
            <div
              className="h-full rounded-pill bg-primary-dark"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Complétez votre portfolio pour plus de visibilité.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
            <ClipboardCheck className="h-4 w-4" /> Candidatures
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-text">
            {apps.length} actives
          </p>
          <Badge tone="success" className="mt-3">
            +{Math.min(apps.length, 2)} cette semaine
          </Badge>
        </Card>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Offres suggérées</h2>
          <Link to="/app/student/offers" className="text-sm font-medium text-primary-dark">
            Tout voir
          </Link>
        </div>
        <div className="grid gap-4">
          {offers.map((o) => (
            <Card key={o.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-peach font-bold text-primary-dark">
                {(o.company?.name || 'S').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/app/student/offers/${o.id}`}
                  className="font-heading font-semibold hover:text-primary-dark"
                >
                  {o.title}
                </Link>
                <p className="text-sm text-text-muted">
                  {o.company?.name} · {o.city}
                </p>
              </div>
              <Badge tone="primary">{formatSalary(o.minSalary, o.maxSalary)}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Candidatures récentes</h2>
          <Link
            to="/app/student/applications"
            className="text-sm font-medium text-primary-dark"
          >
            Tout voir
          </Link>
        </div>
        <div className="space-y-3">
          {apps.slice(0, 3).map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <Link
                  to={`/app/student/applications/${a.id}`}
                  className="font-medium hover:text-primary-dark"
                >
                  {a.offer?.title}
                </Link>
                <p className="text-sm text-text-muted">
                  {a.offer?.company?.name} · {a.offer?.city}
                </p>
              </div>
              <Badge tone={applicationStatusTone[a.status]}>
                {applicationStatusLabel[a.status]}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-10 overflow-hidden bg-primary-dark p-6 text-white md:p-8">
        <h2 className="font-heading text-xl font-bold">Boostez votre visibilité</h2>
        <p className="mt-2 max-w-lg text-sm text-white/85">
          Les recruteurs recherchent des talents comme vous. Améliorez votre portfolio
          aujourd’hui.
        </p>
        <Link to="/app/student/profile" className="mt-6 inline-block">
          <Button variant="primary">Éditer le portfolio</Button>
        </Link>
      </Card>
    </div>
  )
}
