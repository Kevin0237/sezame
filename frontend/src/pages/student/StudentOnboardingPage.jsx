import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, GraduationCap, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

const steps = [
  { title: 'Commençons par vous connaître', hint: 'Infos de base' },
  { title: 'Votre formation', hint: 'Parcours académique' },
  { title: 'Vos compétences', hint: 'Ce que vous maîtrisez' },
  { title: 'Première réalisation', hint: 'Portfolio vivant' },
]

export function StudentOnboardingPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    school: '',
    fieldOfStudy: '',
    education: '',
    skills: '',
    achievementTitle: '',
    achievementDescription: '',
    bio: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function finish() {
    setError('')
    try {
      const skills = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await api.profile.updateMe({
        firstName: form.firstName,
        lastName: form.lastName,
        school: form.school,
        fieldOfStudy: form.fieldOfStudy,
        education: form.education || `${form.fieldOfStudy} — ${form.school}`,
        skills,
        bio: form.bio || `Étudiant(e) en ${form.fieldOfStudy}`,
        title: form.fieldOfStudy,
        educationHistory: form.school
          ? [{ title: form.fieldOfStudy || 'Formation', school: form.school, year: '' }]
          : [],
      })
      if (form.achievementTitle) {
        await api.profile.addAchievement({
          title: form.achievementTitle,
          description: form.achievementDescription,
          image_url:
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        })
      }
      updateUser({
        onboardingComplete: true,
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim() || user?.name,
      })
      navigate('/app/student')
    } catch (e) {
      setError(e.message)
    }
  }

  async function next() {
    if (step < steps.length - 1) setStep((s) => s + 1)
    else await finish()
  }

  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="mx-auto max-w-xl py-4">
      <div className="mb-6 flex items-center justify-between">
        <Logo color="#934B19" markClassName="h-7 w-7" />
        <span className="text-sm text-text-muted">
          Étape {step + 1} sur {steps.length}
        </span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-pill bg-border">
        <div className="h-full rounded-pill bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{steps[step].title}</h1>
        <p className="mt-2 text-sm text-text-muted">{steps[step].hint}</p>
      </div>

      <Card className="mt-8 p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="mx-auto flex flex-col items-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-bg-alt">
                <Camera className="h-8 w-8 text-text-muted" />
              </div>
              <p className="mt-2 text-xs text-text-muted">Photo de profil (optionnel)</p>
            </div>
            <Input label="Prénom" placeholder="Ex: Jean" value={form.firstName} onChange={set('firstName')} />
            <Input label="Nom" placeholder="Ex: Bakari" value={form.lastName} onChange={set('lastName')} />
            <Input
              label="Adresse e-mail"
              icon={Mail}
              value={form.email || user?.email || ''}
              onChange={set('email')}
              placeholder="nom@exemple.com"
            />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Université ou école"
              icon={GraduationCap}
              placeholder="Ex: Université de Yaoundé I"
              value={form.school}
              onChange={set('school')}
            />
            <Select
              label="Domaine d'études"
              value={form.fieldOfStudy}
              onChange={set('fieldOfStudy')}
            >
              <option value="">Sélectionnez votre domaine</option>
              <option>Informatique</option>
              <option>Marketing</option>
              <option>Design</option>
              <option>Finance</option>
              <option>Gestion</option>
              <option>Autre</option>
            </Select>
            <Input
              label="Diplôme / formation"
              placeholder="Ex: Master Marketing Digital"
              value={form.education}
              onChange={set('education')}
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Input
              label="Compétences (séparées par des virgules)"
              placeholder="React, Figma, SEO…"
              value={form.skills}
              onChange={set('skills')}
            />
            <Textarea
              label="Bio courte"
              placeholder="Parlez de vous en quelques lignes"
              value={form.bio}
              onChange={set('bio')}
            />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <Input
              label="Titre de la réalisation"
              placeholder="Ex: Campagne digitale 2025"
              value={form.achievementTitle}
              onChange={set('achievementTitle')}
            />
            <Textarea
              label="Description"
              placeholder="Ce que vous avez accompli"
              value={form.achievementDescription}
              onChange={set('achievementDescription')}
            />
          </div>
        )}

        {error && <p className="mt-4 text-sm text-danger-text">{error}</p>}

        <Button variant="strong" className="mt-6 w-full" onClick={next}>
          {step === steps.length - 1 ? 'Terminer' : 'Suivant →'}
        </Button>
        <button
          type="button"
          className="mt-3 w-full text-center text-sm text-primary-dark"
          onClick={() => navigate('/app/student')}
        >
          Ignorer pour l’instant
        </button>
      </Card>
    </div>
  )
}
