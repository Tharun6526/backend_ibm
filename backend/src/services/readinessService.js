import prisma from '../config/database.js';
import { clampScore, determineReadinessStatus } from '../utils/scoreUtils.js';

export const getReadiness = async (userId) => {
  let readiness = await prisma.jobReadiness.findUnique({
    where: { userId }
  });

  if (!readiness) {
    readiness = await calculateReadiness(userId);
  }

  return {
    overallScore: readiness.overallScore,
    breakdown: {
      technicalSkills: readiness.technicalSkills,
      dsa: readiness.dsa,
      projects: readiness.projects,
      resume: readiness.resume,
      github: readiness.github,
      interview: readiness.interview
    },
    status: readiness.status,
    improvements: readiness.improvements
  };
};

export const calculateReadiness = async (userId) => {
  // Fetch user data across tables
  const userSkills = await prisma.userSkill.findMany({ where: { userId } });
  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { skills: true, projects: true }
  });
  const github = await prisma.githubProfile.findUnique({
    where: { userId },
    include: { analysis: true, repositories: true }
  });
  const interviews = await prisma.interviewEvaluation.findMany({
    where: { interview: { userId } }
  });

  // Calculate Technical Skills Score
  let techScore = 60;
  if (userSkills.length > 0) {
    const sum = userSkills.reduce((acc, s) => acc + s.level, 0);
    techScore = Math.round(sum / userSkills.length);
  } else if (resume && resume.skills.length > 0) {
    const sum = resume.skills.reduce((acc, s) => acc + s.level, 0);
    techScore = Math.round(sum / resume.skills.length);
  }
  techScore = clampScore(techScore);

  // Calculate DSA Score
  const dsaSkill = userSkills.find((s) => s.skillName.toUpperCase().includes('DSA') || s.skillName.toUpperCase().includes('ALGORITHM'));
  let dsaScore = dsaSkill ? dsaSkill.level : (techScore > 70 ? 65 : 55);
  dsaScore = clampScore(dsaScore);

  // Calculate Projects Score
  let projectScore = 55;
  const projectCount = (resume?.projects?.length || 0) + (github?.repositories?.length || 0);
  if (projectCount > 0) {
    projectScore = Math.min(95, 60 + projectCount * 8);
  }
  if (github?.analysis?.projectQuality) {
    projectScore = Math.round((projectScore + github.analysis.projectQuality) / 2);
  }
  projectScore = clampScore(projectScore);

  // Calculate Resume Score
  let resumeScore = resume ? 75 : 40;
  if (resume?.skills?.length && resume.skills.length > 3) resumeScore += 10;
  if (resume?.projects?.length && resume.projects.length > 1) resumeScore += 10;
  resumeScore = clampScore(resumeScore);

  // Calculate GitHub Score
  let githubScore = github ? 65 : 35;
  if (github?.repositories?.length) githubScore += Math.min(25, github.repositories.length * 5);
  if (github?.analysis?.complexityScore) githubScore = Math.round((githubScore + github.analysis.complexityScore) / 2);
  githubScore = clampScore(githubScore);

  // Calculate Interview Score
  let interviewScore = 60;
  if (interviews.length > 0) {
    const sum = interviews.reduce((acc, i) => acc + i.overallScore, 0);
    interviewScore = Math.round(sum / interviews.length);
  }
  interviewScore = clampScore(interviewScore);

  // Weighted overall score
  const overallScore = Math.round(
    techScore * 0.25 +
    dsaScore * 0.20 +
    projectScore * 0.20 +
    resumeScore * 0.15 +
    githubScore * 0.10 +
    interviewScore * 0.10
  );

  const status = determineReadinessStatus(overallScore);

  // Improvements generation
  const improvements = [];
  if (dsaScore < 70) improvements.push('Improve DSA and practice problem-solving patterns');
  if (techScore < 70) improvements.push('Complete system design roadmap and core tech skills');
  if (githubScore < 60) improvements.push('Connect GitHub and publish clean project repositories');
  if (resumeScore < 60) improvements.push('Upload an updated resume for AI analysis');
  if (interviewScore < 70) improvements.push('Complete mock interviews to boost technical response scores');

  if (improvements.length === 0) {
    improvements.push('Keep practicing advanced mock interviews and system architecture!');
  }

  const updated = await prisma.jobReadiness.upsert({
    where: { userId },
    update: {
      overallScore,
      technicalSkills: techScore,
      dsa: dsaScore,
      projects: projectScore,
      resume: resumeScore,
      github: githubScore,
      interview: interviewScore,
      status,
      improvements
    },
    create: {
      userId,
      overallScore,
      technicalSkills: techScore,
      dsa: dsaScore,
      projects: projectScore,
      resume: resumeScore,
      github: githubScore,
      interview: interviewScore,
      status,
      improvements
    }
  });

  return {
    overallScore: updated.overallScore,
    breakdown: {
      technicalSkills: updated.technicalSkills,
      dsa: updated.dsa,
      projects: updated.projects,
      resume: updated.resume,
      github: updated.github,
      interview: updated.interview
    },
    status: updated.status,
    improvements: updated.improvements
  };
};
