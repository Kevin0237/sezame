import { Link } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export function NotFoundPage() {
  return (
    <PublicLayout showFooter={false}>
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Logo color="#FDA067" />
        <p className="mt-8 font-heading text-6xl font-bold text-primary-dark">404</p>
        <h1 className="mt-2 font-heading text-2xl font-bold">Page introuvable</h1>
        <p className="mt-2 text-sm text-text-muted">
          Cette porte n’existe pas encore. Revenez à l’accueil pour continuer.
        </p>
        <Link to="/" className="mt-8">
          <Button variant="strong">Retour à l’accueil</Button>
        </Link>
      </div>
    </PublicLayout>
  )
}
