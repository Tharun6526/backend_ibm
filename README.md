# 🚀 AI Career Copilot

### Your AI-Powered Career Development Companion

> Analyze your skills • Discover career paths • Build a roadmap • Get job-ready

AI Career Copilot is an AI-powered career development platform designed to help students and aspiring professionals understand their strengths, identify skill gaps, and prepare for their target careers.

The platform brings together career guidance, skill-gap analysis, personalized learning roadmaps, job readiness assessment, resume improvement, mock interviews, job tracking, and career goal management into one unified experience.

---

## 🎯 Problem Statement

Students often struggle to transition from learning to employment. They may have technical skills and projects but still face important questions:

- Which career path is right for me?
- What skills am I missing?
- How ready am I for my target role?
- What should I learn next?
- Is my resume strong enough?
- How can I prepare for interviews?

Career preparation is often fragmented across multiple platforms, making it difficult for students to understand their overall progress.

### 💡 Our Solution

**AI Career Copilot** provides a centralized and personalized career guidance experience that helps students:

1. Understand their current skills and profile
2. Discover suitable career paths
3. Identify skill gaps
4. Follow a personalized learning roadmap
5. Measure job readiness
6. Improve resumes and portfolios
7. Practice for technical interviews
8. Track jobs, applications, and career goals

---

## 🗺️ Career Journey

AI Career Copilot guides users through a structured career preparation journey:

```
Profile Setup
      ↓
Resume & GitHub
      ↓
AI Career Analysis
      ↓
Career Recommendations
      ↓
Skill Gap Analysis
      ↓
Personalized Roadmap
      ↓
Courses & Learning
      ↓
Job Readiness
      ↓
Interview Preparation
```

---

## ✨ Key Features

### 📊 Personalized Dashboard
Get a complete overview of your career journey, including:
- Profile completion
- Career progress
- Job application activity
- Active career goals
- Recent progress and achievements

### 🎯 Career Matches
Discover career paths that align with your skills, projects, and interests.

Highlights:
- Personalized career recommendations
- Career match percentage
- Reasons behind each recommendation
- Alternative career paths to explore

### 📈 Skill Gap Analysis
Compare your current skills with the requirements of your target career. Helps users identify:
- Current skill alignment
- Target skill requirements
- Strong technical areas
- Skills that need improvement
- Priority learning opportunities

### 🛡️ Job Readiness Assessment
Measure how prepared you are for your target role. The readiness score considers:
- 💻 Technical Skills
- 🧩 DSA & Algorithms
- 🚀 Project Portfolio
- 📄 Resume Quality
- 🐙 GitHub Activity
- 🎤 Interview Readiness

Users receive an overall readiness score along with personalized strengths and areas for improvement.

### 🎤 Mock Interview
Practice technical interviews in an interactive environment. Users can:
- Answer role-specific questions
- Practice structured responses
- Track interview progress
- Receive AI-assisted feedback and improvement suggestions

### 💼 Job Tracker & Live Job Postings
Organize your job search and explore relevant opportunities:
- 🔎 Search job opportunities
- 📌 Save interesting jobs
- 📤 Track applications
- 🎤 Monitor interview stages
- 🎉 Track offers and outcomes
- 📊 View skill-match scores

### 📄 Smart Resume Builder
Build and improve your professional resume with structured guidance:
- Profile-based resume sections
- Skills synchronization
- Resume completion tracking
- ATS score insights
- AI-powered improvement suggestions
- Resume preview and export

### 🎯 Career Goals
Set meaningful career goals and track your progress:
- Create career goals
- Set milestones and target dates
- Track completion progress
- Update goal status
- Mark milestones as completed

### 🤖 AI Career Copilot
Interact with an AI-powered career assistant for personalized guidance related to:
- Career planning
- Skills to learn next
- Resume improvement
- Technical interview preparation
- Job search strategy

---

## 🖥️ Application Modules

| Module | Purpose |
|---|---|
| 📊 Dashboard | Overview of career progress |
| 🎯 Career Matches | Personalized career recommendations |
| 📈 Skill Gap | Current skills vs target requirements |
| 🗺️ Roadmap | Structured learning journey |
| 🛡️ Job Readiness | Overall employability assessment |
| 🎤 Mock Interview | Interview preparation |
| 💼 Job Tracker | Job and application tracking |
| 📄 Resume Builder | Resume analysis and improvement |
| 🎯 Career Goals | Goal and milestone tracking |
| 🤖 AI Copilot | Personalized career guidance |

---

## 🏗️ Project Architecture

AI Career Copilot follows a client-server architecture:

```
                 ┌─────────────────────┐
                 │      Frontend       │
                 │  React + TypeScript │
                 └──────────┬──────────┘
                            │
                       API Requests
                            │
                 ┌──────────▼──────────┐
                 │       Backend       │
                 │   APIs & Services   │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     Authentication     AI Analysis       Job Data
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │      Database       │
                 └─────────────────────┘
```

---

## 🛠️ Technology Stack

**Frontend**
- React
- TypeScript
- Modern UI components and responsive styling

**Backend**
- Node.js
- Express.js
- RESTful APIs

**Database**
- PostgreSQL
- Prisma ORM

**Authentication & Security**
- JWT Authentication
- Secure password handling

**AI & Career Intelligence**
- AI-assisted career analysis
- Skill and career matching
- Personalized recommendations

---

## 🔵 IBM Bob Technology

IBM Bob was used as an AI-assisted development technology during the development of AI Career Copilot.

It supported our development workflow by assisting with:
- Code development and implementation
- Understanding and improving existing code
- Debugging and problem solving
- Refining application workflows
- Improving developer productivity during rapid development

IBM Bob helped our team accelerate development and focus on building a complete end-to-end student career guidance platform.

📄 For detailed information, see: [`IBM_BOB_USAGE.md`](./IBM_BOB_USAGE.md)

---

## 📁 Project Structure

```
backend_ibm/
│
├── backend/                 # Backend application
├── public/                  # Static assets
├── src/                     # Frontend source code
│
├── IBM_BOB_USAGE.md         # IBM Bob technology documentation
├── README.md
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js
- npm
- PostgreSQL
- Git

### Clone the Repository
```bash
git clone https://github.com/Tharun6526/backend_ibm.git
cd backend_ibm
```

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Create a `.env` file and configure the required environment variables.

Example:
```
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
```

> ⚠️ Never commit API keys, passwords, or `.env` files to GitHub.

### Run the Application
```bash
npm run dev
```

---

## 👥 Team

| Team Member | Contribution |
|---|---|
| A. Tharun Chowdary | Backend Development |
| K. Gowtham Karthik | Frontend Development |
| M. Srilaya | UI/UX Design |
| V. Sahitya | Testing & Documentation |

---

## 🔮 Future Improvements

We plan to explore:
- More advanced AI career recommendations
- Improved job matching
- Advanced learning roadmaps
- Additional interview scenarios
- Career analytics and insights
- Personalized notifications and reminders
- Cloud deployment

---

## 🎓 Built for Student Career Readiness

Career preparation should be personalized, measurable, and accessible.

AI Career Copilot helps students understand where they are today, identify what they need to improve, and take clear steps toward their career goals.

---

## ⭐ Support

If you find this project useful, consider giving the repository a star ⭐!

**🚀 Discover Your Path. Build Your Skills. Prepare for Your Career.**
