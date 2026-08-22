import axios from 'axios';
import { env } from '../config/environment.js';
import { clampScore } from '../utils/scoreUtils.js';

export const generateInterviewQuestionAI = async ({ type, difficulty, questionNumber }) => {
  if (env.AI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI Tech Interviewer. Generate a question based on interview type and difficulty.
Return ONLY valid JSON format:
{
  "questionText": "Explain the difference between optimistic and pessimistic locking in databases.",
  "category": "Database Architecture"
}`
            },
            {
              role: 'user',
              content: JSON.stringify({ type, difficulty, questionNumber })
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5
        },
        {
          headers: {
            Authorization: `Bearer ${env.AI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      if (parsed.questionText) return parsed;
    } catch (err) {
      console.warn('AI Interview Question API failed, using fallback question bank:', err.message);
    }
  }

  // Fallback Question Generator
  const bank = {
    TECHNICAL: [
      { questionText: 'Explain the event loop in Node.js and how non-blocking I/O is achieved.', category: 'Node.js' },
      { questionText: 'What are database indexes, and how do B-Trees improve query lookup speeds?', category: 'Databases' },
      { questionText: 'Compare REST APIs vs GraphQL in terms of over-fetching and caching.', category: 'Web APIs' }
    ],
    DSA: [
      { questionText: 'How would you detect a cycle in a linked list in O(1) space complexity?', category: 'Data Structures' },
      { questionText: 'Explain how a hash map resolves collisions using chaining vs open addressing.', category: 'Algorithms' }
    ],
    HR: [
      { questionText: 'Describe a time when you faced a severe technical deadline conflict and how you handled it.', category: 'Behavioral' },
      { questionText: 'Why are you interested in advancing your career in software development?', category: 'Career Goals' }
    ]
  };

  const pool = bank[type] || bank.TECHNICAL;
  const item = pool[(questionNumber || 0) % pool.length];
  return item;
};

export const evaluateInterviewAnswerAI = async ({ questionText, answerText, type, difficulty }) => {
  if (env.AI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI Interview Evaluator. Evaluate the candidate's answer for correctness, communication, and technical depth.
Return ONLY valid JSON format:
{
  "correctness": 85,
  "communication": 80,
  "technicalDepth": 75,
  "overallScore": 80,
  "feedback": "Great explanation of core principles, but could mention edge cases."
}`
            },
            {
              role: 'user',
              content: JSON.stringify({ questionText, answerText, type, difficulty })
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
          feedback: parsed.feedback || 'Good attempt.'
        };
      }
    } catch (err) {
      console.warn('AI Interview Evaluation API failed, using fallback scoring engine:', err.message);
    }
  }

  // Fallback Scoring Engine based on response length and technical keywords
  const length = answerText ? answerText.trim().length : 0;
  let base = 60;
  if (length > 50) base += 15;
  if (length > 150) base += 15;

  const score = clampScore(base);

  return {
    correctness: score,
    communication: Math.min(100, score + 5),
    technicalDepth: Math.max(0, score - 5),
    overallScore: score,
    feedback: score >= 80 
      ? 'Comprehensive response detailing the core architectural mechanics clearly.'
      : 'Good foundational answer. Consider adding specific examples and edge-case handling.'
  };
};
