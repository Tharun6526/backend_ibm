// ─── Mock data for the entire app ───────────────────────────
// All data is static – no API calls, no backend.

export interface Job {
  id: string
  company: string
  role: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote'
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'
  salary?: string
  appliedDate?: string
  logo: string
  matchScore: number
}

export interface Skill {
  name: string
  current: number   // 0-100
  required: number  // 0-100
  category: string
}

export interface Goal {
  id: string
  title: string
  description: string
  progress: number
  dueDate: string
  status: 'On Track' | 'At Risk' | 'Completed'
  milestones: { label: string; done: boolean }[]
}

export interface Activity {
  id: string
  type: 'application' | 'interview' | 'offer' | 'skill' | 'resume'
  text: string
  time: string
}

/* ── Jobs ─────────────────────────────────────────────────── */
export const mockJobs: Job[] = [
  {
    id: '1',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco, CA',
    type: 'Remote',
    status: 'Interview',
    salary: '$160k – $220k',
    appliedDate: '2024-01-15',
    logo: 'S',
    matchScore: 92,
  },
  {
    id: '2',
    company: 'Vercel',
    role: 'Staff Software Engineer',
    location: 'Remote',
    type: 'Remote',
    status: 'Applied',
    salary: '$180k – $240k',
    appliedDate: '2024-01-18',
    logo: 'V',
    matchScore: 88,
  },
  {
    id: '3',
    company: 'Linear',
    role: 'Product Engineer',
    location: 'New York, NY',
    type: 'Full-time',
    status: 'Applied',
    salary: '$140k – $180k',
    appliedDate: '2024-01-20',
    logo: 'L',
    matchScore: 85,
  },
  {
    id: '4',
    company: 'Figma',
    role: 'Frontend Engineer',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Saved',
    salary: '$150k – $200k',
    logo: 'F',
    matchScore: 79,
  },
  {
    id: '5',
    company: 'Notion',
    role: 'Senior React Engineer',
    location: 'Remote',
    type: 'Remote',
    status: 'Offer',
    salary: '$155k – $205k',
    appliedDate: '2024-01-10',
    logo: 'N',
    matchScore: 94,
  },
  {
    id: '6',
    company: 'Loom',
    role: 'Frontend Developer',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Rejected',
    salary: '$120k – $160k',
    appliedDate: '2024-01-05',
    logo: 'LM',
    matchScore: 71,
  },
]

/* ── Skills ───────────────────────────────────────────────── */
export const mockSkills: Skill[] = [
  { name: 'React',          current: 90, required: 95, category: 'Frontend' },
  { name: 'TypeScript',     current: 75, required: 90, category: 'Frontend' },
  { name: 'Node.js',        current: 60, required: 80, category: 'Backend'  },
  { name: 'GraphQL',        current: 45, required: 75, category: 'Backend'  },
  { name: 'System Design',  current: 55, required: 85, category: 'Architecture' },
  { name: 'CSS / Tailwind', current: 88, required: 80, category: 'Frontend' },
  { name: 'Testing',        current: 50, required: 85, category: 'Quality'  },
  { name: 'CI/CD',          current: 40, required: 70, category: 'DevOps'   },
]

/* ── Goals ────────────────────────────────────────────────── */
export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Land a Senior Engineer role',
    description: 'Target FAANG or top-tier startup, $160k+ compensation',
    progress: 65,
    dueDate: 'March 2024',
    status: 'On Track',
    milestones: [
      { label: 'Update resume',              done: true  },
      { label: 'Apply to 20 companies',      done: true  },
      { label: 'Complete 10 interviews',     done: false },
      { label: 'Negotiate offer',            done: false },
    ],
  },
  {
    id: '2',
    title: 'Improve TypeScript proficiency',
    description: 'Reach advanced level — generics, utility types, decorators',
    progress: 45,
    dueDate: 'February 2024',
    status: 'At Risk',
    milestones: [
      { label: 'Complete TS course',         done: true  },
      { label: 'Build 2 TS projects',        done: false },
      { label: 'Pass TS certification',      done: false },
    ],
  },
  {
    id: '3',
    title: 'Build personal portfolio',
    description: 'Showcase 3 major projects with case studies',
    progress: 100,
    dueDate: 'January 2024',
    status: 'Completed',
    milestones: [
      { label: 'Design mockups',             done: true  },
      { label: 'Build the site',             done: true  },
      { label: 'Write case studies',         done: true  },
      { label: 'Deploy to production',       done: true  },
    ],
  },
]

/* ── Activity ─────────────────────────────────────────────── */
export const mockActivity: Activity[] = [
  { id: '1', type: 'offer',       text: 'Received offer from Notion – $180k',           time: '2h ago'   },
  { id: '2', type: 'interview',   text: 'Interview scheduled with Stripe (Round 2)',     time: '5h ago'   },
  { id: '3', type: 'application', text: 'Applied to Linear – Product Engineer',          time: 'Yesterday'},
  { id: '4', type: 'skill',       text: 'Completed "Advanced TypeScript" course',        time: '2d ago'   },
  { id: '5', type: 'resume',      text: 'Resume score improved: 74 → 87',               time: '3d ago'   },
  { id: '6', type: 'application', text: 'Applied to Vercel – Staff Software Engineer',  time: '3d ago'   },
]

/* ── Dashboard stats ──────────────────────────────────────── */
export const mockStats = {
  applicationsSent:   23,
  interviewsScheduled: 5,
  offersReceived:      2,
  profileScore:       87,
}
