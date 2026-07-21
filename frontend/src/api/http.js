const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

function getToken() {
  return localStorage.getItem('sezame_token')
}

function getRefreshToken() {
  return localStorage.getItem('sezame_refresh_token')
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem('sezame_token', accessToken)
  if (refreshToken) localStorage.setItem('sezame_refresh_token', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('sezame_token')
  localStorage.removeItem('sezame_refresh_token')
}

let isRefreshing = false
let refreshPromise = null

async function doRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    clearTokens()
    throw new Error(data.message || 'Session expirée.')
  }

  setTokens(data.token, data.refreshToken)
  return data.token
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // If 401 and we have a refresh token, try to refresh once
  if (res.status === 401 && auth && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = doRefresh().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    try {
      const newToken = await refreshPromise
      headers.Authorization = `Bearer ${newToken}`
      res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch {
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Une erreur est survenue.')
  }
  return data
}

/** Real HTTP adapter — used when VITE_USE_MOCK=false */
export const httpApi = {
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  verifyEmail: (body) => request('/auth/verify-email', { method: 'POST', body, auth: false }),
  resendVerification: (body) =>
    request('/auth/resend-verification', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  logout: (refreshToken) =>
    request('/auth/logout', { method: 'POST', body: { refreshToken } }),
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
  listCompanyOffers: () => request('/offers/recruiter'),
  createApplication: (body) => request('/applications', { method: 'POST', body }),
  listMyApplications: () => request('/applications/me'),
  getApplication: (id) => request(`/applications/${id}`),
  updateApplicationStatus: (id, body) =>
    request(`/applications/${id}/status`, { method: 'PUT', body }),
  listOfferApplications: (offerId) => request(`/applications/offer/${offerId}`),
  getRecruiterDashboard: () => request('/dashboard/recruiter'),
  submitCompanyVerification: (body) => request('/company/verify', { method: 'POST', body }),
  getCompanyStatus: () => request('/company/status'),
  updateCompany: (body) => request('/company', { method: 'PUT', body }),
  listVerifications: () => request('/admin/verifications'),
  resolveVerification: (userId, body) =>
    request(`/admin/verifications/${userId}`, { method: 'PUT', body }),
  listReports: () => request('/admin/reports'),
  disableOffer: (id) => request(`/admin/offers/${id}/disable`, { method: 'PUT' }),
  listAccounts: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/accounts${q ? `?${q}` : ''}`)
  },
  setAccountDisabled: (userId, disabled) =>
    request(`/admin/accounts/${userId}/disabled`, { method: 'PUT', body: { disabled } }),
  getDashboard: () => request('/admin/dashboard'),
  listNotifications: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/notifications${q ? `?${q}` : ''}`)
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  getCandidate: (userId) => request(`/profile/candidates/${userId}`),
  uploadImage: async (file) => {
    const token = getToken()
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Erreur lors de l'upload.")
    return data
  },
}
