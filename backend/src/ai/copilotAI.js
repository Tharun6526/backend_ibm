import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/environment.js';

export const chatCopilotAI = async ({ message, history, profile, user }) => {
  const apiKey = env.GEMINI_API_KEY || env.AI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const userName = user?.name || 'User';
      const goalStr = profile?.careerGoal || 'Software Engineer';
      const levelStr = profile?.experienceLevel || 'BEGINNER';
      const collegeStr = profile?.college || '';

      const systemPrompt = `You are an expert AI Career Copilot. You are guiding ${userName} (Career Goal: ${goalStr}, Level: ${levelStr}, College: ${collegeStr}).
Your role is to:
1. Provide personalized career guidance, technical skill recommendations, and interview preparation advice.
2. Ask targeted follow-up questions to help the user refine their career plans, resolve roadmap roadblocks, and achieve their target role.
3. Keep responses clear, encouraging, actionable, and formatted in clean markdown.`;

      const contents = [];
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: `Understood! I am ready to guide ${userName} step-by-step toward becoming a successful ${goalStr}. How can I assist you today?` }] });

      if (history && Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          const role = h.role === 'user' ? 'user' : 'model';
          contents.push({ role, parts: [{ text: h.text }] });
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const result = await model.generateContent({ contents });
      const responseText = result.response.text();
      if (responseText && responseText.trim().length > 0) {
        return responseText.trim();
      }
    } catch (err) {
      console.warn('Gemini API Copilot call notice:', err.message);
    }
  }

  // Fallback response generator if network or API key issue
  const query = (message || '').toLowerCase();

  if (query.includes('resume')) {
    return `To optimize your resume for your target role, highlight quantifiable achievements (e.g., "Improved query execution speed by 40% with PostgreSQL indexing"), group your tech stack by categories, and ensure your contact details are updated. You can also upload your resume in the Resume Builder tab for detailed AI feedback!`;
  }

  if (query.includes('interview') || query.includes('prepare') || query.includes('dsa')) {
    return `For interview preparation:
1. **Technical**: Practice core algorithms (Tree Traversal, Dynamic Programming, System Design basics).
2. **Behavioral**: Frame responses using the STAR method (Situation, Task, Action, Result).
3. Head over to our **Mock Interview** tab to complete a live interactive session with real-time feedback!`;
  }

  if (query.includes('skill') || query.includes('learn') || query.includes('senior')) {
    return `To transition into a Senior role, build deep expertise in:
- **Architecture**: Distributed systems, microservices, load balancing, and database optimization.
- **DevOps**: Docker, Kubernetes, CI/CD pipelines, and cloud deployment (AWS/GCP).
- Check out the **Skill Gap** and **Courses** tabs to see personalized course recommendations!`;
  }

  return `I'm your AI Career Copilot! I can help you with resume optimization, skill gap analysis, custom learning roadmaps, and mock interview practice. What specific career goals are you focusing on today?`;
};
