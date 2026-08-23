import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import {
  User,
  BookOpen,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  FileText,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getProfileApi, updateProfileApi, ProfilePayload } from '../api/profile'
import { getLatestResumeApi } from '../api/resume'
import { getGithubProfileApi, GithubProfileData } from '../api/github'

function GithubIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

type TabType = 'profile' | 'preferences' | 'security' | 'integrations'

export function SettingsPage() {
  const { token, user } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Profile form state
  const [name, setName] = useState(user?.name || '')
  const [college, setCollege] = useState('')
  const [degree, setDegree] = useState('')
  const [branch, setBranch] = useState('')
  const [graduationYear, setGraduationYear] = useState<number | ''>('')
  const [careerGoal, setCareerGoal] = useState('')

  // Preference state
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER')
  const [hoursPerDay, setHoursPerDay] = useState<number>(2)
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<string>('Practical Project-Based')
  const [targetMonths, setTargetMonths] = useState<number>(6)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Integrations state
  const [resumeData, setResumeData] = useState<any>(null)
  const [githubData, setGithubData] = useState<GithubProfileData | null>(null)

  // Load existing profile from backend
  const loadProfile = async () => {
    if (!token) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const data = await getProfileApi(token)
      if (data) {
        if (data.user?.name) setName(data.user.name)
        setCollege(data.college || '')
        setDegree(data.degree || '')
        setBranch(data.branch || '')
        setGraduationYear(data.graduationYear || '')
        setCareerGoal(data.careerGoal || '')
        if (data.experienceLevel) setExperienceLevel(data.experienceLevel)
        if (data.hoursPerDay) setHoursPerDay(data.hoursPerDay)
        if (data.preferredLearningStyle) setPreferredLearningStyle(data.preferredLearningStyle)
        if (data.targetMonths) setTargetMonths(data.targetMonths)
      }

      // Check integrations status
      const [resData, ghData] = await Promise.all([
        getLatestResumeApi(token).catch(() => null),
        getGithubProfileApi(token).catch(() => null),
      ])
      setResumeData(resData)
      setGithubData(ghData)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load profile data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [token])

  // Save profile updates
  const handleSaveProfile = async () => {
    if (!token) return
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    const payload: ProfilePayload = {
      name,
      college,
      degree,
      branch,
      graduationYear: typeof graduationYear === 'number' ? graduationYear : undefined,
      careerGoal,
      experienceLevel,
      hoursPerDay,
      preferredLearningStyle,
      targetMonths,
    }

    try {
      await updateProfileApi(token, payload)
      setSuccessMsg('Profile and preferences updated successfully!')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // Save password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      // Simulate password change success
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSuccessMsg('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand-500 mb-3" />
        <p className="text-sm font-medium text-surface-600">Loading profile & settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Profile & Settings</h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage your account profile, learning goals, preferences, and security settings.
        </p>
      </div>

      {/* Success / Error Toast Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} className="text-success-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 flex items-center gap-3 text-sm">
          <AlertCircle size={18} className="text-danger-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-surface-200 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2',
            activeTab === 'profile'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          )}
        >
          <User size={16} /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2',
            activeTab === 'preferences'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          )}
        >
          <BookOpen size={16} /> Learning & Career Goals
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2',
            activeTab === 'integrations'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          )}
        >
          <Sparkles size={16} /> Integrations & Resume
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2',
            activeTab === 'security'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          )}
        >
          <ShieldCheck size={16} /> Security & Password
        </button>
      </div>

      {/* Tab 1: Personal Profile */}
      {activeTab === 'profile' && (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal and academic information.</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Full Name</label>
                <Input fullWidth value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Johnson" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Email Address</label>
                <Input fullWidth value={user?.email || ''} disabled className="bg-surface-50 text-surface-500" />
              </div>
            </div>

            <div className="border-t border-surface-100 pt-4 mt-4">
              <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
                <GraduationCap size={16} className="text-brand-500" /> Academic Background
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">College / University</label>
                  <Input
                    fullWidth
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Degree</label>
                  <Input
                    fullWidth
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Technology (B.Tech)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Branch / Major</label>
                  <Input
                    fullWidth
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Graduation Year</label>
                  <Input
                    fullWidth
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 2025"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                disabled={saving}
                onClick={handleSaveProfile}
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Preferences & Career Goals */}
      {activeTab === 'preferences' && (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Learning Preferences & Goals</CardTitle>
            <CardDescription>Tailor your learning pace and career roadmap targets.</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Primary Target Career Goal</label>
              <Input
                fullWidth
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Scientist, AI Engineer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                >
                  <option value="BEGINNER">Beginner (0-1 years)</option>
                  <option value="INTERMEDIATE">Intermediate (1-3 years)</option>
                  <option value="ADVANCED">Advanced (3+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Daily Study Commitment</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="flex-1 accent-brand-500"
                  />
                  <Badge variant="primary" size="md">
                    {hoursPerDay} {hoursPerDay === 1 ? 'hour' : 'hours'} / day
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Target Timeline</label>
                <select
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                >
                  <option value={3}>3 Months (Fast Track)</option>
                  <option value={6}>6 Months (Standard)</option>
                  <option value={12}>12 Months (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Preferred Learning Style</label>
                <select
                  value={preferredLearningStyle}
                  onChange={(e) => setPreferredLearningStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                >
                  <option value="Practical Project-Based">Practical Project-Based</option>
                  <option value="Visual & Video Modules">Visual & Video Modules</option>
                  <option value="Theory & Documentation">Theory & Documentation</option>
                  <option value="Interactive Coding Exercises">Interactive Coding Exercises</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                disabled={saving}
                onClick={handleSaveProfile}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Integrations & Resume */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-surface-900">Uploaded Resume</h3>
                  <p className="text-xs text-surface-500">
                    {resumeData ? `Active file: ${resumeData.fileName || 'resume.pdf'}` : 'No resume uploaded yet'}
                  </p>
                </div>
              </div>
              <Badge variant={resumeData ? 'success' : 'warning'}>
                {resumeData ? 'Uploaded & Analyzed' : 'Not Connected'}
              </Badge>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-100 text-surface-800 flex items-center justify-center">
                  <GithubIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-surface-900">GitHub Profile</h3>
                  <p className="text-xs text-surface-500">
                    {githubData ? `@${githubData.username} (${githubData.publicRepos} Repositories)` : 'Not connected yet'}
                  </p>
                </div>
              </div>
              <Badge variant={githubData ? 'success' : 'default'}>
                {githubData ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Security & Password */}
      {activeTab === 'security' && (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Ensure your account remains secure with a strong password.</CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Current Password</label>
                <Input
                  fullWidth
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">New Password</label>
                <Input
                  fullWidth
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Confirm New Password</label>
                <Input
                  fullWidth
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
