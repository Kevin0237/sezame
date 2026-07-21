import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'

export function CandidateProfilePage() {
  const { userId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.profile
      .getCandidate(userId)
      .then(setData)
      .catch((e) => setError(e.message))
  }, [userId])

  if (error) return <p className="text-danger-text">{error}</p>
  if (!data) return <p className="text-text-muted">Chargement…</p>

  const { user, profile } = data

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/app/recruiter"
        className="inline-flex items-center gap-1 text-sm text-text-muted"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <Card className="mt-4 p-6 text-center md:p-8">
        <img
          src={
            user.avatar ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`
          }
          alt=""
          className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-primary/40"
        />
        <h1 className="mt-4 font-heading text-2xl font-bold">{user.name}</h1>
        <p className="text-text-muted">{profile.title}</p>
        {profile.city && (
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-text-muted">
            <MapPin className="h-4 w-4" /> {profile.city}
          </p>
        )}
        {profile.bio && <p className="mx-auto mt-4 max-w-lg text-sm text-text-muted">{profile.bio}</p>}
      </Card>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Compétences</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(profile.skills || []).map((s) => (
            <Badge key={s} tone="primary">
              {s}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Réalisations</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(profile.achievements || []).map((a) => (
            <Card key={a.id} className="overflow-hidden">
              {a.imageUrl && (
                <img src={a.imageUrl} alt="" className="h-36 w-full object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-text-muted">{a.description}</p>
                {a.projectUrl && (
                  <a
                    href={a.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary transition hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Voir le projet
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
