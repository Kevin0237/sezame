import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, GraduationCap, Lock, Mail } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'

export function RegisterPage() {
  const [params] = useSearchParams()
  const initialRole = params.get('role') === 'recruiter' ? 'recruiter' : 'student'
  const [step, setStep] = useState(initialRole ? 'form' : 'role')
  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const title = useMemo(
    () => (role === 'recruiter' ? 'Créer un compte recruteur' : 'Créer un compte étudiant'),
    [role],
  )

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    try {
      await register({ email, password, role })
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <Logo showTagline color="#FDA067" className="justify-center" />
          <h1 className="mt-6 font-heading text-2xl font-bold">{title}</h1>
        </div>

        {step === 'role' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setRole('student')
                setStep('form')
              }}
              className="rounded-md border border-border bg-surface p-6 text-left shadow-soft hover:border-primary"
            >
              <GraduationCap className="h-8 w-8 text-primary-dark" />
              <h2 className="mt-3 font-heading font-semibold">Étudiant / Diplômé</h2>
              <p className="mt-1 text-sm text-text-muted">
                Créez votre portfolio et postulez aux offres.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('recruiter')
                setStep('form')
              }}
              className="rounded-md border border-border bg-surface p-6 text-left shadow-soft hover:border-primary"
            >
              <Briefcase className="h-8 w-8 text-primary-dark" />
              <h2 className="mt-3 font-heading font-semibold">Recruteur</h2>
              <p className="mt-1 text-sm text-text-muted">
                Publiez des offres et trouvez des talents.
              </p>
            </button>
          </div>
        )}

        {step === 'form' && (
          <Card className="p-6">
            <button
              type="button"
              className="mb-4 text-sm text-primary-dark"
              onClick={() => setStep('role')}
            >
              ← Changer le type de compte
            </button>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Adresse e-mail"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
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
              <Input
                label="Confirmer le mot de passe"
                type="password"
                icon={Lock}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {error && <p className="text-sm text-danger-text">{error}</p>}
              <Button type="submit" variant="strong" className="w-full" disabled={loading}>
                {loading ? 'Création…' : 'Créer mon compte'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-primary-dark">
                Se connecter
              </Link>
            </p>
          </Card>
        )}
      </div>
    </PublicLayout>
  )
}
