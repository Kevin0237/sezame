import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'
import { companyStatusLabel } from '@/lib/format'
import { useAuth } from '@/context/AuthContext'

const tone = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
}

export function VerificationStatusPage() {
  const [status, setStatus] = useState(null)
  const { user, updateUser } = useAuth()

  useEffect(() => {
    api.company.getStatus().then((res) => {
      setStatus(res)
      if (res.status) updateUser({ verificationStatus: res.status })
    })
  }, [])

  const s = status?.status || user?.verificationStatus || 'pending'

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-heading text-2xl font-bold">Statut de vérification</h1>
      <Card className="mt-6 p-8 text-center">
        <Badge tone={tone[s]} className="text-sm">
          {companyStatusLabel[s] || s}
        </Badge>
        <p className="mt-4 text-sm text-text-muted">
          {s === 'pending' &&
            'Votre dossier est en cours d’examen. Vous pourrez publier des offres une fois vérifié.'}
          {s === 'verified' &&
            'Votre entreprise est vérifiée. Vous pouvez publier des offres.'}
          {s === 'rejected' &&
            'Votre demande a été refusée. Vous pouvez resoumettre un document.'}
        </p>
        {status?.company && (
          <p className="mt-4 font-medium text-text">{status.company.name}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {s === 'verified' && (
            <Link to="/app/recruiter/offers/new">
              <Button variant="strong">Créer une offre</Button>
            </Link>
          )}
          {s !== 'verified' && (
            <Link to="/app/recruiter/onboarding">
              <Button variant="outline">Mettre à jour le dossier</Button>
            </Link>
          )}
          <Link to="/app/recruiter">
            <Button variant="ghost">Tableau de bord</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
