import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { api } from '@/api/client'

export function RecruiterOnboardingPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    sector: '',
    city: '',
    description: '',
    documentUrl: '',
  })
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) {
      setError("Le document ne doit pas dépasser 10 Mo.")
      return
    }
    setFile(f)
    setFileName(f.name)
    setForm((prev) => ({ ...prev, documentUrl: '' }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let docUrl = form.documentUrl || undefined
      if (file) {
        const { url } = await api.profile.uploadImage(file)
        docUrl = url
      }
      await api.company.submitVerification({
        name: form.name,
        sector: form.sector,
        city: form.city,
        description: form.description,
        document_url: docUrl,
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
            label="Nom de l'entreprise"
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Document justificatif (optionnel)
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Choisir un fichier
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={onFileChange}
              />
              <span className="self-center text-xs text-text-muted">ou</span>
              <Input
                value={form.documentUrl}
                onChange={(e) => {
                  setForm((f) => ({ ...f, documentUrl: e.target.value }))
                  setFile(null)
                  setFileName('')
                }}
                placeholder="Coller une URL du document"
                className="flex-1"
              />
            </div>
            {(fileName || form.documentUrl) && (
              <p className="mt-1 text-xs text-success-text">
                {fileName || form.documentUrl}
              </p>
            )}
            <p className="mt-1 text-xs text-text-muted">
              PDF, JPEG, PNG — max 10 Mo. Registre de commerce ou équivalent.
            </p>
          </div>

          {error && <p className="text-sm text-danger-text">{error}</p>}
          <Button type="submit" variant="strong" className="w-full" disabled={saving}>
            {saving ? 'Envoi…' : 'Soumettre pour vérification'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
