import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { api } from '@/api/client'

export function RecruiterOnboardingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    sector: '',
    city: '',
    description: '',
    documentUrl: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.company.submitVerification({
        ...form,
        document_url: form.documentUrl || 'https://example.com/registre-commerce.pdf',
      })
      navigate('/app/recruiter/verification')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl py-4">
      <Logo color="#934B19" className="mb-6" />
      <h1 className="font-heading text-2xl font-bold">Onboarding entreprise</h1>
      <p className="mt-2 text-sm text-text-muted">
        Renseignez votre entreprise et déposez le registre de commerce pour vérification.
      </p>
      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Nom de l’entreprise"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="Secteur"
            value={form.sector}
            onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
            required
          >
            <option value="">Sélectionnez</option>
            <option>Technologie</option>
            <option>Finance</option>
            <option>Agroalimentaire</option>
            <option>Consulting</option>
            <option>Autre</option>
          </Select>
          <Input
            label="Ville"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="URL du document justificatif"
            value={form.documentUrl}
            onChange={(e) => setForm((f) => ({ ...f, documentUrl: e.target.value }))}
            placeholder="https://… (PDF registre de commerce)"
          />
          {error && <p className="text-sm text-danger-text">{error}</p>}
          <Button type="submit" variant="strong" className="w-full" disabled={saving}>
            {saving ? 'Envoi…' : 'Soumettre pour vérification'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
