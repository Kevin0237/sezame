import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <Logo showTagline color="#FDA067" className="justify-center" />
          <h1 className="mt-6 font-heading text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-text-muted">
            Nous vous enverrons un lien de réinitialisation.
          </p>
        </div>
        <Card className="p-6">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-text">
                Si un compte existe pour <strong>{email}</strong>, un e-mail a été envoyé.
              </p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="strong">Retour à la connexion</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Adresse e-mail"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="strong" className="w-full">
                Envoyer le lien
              </Button>
            </form>
          )}
        </Card>
      </div>
    </PublicLayout>
  )
}
