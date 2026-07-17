import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Pencil, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.profile.getMe().then(setProfile).catch(() => {})
  }, [])

  if (!profile) {
    return <p className="text-text-muted">Chargement du profil…</p>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6 text-center md:p-8">
        <img
          src={
            user?.avatar ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`
          }
          alt=""
          className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-primary/50"
        />
        <h1 className="mt-4 font-heading text-2xl font-bold">{user?.name}</h1>
        <p className="text-text-muted">{profile.title || 'Profil Sezame'}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-text-muted">
          {profile.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {profile.city}
            </span>
          )}
          {profile.experienceYears > 0 && (
            <span>{profile.experienceYears}+ ans d’expérience</span>
          )}
        </div>
        {profile.bio && (
          <p className="mx-auto mt-4 max-w-lg text-sm text-text-muted">{profile.bio}</p>
        )}
        <Link to="/app/student/profile/edit" className="mt-6 inline-block">
          <Button variant="primary">
            <Pencil className="h-4 w-4" /> Éditer mon profil
          </Button>
        </Link>
      </Card>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Compétences</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(profile.skills || []).length === 0 && (
            <p className="text-sm text-text-muted">Aucune compétence ajoutée.</p>
          )}
          {(profile.skills || []).map((s) => (
            <Badge key={s} tone="primary">
              {s}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Formation</h2>
        <ul className="mt-3 space-y-3">
          {(profile.educationHistory || []).length === 0 && profile.education && (
            <li className="flex gap-3 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              {profile.education}
            </li>
          )}
          {(profile.educationHistory || []).map((e, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>{e.title}</strong>
                <span className="text-text-muted">
                  {' '}
                  — {e.school}
                  {e.year ? ` · ${e.year}` : ''}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Mes réalisations</h2>
          <Link to="/app/student/achievements/new">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </Link>
        </div>
        {(profile.achievements || []).length === 0 ? (
          <EmptyState
            title="Aucune réalisation"
            description="Ajoutez un projet pour enrichir votre portfolio vivant."
            actionLabel="Ajouter un projet"
            actionTo="/app/student/achievements/new"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.achievements.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                {a.imageUrl && (
                  <img src={a.imageUrl} alt="" className="h-40 w-full object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-heading font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{a.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
