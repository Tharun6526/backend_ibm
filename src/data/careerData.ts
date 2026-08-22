// ─── Shared mock data for Career Recommendation feature ──────
// Imported by CareerRecommendationPage and CareerDetailPage.

export interface CareerMatch {
  id:          string
  title:       string
  matchPct:    number
  shortWhy:    string
  strengths:   string[]
  improveSkill: string
  fitTag:      'Strong' | 'Moderate' | 'Developing'
}

export interface SkillLevel {
  name:  string
  level: 'Strong' | 'Good' | 'Intermediate' | 'Beginner'
  pct:   number
}

export interface SkillGap {
  name:    string
  current: number
  target:  number
}

export interface CareerDetail extends CareerMatch {
  description:  string
  whyFits:      { skill: string; note: string }[]
  currentSkills: SkillLevel[]
  skillGaps:    SkillGap[]
  fitBreakdown: { label: string; pct: number }[]
  typicalSkills: string[]
  mainGap:      string
}

export const CAREER_MATCHES: CareerMatch[] = [
  {
    id:          'software-developer',
    title:       'Software Developer',
    matchPct:    91,
    shortWhy:    'Your project experience and Java skills strongly align with software development.',
    strengths:   ['Java', 'SQL', 'REST APIs'],
    improveSkill: 'System Design',
    fitTag:      'Strong',
  },
  {
    id:          'backend-developer',
    title:       'Backend Developer',
    matchPct:    87,
    shortWhy:    'Strong backend project history and SQL knowledge make this a great fit.',
    strengths:   ['Java', 'SQL', 'REST APIs'],
    improveSkill: 'System Design',
    fitTag:      'Strong',
  },
  {
    id:          'data-analyst',
    title:       'Data Analyst',
    matchPct:    73,
    shortWhy:    'Your SQL skills are a solid foundation; data visualization will unlock this path.',
    strengths:   ['SQL', 'Python', 'Data'],
    improveSkill: 'Data Visualization',
    fitTag:      'Moderate',
  },
  {
    id:          'ml-engineer',
    title:       'ML Engineer',
    matchPct:    68,
    shortWhy:    'Promising interest in AI/ML; deeper math and frameworks will get you there.',
    strengths:   ['Python', 'Data'],
    improveSkill: 'Machine Learning',
    fitTag:      'Developing',
  },
]

