import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/environment.js';

export const recommendCareerAI = async ({ profile, resumeSkills, githubData, targetGoal }) => {
  const goal = targetGoal || profile?.careerGoal || 'Software Developer';
  const apiKey = env.GEMINI_API_KEY || env.AI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `You are an expert AI Career Coach. Analyze the candidate details and return recommended career matches.
Candidate Target Goal: "${goal}"
Profile Level: "${profile?.experienceLevel || 'BEGINNER'}"

Return ONLY valid JSON format:
{
  "recommendations": [
    {
      "career": "${goal}",
      "matchPercentage": 92,
      "reasons": ["Strong skill alignment", "High project relevance", "Active learning path"],
      "requiredSkills": ["DSA", "System Design", "Testing", "Spring Boot", "Git", "Cloud"]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        return parsed.recommendations;
      }
    } catch (err) {
      console.warn('Gemini Career Recommendation API warning (using fallback):', err.message);
    }
  }

  // Fallback Career Match Engine
  const skillsList = (resumeSkills || []).map((s) => s.name || s);
  const matchBase = Math.min(95, 78 + skillsList.length * 3);

  return [
    {
      career: goal === 'Not sure' ? 'Software Developer' : goal,
      matchPercentage: matchBase,
      reasons: [
        `Strong alignment with your target goal of ${goal}`,
        skillsList.length > 0 ? `Demonstrated proficiency in ${skillsList.slice(0, 3).join(', ')}` : 'Solid computer science foundations',
        'Active GitHub technical project repository history'
      ],
      requiredSkills: ['DSA', 'System Design', 'Testing', 'Spring Boot', 'Git', 'Cloud']
    },
    {
      career: 'Cloud Engineer',
      matchPercentage: Math.max(50, matchBase - 12),
      reasons: [
        'Growing industry demand for cloud deployment & infrastructure',
        'Complements backend engineering & microservices skills'
      ],
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux']
    }
  ];
};
