import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'

export function VerifyEmailPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  const email = location.state?.email || 'votre adresse'

  const [status, setStatus] = useState(tokenFromUrl ? 'verifying' : 'waiting')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!tokenFromUrl) return

    let cancelled = false
    api.auth
      .verifyEmail({ token: tokenFromUrl })
      .then((res) => {
        if (!cancelled) {
          setStatus('success')
          setMessage(res.message)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error')
          setMessage(err.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [tokenFromUrl])

  async function handleResend() {
    if (!email || email === 'votre adresse') {
      setMessage('Connectez-vous depuis la page d’inscription pour renvoyer l’e-mail.')
      return
    }
    setResending(true)
    try {
      const res = await api.auth.resendVerification({ email })
      setMessage(res.message)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-peach">
            <MailCheck className="h-7 w-7 text-primary-dark" />
          </div>

          {status === 'verifying' && (
            <>
              <h1 className="font-heading text-2xl font-bold">Vérification en cours…</h1>
              <p className="mt-3 text-sm text-text-muted">Merci de patienter.</p>
            </>
          )}

          {status === 'waiting' && (
            <>
              <h1 className="font-heading text-2xl font-bold">Vérifiez votre e-mail</h1>
              <p className="mt-3 text-sm text-text-muted">
                Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Ouvrez-le
                pour activer votre compte.
              </p>
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Envoi…' : 'Renvoyer l’e-mail'}
              </Button>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="font-heading text-2xl font-bold">E-mail confirmé</h1>
              <p className="mt-3 text-sm text-text-muted">{message}</p>
              <Link to="/login" className="mt-6 inline-block w-full">
                <Button variant="strong" className="w-full">
                  Se connecter
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="font-heading text-2xl font-bold">Lien invalide</h1>
              <p className="mt-3 text-sm text-danger-text">{message}</p>
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={handleResend}
                disabled={resending}
              >
                Renvoyer un lien
              </Button>
            </>
          )}

          {message && status === 'waiting' && (
            <p className="mt-4 text-xs text-text-muted">{message}</p>
          )}

          {status !== 'success' && (
            <Link to="/login" className="mt-4 inline-block text-sm text-primary-dark">
              Retour à la connexion
            </Link>
          )}
        </Card>
      </div>
    </PublicLayout>
  )
}
