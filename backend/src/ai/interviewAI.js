import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/environment.js';
import { clampScore } from '../utils/scoreUtils.js';

export const generateInterviewQuestionAI = async ({ type, difficulty, questionNumber, role }) => {
  const apiKey = env.GEMINI_API_KEY || env.AI_API_KEY;
  const targetRole = role || 'Software Developer';

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const randomSeed = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

      const prompt = `You are an expert AI Technical Interviewer conducting a realistic job interview.
Target Candidate Role: "${targetRole}"
Interview Type: ${type || 'TECHNICAL'}
Difficulty Level: ${difficulty || 'MEDIUM'}
Question Index: #${(questionNumber || 0) + 1}
Randomization Seed: ${randomSeed}

Instructions:
- Generate 1 HIGHLY SPECIFIC, professional interview question tailored explicitly for a candidate applying for the "${targetRole}" role.
- Focus on real-world engineering challenges, core frameworks, system trade-offs, architecture, or behavioral STAR scenarios pertinent to a ${targetRole}.
- Ensure this question is unique and different every time.

Return ONLY valid JSON:
{
  "questionText": "Your specific interview question text here",
  "category": "Relevant Tech Domain (e.g. Frontend Architecture, Database Design, System Scalability, API Security)"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      if (parsed.questionText) return parsed;
    } catch (err) {
      console.warn('Gemini Interview Question API notice (using dynamic fallback):', err.message);
    }
  }

  // Dynamic Fallback Question Generator with Role-Specific Pools
  const questionPools = {
    'Frontend Engineer': [
      { questionText: 'How does React Virtual DOM reconciliation work under the hood, and how do key props prevent unnecessary re-renders?', category: 'React & Virtual DOM' },
      { questionText: 'Explain the difference between SSG, SSR, and ISR in Next.js, and when you would choose each for web performance.', category: 'Web Architecture' },
      { questionText: 'Describe how CSS Grid and Flexbox differ in layout calculation, and how you would optimize Core Web Vitals (LCP, CLS).', category: 'Frontend Performance' },
      { questionText: 'How do browser Event Bubbling and Event Capturing work, and how does event delegation optimize event listeners?', category: 'JavaScript Mechanics' },
      { questionText: 'Explain state management trade-offs between React Context, Redux Toolkit, and Zustand for large scale apps.', category: 'State Architecture' }
    ],
    'Backend Engineer': [
      { questionText: 'Explain how B-Tree indexes improve database query execution speeds, and what composite index ordering rules apply.', category: 'Database Optimization' },
      { questionText: 'How would you implement idempotent REST API endpoints to handle duplicate payment or order submissions safely?', category: 'API Security & Design' },
      { questionText: 'Compare connection pooling with direct database connections under high API concurrency in Node.js / PostgreSQL.', category: 'Backend Architecture' },
      { questionText: 'How do Redis caching strategies like Cache-Aside, Write-Through, and TTL expiration prevent cache stampedes?', category: 'Caching Systems' },
      { questionText: 'Explain message queues (e.g., RabbitMQ, Kafka) and how event-driven architecture handles async background processing.', category: 'Distributed Systems' }
    ],
    'Full Stack Developer': [
      { questionText: 'Walk me through end-to-end user authentication using JWT access tokens, HTTP-Only refresh cookies, and CSRF protection.', category: 'Fullstack Security' },
      { questionText: 'How do you structure database schema migrations using Prisma / ORM tools while ensuring zero-downtime deployments?', category: 'Database & DevOps' },
      { questionText: 'Explain WebSockets vs Server-Sent Events (SSE) vs HTTP Polling for real-time live updates in web applications.', category: 'Real-time Web Tech' },
      { questionText: 'How do you optimize initial page load speeds using bundle splitting, lazy loading, and CDN asset caching?', category: 'Fullstack Optimization' }
    ],
    'Cloud / DevOps Engineer': [
      { questionText: 'Explain Docker multi-stage builds and how container image size impacts CI/CD build speed and deployment security.', category: 'Containerization' },
      { questionText: 'How do Kubernetes Pods, Deployments, and Services interact to provide self-healing microservices and ingress routing?', category: 'Kubernetes Orchestration' },
      { questionText: 'Describe Infrastructure as Code (IaC) principles using Terraform and state locking with S3 and DynamoDB.', category: 'Infrastructure as Code' }
    ]
  };

  // Match role or default to Software Developer pool
  const matchedRoleKey = Object.keys(questionPools).find(k => targetRole.toLowerCase().includes(k.toLowerCase())) || 'Backend Engineer';
  const pool = questionPools[matchedRoleKey] || questionPools['Backend Engineer'];

  // Random offset selector so questions never repeat statically
  const randomIndex = (Math.floor(Math.random() * 100) + (questionNumber || 0)) % pool.length;
  return pool[randomIndex];
};

export const evaluateInterviewAnswerAI = async ({ questionText, answerText, type, difficulty }) => {
  const apiKey = env.GEMINI_API_KEY || env.AI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `You are an expert AI Interview Evaluator. Evaluate the candidate's answer for correctness, communication, and technical depth.
Question: "${questionText}"
Candidate's Answer: "${answerText}"
Type: ${type}
Difficulty: ${difficulty}

Return ONLY valid JSON:
{
  "correctness": 85,
  "communication": 80,
  "technicalDepth": 75,
  "overallScore": 80,
  "feedback": "Actionable feedback highlighting exact technical strengths and key points for improvement."
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      if (parsed.overallScore !== undefined) {
        const correctness = clampScore(parsed.correctness || 75);
        const communication = clampScore(parsed.communication || 75);
        const technicalDepth = clampScore(parsed.technicalDepth || 75);
        const overallScore = clampScore(parsed.overallScore || Math.round((correctness + communication + technicalDepth) / 3));
        return {
          correctness,
          communication,
          technicalDepth,
          overallScore,
          feedback: parsed.feedback || 'Good attempt with solid technical insights.'
        };
      }
    } catch (err) {
      console.warn('Gemini Interview Evaluation API notice (using fallback):', err.message);
    }
  }

  // Fallback Scoring Engine
  const length = answerText ? answerText.trim().length : 0;
  let base = 65;
  if (length > 50) base += 15;
  if (length > 150) base += 12;

  const score = clampScore(base);

  return {
    correctness: score,
    communication: Math.min(100, score + 5),
    technicalDepth: Math.max(0, score - 5),
    overallScore: score,
    feedback: score >= 80 
      ? 'Comprehensive response detailing core architectural mechanics and trade-offs clearly.'
      : 'Solid response! Consider adding specific real-world examples and edge-case considerations.'
  };
};
