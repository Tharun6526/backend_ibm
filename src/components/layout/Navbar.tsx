import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useAuth } from '../../context/AuthContext'

const routeTitles: Record<string, string> = {
  '/':              'Dashboard',
  '/jobs':          'Job Tracker',
  '/resume':        'Resume Builder',
  '/goals':         'Career Goals',
  '/skills':        'Skill Gap Analysis',
  '/copilot':       'AI Copilot',
  '/settings':      'Settings',
  '/career':        'Career Matches',
  '/skill-gap':     'Skill Gap Analysis',
  '/roadmap':        'Career Roadmap',
  '/courses':        'Recommended Courses',
  '/job-readiness':  'Job Readiness',
  '/mock-interview': 'Mock Interview',
}

interface NavbarProps {
  onMenuToggle?: () => void
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const title = Object.entries(routeTitles).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] ?? 'AI Career Copilot'

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AJ'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex items-center h-16 px-4 gap-4 bg-white border-b border-surface-200 flex-shrink-0">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-surface-900">{title}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search jobs, skills, contacts…"
            className={clsx(
              'w-full pl-9 pr-3 py-1.5 text-sm rounded-lg',
              'border border-surface-200 bg-surface-50',
              'placeholder:text-surface-400 text-surface-700',
              'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white',
              'transition-all duration-150'
            )}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Help */}
      <button
        className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={18} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-10 w-80 bg-white border border-surface-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <span className="text-sm font-semibold text-surface-900">Notifications</span>
              <Badge variant="primary" size="sm">3 new</Badge>
            </div>
            <ul>
              {mockNotifications.map((n) => (
                <li
                  key={n.id}
                  className={clsx(
                    'flex gap-3 px-4 py-3 text-sm border-b border-surface-50 hover:bg-surface-50 cursor-pointer transition-colors',
                    !n.read && 'bg-brand-50/40'
                  )}
                >
                  <span className="text-lg flex-shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-800 truncate">{n.title}</p>
                    <p className="text-surface-500 text-xs mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                  )}
                </li>
              ))}
            </ul>
            <div className="px-4 py-2">
              <button className="text-xs text-brand-600 hover:underline">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar & User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-surface-100 transition-colors"
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
          <ChevronDown size={14} className="text-surface-400 hidden sm:block" />
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-10 w-56 bg-white border border-surface-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
            <div className="px-4 py-3 border-b border-surface-100">
              <p className="text-sm font-semibold text-surface-900 truncate">
                {user?.name || 'Alex Johnson'}
              </p>
              <p className="text-xs text-surface-500 truncate">
                {user?.email || 'alex@example.com'}
              </p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setUserMenuOpen(false)
                  navigate('/settings')
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors text-left font-medium"
              >
                <User size={15} className="text-surface-500" />
                Profile & Settings
              </button>
            </div>
            <div className="border-t border-surface-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors text-left font-medium"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}


/* ── Mock data ───────────────────────────────────────────────── */
const mockNotifications = [
  { id: 1, icon: '🎯', title: 'New job match: Senior Frontend at Stripe', time: '2 min ago',   read: false },
  { id: 2, icon: '📝', title: 'Resume score improved to 87/100',           time: '1 hour ago', read: false },
  { id: 3, icon: '🏆', title: 'Goal achieved: 50 applications sent',       time: '3 hours ago',read: false },
  { id: 4, icon: '💡', title: 'New skill recommendation: TypeScript',      time: 'Yesterday',  read: true  },
]
