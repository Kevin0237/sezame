import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function EditProfilePage() {
  const navigate = useNavigate()
  const { updateUser, user } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    title: '',
    city: '',
    education: '',
    skills: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.profile.getMe().then((p) => {
      setForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        bio: p.bio || '',
        title: p.title || '',
        city: p.city || '',
        education: p.education || '',
        skills: (p.skills || []).join(', '),
      })
    })
  }, [user])

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.profile.updateMe({
        ...form,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      updateUser({
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim(),
      })
      navigate('/app/student/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-2xl font-bold">Éditer mon profil</h1>
      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Prénom"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
            <Input
              label="Nom"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <Input
            label="Titre"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Ville"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <Input
            label="Formation"
            value={form.education}
            onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))}
          />
          <Input
            label="Compétences"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="React, Figma…"
          />
          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
          {error && <p className="text-sm text-danger-text">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" variant="strong" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
