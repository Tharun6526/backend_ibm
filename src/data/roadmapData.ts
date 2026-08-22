// ─── Mock data for the Personalized Roadmap page ─────────────
// Route: /roadmap
// Grounded in skillGapData — same skill priorities.

export type TaskStatus = 'completed' | 'in-progress' | 'upcoming'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface RoadmapTask {
  id:               string
  title:            string
  skill:            string
  estimatedMinutes: number
  completed:        boolean
}

export interface RoadmapWeek {
  id:             string
  week:           number
  title:          string
  skills:         string[]
  estimatedHours: number
  difficulty:     Difficulty
  status:         TaskStatus
  progress:       number     // 0–100, computed from tasks
  skillGapReason: string     // Why this week exists
  tasks:          RoadmapTask[]
}

/* ── Summary ──────────────────────────────────────────────── */
export const ROADMAP_SUMMARY = {
  careerTarget:    'Software Developer',
  totalWeeks:      12,
  overallProgress: 35,
  prioritySkills:  6,
  focusAreas:      3,
}

/* ── Top priorities (pulled from Skill Gap) ─────────────────── */
export const TOP_PRIORITIES = [
  { name: 'System Design',                  current: 20, target: 65, gap: 45 },
  { name: 'Data Structures & Algorithms',   current: 55, target: 85, gap: 30 },
  { name: 'Cloud Fundamentals',             current: 35, target: 70, gap: 35 },
]

