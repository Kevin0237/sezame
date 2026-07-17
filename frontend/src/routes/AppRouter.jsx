import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { GuestOnly, RequireAuth } from '@/routes/guards'
import { RoleHomeRedirect } from '@/routes/RoleHomeRedirect'

import { LandingPage } from '@/pages/public/LandingPage'
import { PublicOffersPage } from '@/pages/public/PublicOffersPage'
import { OfferDetailPage } from '@/pages/public/OfferDetailPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { NotificationsPage } from '@/pages/shared/NotificationsPage'
import { SettingsPage } from '@/pages/shared/SettingsPage'
import { NotFoundPage } from '@/pages/shared/NotFoundPage'

import { StudentOnboardingPage } from '@/pages/student/StudentOnboardingPage'
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage'
import { StudentProfilePage } from '@/pages/student/StudentProfilePage'
import { EditProfilePage } from '@/pages/student/EditProfilePage'
import { AchievementFormPage } from '@/pages/student/AchievementFormPage'
import { StudentOffersPage } from '@/pages/student/StudentOffersPage'
import { StudentApplicationsPage } from '@/pages/student/StudentApplicationsPage'
import { ApplicationDetailPage } from '@/pages/student/ApplicationDetailPage'

import { RecruiterOnboardingPage } from '@/pages/recruiter/RecruiterOnboardingPage'
import { VerificationStatusPage } from '@/pages/recruiter/VerificationStatusPage'
import { RecruiterDashboardPage } from '@/pages/recruiter/RecruiterDashboardPage'
import { OfferFormPage } from '@/pages/recruiter/OfferFormPage'
import { RecruiterOffersPage } from '@/pages/recruiter/RecruiterOffersPage'
import { OfferApplicationsPage } from '@/pages/recruiter/OfferApplicationsPage'
import { CandidateProfilePage } from '@/pages/recruiter/CandidateProfilePage'
import { CompanyProfilePage } from '@/pages/recruiter/CompanyProfilePage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { VerificationsPage } from '@/pages/admin/VerificationsPage'
import { ModerationPage } from '@/pages/admin/ModerationPage'
import { AccountsPage } from '@/pages/admin/AccountsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/offers" element={<PublicOffersPage />} />
          <Route path="/offers/:id" element={<OfferDetailPage />} />

          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<RoleHomeRedirect />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              <Route element={<RequireAuth roles={['student']} />}>
                <Route path="student" element={<StudentDashboardPage />} />
                <Route path="student/onboarding" element={<StudentOnboardingPage />} />
                <Route path="student/profile" element={<StudentProfilePage />} />
                <Route path="student/profile/edit" element={<EditProfilePage />} />
                <Route path="student/achievements/new" element={<AchievementFormPage />} />
                <Route path="student/offers" element={<StudentOffersPage />} />
                <Route
                  path="student/offers/:id"
                  element={<OfferDetailPage connected />}
                />
                <Route path="student/applications" element={<StudentApplicationsPage />} />
                <Route path="student/applications/:id" element={<ApplicationDetailPage />} />
              </Route>

              <Route element={<RequireAuth roles={['recruiter']} />}>
                <Route path="recruiter" element={<RecruiterDashboardPage />} />
                <Route path="recruiter/onboarding" element={<RecruiterOnboardingPage />} />
                <Route path="recruiter/verification" element={<VerificationStatusPage />} />
                <Route path="recruiter/offers" element={<RecruiterOffersPage />} />
                <Route path="recruiter/offers/new" element={<OfferFormPage />} />
                <Route path="recruiter/offers/:id/edit" element={<OfferFormPage />} />
                <Route
                  path="recruiter/offers/:id/applications"
                  element={<OfferApplicationsPage />}
                />
                <Route path="recruiter/candidates/:userId" element={<CandidateProfilePage />} />
                <Route path="recruiter/company" element={<CompanyProfilePage />} />
              </Route>

              <Route element={<RequireAuth roles={['admin']} />}>
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/verifications" element={<VerificationsPage />} />
                <Route path="admin/moderation" element={<ModerationPage />} />
                <Route path="admin/accounts" element={<AccountsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
