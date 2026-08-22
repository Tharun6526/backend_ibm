import { clsx } from 'clsx'
import {
  TrendingUp,
  Briefcase,
  Calendar,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardFooter,
  Badge,
  Button,
  Progress,
} from '../components/ui'
import { mockStats, mockJobs, mockActivity, mockSkills, mockGoals } from '../data/mock'

const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  Applied:   'primary',
  Interview: 'warning',
  Offer:     'success',
  Rejected:  'danger',
  Saved:     'default',
}

const activityIcons: Record<string, React.ReactNode> = {
  offer:       <Award size={14} className="text-success-600" />,
  interview:   <Calendar size={14} className="text-warning-600" />,
  application: <Briefcase size={14} className="text-info-600" />,
  skill:       <TrendingUp size={14} className="text-brand-600" />,
  resume:      <CheckCircle2 size={14} className="text-accent-500" />,
}

export function DashboardPage() {
  const topJobs = mockJobs.filter((j) => j.status !== 'Rejected').slice(0, 4)
  const topSkills = mockSkills.slice(0, 4)
  const activeGoal = mockGoals[0]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">
            Welcome back, Alex 👋
          </h2>
          <p className="text-sm text-surface-500 mt-0.5">
            Here's what's happening with your career today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot size="lg">Profile 87% complete</Badge>
          <Button variant="primary" size="sm" leftIcon={<Flame size={14} />}>
            Complete Profile
          </Button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Applications Sent',     value: mockStats.applicationsSent,     icon: <Briefcase size={18} />,    color: 'text-info-600',    bg: 'bg-info-50' },
          { label: 'Interviews Scheduled',  value: mockStats.interviewsScheduled,  icon: <Calendar size={18} />,     color: 'text-warning-600', bg: 'bg-warning-50' },
          { label: 'Offers Received',       value: mockStats.offersReceived,       icon: <Award size={18} />,        color: 'text-success-600', bg: 'bg-success-50' },
          { label: 'Profile Score',         value: `${mockStats.profileScore}%`,   icon: <TrendingUp size={18} />,   color: 'text-brand-600',   bg: 'bg-brand-50' },
        ].map((stat) => (
          <Card key={stat.label} variant="default" padding="md" hoverable>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-surface-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
              </div>
              <div className={clsx('p-2 rounded-lg flex-shrink-0', stat.bg, stat.color)}>
                {stat.icon}
              </div>
            </div>
            <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
              <ArrowUpRight size={11} />
              <span>+12% this week</span>
            </p>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active applications */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-surface-100">
              <div>
                <CardTitle>Active Applications</CardTitle>
                <CardDescription className="mt-0.5">Track your job pipeline</CardDescription>
              </div>
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={14} />}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-surface-50">
              {topJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center font-semibold text-sm text-surface-700 flex-shrink-0">
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{job.role}</p>
                    <p className="text-xs text-surface-500 truncate">{job.company} · {job.location}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-surface-500 hidden sm:block">
                      {job.matchScore}% match
                    </span>
                    <Badge variant={statusColors[job.status] ?? 'default'} dot size="sm">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-surface-100">
              <button className="text-xs text-brand-600 hover:underline font-medium">
                + Add new application
              </button>
            </div>
          </Card>

          {/* Skill gaps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Skill Gaps</CardTitle>
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={14} />}>
                  Full analysis
                </Button>
              </div>
              <CardDescription>Skills needed for your target roles</CardDescription>
            </CardHeader>
            <div className="mt-4 space-y-4">
              {topSkills.map((skill) => {
                const gap = skill.required - skill.current
                return (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-surface-700">{skill.name}</span>
                        <Badge variant="default" size="sm">{skill.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-surface-500">
                        {gap > 0 && (
                          <span className="text-warning-600 font-medium">–{gap}pts gap</span>
                        )}
                        <span>{skill.current}/{skill.required}</span>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-surface-100 overflow-hidden">
                      {/* Required marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-surface-300 z-10"
                        style={{ left: `${skill.required}%` }}
                      />
                      {/* Fill */}
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all duration-500',
                          skill.current >= skill.required
                            ? 'bg-success-500'
                            : skill.current >= skill.required * 0.8
                            ? 'bg-warning-500'
                            : 'bg-brand-500'
                        )}
                        style={{ width: `${skill.current}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Active goal */}
          <Card>
            <CardHeader>
              <CardTitle>Active Goal</CardTitle>
              <CardDescription className="mt-0.5">
                {activeGoal.title}
              </CardDescription>
            </CardHeader>
            <div className="mt-4">
              <Progress
                value={activeGoal.progress}
                label="Overall progress"
                showLabel
                color={
                  activeGoal.status === 'Completed' ? 'success'
                  : activeGoal.status === 'At Risk'  ? 'warning'
                  : 'brand'
                }
                size="lg"
              />
              <div className="mt-4 space-y-2">
                {activeGoal.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2
                      size={15}
                      className={m.done ? 'text-success-500' : 'text-surface-200'}
                    />
                    <span className={m.done ? 'text-surface-500 line-through' : 'text-surface-700'}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <CardFooter>
              <Badge
                variant={
                  activeGoal.status === 'Completed' ? 'success'
                  : activeGoal.status === 'At Risk'  ? 'warning'
                  : 'primary'
                }
                dot
              >
                {activeGoal.status}
              </Badge>
              <span className="ml-auto text-xs text-surface-400">Due {activeGoal.dueDate}</span>
            </CardFooter>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <div className="mt-4 space-y-3">
              {mockActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {activityIcons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-700 leading-relaxed">{item.text}</p>
                    <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