export const CAREER_DETAILS: Record<string, CareerDetail> = {
  'software-developer': {
    ...CAREER_MATCHES[0],
    description:
      'Software developers design, build, test and maintain software applications and services. They work across the full lifecycle — from architecture to deployment.',
    whyFits: [
      { skill: 'Java',                  note: 'Strong foundation detected from projects'   },
      { skill: 'SQL',                   note: 'Database work present in repositories'      },
      { skill: 'Git',                   note: 'Consistent version control usage'           },
      { skill: 'Backend Projects',      note: '3+ backend projects on GitHub'              },
      { skill: 'Problem Solving',       note: 'DSA progress shows analytical thinking'     },
    ],
    currentSkills: [
      { name: 'Java',    level: 'Strong',       pct: 85 },
      { name: 'SQL',     level: 'Strong',       pct: 80 },
      { name: 'Git',     level: 'Good',         pct: 75 },
      { name: 'React',   level: 'Intermediate', pct: 60 },
      { name: 'Python',  level: 'Intermediate', pct: 55 },
    ],
    skillGaps: [
      { name: 'DSA',            current: 55, target: 85 },
      { name: 'System Design',  current: 20, target: 65 },
      { name: 'Testing',        current: 50, target: 70 },
      { name: 'Spring Boot',    current: 60, target: 80 },
    ],
    fitBreakdown: [
      { label: 'Technical Skills',    pct: 85 },
      { label: 'Projects',            pct: 82 },
      { label: 'Experience',          pct: 70 },
      { label: 'Interests',           pct: 94 },
      { label: 'Learning Alignment',  pct: 88 },
    ],
    typicalSkills: ['Java', 'Data Structures', 'Algorithms', 'REST APIs', 'Databases', 'Testing', 'System Design', 'Git', 'Cloud Fundamentals'],
    mainGap: 'System Design',
  },
  'backend-developer': {
    ...CAREER_MATCHES[1],
    description:
      'Backend developers build server-side logic, APIs, databases and infrastructure that power applications.',
    whyFits: [
      { skill: 'Java',        note: 'Primary language in your projects' },
      { skill: 'SQL',         note: 'Used across multiple repositories' },
      { skill: 'REST APIs',   note: 'API projects identified on GitHub' },
      { skill: 'Git',         note: 'Regular commit history'            },
      { skill: 'Node.js',     note: 'Detected in E-Commerce-API project'},
    ],
    currentSkills: [
      { name: 'Java',      level: 'Strong',       pct: 85 },
      { name: 'SQL',       level: 'Strong',       pct: 80 },
      { name: 'Node.js',   level: 'Good',         pct: 70 },
      { name: 'REST APIs', level: 'Good',         pct: 72 },
      { name: 'Python',    level: 'Intermediate', pct: 55 },
    ],
    skillGaps: [
      { name: 'System Design',  current: 20, target: 75 },
      { name: 'DSA',            current: 55, target: 80 },
      { name: 'Microservices',  current: 25, target: 65 },
      { name: 'Docker',         current: 30, target: 60 },
    ],
    fitBreakdown: [
      { label: 'Technical Skills',    pct: 83 },
      { label: 'Projects',            pct: 88 },
      { label: 'Experience',          pct: 68 },
      { label: 'Interests',           pct: 90 },
      { label: 'Learning Alignment',  pct: 86 },
    ],
    typicalSkills: ['Java', 'SQL', 'REST APIs', 'System Design', 'Docker', 'Microservices', 'Git', 'Testing', 'Cloud'],
    mainGap: 'System Design',
  },
  'data-analyst': {
    ...CAREER_MATCHES[2],
    description:
      'Data analysts collect, process and interpret data to help organisations make informed decisions.',
    whyFits: [
      { skill: 'SQL',     note: 'Core skill for data querying'            },
      { skill: 'Python',  note: 'Widely used for data analysis'           },
      { skill: 'Logic',   note: 'Strong analytical problem-solving skills' },
    ],
    currentSkills: [
      { name: 'SQL',        level: 'Strong',       pct: 80 },
      { name: 'Python',     level: 'Intermediate', pct: 55 },
      { name: 'Excel',      level: 'Good',         pct: 65 },
      { name: 'Statistics', level: 'Beginner',     pct: 35 },
    ],
    skillGaps: [
      { name: 'Data Visualization', current: 20, target: 75 },
      { name: 'Statistics',         current: 35, target: 70 },
      { name: 'Power BI / Tableau', current: 10, target: 60 },
    ],
    fitBreakdown: [
      { label: 'Technical Skills',    pct: 68 },
      { label: 'Projects',            pct: 60 },
      { label: 'Experience',          pct: 65 },
      { label: 'Interests',           pct: 80 },
      { label: 'Learning Alignment',  pct: 72 },
    ],
    typicalSkills: ['SQL', 'Python', 'Excel', 'Statistics', 'Data Visualization', 'Tableau', 'Power BI', 'R'],
    mainGap: 'Data Visualization',
  },
  'ml-engineer': {
    ...CAREER_MATCHES[3],
    description:
      'ML engineers build, train, and deploy machine learning models and data pipelines at scale.',
    whyFits: [
      { skill: 'Python',  note: 'Key ML language, present in projects'  },
      { skill: 'Data',    note: 'Interest in AI/ML aligned to this path' },
    ],
    currentSkills: [
      { name: 'Python',     level: 'Intermediate', pct: 55 },
      { name: 'Statistics', level: 'Beginner',     pct: 35 },
      { name: 'SQL',        level: 'Strong',       pct: 80 },
    ],
    skillGaps: [
      { name: 'Machine Learning',  current: 20, target: 80 },
      { name: 'Deep Learning',     current: 10, target: 70 },
      { name: 'PyTorch / TF',      current: 10, target: 65 },
      { name: 'Statistics',        current: 35, target: 75 },
    ],
    fitBreakdown: [
      { label: 'Technical Skills',    pct: 55 },
      { label: 'Projects',            pct: 50 },
      { label: 'Experience',          pct: 60 },
      { label: 'Interests',           pct: 85 },
      { label: 'Learning Alignment',  pct: 78 },
    ],
    typicalSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Statistics', 'Data Engineering', 'SQL', 'Cloud ML'],
    mainGap: 'Machine Learning',
  },
}

export const COMPARISON_ROWS = CAREER_MATCHES.map((c) => ({
  title:      c.title,
  matchPct:   c.matchPct,
  currentFit: c.fitTag,
  mainGap:    CAREER_DETAILS[c.id]?.mainGap ?? '—',
}))
