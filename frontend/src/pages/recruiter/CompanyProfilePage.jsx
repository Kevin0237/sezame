import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'
import { companyStatusLabel } from '@/lib/format'

export function CompanyProfilePage() {
  const fileRef = useRef(null)
  const [company, setCompany] = useState(null)
  const [form, setForm] = useState({ name: '', sector: '', city: '', description: '', documentUrl: '' })
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.company.getStatus().then((res) => {
      setCompany(res.company)
      if (res.company) {
        setForm({
          name: res.company.name || '',
          sector: res.company.sector || '',
          city: res.company.city || '',
          description: res.company.description || '',
          documentUrl: res.company.documentUrl || '',
        })
      }
    })
  }, [])

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
    setError('')
    try {
      let docUrl = form.documentUrl || undefined
      if (file) {
        const { url } = await api.profile.uploadImage(file)
        docUrl = url
      }
      const updated = await api.company.update({
        name: form.name,
        sector: form.sector,
        city: form.city,
        description: form.description,
        document_url: docUrl,
      })
      setCompany(updated.company || updated)
      setSaved(true)
      setFile(null)
      setFileName('')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-2xl font-bold">Profil entreprise</h1>
        <p className="mt-2 text-sm text-text-muted">
          Aucune entreprise liée. Complétez l'onboarding.
        </p>
        <Link to="/app/recruiter/onboarding" className="mt-4 inline-block text-primary-dark">
          Aller à l'onboarding →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Profil entreprise</h1>
        <Badge
          tone={
            company.status === 'verified'
              ? 'success'
              : company.status === 'rejected'
                ? 'danger'
                : 'warning'
          }
        >
          {companyStatusLabel[company.status]}
        </Badge>
      </div>
      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Secteur"
            value={form.sector}
            onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
          />
          <Input
            label="Ville"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <Textarea
            label="Description publique"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Document justificatif
            </label>
            {company.documentUrl && !file && (
              <p className="mb-2 text-xs text-text-muted">
                Document actuel :{' '}
                <a
                  href={company.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.documentUrl}
                </a>
              </p>
            )}
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
              PDF, JPEG, PNG — max 10 Mo.
            </p>
          </div>

          {error && <p className="text-sm text-danger-text">{error}</p>}
          {saved && <p className="text-sm text-success-text">Enregistré.</p>}
          <Button type="submit" variant="strong">
            Enregistrer
          </Button>
        </form>
      </Card>
    </div>
  )
}
