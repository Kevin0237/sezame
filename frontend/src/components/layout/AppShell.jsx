import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  User,
  Building2,
  FolderKanban,
  Users,
  Flag,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { fr } from '@/i18n/fr'
import { useEffect, useState } from 'react'
import { api } from '@/api/client'

function studentNav() {
  return [
    { to: '/app/student', label: fr.nav.dashboard, icon: LayoutDashboard, end: true },
    { to: '/app/student/offers', label: fr.nav.jobs, icon: Search },
    { to: '/app/student/applications', label: fr.nav.applications, icon: ClipboardList },
    { to: '/app/student/profile', label: fr.nav.portfolio, icon: FolderKanban },
    { to: '/app/settings', label: fr.nav.settings, icon: Settings },
  ]
}

function recruiterNav() {
  return [
    { to: '/app/recruiter', label: fr.nav.dashboard, icon: LayoutDashboard, end: true },
    { to: '/app/recruiter/offers', label: fr.nav.myOffers, icon: Briefcase },
    { to: '/app/recruiter/company', label: fr.nav.company, icon: Building2 },
    { to: '/app/settings', label: fr.nav.settings, icon: Settings },
  ]
}

function adminNav() {
  return [
    { to: '/app/admin', label: fr.nav.dashboard, icon: LayoutDashboard, end: true },
    { to: '/app/admin/verifications', label: fr.nav.verifications, icon: Shield },
    { to: '/app/admin/moderation', label: fr.nav.moderation, icon: Flag },
    { to: '/app/admin/accounts', label: fr.nav.accounts, icon: Users },
    { to: '/app/settings', label: fr.nav.settings, icon: Settings },
  ]
}

function mobileNav(role) {
  if (role === 'recruiter') {
    return [
      { to: '/app/recruiter', label: fr.nav.home, icon: Home, end: true },
      { to: '/app/recruiter/offers', label: fr.nav.offers, icon: Briefcase },
      { to: '/app/recruiter/company', label: 'Entreprise', icon: Building2 },
      { to: '/app/settings', label: fr.nav.profile, icon: User },
    ]
  }
  if (role === 'admin') {
    return [
      { to: '/app/admin', label: fr.nav.home, icon: Home, end: true },
      { to: '/app/admin/verifications', label: 'Vérif.', icon: Shield },
      { to: '/app/admin/moderation', label: 'Modér.', icon: Flag },
      { to: '/app/admin/accounts', label: 'Comptes', icon: Users },
    ]
  }
  return [
    { to: '/app/student', label: fr.nav.home, icon: Home, end: true },
    { to: '/app/student/offers', label: fr.nav.jobs, icon: Briefcase },
    { to: '/app/student/applications', label: fr.nav.applications, icon: ClipboardList },
    { to: '/app/student/profile', label: fr.nav.profile, icon: User },
  ]
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  const role = user?.role || 'student'
  const sideItems =
    role === 'admin' ? adminNav() : role === 'recruiter' ? recruiterNav() : studentNav()
  const bottomItems = mobileNav(role)

  useEffect(() => {
    let cancelled = false
    api.notifications
      .list({ limit: 50 })
      .then((list) => {
        if (!cancelled) setUnread(list.filter((n) => !n.isRead).length)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user?.id])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-bg-alt lg:flex">
        <div className="px-5 py-5">
          <Link to="/">
            <Logo color="#934B19" markClassName="h-7 w-7" />
          </Link>
        </div>
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`
              }
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold text-text">
                {user?.name}
              </p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {sideItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary text-text'
                    : 'text-text-muted hover:bg-peach/50 hover:text-text'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-pill px-4 py-2 text-sm text-text-muted hover:bg-peach/40"
          >
            <LogOut className="h-4 w-4" />
            {fr.nav.logout}
          </button>
          <p className="mt-3 px-2 text-[10px] text-text-muted/70">
            © {new Date().getFullYear()} SEZAME
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-bg/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <Logo color="#934B19" markClassName="h-7 w-7" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/app/notifications"
              className="relative rounded-full p-2 text-text hover:bg-peach/40"
              aria-label={fr.nav.notifications}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-dark" />
              )}
            </Link>
            <Link to={role === 'student' ? '/app/student/profile' : '/app/settings'}>
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`
                }
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/40"
              />
            </Link>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
          {bottomItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-pill px-2 py-1.5 text-[11px] font-medium ${
                  isActive ? 'bg-primary/80 text-text' : 'text-text-muted'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
