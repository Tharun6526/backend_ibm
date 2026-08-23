import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Search, MapPin, DollarSign, Clock, ExternalLink, Loader2, RefreshCw, X } from 'lucide-react'
import { Card, Badge, Button, Input, Progress } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getLiveJobsApi, LiveJobItem } from '../api/jobs'

const statusColors: Record<LiveJobItem['status'], 'primary' | 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  Applied:   'primary',
  Interview: 'warning',
  Offer:     'success',
  Rejected:  'danger',
  Saved:     'default',
}

const STATUSES: LiveJobItem['status'][] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

export function JobTrackerPage() {
  const { token } = useAuth()
  const [jobs, setJobs] = useState<LiveJobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<LiveJobItem['status'] | 'All'>('All')

  // Modals state
  const [editingJob, setEditingJob] = useState<LiveJobItem | null>(null)

  const fetchJobs = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const liveData = await getLiveJobsApi(token, search)
      setJobs(liveData || [])
    } catch (err) {
      console.error('Failed to fetch live jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [token])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  // Calculate status counts
  const statusCounts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1
    return acc
  }, {})

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = activeFilter === 'All' || j.status === activeFilter
    return matchesSearch && matchesStatus
  })

  // Open Real Job Posting URL
  const handleOpenJobUrl = (url: string) => {
    if (url) {
      const validUrl = url.startsWith('http') ? url : `https://${url}`
      window.open(validUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Update Status handler
  const handleUpdateStatus = (jobId: string, newStat: LiveJobItem['status']) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStat } : j))
    )
    setEditingJob(null)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Job Tracker & Live Postings</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            Real-world job opportunities powered by live API & tailored to your recommendations
          </p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={fetchJobs}
            disabled={loading}
          >
            Refresh Jobs
          </Button>
        </div>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(activeFilter === status ? 'All' : status)}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all duration-150 cursor-pointer',
              activeFilter === status
                ? 'border-brand-300 bg-brand-50'
                : 'border-surface-200 bg-white hover:border-surface-300 hover:bg-surface-50'
            )}
          >
            <span className="text-xl font-bold text-surface-900">{statusCounts[status] ?? 0}</span>
            <Badge variant={statusColors[status]} size="sm" dot>{status}</Badge>
          </button>
        ))}
      </div>

      {/* Search & Filters row */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-col sm:flex-row">
        <Input
          leftIcon={<Search size={14} />}
          placeholder="Search by company, role or tech stack…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          className="sm:max-w-md"
        />
        <Button type="submit" variant="secondary" size="md" leftIcon={<Search size={14} />}>
          Search Jobs
        </Button>
      </form>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 text-surface-500 flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-brand-500 mb-3" />
          <p className="text-sm font-medium">Fetching real-world live job postings for you...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <BriefcaseIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No live job applications match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <Card key={job.id} hoverable className="flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {job.logo || job.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 text-sm truncate">{job.role}</p>
                    <p className="text-xs text-surface-500 truncate">{job.company}</p>
                  </div>
                  <Badge variant={statusColors[job.status]} dot size="sm">
                    {job.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5">
                  <p className="text-xs text-surface-500 flex items-center gap-1.5">
                    <MapPin size={11} className="text-surface-400" />
                    {job.location}
                  </p>
                  {job.salary && (
                    <p className="text-xs text-surface-500 flex items-center gap-1.5">
                      <DollarSign size={11} className="text-surface-400" />
                      {job.salary}
                    </p>
                  )}
                  {job.appliedDate && (
                    <p className="text-xs text-surface-500 flex items-center gap-1.5">
                      <Clock size={11} className="text-surface-400" />
                      Posted {job.appliedDate}
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <Progress
                    value={job.matchScore}
                    label="Skill Match Score"
                    showLabel
                    size="sm"
                    color={job.matchScore >= 85 ? 'success' : job.matchScore >= 70 ? 'brand' : 'warning'}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2 pt-3 border-t border-surface-100">
                <Button
                  variant="primary"
                  size="xs"
                  fullWidth
                  rightIcon={<ExternalLink size={12} />}
                  onClick={() => handleOpenJobUrl(job.url)}
                  title="Open real-world job posting"
                >
                  View / Apply
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  fullWidth
                  onClick={() => setEditingJob(job)}
                >
                  Update Status
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-surface-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-surface-900">Update Application Status</h3>
              <button
                onClick={() => setEditingJob(null)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-surface-900">{editingJob.role}</p>
                <p className="text-xs text-surface-500">{editingJob.company}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">
                  Select New Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(editingJob.id, st)}
                      className={clsx(
                        'py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left flex items-center justify-between',
                        editingJob.status === st
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-surface-200 bg-white text-surface-700 hover:bg-surface-50'
                      )}
                    >
                      <span>{st}</span>
                      <Badge variant={statusColors[st]} size="sm" dot />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BriefcaseIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
}
