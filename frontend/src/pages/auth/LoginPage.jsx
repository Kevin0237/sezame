import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { DEMO_PASSWORD } from '@/data/mock/seed'

export function LoginPage() {
  const { login, loginAsDemo, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('aicha@email.com')
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState('')

  function homeFor(user) {
    if (user.role === 'admin') return '/app/admin'
    if (user.role === 'recruiter') return '/app/recruiter'
    if (!user.onboardingComplete) return '/app/student/onboarding'
    return '/app/student'
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = await login(email, password)
      const from = location.state?.from
      navigate(typeof from === 'string' ? from : homeFor(user), { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  async function demo(role) {
    setError('')
    try {
      const user = await loginAsDemo(role)
      navigate(homeFor(user), { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <Logo showTagline color="#FDA067" className="justify-center" />
          <h1 className="mt-6 font-heading text-2xl font-bold">Connexion</h1>
          <p className="mt-2 text-sm text-text-muted">
            Accédez à votre espace Sezame
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Adresse e-mail"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary-dark">
                Mot de passe oublié ?
              </Link>
            </div>
            {error && <p className="text-sm text-danger-text">{error}</p>}
            <Button type="submit" variant="strong" className="w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-text-muted">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-primary-dark">
              S’inscrire
            </Link>
          </p>
        </Card>

        <Card className="mt-4 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-text-muted uppercase">
            Comptes démo (mot de passe : {DEMO_PASSWORD})
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => demo('student')}>
              Étudiant
            </Button>
            <Button size="sm" variant="outline" onClick={() => demo('recruiter')}>
              Recruteur
            </Button>
            <Button size="sm" variant="outline" onClick={() => demo('recruiterPending')}>
              Recruteur (attente)
            </Button>
            <Button size="sm" variant="outline" onClick={() => demo('admin')}>
              Admin
            </Button>
          </div>
        </Card>
      </div>
    </PublicLayout>
  )
}