/* ── 12-week roadmap ──────────────────────────────────────── */
export const ROADMAP_WEEKS: RoadmapWeek[] = [
  {
    id: 'week-1',
    week: 1,
    title: 'Build Your DSA Foundation',
    skills: ['Arrays', 'Strings'],
    estimatedHours: 4,
    difficulty: 'Beginner',
    status: 'completed',
    progress: 100,
    skillGapReason: 'High-priority skill gap — DSA is core for software engineering roles.',
    tasks: [
      { id: 'w1t1', title: 'Arrays — sliding window problems',    skill: 'Arrays',  estimatedMinutes: 60, completed: true },
      { id: 'w1t2', title: 'Arrays — two pointer technique',      skill: 'Arrays',  estimatedMinutes: 60, completed: true },
      { id: 'w1t3', title: 'Strings — pattern matching basics',  skill: 'Strings', estimatedMinutes: 60, completed: true },
      { id: 'w1t4', title: 'Strings — anagram & substring tasks',skill: 'Strings', estimatedMinutes: 60, completed: true },
    ],
  },
  {
    id: 'week-2',
    week: 2,
    title: 'Intermediate DSA',
    skills: ['Hashing', 'Linked Lists', 'Stacks & Queues'],
    estimatedHours: 5,
    difficulty: 'Intermediate',
    status: 'completed',
    progress: 100,
    skillGapReason: 'High-priority skill gap — Hashing and Lists are frequent interview topics.',
    tasks: [
      { id: 'w2t1', title: 'HashMap fundamentals',        skill: 'Hashing',         estimatedMinutes: 60, completed: true },
      { id: 'w2t2', title: 'Hash collision & design',     skill: 'Hashing',         estimatedMinutes: 60, completed: true },
      { id: 'w2t3', title: 'Linked list operations',      skill: 'Linked Lists',    estimatedMinutes: 60, completed: true },
      { id: 'w2t4', title: 'Stack & queue implementations',skill: 'Stacks & Queues',estimatedMinutes: 60, completed: true },
      { id: 'w2t5', title: 'Monotonic stack patterns',    skill: 'Stacks & Queues', estimatedMinutes: 60, completed: true },
    ],
  },
  {
    id: 'week-3',
    week: 3,
    title: 'Trees & Graphs',
    skills: ['Trees', 'Graphs'],
    estimatedHours: 5,
    difficulty: 'Intermediate',
    status: 'in-progress',
    progress: 50,
    skillGapReason: 'High-priority — Trees and Graphs appear in senior interviews.',
    tasks: [
      { id: 'w3t1', title: 'Binary tree traversals',      skill: 'Trees',  estimatedMinutes: 60, completed: true },
      { id: 'w3t2', title: 'BST operations & validation', skill: 'Trees',  estimatedMinutes: 60, completed: true },
      { id: 'w3t3', title: 'Graph BFS & DFS',             skill: 'Graphs', estimatedMinutes: 75, completed: false },
      { id: 'w3t4', title: 'Shortest path algorithms',    skill: 'Graphs', estimatedMinutes: 75, completed: false },
    ],
  },
  {
    id: 'week-4',
    week: 4,
    title: 'Backend Foundations',
    skills: ['Spring Boot', 'REST APIs'],
    estimatedHours: 6,
    difficulty: 'Intermediate',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'Based on your Backend Development skill gap.',
    tasks: [
      { id: 'w4t1', title: 'Spring Boot project setup',    skill: 'Spring Boot', estimatedMinutes: 90, completed: false },
      { id: 'w4t2', title: 'REST API design patterns',     skill: 'REST APIs',   estimatedMinutes: 90, completed: false },
      { id: 'w4t3', title: 'Request/response handling',    skill: 'REST APIs',   estimatedMinutes: 60, completed: false },
      { id: 'w4t4', title: 'Error handling & validation',  skill: 'Spring Boot', estimatedMinutes: 60, completed: false },
    ],
  },
  {
    id: 'week-5',
    week: 5,
    title: 'Database Design',
    skills: ['SQL', 'Database Design'],
    estimatedHours: 4,
    difficulty: 'Intermediate',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'SQL is a strong skill — deepen with schema design.',
    tasks: [
      { id: 'w5t1', title: 'Normalization & schema design', skill: 'SQL',             estimatedMinutes: 60, completed: false },
      { id: 'w5t2', title: 'Indexing & query optimisation', skill: 'SQL',             estimatedMinutes: 60, completed: false },
      { id: 'w5t3', title: 'Transactions & ACID',           skill: 'Database Design', estimatedMinutes: 60, completed: false },
      { id: 'w5t4', title: 'ORM patterns',                  skill: 'Database Design', estimatedMinutes: 60, completed: false },
    ],
  },
  {
    id: 'week-6',
    week: 6,
    title: 'Testing',
    skills: ['Unit Testing', 'Integration Testing'],
    estimatedHours: 4,
    difficulty: 'Intermediate',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'Based on your Testing skill gap (current 50%, target 75%).',
    tasks: [
      { id: 'w6t1', title: 'JUnit unit testing basics',       skill: 'Unit Testing',        estimatedMinutes: 60, completed: false },
      { id: 'w6t2', title: 'Mocking with Mockito',            skill: 'Unit Testing',        estimatedMinutes: 60, completed: false },
      { id: 'w6t3', title: 'Integration test patterns',       skill: 'Integration Testing', estimatedMinutes: 60, completed: false },
      { id: 'w6t4', title: 'Test coverage & best practices',  skill: 'Integration Testing', estimatedMinutes: 60, completed: false },
    ],
  },
  {
    id: 'week-7',
    week: 7,
    title: 'Backend Project',
    skills: ['Spring Boot', 'REST APIs', 'SQL'],
    estimatedHours: 8,
    difficulty: 'Intermediate',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'Apply backend skills through a complete project.',
    tasks: [
      { id: 'w7t1', title: 'Plan and scaffold project',     skill: 'Spring Boot', estimatedMinutes: 60, completed: false },
      { id: 'w7t2', title: 'Build core API endpoints',      skill: 'REST APIs',   estimatedMinutes: 120, completed: false },
      { id: 'w7t3', title: 'Database layer & migrations',   skill: 'SQL',         estimatedMinutes: 90, completed: false },
      { id: 'w7t4', title: 'Add authentication',            skill: 'Spring Boot', estimatedMinutes: 90, completed: false },
      { id: 'w7t5', title: 'Write test suite',              skill: 'Spring Boot', estimatedMinutes: 60, completed: false },
      { id: 'w7t6', title: 'Deploy to Render / Railway',    skill: 'Spring Boot', estimatedMinutes: 60, completed: false },
    ],
  },
  {
    id: 'week-8',
    week: 8,
    title: 'Backend Project Improvements',
    skills: ['Code Quality', 'Refactoring'],
    estimatedHours: 5,
    difficulty: 'Advanced',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'Improve code quality for portfolio and GitHub.',
    tasks: [
      { id: 'w8t1', title: 'Code review & refactor',        skill: 'Code Quality',  estimatedMinutes: 90, completed: false },
      { id: 'w8t2', title: 'Add Swagger / OpenAPI docs',    skill: 'Code Quality',  estimatedMinutes: 60, completed: false },
      { id: 'w8t3', title: 'Performance improvements',      skill: 'Refactoring',   estimatedMinutes: 90, completed: false },
      { id: 'w8t4', title: 'Write a README & case study',   skill: 'Code Quality',  estimatedMinutes: 60, completed: false },
    ],
  },
  {
    id: 'week-9',
    week: 9,
    title: 'System Design Fundamentals',
    skills: ['System Design'],
    estimatedHours: 6,
    difficulty: 'Advanced',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'CRITICAL skill gap — System Design (current 20%, target 65%).',
    tasks: [
      { id: 'w9t1', title: 'Scalability & load balancing',       skill: 'System Design', estimatedMinutes: 90, completed: false },
      { id: 'w9t2', title: 'Caching strategies (Redis)',          skill: 'System Design', estimatedMinutes: 90, completed: false },
      { id: 'w9t3', title: 'Database sharding & replication',     skill: 'System Design', estimatedMinutes: 90, completed: false },
      { id: 'w9t4', title: 'Design a URL shortener (practice)',   skill: 'System Design', estimatedMinutes: 90, completed: false },
    ],
  },
  {
    id: 'week-10',
    week: 10,
    title: 'Cloud Fundamentals',
    skills: ['Cloud', 'AWS Basics'],
    estimatedHours: 5,
    difficulty: 'Intermediate',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'High-priority gap — Cloud (current 35%, target 70%).',
    tasks: [
      { id: 'w10t1', title: 'AWS core services (EC2, S3, RDS)',  skill: 'Cloud',     estimatedMinutes: 90, completed: false },
      { id: 'w10t2', title: 'Serverless & Lambda basics',        skill: 'AWS Basics',estimatedMinutes: 75, completed: false },
      { id: 'w10t3', title: 'Deploy project to AWS',             skill: 'Cloud',     estimatedMinutes: 90, completed: false },
      { id: 'w10t4', title: 'CI/CD with GitHub Actions',         skill: 'Cloud',     estimatedMinutes: 75, completed: false },
    ],
  },
  {
    id: 'week-11',
    week: 11,
    title: 'Resume + GitHub Improvements',
    skills: ['Resume', 'GitHub'],
    estimatedHours: 4,
    difficulty: 'Beginner',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'Prepare your profile for job applications.',
    tasks: [
      { id: 'w11t1', title: 'Update resume with new projects',   skill: 'Resume', estimatedMinutes: 60, completed: false },
      { id: 'w11t2', title: 'Improve GitHub README files',       skill: 'GitHub', estimatedMinutes: 60, completed: false },
      { id: 'w11t3', title: 'Pin top 4 repositories',           skill: 'GitHub', estimatedMinutes: 30, completed: false },
      { id: 'w11t4', title: 'Record a project walkthrough',      skill: 'Resume', estimatedMinutes: 90, completed: false },
    ],
  },
  {
    id: 'week-12',
    week: 12,
    title: 'Career Preparation',
    skills: ['Interview Prep', 'Networking'],
    estimatedHours: 5,
    difficulty: 'Intermediate',
    status: 'upcoming',
    progress: 0,
    skillGapReason: 'Final phase — become job ready.',
    tasks: [
      { id: 'w12t1', title: 'Mock behavioral interview',            skill: 'Interview Prep', estimatedMinutes: 60, completed: false },
      { id: 'w12t2', title: 'Technical interview practice (2h)',    skill: 'Interview Prep', estimatedMinutes: 120, completed: false },
      { id: 'w12t3', title: 'LinkedIn profile polish',              skill: 'Networking',     estimatedMinutes: 60, completed: false },
      { id: 'w12t4', title: 'Apply to 10 target companies',         skill: 'Networking',     estimatedMinutes: 60, completed: false },
    ],
  },
]
