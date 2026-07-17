import {
  users as seedUsers,
  companies as seedCompanies,
  profiles as seedProfiles,
  achievements as seedAchievements,
  offers as seedOffers,
  applications as seedApplications,
  notifications as seedNotifications,
  reports as seedReports,
  activityLogs as seedLogs,
} from '@/data/mock/seed'

function clone(data) {
  return structuredClone(data)
}

const store = {
  users: clone(seedUsers),
  companies: clone(seedCompanies),
  profiles: clone(seedProfiles),
  achievements: clone(seedAchievements),
  offers: clone(seedOffers),
  applications: clone(seedApplications),
  notifications: clone(seedNotifications),
  reports: clone(seedReports),
  logs: clone(seedLogs),
  disabledAccounts: new Set(),
}

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function publicUser(user) {
  if (!user) return null
  const { password: _password, ...rest } = user
  return rest
}

function enrichOffer(offer) {
  const company = store.companies.find((c) => c.id === offer.companyId)
  return {
    ...offer,
    company: company
      ? { id: company.id, name: company.name, city: company.city, logo: company.logo }
      : null,
  }
}

export const mockApi = {
  async register({ email, password, role }) {
    await delay()
    if (store.users.some((u) => u.email === email)) {
      throw new Error('Un compte existe déjà avec cet e-mail.')
    }
    const id = `u-${Date.now()}`
    const user = {
      id,
      email,
      password,
      role,
      name: email.split('@')[0],
      firstName: '',
      lastName: '',
      avatar: null,
      emailVerified: false,
      onboardingComplete: role !== 'student',
      verificationStatus: role === 'recruiter' ? 'pending' : undefined,
      companyId: role === 'recruiter' ? null : undefined,
    }
    store.users.push(user)
    if (role === 'student') {
      store.profiles[id] = {
        id: `p-${Date.now()}`,
        userId: id,
        bio: '',
        title: '',
        city: '',
        education: '',
        school: '',
        fieldOfStudy: '',
        experienceYears: 0,
        skills: [],
        educationHistory: [],
        completionScore: 10,
      }
    }
    return { id, email, role }
  },

  async login({ email, password }) {
    await delay()
    const user = store.users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('E-mail ou mot de passe incorrect.')
    if (store.disabledAccounts.has(user.id)) {
      throw new Error('Ce compte a été désactivé.')
    }
    const token = `mock-token-${user.id}`
    return { token, user: publicUser(user) }
  },

  async logout() {
    await delay(50)
    return { message: 'Logged out successfully' }
  },

  async getProfileMe(userId) {
    await delay()
    const profile = store.profiles[userId]
    if (!profile) throw new Error('Profil introuvable.')
    const ach = store.achievements.filter((a) => a.userId === userId)
    return { ...profile, achievements: ach }
  },

  async updateProfileMe(userId, data) {
    await delay()
    const current = store.profiles[userId] || {
      id: `p-${Date.now()}`,
      userId,
      skills: [],
      educationHistory: [],
      completionScore: 0,
    }
    const next = { ...current, ...data }
    let score = 20
    if (next.bio) score += 20
    if (next.education || next.school) score += 20
    if (next.skills?.length) score += 20
    if (store.achievements.some((a) => a.userId === userId)) score += 20
    next.completionScore = Math.min(score, 100)
    store.profiles[userId] = next

    const user = store.users.find((u) => u.id === userId)
    if (user) {
      if (data.firstName || data.lastName) {
        user.firstName = data.firstName ?? user.firstName
        user.lastName = data.lastName ?? user.lastName
        user.name = `${user.firstName} ${user.lastName}`.trim()
      }
      if (next.completionScore >= 60) user.onboardingComplete = true
    }
    return { message: 'Profile updated', completionScore: next.completionScore, profile: next }
  },

  async addAchievement(userId, data) {
    await delay()
    const item = {
      id: `a-${Date.now()}`,
      userId,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url || data.imageUrl || '',
    }
    store.achievements.unshift(item)
    return item
  },

  async deleteAchievement(userId, id) {
    await delay()
    store.achievements = store.achievements.filter(
      (a) => !(a.id === id && a.userId === userId),
    )
    return { message: 'Achievement deleted' }
  },

  async listOffers({ city, type, q, page = 1, contractType, sector } = {}) {
    await delay()
    let list = store.offers.filter((o) => o.status === 'active')
    if (city) list = list.filter((o) => o.city.toLowerCase().includes(city.toLowerCase()))
    if (type) list = list.filter((o) => o.type === type)
    if (contractType) {
      list = list.filter((o) =>
        o.contractType.toLowerCase().includes(contractType.toLowerCase()),
      )
    }
    if (sector) {
      list = list.filter((o) => o.sector.toLowerCase().includes(sector.toLowerCase()))
    }
    if (q) {
      const query = q.toLowerCase()
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(query) ||
          o.description.toLowerCase().includes(query) ||
          o.sector.toLowerCase().includes(query),
      )
    }
    list = list.map(enrichOffer)
    const pageSize = 10
    const start = (page - 1) * pageSize
    return { offers: list.slice(start, start + pageSize), total: list.length }
  },

  async getOffer(id) {
    await delay()
    const offer = store.offers.find((o) => o.id === id)
    if (!offer) throw new Error('Offre introuvable.')
    return enrichOffer(offer)
  },

  async createOffer(userId, data) {
    await delay()
    const user = store.users.find((u) => u.id === userId)
    if (!user || user.role !== 'recruiter') throw new Error('Accès refusé.')
    if (user.verificationStatus !== 'verified') {
      throw new Error('Entreprise non vérifiée.')
    }
    const offer = {
      id: `o-${Date.now()}`,
      companyId: user.companyId,
      title: data.title,
      description: data.description,
      type: data.type || 'employment',
      contractType: data.contractType || (data.type === 'freelance' ? 'Freelance' : 'CDI'),
      city: data.city,
      workMode: data.workMode || 'Présentiel',
      sector: data.sector || 'Général',
      minSalary: Number(data.minSalary),
      maxSalary: Number(data.maxSalary),
      deadline: data.deadline,
      status: 'active',
      createdAt: new Date().toISOString(),
      views: 0,
    }
    store.offers.unshift(offer)
    return { ...offer, status: 'active' }
  },

  async updateOffer(userId, id, data) {
    await delay()
    const offer = store.offers.find((o) => o.id === id)
    if (!offer) throw new Error('Offre introuvable.')
    const user = store.users.find((u) => u.id === userId)
    if (user?.companyId !== offer.companyId && user?.role !== 'admin') {
      throw new Error('Accès refusé.')
    }
    Object.assign(offer, data)
    return { message: 'Offer updated', offer }
  },

  async closeOffer(userId, id) {
    await delay()
    const offer = store.offers.find((o) => o.id === id)
    if (!offer) throw new Error('Offre introuvable.')
    offer.status = 'closed'
    return { message: 'Offer closed' }
  },

  async createApplication(userId, { offer_id }) {
    await delay()
    const existing = store.applications.find(
      (a) => a.userId === userId && a.offerId === offer_id,
    )
    if (existing) throw new Error('Vous avez déjà postulé à cette offre.')
    const app = {
      id: `app-${Date.now()}`,
      offerId: offer_id,
      userId,
      status: 'submitted',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ status: 'submitted', at: new Date().toISOString() }],
    }
    store.applications.unshift(app)
    return app
  },

  async listMyApplications(userId) {
    await delay()
    return store.applications
      .filter((a) => a.userId === userId)
      .map((a) => {
        const offer = enrichOffer(store.offers.find((o) => o.id === a.offerId) || {})
        return { ...a, offer }
      })
  },

  async getApplication(userId, id) {
    await delay()
    const app = store.applications.find((a) => a.id === id)
    if (!app) throw new Error('Candidature introuvable.')
    const offer = enrichOffer(store.offers.find((o) => o.id === app.offerId) || {})
    const candidate = publicUser(store.users.find((u) => u.id === app.userId))
    const profile = store.profiles[app.userId]
    return { ...app, offer, candidate, profile }
  },

  async updateApplicationStatus(userId, id, { status }) {
    await delay()
    const app = store.applications.find((a) => a.id === id)
    if (!app) throw new Error('Candidature introuvable.')
    app.status = status
    app.updatedAt = new Date().toISOString()
    app.history.push({ status, at: app.updatedAt })
    return { id: app.id, status: app.status, updated_at: app.updatedAt }
  },

  async listOfferApplications(offerId) {
    await delay()
    return store.applications
      .filter((a) => a.offerId === offerId)
      .map((a) => ({
        ...a,
        candidate: publicUser(store.users.find((u) => u.id === a.userId)),
        profile: store.profiles[a.userId],
      }))
  },

  async submitCompanyVerification(userId, data) {
    await delay()
    const user = store.users.find((u) => u.id === userId)
    if (!user) throw new Error('Utilisateur introuvable.')
    let company = store.companies.find((c) => c.userId === userId)
    if (!company) {
      company = {
        id: `c-${Date.now()}`,
        userId,
        name: data.name || 'Mon entreprise',
        sector: data.sector || '',
        city: data.city || '',
        description: data.description || '',
        logo: null,
        status: 'pending',
        documentUrl: data.document_url || data.documentUrl || '',
        submittedAt: new Date().toISOString(),
      }
      store.companies.push(company)
      user.companyId = company.id
    } else {
      Object.assign(company, {
        name: data.name ?? company.name,
        sector: data.sector ?? company.sector,
        city: data.city ?? company.city,
        description: data.description ?? company.description,
        documentUrl: data.document_url || data.documentUrl || company.documentUrl,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      })
    }
    user.verificationStatus = 'pending'
    return { status: 'pending', message: 'Document submitted', company }
  },

  async getCompanyStatus(userId) {
    await delay()
    const company = store.companies.find((c) => c.userId === userId)
    return {
      status: company?.status || 'pending',
      company: company || null,
    }
  },

  async updateCompany(userId, data) {
    await delay()
    const company = store.companies.find((c) => c.userId === userId)
    if (!company) throw new Error('Entreprise introuvable.')
    Object.assign(company, data)
    return company
  },

  async listVerifications() {
    await delay()
    return store.companies
      .filter((c) => c.status === 'pending')
      .map((c) => {
        const user = store.users.find((u) => u.id === c.userId)
        return {
          userId: c.userId,
          companyName: c.name,
          city: c.city,
          doc_url: c.documentUrl,
          submitted_at: c.submittedAt,
          email: user?.email,
        }
      })
  },

  async resolveVerification(adminId, userId, { action }) {
    await delay()
    const company = store.companies.find((c) => c.userId === userId)
    const user = store.users.find((u) => u.id === userId)
    if (!company || !user) throw new Error('Demande introuvable.')
    const status = action === 'approve' ? 'verified' : 'rejected'
    company.status = status
    user.verificationStatus = status
    store.logs.unshift({
      id: `l-${Date.now()}`,
      type: 'verification',
      message: `${company.name} ${status === 'verified' ? 'approuvée' : 'refusée'}`,
      at: new Date().toISOString(),
    })
    return { message: status === 'verified' ? 'User verified' : 'User rejected' }
  },

  async listReports() {
    await delay()
    return store.reports.map((r) => {
      const offer = r.targetType === 'offer' ? store.offers.find((o) => o.id === r.targetId) : null
      const company = offer ? store.companies.find((c) => c.id === offer.companyId) : null
      return {
        ...r,
        title: offer?.title,
        companyName: company?.name,
      }
    })
  },

  async disableOffer(id) {
    await delay()
    const offer = store.offers.find((o) => o.id === id)
    if (!offer) throw new Error('Offre introuvable.')
    offer.status = 'disabled'
    return { message: 'Offer disabled' }
  },

  async listAccounts({ q } = {}) {
    await delay()
    let list = store.users.map(publicUser)
    if (q) {
      const query = q.toLowerCase()
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          u.name?.toLowerCase().includes(query),
      )
    }
    return list.map((u) => ({
      ...u,
      disabled: store.disabledAccounts.has(u.id),
    }))
  },

  async setAccountDisabled(userId, disabled) {
    await delay()
    if (disabled) store.disabledAccounts.add(userId)
    else store.disabledAccounts.delete(userId)
    return { message: disabled ? 'Account disabled' : 'Account enabled' }
  },

  async listNotifications(userId, { limit = 20 } = {}) {
    await delay()
    return store.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => Number(a.isRead) - Number(b.isRead) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
  },

  async markNotificationRead(userId, id) {
    await delay()
    const n = store.notifications.find((x) => x.id === id && x.userId === userId)
    if (n) n.isRead = true
    return { message: 'Notification marked as read' }
  },

  async listCompanyOffers(userId) {
    await delay()
    const user = store.users.find((u) => u.id === userId)
    return store.offers
      .filter((o) => o.companyId === user?.companyId)
      .map((o) => ({
        ...enrichOffer(o),
        applicants: store.applications.filter((a) => a.offerId === o.id).length,
      }))
  },

  async getRecruiterDashboard(userId) {
    await delay()
    const user = store.users.find((u) => u.id === userId)
    const companyOffers = store.offers.filter((o) => o.companyId === user?.companyId)
    const offerIds = new Set(companyOffers.map((o) => o.id))
    const apps = store.applications.filter((a) => offerIds.has(a.offerId))
    return {
      totalApplications: apps.length,
      newApplications: apps.filter((a) => a.status === 'submitted').length,
      inInterview: apps.filter((a) => a.status === 'in_review').length,
      activeOffers: companyOffers.filter((o) => o.status === 'active').length,
      views: companyOffers.reduce((sum, o) => sum + (o.views || 0), 0),
      recentOffers: companyOffers.slice(0, 5).map((o) => ({
        ...enrichOffer(o),
        applicants: store.applications.filter((a) => a.offerId === o.id).length,
      })),
      suggestedTalents: Object.values(store.profiles)
        .slice(0, 3)
        .map((p) => ({
          ...p,
          user: publicUser(store.users.find((u) => u.id === p.userId)),
        })),
    }
  },

  async getAdminDashboard() {
    await delay()
    return {
      activeUsers: store.users.length * 1200,
      offersToModerate: store.reports.filter((r) => r.targetType === 'offer').length + 170,
      pendingCompanies: store.companies.filter((c) => c.status === 'pending').length,
      conversionRate: 8.2,
      verifications: await this.listVerifications(),
      reports: await this.listReports(),
      geo: [
        { city: 'Douala', percent: 45, count: 5580 },
        { city: 'Yaoundé', percent: 32, count: 3960 },
        { city: 'Autres', percent: 23, count: 2860 },
      ],
      logs: store.logs,
    }
  },

  async getCandidateProfile(userId) {
    await delay()
    const user = publicUser(store.users.find((u) => u.id === userId))
    const profile = store.profiles[userId]
    const ach = store.achievements.filter((a) => a.userId === userId)
    if (!user || !profile) throw new Error('Candidat introuvable.')
    return { user, profile: { ...profile, achievements: ach } }
  },

  getStore() {
    return store
  },
}
