import { analyzeResumeAI } from './resumeAI.js';
import { recommendCareerAI } from './careerAI.js';
import { analyzeSkillGapAI } from './skillGapAI.js';
import { generateRoadmapAI } from './roadmapAI.js';
import { generateInterviewQuestionAI, evaluateInterviewAnswerAI } from './interviewAI.js';
import { chatCopilotAI } from './copilotAI.js';

export const aiService = {
  chatCopilot: async (payload) => {
    return await chatCopilotAI(payload);
  },
  analyzeResume: async (resumeText) => {
    return await analyzeResumeAI(resumeText);
  },
  analyzeGithub: async (githubProfileData, repos) => {
    // Structural GitHub analyzer
    const repoCount = repos ? repos.length : 0;
    const totalStars = repos ? repos.reduce((acc, r) => acc + (r.stargazers_count || r.stars || 0), 0) : 0;
    const languages = Array.from(new Set((repos || []).map((r) => r.language).filter(Boolean)));

    const projectQuality = Math.min(95, 65 + repoCount * 3 + totalStars * 2);
    const complexityScore = Math.min(90, 60 + languages.length * 5);
    const relevanceScore = Math.min(95, 70 + (repoCount > 0 ? 10 : 0));

    return {
      projectQuality,
      complexityScore,
      relevanceScore,
      summary: `Analyzed ${repoCount} repositories across languages: ${languages.join(', ') || 'N/A'}. Total stars: ${totalStars}.`,
      topLanguages: languages
    };
  },
  recommendCareer: async (payload) => {
    return await recommendCareerAI(payload);
  },
  analyzeSkillGap: async (payload) => {
    return await analyzeSkillGapAI(payload);
  },
  generateRoadmap: async (payload) => {
    return await generateRoadmapAI(payload);
  },
  generateInterviewQuestion: async (payload) => {
    return await generateInterviewQuestionAI(payload);
  },
  evaluateInterviewAnswer: async (payload) => {
    return await evaluateInterviewAnswerAI(payload);
  }
};
