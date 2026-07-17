const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

function getToken() {
  return localStorage.getItem('sezame_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Une erreur est survenue.')
  }
  return data
}

/** Real HTTP adapter — used when VITE_USE_MOCK=false */
export const httpApi = {
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfileMe: () => request('/profile/me'),
  updateProfileMe: (body) => request('/profile/me', { method: 'PUT', body }),
  addAchievement: (body) => request('/profile/achievements', { method: 'POST', body }),
  deleteAchievement: (id) => request(`/profile/achievements/${id}`, { method: 'DELETE' }),
  listOffers: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/offers${q ? `?${q}` : ''}`, { auth: false })
  },
  getOffer: (id) => request(`/offers/${id}`, { auth: false }),
  createOffer: (body) => request('/offers', { method: 'POST', body }),
  updateOffer: (id, body) => request(`/offers/${id}`, { method: 'PUT', body }),
  closeOffer: (id) => request(`/offers/${id}`, { method: 'DELETE' }),
  createApplication: (body) => request('/applications', { method: 'POST', body }),
  listMyApplications: () => request('/applications/me'),
  updateApplicationStatus: (id, body) =>
    request(`/applications/${id}/status`, { method: 'PUT', body }),
  submitCompanyVerification: (body) => request('/company/verify', { method: 'POST', body }),
  getCompanyStatus: () => request('/company/status'),
  listVerifications: () => request('/admin/verifications'),
  resolveVerification: (userId, body) =>
    request(`/admin/verifications/${userId}`, { method: 'PUT', body }),
  listReports: () => request('/admin/reports'),
  disableOffer: (id) => request(`/admin/offers/${id}/disable`, { method: 'PUT' }),
  listNotifications: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/notifications${q ? `?${q}` : ''}`)
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
}
