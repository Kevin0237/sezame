import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { OfferCard } from '@/components/offers/OfferCard'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'

export function PublicOffersPage() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState({ offers: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    city: params.get('city') || '',
    type: params.get('type') || '',
    contractType: params.get('contractType') || '',
    sector: params.get('sector') || '',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.offers
      .list(filters)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters])

  function applyFilters(e) {
    e?.preventDefault()
    const next = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) next.set(k, v)
    })
    setParams(next)
    setFilters({ ...filters })
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="font-heading text-3xl font-bold text-text md:text-4xl">
          Trouvez votre prochaine opportunité
        </h1>
        <p className="mt-2 text-text-muted">
          Parcourez les offres sans compte. Connectez-vous pour postuler.
        </p>

        <form
          onSubmit={applyFilters}
          className="mt-8 grid gap-3 rounded-md border border-border bg-surface p-4 shadow-soft md:grid-cols-5"
        >
          <Input
            icon={Search}
            placeholder="Poste, mots-clés…"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="md:col-span-2"
          />
          <Input
            placeholder="Ville (ex: Douala)"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          />
          <Select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">Type</option>
            <option value="employment">Emploi</option>
            <option value="freelance">Freelance</option>
          </Select>
          <Button type="submit" variant="strong" className="w-full">
            <Filter className="h-4 w-4" /> Appliquer
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {loading ? '…' : `${data.total} offres trouvées`}
          </p>
          <Link to="/login" className="text-sm font-medium text-primary-dark">
            Se connecter pour postuler →
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {!loading && data.offers.length === 0 && (
            <EmptyState
              title="Aucune offre trouvée"
              description="Essayez d’autres filtres ou revenez plus tard."
              actionLabel="Réinitialiser"
              onAction={() =>
                setFilters({ q: '', city: '', type: '', contractType: '', sector: '' })
              }
            />
          )}
          {data.offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
