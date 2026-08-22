import axios from 'axios';
import { env } from '../config/environment.js';

export const generateRoadmapAI = async ({ targetCareer, skillGaps, experienceLevel, hoursPerDay, targetMonths }) => {
  const career = targetCareer || 'Software Developer';
  const months = targetMonths || 6;
  const hours = hoursPerDay || 2;

  if (env.AI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI Learning Roadmap Architect. Generate a step-by-step personalized learning roadmap tasks list.
Return ONLY valid JSON:
{
  "tasks": [
    {
      "title": "Master Data Structures & Algorithms",
      "description": "Solve array, string, and hash table problems.",
      "skill": "DSA",
      "duration": "4 Weeks",
      "priority": "HIGH",
      "status": "NOT_STARTED",
      "resources": ["IBM SkillsBuild DSA Masterclass", "LeetCode"]
    }
  ]
}`
            },
            {
              role: 'user',
              content: JSON.stringify({ career, skillGaps, experienceLevel, hours, months })
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
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed.tasks;
      }
    } catch (err) {
      console.warn('AI Roadmap API failed, using fallback generator:', err.message);
    }
  }

  // Fallback Roadmap Task Generator Engine
  return [
    {
      title: 'Master Data Structures & Algorithms Fundamentals',
      description: 'Focus on arrays, hash maps, two-pointer techniques, and recursion basics.',
      skill: 'DSA',
      duration: '3 Weeks',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      resources: ['IBM SkillsBuild DSA Masterclass', 'LeetCode Curated 75']
    },
    {
      title: 'System Design & Architectural Patterns',
      description: 'Understand microservices, database indexes, load balancers, and redis caching.',
      skill: 'System Design',
      duration: '4 Weeks',
      priority: 'CRITICAL',
      status: 'NOT_STARTED',
      resources: ['IBM SkillsBuild System Design Fundamentals', 'Grokking System Design']
    },
    {
      title: 'Database Schema Design & SQL Optimization',
      description: 'Practice complex joins, indexing strategies, transaction isolation, and query plans.',
      skill: 'SQL',
      duration: '2 Weeks',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      resources: ['IBM SkillsBuild Relational Database Design']
    },
    {
      title: 'Cloud Infrastructure & Containerization',
      description: 'Containerize backend node applications with Docker and deploy to AWS EC2.',
      skill: 'Cloud',
      duration: '3 Weeks',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      resources: ['IBM SkillsBuild AWS Cloud Architecture']
    }
  ];
};
