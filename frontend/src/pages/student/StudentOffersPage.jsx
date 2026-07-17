import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { OfferCard } from '@/components/offers/OfferCard'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'

export function StudentOffersPage() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    city: params.get('city') || '',
    type: params.get('type') || '',
    contractType: '',
    sector: '',
  })
  const [data, setData] = useState({ offers: [], total: 0 })
  const [loading, setLoading] = useState(true)

  function load(next = filters) {
    setLoading(true)
    api.offers
      .list(next)
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">
        Recherche d’offres
      </h1>
      <p className="mt-1 text-text-muted">Filtrez par secteur, ville et type de contrat.</p>

      <form
        className="mt-6 grid gap-3 rounded-md border border-border bg-surface p-4 shadow-soft md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault()
          load()
        }}
      >
        <Input
          icon={Search}
          placeholder="Mot-clé"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className="md:col-span-2"
        />
        <Input
          placeholder="Ville"
          value={filters.city}
          onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
        />
        <Select
          value={filters.contractType}
          onChange={(e) => setFilters((f) => ({ ...f, contractType: e.target.value }))}
        >
          <option value="">Type de contrat</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Freelance">Freelance</option>
        </Select>
        <Button type="submit" variant="strong" className="md:col-span-4 md:w-fit">
          Rechercher
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        {loading ? '…' : `${data.total} offres correspondantes`}
      </p>

      <div className="mt-4 grid gap-4">
        {!loading && data.offers.length === 0 && (
          <EmptyState
            title="Aucune offre"
            description="Modifiez vos filtres pour élargir la recherche."
          />
        )}
        {data.offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} to={`/app/student/offers/${offer.id}`} />
        ))}
      </div>
    </div>
  )
}
