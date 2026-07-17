import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const email = location.state?.email || user?.email || 'votre adresse'

  function simulateVerify() {
    updateUser({ emailVerified: true })
    if (user?.role === 'recruiter') navigate('/app/recruiter/onboarding')
    else if (user?.role === 'student') navigate('/app/student/onboarding')
    else navigate('/login')
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-peach">
            <MailCheck className="h-7 w-7 text-primary-dark" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Vérifiez votre e-mail</h1>
          <p className="mt-3 text-sm text-text-muted">
            Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Ouvrez-le pour
            activer votre compte.
          </p>
          <Button variant="strong" className="mt-8 w-full" onClick={simulateVerify}>
            J’ai vérifié mon e-mail (démo)
          </Button>
          <Link to="/login" className="mt-4 inline-block text-sm text-primary-dark">
            Retour à la connexion
          </Link>
        </Card>
      </div>
    </PublicLayout>
  )
}
