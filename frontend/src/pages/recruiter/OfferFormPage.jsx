import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function OfferFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'employment',
    contractType: 'CDI',
    city: '',
    workMode: 'Hybride',
    sector: 'Technologie',
    minSalary: '',
    maxSalary: '',
    deadline: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.offers.get(id).then((o) => {
      setForm({
        title: o.title,
        description: o.description,
        type: o.type,
        contractType: o.contractType,
        city: o.city,
        workMode: o.workMode,
        sector: o.sector,
        minSalary: o.minSalary,
        maxSalary: o.maxSalary,
        deadline: o.deadline,
      })
    })
  }, [id, isEdit])

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (user?.verificationStatus !== 'verified') {
      setError('Entreprise non vérifiée — publication bloquée.')
      return
    }
    if (!form.minSalary || !form.maxSalary) {
      setError('La fourchette de salaire est obligatoire.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isEdit) await api.offers.update(id, form)
      else await api.offers.create(form)
      navigate('/app/recruiter/offers')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">
        {isEdit ? 'Modifier l’offre' : 'Créer une offre'}
      </h1>
      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Titre" value={form.title} onChange={set('title')} required />
          <Textarea
            label="Description"
            value={form.description}
            onChange={set('description')}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Type" value={form.type} onChange={set('type')}>
              <option value="employment">Emploi</option>
              <option value="freelance">Freelance</option>
            </Select>
            <Select label="Contrat" value={form.contractType} onChange={set('contractType')}>
              <option>CDI</option>
              <option>CDD</option>
              <option>Stage</option>
              <option>Freelance</option>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ville" value={form.city} onChange={set('city')} required />
            <Input label="Secteur" value={form.sector} onChange={set('sector')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Salaire min (FCFA)"
              type="number"
              value={form.minSalary}
              onChange={set('minSalary')}
              required
            />
            <Input
              label="Salaire max (FCFA)"
              type="number"
              value={form.maxSalary}
              onChange={set('maxSalary')}
              required
            />
          </div>
          <Input
            label="Date limite"
            type="date"
            value={form.deadline}
            onChange={set('deadline')}
            required
          />
          {error && <p className="text-sm text-danger-text">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" variant="strong" disabled={saving}>
              {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Publier'}
            </Button>
            <LinkButton onClick={() => navigate(-1)} />
          </div>
        </form>
      </Card>
    </div>
  )
}

function LinkButton({ onClick }) {
  return (
    <Button type="button" variant="outline" onClick={onClick}>
      Annuler
    </Button>
  )
}
