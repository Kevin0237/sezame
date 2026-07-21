import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'

export function AchievementFormPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.")
      return
    }
    setFile(f)
    setImageUrl('')
    setPreview(URL.createObjectURL(f))
  }

  function onUrlChange(e) {
    setImageUrl(e.target.value)
    if (e.target.value) {
      setFile(null)
      setPreview(e.target.value)
    } else {
      setPreview('')
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let finalImageUrl = imageUrl || undefined
      if (file) {
        const { url } = await api.profile.uploadImage(file)
        finalImageUrl = url
      }
      await api.profile.addAchievement({
        title,
        description,
        image_url: finalImageUrl,
        project_url: projectUrl || undefined,
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
      <h1 className="font-heading text-2xl font-bold">Ajouter une réalisation</h1>
      <Card className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium">Image (optionnel)</label>
            {preview && (
              <img
                src={preview}
                alt="Aperçu"
                className="mb-2 h-40 w-full rounded object-cover"
              />
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
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
              <span className="self-center text-xs text-text-muted">ou</span>
              <Input
                value={imageUrl}
                onChange={onUrlChange}
                placeholder="Coller une URL d'image"
                className="flex-1"
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              JPEG, PNG, WebP — max 5 Mo. Compresse et redimensionne automatiquement.
            </p>
          </div>

          <Input
            label="Lien du projet (optionnel)"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://github.com/…"
          />
          {error && <p className="text-sm text-danger-text">{error}</p>}
          <Button type="submit" variant="strong" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Publier'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
