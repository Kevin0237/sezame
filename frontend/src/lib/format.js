export function formatSalary(min, max) {
  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n / 1000) + 'k'
  if (min && max) return `${fmt(min)} - ${fmt(max)} FCFA`
  if (min) return `À partir de ${fmt(min)} FCFA`
  return 'Salaire non précisé'
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export const applicationStatusLabel = {
  submitted: 'Envoyée',
  viewed: 'Vue',
  in_review: 'En cours',
  rejected: 'Refusée',
  accepted: 'Acceptée',
}

export const applicationStatusTone = {
  submitted: 'neutral',
  viewed: 'warning',
  in_review: 'warning',
  rejected: 'danger',
  accepted: 'success',
}

export const companyStatusLabel = {
  pending: 'En attente',
  verified: 'Vérifiée',
  rejected: 'Refusée',
}
