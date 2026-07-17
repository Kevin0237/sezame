import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/format'

export function NotificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const list = await api.notifications.list()
      setItems(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function markRead(id) {
    await api.notifications.markRead(id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Notifications</h1>
      <p className="mt-1 text-sm text-text-muted">Restez informé de vos candidatures et alertes.</p>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-text-muted">Chargement…</p>}
        {!loading && items.length === 0 && (
          <EmptyState
            title="Aucune notification"
            description="Vous serez alerté dès qu’il y aura du nouveau."
          />
        )}
        {items.map((n) => (
          <Card
            key={n.id}
            className={`p-4 ${n.isRead ? 'opacity-70' : 'border-primary/40'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-text">{n.content}</p>
                <p className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  className="text-xs font-medium text-primary-dark"
                  onClick={() => markRead(n.id)}
                >
                  Lu
                </button>
              )}
            </div>
            {n.link && (
              <Link to={n.link} className="mt-3 inline-block text-sm font-medium text-primary-dark">
                Voir →
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
