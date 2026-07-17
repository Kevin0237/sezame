import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Laptop,
  Play,
  Rocket,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const pillars = [
  {
    title: 'Salariat',
    icon: Briefcase,
    tone: 'bg-peach',
    points: ['CDI & CDD', 'Grandes entreprises'],
    cta: 'Explorer les offres',
    to: '/offers?type=employment',
  },
  {
    title: 'Entrepreneuriat',
    icon: Rocket,
    tone: 'bg-peach',
    points: ['Réseau de mentors', 'Ressources & investisseurs'],
    cta: 'Bâtir mon projet',
    to: '/register',
    popular: true,
  },
  {
    title: 'Freelancing',
    icon: Laptop,
    tone: 'bg-accent-green/50',
    points: ['Missions certifiées', 'Paiement sécurisé'],
    cta: 'Trouver une mission',
    to: '/offers?type=freelance',
  },
]

const stats = [
  { value: '15k+', label: 'Membres actifs' },
  { value: '500+', label: 'Entreprises partenaires' },
  { value: '2.5k', label: 'Recrutements réussis' },
  { value: '12', label: 'Villes couvertes' },
]

export function LandingPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-peach/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
          <div>
            <span className="inline-flex rounded-pill bg-primary/90 px-3 py-1 text-xs font-semibold tracking-wide text-text uppercase">
              L’excellence camerounaise
            </span>
            <h1 className="mt-5 font-heading text-4xl leading-tight font-bold text-text md:text-5xl">
              Ouvre-toi à un futur{' '}
              <em className="not-italic text-primary-dark">sans frontières.</em>
            </h1>
            <p className="mt-4 max-w-lg text-base text-text-muted md:text-lg">
              Sezame connecte les talents camerounais aux opportunités en salariat,
              entrepreneuriat et freelancing — simplement, concrètement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Commencer l’aventure <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/offers">
                <Button variant="outline" size="lg">
                  <Play className="h-4 w-4" /> Voir comment ça marche
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-xs text-text-muted">
              Partenaires de confiance : Mboa Digital · Agro-Innov · FinTech Horizon
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-square overflow-hidden rounded-full border-4 border-surface shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=800&fit=crop"
                alt="Professionnels camerounais au travail"
                className="h-full w-full object-cover"
              />
            </div>
            <Card className="absolute right-0 bottom-6 flex max-w-[220px] items-center gap-2 p-3 md:-right-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success-text" />
              <p className="text-xs font-medium text-text">
                +250 offres publiées aujourd’hui
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-text">
            Trois piliers, un seul objectif.
          </h2>
          <p className="mt-3 text-text-muted">
            Choisissez votre trajectoire — Sezame vous ouvre les portes.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <Card key={p.title} className="relative flex flex-col p-6">
                {p.popular && (
                  <span className="absolute top-4 right-4 rounded-pill bg-primary-dark px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Populaire
                  </span>
                )}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-md ${p.tone}`}
                >
                  <Icon className="h-6 w-6 text-primary-dark" />
                </div>
                <h3 className="font-heading text-xl font-semibold">{p.title}</h3>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-text-muted">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.to}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-dark"
                >
                  {p.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-primary-dark text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-6 md:py-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid items-center gap-8 overflow-hidden rounded-lg bg-peach-soft p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="font-heading text-3xl font-bold text-text">
              Prêt à semer les graines de votre succès ?
            </h2>
            <p className="mt-3 text-text-muted">
              Créez votre profil gratuitement et laissez les bonnes opportunités venir à vous.
            </p>
            <Link to="/register" className="mt-6 inline-block">
              <Button variant="strong" size="lg">
                Créer mon compte gratuit
              </Button>
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=500&fit=crop"
              alt="Graines"
              className="h-56 w-full object-cover md:h-64"
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
