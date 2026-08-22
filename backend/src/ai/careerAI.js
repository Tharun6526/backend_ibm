import axios from 'axios';
import { env } from '../config/environment.js';

export const recommendCareerAI = async ({ profile, resumeSkills, githubData, targetGoal }) => {
  const goal = targetGoal || profile?.careerGoal || 'Software Developer';

  if (env.AI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI Career Match Coach. Analyze candidate details and recommend career matches.
Return ONLY valid JSON matching this format:
{
  "recommendations": [
    {
      "career": "Software Developer",
      "matchPercentage": 91,
      "reasons": ["Strong Java skills", "Good SQL knowledge", "Backend project experience"],
      "requiredSkills": ["DSA", "System Design", "Testing", "Spring Boot", "Git", "Cloud"]
    }
  ]
}`
            },
            {
              role: 'user',
              content: JSON.stringify({ profile, resumeSkills, githubData, goal })
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        },
        {
          headers: {
            Authorization: `Bearer ${env.AI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        return parsed.recommendations;
      }
    } catch (err) {
      console.warn('AI Career API failed, falling back to local analysis engine:', err.message);
    }
  }

  // Fallback Career Match Engine
  const skillsList = (resumeSkills || []).map((s) => s.name || s);
  const matchBase = Math.min(95, 75 + skillsList.length * 3);

  return [
    {
      career: goal === 'Not sure' ? 'Software Developer' : goal,
      matchPercentage: matchBase,
      reasons: [
        `Strong alignment with your goal of ${goal}`,
        skillsList.length > 0 ? `Demonstrated proficiency in ${skillsList.slice(0, 3).join(', ')}` : 'Solid computer science foundations',
        'Active GitHub technical project repository history'
      ],
      requiredSkills: ['DSA', 'System Design', 'Testing', 'Spring Boot', 'Git', 'Cloud']
    },
    {
      career: 'Cloud Engineer',
      matchPercentage: Math.max(50, matchBase - 15),
      reasons: [
        'Growing industry demand for cloud deployment',
        'Complements backend engineering skills'
      ],
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux']
    }
  ];
};
