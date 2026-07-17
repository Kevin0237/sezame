import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'

export function AccountsPage() {
  const [q, setQ] = useState('')
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  async function load(query = q) {
    setLoading(true)
    try {
      setAccounts(await api.admin.listAccounts({ q: query }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  async function toggle(userId, disabled) {
    await api.admin.setAccountDisabled(userId, disabled)
    load()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Gestion des comptes</h1>
      <p className="mt-1 text-sm text-text-muted">Recherchez et activez / désactivez un compte.</p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          load()
        }}
      >
        <Input
          icon={Search}
          placeholder="E-mail ou nom…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="strong">
          Chercher
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-text-muted">Chargement…</p>}
        {!loading && accounts.length === 0 && (
          <EmptyState title="Aucun compte" description="Modifiez votre recherche." />
        )}
        {accounts.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-sm text-text-muted">
                {a.email} · {a.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={a.disabled ? 'danger' : 'success'}>
                {a.disabled ? 'Désactivé' : 'Actif'}
              </Badge>
              <Button
                size="sm"
                variant={a.disabled ? 'strong' : 'danger'}
                onClick={() => toggle(a.id, !a.disabled)}
              >
                {a.disabled ? 'Activer' : 'Désactiver'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
