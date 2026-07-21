import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { OfferCard } from '@/components/offers/OfferCard'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/api/client'

const PAGE_SIZE = 10

export function StudentOffersPage() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    city: params.get('city') || '',
    type: params.get('type') || '',
    contractType: '',
    sector: '',
  })
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ offers: [], total: 0 })
  const [loading, setLoading] = useState(true)

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  function load(p = page, f = filters) {
    setLoading(true)
    api.offers
      .list({ ...f, page: p })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    load(1)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">
        Recherche d'offres
      </h1>
      <p className="mt-1 text-text-muted">Filtrez par secteur, ville et type de contrat.</p>

      <form
        className="mt-6 grid gap-3 rounded-md border border-border bg-surface p-4 shadow-soft md:grid-cols-4"
        onSubmit={handleSearch}
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
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">Type d'offre</option>
          <option value="employment">Emploi</option>
          <option value="freelance">Freelance</option>
        </Select>
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
        <Input
          placeholder="Secteur"
          value={filters.sector}
          onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}
        />
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

      {data.total > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => { setPage((p) => p - 1); load(page - 1); }}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-text-muted">
            Page {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => { setPage((p) => p + 1); load(page + 1); }}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
