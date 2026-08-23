import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Target,
  BookOpen,
  MessageSquare,
  Settings,
  Zap,
  ChevronRight,
  Award,
  Map,
  GraduationCap,
  ShieldCheck,
  Mic,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  label: string
  icon: React.ReactNode
  to: string
  badge?: string | number
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard',           icon: <LayoutDashboard size={18} />, to: '/'           },
  { label: 'Career Matches',      icon: <Award size={18} />,           to: '/career',    badge: 'New', badgeVariant: 'success' },
  { label: 'Skill Gap',           icon: <BookOpen size={18} />,        to: '/skill-gap'  },
  { label: 'My Roadmap',          icon: <Map size={18} />,             to: '/roadmap'    },
  { label: 'Courses',             icon: <GraduationCap size={18} />,   to: '/courses'       },
  { label: 'Job Readiness',       icon: <ShieldCheck size={18} />,     to: '/job-readiness' },
  { label: 'Mock Interview',      icon: <Mic size={18} />,             to: '/mock-interview' },
  { label: 'Job Tracker',         icon: <Briefcase size={18} />,       to: '/jobs',      badge: 3,     badgeVariant: 'primary' },
  { label: 'Resume Builder',      icon: <FileText size={18} />,        to: '/resume'     },
  { label: 'Career Goals',        icon: <Target size={18} />,          to: '/goals'      },
  { label: 'AI Copilot',          icon: <MessageSquare size={18} />,   to: '/copilot',   badge: 2,     badgeVariant: 'info' },
]

const secondaryNav: NavItem[] = [
  { label: 'Settings', icon: <Settings size={18} />, to: '/settings' },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AJ'

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-white border-r border-surface-200',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-surface-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-surface-900 whitespace-nowrap text-sm">
              Career Copilot
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1 rounded text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
        )}

        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute left-12 p-1 rounded-full bg-white border border-surface-200 text-surface-400 hover:text-surface-600 shadow-sm"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150',
                  'group relative',
                  isActive(item.to)
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={clsx(
                    'flex-shrink-0 transition-colors',
                    isActive(item.to) ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'
                  )}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant={item.badgeVariant ?? 'default'}
                        size="sm"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Active indicator */}
                {isActive(item.to) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-brand-500" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Secondary nav */}
      <div className="py-3 px-2 border-t border-surface-100">
        <ul className="space-y-0.5">
          {secondaryNav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150',
                  isActive(item.to)
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0 text-surface-400">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* User avatar row */}
        {!collapsed && (
          <Link
            to="/settings"
            className="mt-3 flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-surface-50 transition-colors group cursor-pointer"
            title="View Profile & Settings"
          >
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-800 group-hover:text-brand-600 truncate">
                {user?.name || 'Alex Johnson'}
              </p>
              <p className="text-xs text-surface-400 truncate">
                {user?.email || 'alex@example.com'}
              </p>
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}

