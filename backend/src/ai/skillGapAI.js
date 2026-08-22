import axios from 'axios';
import { env } from '../config/environment.js';
import { clampScore, calculateSkillGap } from '../utils/scoreUtils.js';

export const analyzeSkillGapAI = async ({ targetCareer, currentSkills }) => {
  const career = targetCareer || 'Software Developer';

  if (env.AI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI Skill Gap Analyzer. Given candidate skills and target career, compute required levels and priority gaps.
Return ONLY valid JSON format:
{
  "gaps": [
    {
      "skill": "System Design",
      "currentLevel": 20,
      "requiredLevel": 65,
      "priority": "CRITICAL",
      "recommendedActions": ["System design fundamentals", "REST architecture", "Database design", "Caching", "Scalability"]
    }
  ]
}`
            },
            {
              role: 'user',
              content: JSON.stringify({ career, currentSkills })
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        },
        {
          headers: {
            Authorization: `Bearer ${env.AI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      if (parsed.gaps && Array.isArray(parsed.gaps)) {
        return parsed.gaps.map((g) => {
          const cur = clampScore(g.currentLevel);
          const req = clampScore(g.requiredLevel);
          return {
            ...g,
            currentLevel: cur,
            requiredLevel: req,
            gap: calculateSkillGap(cur, req)
          };
        });
      }
    } catch (err) {
      console.warn('AI Skill Gap API failed, using fallback engine:', err.message);
    }
  }

  // Fallback Skill Gap Engine
  const userSkillMap = {};
  (currentSkills || []).forEach((s) => {
    userSkillMap[s.skillName || s.name] = s.level || 50;
  });

  const targetRequirements = [
    {
      skill: 'System Design',
      requiredLevel: 65,
      defaultCurrent: userSkillMap['System Design'] || 20,
      priority: 'CRITICAL',
      actions: ['System design fundamentals', 'REST architecture', 'Database design', 'Caching', 'Scalability']
    },
    {
      skill: 'DSA',
      requiredLevel: 75,
      defaultCurrent: userSkillMap['DSA'] || 35,
      priority: 'HIGH',
      actions: ['Practice LeetCode mediums', 'Trees & Graph algorithms', 'Dynamic programming patterns']
    },
    {
      skill: 'Cloud',
      requiredLevel: 60,
      defaultCurrent: userSkillMap['Cloud'] || userSkillMap['AWS'] || 25,
      priority: 'MEDIUM',
      actions: ['AWS EC2 & S3 basics', 'Docker containerization', 'CI/CD pipeline creation']
    },
    {
      skill: 'Testing',
      requiredLevel: 55,
      defaultCurrent: userSkillMap['Testing'] || 15,
      priority: 'MEDIUM',
      actions: ['Unit testing with Jest/JUnit', 'Integration testing', 'Mocking strategies']
    }
  ];

  return targetRequirements.map((item) => {
    const cur = clampScore(item.defaultCurrent);
    const req = clampScore(item.requiredLevel);
    const gap = calculateSkillGap(cur, req);
    return {
      skill: item.skill,
      currentLevel: cur,
      requiredLevel: req,
      gap,
      priority: item.priority,
      recommendedActions: item.actions
    };
  });
};
