import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { DashboardPage }    from './pages/DashboardPage'
import { JobTrackerPage }   from './pages/JobTrackerPage'
import { ResumeBuilderPage } from './pages/ResumeBuilderPage'
import { CareerGoalsPage }  from './pages/CareerGoalsPage'
import { SkillGapPage }     from './pages/SkillGapPage'
import { CopilotPage }      from './pages/CopilotPage'
import { WelcomePage }      from './pages/WelcomePage'
import { LoginPage }        from './pages/LoginPage'
import { RegisterPage }     from './pages/RegisterPage'
import { OnboardingPage }   from './pages/OnboardingPage'
import { ProfileInputPage } from './pages/ProfileInputPage'
import { AnalysisPage }              from './pages/AnalysisPage'
import { CareerRecommendationPage }  from './pages/CareerRecommendationPage'
import { CareerDetailPage }          from './pages/CareerDetailPage'
import { SkillGapAnalysisPage }      from './pages/SkillGapAnalysisPage'
import { RoadmapPage }               from './pages/RoadmapPage'
import { CoursesPage }               from './pages/CoursesPage'
import { JobReadinessPage }          from './pages/JobReadinessPage'
import { MockInterviewPage }         from './pages/MockInterviewPage'
import { SettingsPage }              from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public routes (no sidebar / navbar) ── */}
        <Route path="/welcome"    element={<WelcomePage />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/onboarding"   element={<OnboardingPage />} />
        <Route path="/profile-input" element={<ProfileInputPage />} />
        <Route path="/analysis"      element={<AnalysisPage />} />

        {/* ── Authenticated shell (sidebar + navbar) ── */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/jobs"         element={<JobTrackerPage />} />
          <Route path="/resume"       element={<ResumeBuilderPage />} />
          <Route path="/goals"        element={<CareerGoalsPage />} />
          <Route path="/skills"       element={<SkillGapPage />} />
          <Route path="/copilot"      element={<CopilotPage />} />
          <Route path="/settings"     element={<SettingsPage />} />
          {/* Phase 5 */}
          <Route path="/career"               element={<CareerRecommendationPage />} />
          <Route path="/career/:careerId"     element={<CareerDetailPage />} />
          {/* Placeholder targets for future phases */}
          <Route path="/roadmap"    element={<RoadmapPage />} />
          <Route path="/skill-gap"  element={<SkillGapAnalysisPage />} />
          <Route path="/courses"          element={<CoursesPage />} />
          <Route path="/job-readiness"    element={<JobReadinessPage />} />
          <Route path="/mock-interview"   element={<MockInterviewPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

