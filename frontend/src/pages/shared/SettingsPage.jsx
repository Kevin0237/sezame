import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export function SettingsPage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)

  function onSave(e) {
    e.preventDefault()
    updateUser({ email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function onDelete() {
    if (!confirm('Supprimer définitivement votre compte ? (démo)')) return
    await logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-2xl font-bold">Paramètres du compte</h1>
      <p className="mt-1 text-sm text-text-muted">E-mail, sécurité et préférences.</p>

      <Card className="mt-6 p-6">
        <form onSubmit={onSave} className="space-y-4">
          <Input
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
          />
          <Input label="Langue" value="Français" disabled />
          {saved && <p className="text-sm text-success-text">Modifications enregistrées.</p>}
          <Button type="submit" variant="strong">
            Enregistrer
          </Button>
        </form>
      </Card>

      <Card className="mt-4 border-danger-text/20 p-6">
        <h2 className="font-heading font-semibold text-danger-text">Zone dangereuse</h2>
        <p className="mt-2 text-sm text-text-muted">
          La suppression du compte est irréversible.
        </p>
        <Button variant="danger" className="mt-4" onClick={onDelete}>
          Supprimer mon compte
        </Button>
      </Card>
    </div>
  )
}
