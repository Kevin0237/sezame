import { mockApi } from './mock'
import { httpApi } from './http'

const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

function requireUserId() {
  const raw = localStorage.getItem('sezame_user')
  if (!raw) throw new Error('Non authentifié.')
  return JSON.parse(raw).id
}

/**
 * Hybrid API client. Pages call these methods only.
 * Mock mode passes userId from localStorage; HTTP mode uses JWT.
 */
export const api = {
  useMock,

  auth: {
    register: (body) => (useMock ? mockApi.register(body) : httpApi.register(body)),
    login: (body) => (useMock ? mockApi.login(body) : httpApi.login(body)),
    logout: () => (useMock ? mockApi.logout() : httpApi.logout()),
  },

  profile: {
    getMe: () =>
      useMock ? mockApi.getProfileMe(requireUserId()) : httpApi.getProfileMe(),
    updateMe: (body) =>
      useMock ? mockApi.updateProfileMe(requireUserId(), body) : httpApi.updateProfileMe(body),
    addAchievement: (body) =>
      useMock
        ? mockApi.addAchievement(requireUserId(), body)
        : httpApi.addAchievement(body),
    deleteAchievement: (id) =>
      useMock
        ? mockApi.deleteAchievement(requireUserId(), id)
        : httpApi.deleteAchievement(id),
    getCandidate: (userId) =>
      useMock
        ? mockApi.getCandidateProfile(userId)
        : Promise.reject(new Error('Not implemented on HTTP yet')),
  },

  offers: {
    list: (params) => (useMock ? mockApi.listOffers(params) : httpApi.listOffers(params)),
    get: (id) => (useMock ? mockApi.getOffer(id) : httpApi.getOffer(id)),
    create: (body) =>
      useMock ? mockApi.createOffer(requireUserId(), body) : httpApi.createOffer(body),
    update: (id, body) =>
      useMock
        ? mockApi.updateOffer(requireUserId(), id, body)
        : httpApi.updateOffer(id, body),
    close: (id) =>
      useMock ? mockApi.closeOffer(requireUserId(), id) : httpApi.closeOffer(id),
  },

  applications: {
    create: (body) =>
      useMock
        ? mockApi.createApplication(requireUserId(), body)
        : httpApi.createApplication(body),
    listMine: () =>
      useMock
        ? mockApi.listMyApplications(requireUserId())
        : httpApi.listMyApplications(),
    get: (id) =>
      useMock
        ? mockApi.getApplication(requireUserId(), id)
        : Promise.reject(new Error('Not implemented on HTTP yet')),
    updateStatus: (id, body) =>
      useMock
        ? mockApi.updateApplicationStatus(requireUserId(), id, body)
        : httpApi.updateApplicationStatus(id, body),
    listForOffer: (offerId) =>
      useMock
        ? mockApi.listOfferApplications(offerId)
        : Promise.reject(new Error('Not implemented on HTTP yet')),
  },

  company: {
    submitVerification: (body) =>
      useMock
        ? mockApi.submitCompanyVerification(requireUserId(), body)
        : httpApi.submitCompanyVerification(body),
    getStatus: () =>
      useMock ? mockApi.getCompanyStatus(requireUserId()) : httpApi.getCompanyStatus(),
    update: (body) =>
      useMock
        ? mockApi.updateCompany(requireUserId(), body)
        : Promise.reject(new Error('Not implemented on HTTP yet')),
  },

  admin: {
    listVerifications: () =>
      useMock ? mockApi.listVerifications() : httpApi.listVerifications(),
    resolveVerification: (userId, body) =>
      useMock
        ? mockApi.resolveVerification(requireUserId(), userId, body)
        : httpApi.resolveVerification(userId, body),
    listReports: () => (useMock ? mockApi.listReports() : httpApi.listReports()),
    disableOffer: (id) =>
      useMock ? mockApi.disableOffer(id) : httpApi.disableOffer(id),
    listAccounts: (params) =>
      useMock
        ? mockApi.listAccounts(params)
        : Promise.reject(new Error('Not implemented on HTTP yet')),
    setAccountDisabled: (userId, disabled) =>
      useMock
        ? mockApi.setAccountDisabled(userId, disabled)
        : Promise.reject(new Error('Not implemented on HTTP yet')),
    getDashboard: () =>
      useMock
        ? mockApi.getAdminDashboard()
        : Promise.reject(new Error('Not implemented on HTTP yet')),
  },

  notifications: {
    list: (params) =>
      useMock
        ? mockApi.listNotifications(requireUserId(), params)
        : httpApi.listNotifications(params),
    markRead: (id) =>
      useMock
        ? mockApi.markNotificationRead(requireUserId(), id)
        : httpApi.markNotificationRead(id),
  },

  dashboard: {
    recruiter: () =>
      useMock
        ? mockApi.getRecruiterDashboard(requireUserId())
        : Promise.reject(new Error('Not implemented on HTTP yet')),
  },

  recruiter: {
    listOffers: () =>
      useMock
        ? mockApi.listCompanyOffers(requireUserId())
        : Promise.reject(new Error('Not implemented on HTTP yet')),
  },
}
