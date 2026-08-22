// ─── Mock data for the Skill Gap Analysis page ───────────────
// Route: /skill-gap
// Easy to replace with backend data later.

export type Priority = 'Critical' | 'High' | 'Medium' | 'Strong'

export interface SkillItem {
  id:                string
  name:              string
  category:          string
  current:           number   // 0-100
  target:            number   // 0-100
  gap:               number   // target - current (computed)
  priority:          Priority
  description:       string
  recommendedAction: string
  subSkills?:        { name: string; current: number }[]
}

export interface SkillCategory {
  id:      string
  name:    string
  current: number
  target:  number
}

export interface StrongSkill {
  name:  string
  score: number
}

export interface FocusArea {
  name:     string
  priority: Priority
  current:  number
  target:   number
  gap:      number
}

/* ── Summary ──────────────────────────────────────────────── */
export const SKILL_GAP_SUMMARY = {
  careerTarget:      'Software Developer',
  overallCurrent:    72,
  overallTarget:     85,
  skillsEvaluated:   10,
  strongSkillCount:  4,
  improvementCount:  6,
}

/* ── Categories ───────────────────────────────────────────── */
export const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'programming',   name: 'Programming',                    current: 78, target: 90 },
  { id: 'dsa',           name: 'Data Structures & Algorithms',   current: 55, target: 85 },
  { id: 'backend',       name: 'Backend Development',            current: 68, target: 85 },
  { id: 'databases',     name: 'Databases',                      current: 82, target: 90 },
  { id: 'testing',       name: 'Testing',                        current: 50, target: 75 },
  { id: 'system-design', name: 'System Design',                  current: 20, target: 65 },
  { id: 'git',           name: 'Git & GitHub',                   current: 85, target: 85 },
  { id: 'cloud',         name: 'Cloud Fundamentals',             current: 35, target: 70 },
]

/* ── Detailed skill items ─────────────────────────────────── */
export const SKILL_ITEMS: SkillItem[] = [
  {
    id:       'system-design',
    name:     'System Design',
    category: 'System Design',
    current:  20,
    target:   65,
    gap:      45,
    priority: 'Critical',
    description:
      'System design is important for designing scalable backend applications and services.',
    recommendedAction:
      'Complete the System Design fundamentals section of your roadmap.',
  },
  {
    id:       'dsa',
    name:     'Data Structures & Algorithms',
    category: 'DSA',
    current:  55,
    target:   85,
    gap:      30,
    priority: 'High',
    description:
      'DSA is fundamental for software engineering interviews and writing efficient code.',
    recommendedAction:
      'Practice DSA problems consistently — start with arrays and linked lists.',
    subSkills: [
      { name: 'Arrays',        current: 80 },
      { name: 'Strings',       current: 75 },
      { name: 'Hashing',       current: 65 },
      { name: 'Linked Lists',  current: 45 },
      { name: 'Trees',         current: 30 },
      { name: 'Graphs',        current: 20 },
    ],
  },
  {
    id:       'cloud',
    name:     'Cloud Fundamentals',
    category: 'Cloud',
    current:  35,
    target:   70,
    gap:      35,
    priority: 'High',
    description:
      'Cloud knowledge is increasingly expected in software developer roles.',
    recommendedAction:
      'Start with AWS or GCP fundamentals; focus on compute, storage and networking basics.',
  },
  {
    id:       'testing',
    name:     'Testing',
    category: 'Testing',
    current:  50,
    target:   75,
    gap:      25,
    priority: 'Medium',
    description:
      'Writing tests improves code quality and is a key professional skill.',
    recommendedAction:
      'Learn unit testing with JUnit and integration testing patterns.',
  },
  {
    id:       'backend',
    name:     'Backend Development',
    category: 'Backend',
    current:  68,
    target:   85,
    gap:      17,
    priority: 'Medium',
    description:
      'Deeper backend skills — frameworks, REST, middleware — are required at the senior level.',
    recommendedAction:
      'Build one complete backend project using Spring Boot or Node.js.',
  },
]

/* ── Strong skills ────────────────────────────────────────── */
export const STRONG_SKILLS: StrongSkill[] = [
  { name: 'Java',        score: 80 },
  { name: 'SQL',         score: 82 },
  { name: 'Git & GitHub', score: 85 },
  { name: 'React',       score: 75 },
]

/* ── Focus areas (ranked) ─────────────────────────────────── */
export const FOCUS_AREAS: FocusArea[] = [
  { name: 'System Design',  priority: 'Critical', current: 20, target: 65, gap: 45 },
  { name: 'DSA',            priority: 'High',     current: 55, target: 85, gap: 30 },
  { name: 'Cloud',          priority: 'High',     current: 35, target: 70, gap: 35 },
]

/* ── Priority badge variants ─────────────────────────────── */
export const PRIORITY_VARIANT: Record<Priority, 'danger' | 'warning' | 'info' | 'success'> = {
  Critical: 'danger',
  High:     'warning',
  Medium:   'info',
  Strong:   'success',
}
