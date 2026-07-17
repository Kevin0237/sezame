import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { fr } from '@/i18n/fr'

const links = [
  { to: '/', label: fr.nav.home },
  { to: '/offers', label: fr.nav.offers },
]

export function PublicHeader() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)

  const appHome =
    user?.role === 'admin'
      ? '/app/admin'
      : user?.role === 'recruiter'
        ? '/app/recruiter'
        : '/app/student'

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo showTagline={false} color="#934B19" markClassName="h-8 w-8" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-primary-dark' : 'text-text-muted hover:text-text'}`
              }
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Link to={appHome}>
              <Button variant="strong" size="sm">
                Mon espace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {fr.nav.login}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  {fr.nav.signup}
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-pill p-2 text-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-bg px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-text"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link to={appHome} onClick={() => setOpen(false)}>
                <Button variant="strong" size="sm" className="w-full">
                  Mon espace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    {fr.nav.login}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    {fr.nav.signup}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export function PublicLayout({ children, showFooter = true }) {
  return (
    <div className="min-h-screen bg-bg">
      <PublicHeader />
      <main>{children}</main>
      {showFooter && <PublicFooter />}
    </div>
  )
}

function PublicFooter() {
  return (
    <footer className="mt-16 bg-footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <Logo color="#323129" showTagline />
          <p className="mt-3 text-sm text-text-muted">
            La plateforme qui ouvre les portes de l’emploi, de l’entrepreneuriat et du freelancing
            au Cameroun.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-text uppercase">
            Plateforme
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link to="/offers">Offres d’emploi</Link>
            </li>
            <li>
              <Link to="/register">Créer mon profil</Link>
            </li>
            <li>
              <Link to="/register?role=recruiter">Publier une offre</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-text uppercase">
            Support
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>À propos</li>
            <li>Contact</li>
            <li>Confidentialité</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-text uppercase">
            Newsletter
          </h4>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input
              type="email"
              placeholder="Votre e-mail"
              className="min-w-0 flex-1 rounded-pill border border-border bg-surface px-4 py-2 text-sm"
            />
            <Button type="submit" variant="strong" size="sm">
              OK
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/80 px-4 py-4 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} SEZAME. Ouvre-toi sur le monde.
      </div>
    </footer>
  )
}
