import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/api/client'
import { companyStatusLabel } from '@/lib/format'

export function CompanyProfilePage() {
  const [company, setCompany] = useState(null)
  const [form, setForm] = useState({ name: '', sector: '', city: '', description: '' })
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
        })
      }
    })
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const updated = await api.company.update(form)
      setCompany(updated)
      setSaved(true)
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
          Aucune entreprise liée. Complétez l’onboarding.
        </p>
        <Link to="/app/recruiter/onboarding" className="mt-4 inline-block text-primary-dark">
          Aller à l’onboarding →
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
