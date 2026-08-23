# 🚀 AI Career Copilot

> **Your AI-powered companion for building a stronger career, identifying skill gaps, and becoming job-ready.**

AI Career Copilot is an intelligent career development platform designed to help students and aspiring professionals understand where they are, discover where they can go, and get a personalized roadmap to reach their career goals.

From **resume analysis** and **GitHub evaluation** to **career recommendations**, **skill-gap analysis**, and **AI-powered mock interviews**, the platform brings the complete career-development journey into one place.

---

## ✨ Why AI Career Copilot?

Preparing for a career often means using multiple platforms for resumes, courses, coding profiles, interview preparation, and job tracking.

**AI Career Copilot brings these pieces together.**

```text
👤 Your Profile
      ↓
📄 Resume Analysis + 🐙 GitHub Analysis
      ↓
🤖 AI Career Recommendations
      ↓
🎯 Skill Gap Identification
      ↓
🗺️ Personalized Learning Roadmap
      ↓
📚 Recommended Courses & Practice
      ↓
📊 Job Readiness Score
      ↓
🎤 AI Mock Interviews
```

---

# 🌟 Key Features

## 🔐 Secure Authentication

* JWT-based authentication
* Secure password hashing using bcrypt
* Protected API routes
* User account management

## 👤 Career Profile Management

Build a comprehensive professional profile including:

* Career goals
* Academic information
* Skills and interests
* Learning preferences

## 📄 Resume Analysis

Upload your resume and receive meaningful insights.

* PDF and DOCX resume support
* Resume text extraction
* Section parsing
* AI-powered resume analysis
* Skill identification and evaluation

## 🐙 GitHub Profile Analysis

Connect your GitHub profile to showcase your practical development experience.

* Repository analysis
* Programming language statistics
* Project evaluation
* Developer profile insights

## 🧭 Career Recommendations

Discover career paths that align with your profile.

The recommendation engine considers:

* Skills
* Projects
* Resume information
* Experience
* Career interests

## 🎯 Skill Gap Analysis

Understand what skills you need to reach your target role.

The platform helps identify:

* Existing strengths
* Missing skills
* Skill-gap metrics
* Recommended next actions

## 🗺️ Personalized Career Roadmap

Get a structured, step-by-step roadmap based on your goals.

Track your progress with task statuses:

* `NOT_STARTED`
* `IN_PROGRESS`
* `COMPLETED`

## 📚 Skills & Course Recommendations

Receive curated learning recommendations connected directly to your skill gaps and career roadmap.

## 📊 Job Readiness Score

Track your overall career readiness through a dynamic scoring system based on areas such as:

| Category            | Evaluation                            |
| ------------------- | ------------------------------------- |
| 💻 Technical Skills | Skills relevant to your target role   |
| 🧩 DSA              | Problem-solving preparation           |
| 🚀 Projects         | Practical development experience      |
| 📄 Resume           | Resume quality and completeness       |
| 🐙 GitHub           | Developer portfolio and activity      |
| 🎤 Interviews       | Interview preparation and performance |

## 🎤 AI-Powered Mock Interviews

Practice for real interviews with interactive mock interview sessions.

* Technical and HR interview practice
* Answer submission
* Automated evaluation
* Performance feedback

---

# 🛠️ Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Prisma ORM**
* **JWT Authentication**
* **bcrypt**

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**

---

# 🏗️ Project Structure

```text
backend_ibm/
│
├── backend/
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Backend application source code
│   ├── tests/           # Backend tests
│   ├── uploads/         # Uploaded files
│   ├── .env.example     # Environment variable template
│   └── package.json
│
├── src/                 # Frontend source code
├── public/              # Static assets
├── package.json         # Frontend dependencies
└── vite.config.ts       # Vite configuration
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* PostgreSQL

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Tharun6526/backend_ibm.git
cd backend_ibm
```

---

## 2️⃣ Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file based on `.env.example`.

Example database configuration:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/career_copilot?schema=public"
```

> ⚠️ Never commit your actual `.env` file or sensitive credentials to GitHub.

---

## 4️⃣ Set Up the Database

Create the PostgreSQL database:

```sql
CREATE DATABASE career_copilot;
```

Run Prisma migrations and generate the Prisma Client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Seed the database if required:

```bash
node prisma/seed.js
```

---

## 5️⃣ Run the Backend

```bash
npm run dev
```

The backend server should now be running locally. 🎉

---

# 🧪 Testing

Run the test suite with:

```bash
npm test
```

---

# 🔮 Future Improvements

The project is continuously evolving. Potential future enhancements include:

* 🤖 Advanced AI career recommendations
* 📈 More detailed analytics and insights
* 🔍 Job matching and job recommendations
* 🔔 Career and learning reminders
* 🌐 Deployment and cloud integration
* 📱 Improved mobile responsiveness
* 🏆 Gamified learning progress

---

# 🎯 Vision

> **AI Career Copilot aims to transform career preparation from a generic checklist into a personalized, data-driven journey.**

Whether you're preparing for your first internship, improving your development skills, or working toward your dream role, AI Career Copilot helps you understand your current position and take meaningful steps toward your next opportunity.

---

# 🤝 Contributing

Contributions, suggestions, and feedback are welcome!

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

# 👨‍💻 Author

**Tharun Chowdary**

Aspiring Software Developer | Building projects and learning every day 🚀

---

## ⭐ Support

If you find this project useful or interesting, consider giving it a **star ⭐** on GitHub!

**Happy Building! 🚀**
