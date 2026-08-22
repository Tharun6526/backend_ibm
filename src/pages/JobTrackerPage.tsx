import { useState } from 'react'
import { clsx } from 'clsx'
import { Search, Plus, Filter, MapPin, DollarSign, Clock } from 'lucide-react'
import { Card, Badge, Button, Input, Progress } from '../components/ui'
import { mockJobs, type Job } from '../data/mock'

const statusColors: Record<Job['status'], 'primary' | 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  Applied:   'primary',
  Interview: 'warning',
  Offer:     'success',
  Rejected:  'danger',
  Saved:     'default',
}

const statusCounts = mockJobs.reduce<Record<string, number>>((acc, j) => {
  acc[j.status] = (acc[j.status] ?? 0) + 1
  return acc
}, {})

const STATUSES: Job['status'][] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

export function JobTrackerPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<Job['status'] | 'All'>('All')

  const filtered = mockJobs.filter((j) => {
    const matchesSearch =
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = activeFilter === 'All' || j.status === activeFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Job Tracker</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {mockJobs.length} applications tracked
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} className="sm:ml-auto">
          Add Application
        </Button>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-5 gap-3">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(activeFilter === status ? 'All' : status)}
            className={clsx(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all duration-150',
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

      {/* Filters row */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <Input
          leftIcon={<Search size={14} />}
          placeholder="Search by company or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          className="sm:max-w-xs"
        />
        <Button variant="secondary" size="md" leftIcon={<Filter size={14} />}>
          Filters
        </Button>
      </div>

      {/* Job cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No applications match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <Card key={job.id} hoverable>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center font-bold text-sm text-surface-700 flex-shrink-0">
                  {job.logo}
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
                    Applied {job.appliedDate}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <Progress
                  value={job.matchScore}
                  label="Match score"
                  showLabel
                  size="sm"
                  color={job.matchScore >= 85 ? 'success' : job.matchScore >= 70 ? 'brand' : 'warning'}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="xs" fullWidth>View</Button>
                <Button variant="secondary" size="xs" fullWidth>Update</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Keep lucide icon import satisfied
function Briefcase({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
}
