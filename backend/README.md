# AI Career Copilot Backend

Complete, production-grade Node.js + Express + PostgreSQL + Prisma ORM + JWT Backend for the AI Career Copilot platform.

## Features

- **Authentication**: JWT authentication with bcrypt password hashing.
- **Profile Management**: Career goals, academic details, and learning preferences.
- **Dashboard Aggregation**: Calculated stats combining profile, resume, github, skill gaps, readiness score, and roadmap tasks.
- **Resume Processing & AI Analysis**: Upload PDF/DOCX resumes, extract raw text, parse sections, and perform AI analysis.
- **GitHub Integration**: Connect GitHub profile, analyze repos, language stats, and project quality.
- **Career Recommendation Engine**: Match career tracks based on profile, resume skills, projects, and experience.
- **Skill Gap Analysis**: Identify missing skills with gap metrics and recommended action items.
- **Personalized Roadmap**: Step-by-step roadmap generation with interactive task status updates (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
- **SkillsBuild Courses**: Curated course catalog and recommended courses linked directly to user skill gaps.
- **Job Readiness Score**: Dynamic readiness calculator scoring Technical Skills, DSA, Projects, Resume, GitHub, and Interviews.
- **Mock Interviews**: Interactive AI-driven technical/HR mock interview sessions with answer submission and automated scoring evaluation.

## Database Setup

1. Install PostgreSQL and create database:
   ```sql
   CREATE DATABASE career_copilot;
   ```
2. Configure `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/career_copilot?schema=public"
   ```
3. Run Prisma migration and client generation:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   node prisma/seed.js
   ```

## Installation & Running

```bash
cd backend
npm install
npm run dev
```

## Testing

```bash
npm test
```
