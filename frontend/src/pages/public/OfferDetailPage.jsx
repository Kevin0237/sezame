import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { formatSalary, formatDate } from '@/lib/format'

export function OfferDetailPage({ connected = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [offer, setOffer] = useState(null)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.offers
      .get(id)
      .then(setOffer)
      .catch((e) => setError(e.message))
  }, [id])

  async function handleApply() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/offers/${id}` } })
      return
    }
    if (user.role !== 'student') {
      setMessage('Seuls les profils étudiants peuvent postuler.')
      return
    }
    setApplying(true)
    setMessage('')
    try {
      await api.applications.create({ offer_id: id })
      setMessage('Candidature envoyée avec succès.')
      if (connected) navigate('/app/student/applications')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setApplying(false)
    }
  }

  const Wrapper = connected ? ({ children }) => <>{children}</> : PublicLayout

  if (error) {
    return (
      <Wrapper>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-danger-text">{error}</p>
          <Link to={connected ? '/app/student/offers' : '/offers'} className="mt-4 inline-block text-primary-dark">
            Retour aux offres
          </Link>
        </div>
      </Wrapper>
    )
  }

  if (!offer) {
    return (
      <Wrapper>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-text-muted">
          Chargement…
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Link
          to={connected ? '/app/student/offers' : '/offers'}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <Card className="mt-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-text md:text-3xl">
                {offer.title}
              </h1>
              <p className="mt-2 text-text-muted">
                {offer.company?.name} · <MapPin className="inline h-3.5 w-3.5" /> {offer.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Salaire
              </p>
              <p className="font-heading text-lg font-bold text-primary-dark">
                {formatSalary(offer.minSalary, offer.maxSalary)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="success">{offer.contractType}</Badge>
            <Badge tone="neutral">{offer.workMode}</Badge>
            <Badge tone="primary">{offer.sector}</Badge>
          </div>

          <div className="mt-8 space-y-3 text-text">
            <h2 className="font-heading text-lg font-semibold">Description</h2>
            <p className="leading-relaxed text-text-muted whitespace-pre-line">
              {offer.description}
            </p>
            <p className="text-sm text-text-muted">
              Date limite : {formatDate(offer.deadline)}
            </p>
          </div>

          {message && (
            <p className="mt-4 text-sm text-primary-dark">{message}</p>
          )}

          <div className="mt-8">
            <Button
              variant="strong"
              size="lg"
              onClick={handleApply}
              disabled={applying}
              className="w-full sm:w-auto"
            >
              {isAuthenticated && user?.role === 'student'
                ? applying
                  ? 'Envoi…'
                  : 'Postuler en un clic'
                : 'Se connecter pour postuler'}
            </Button>
          </div>
        </Card>
      </div>
    </Wrapper>
  )
}
