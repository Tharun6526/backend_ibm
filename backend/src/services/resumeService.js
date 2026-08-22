import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import prisma from '../config/database.js';
import { aiService } from '../ai/aiService.js';
import { calculateReadiness } from './readinessService.js';

export const extractTextFromFile = async (filePath, mimeType, originalName) => {
  const buffer = fs.readFileSync(filePath);
  let extractedText = '';

  if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    extractedText = data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    originalName.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    extractedText = result.value;
  } else {
    extractedText = buffer.toString('utf-8');
  }

  return extractedText.trim();
};

export const uploadAndProcessResume = async (userId, file) => {
  const extractedText = await extractTextFromFile(file.path, file.mimetype, file.originalname);

  // Perform AI Analysis on extracted text
  const aiResults = await aiService.analyzeResume(extractedText);

  // Transactionally save Resume, Analysis, Skills, Projects, Experience, Certifications
  const savedResume = await prisma.$transaction(async (tx) => {
    const resume = await tx.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        extractedText
      }
    });

    await tx.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        strengths: aiResults.strengths || [],
        weaknesses: aiResults.weaknesses || [],
        feedback: aiResults.feedback || []
      }
    });

    if (aiResults.technicalSkills && aiResults.technicalSkills.length > 0) {
      for (const s of aiResults.technicalSkills) {
        await tx.resumeSkill.create({
          data: {
            resumeId: resume.id,
            name: s.name,
            level: s.level || 70
          }
        });

        // Also add or update UserSkill
        await tx.userSkill.upsert({
          where: {
            userId_skillName: {
              userId,
              skillName: s.name
            }
          },
          update: { level: s.level || 70 },
          create: {
            userId,
            skillName: s.name,
            level: s.level || 70
          }
        });
      }
    }

    if (aiResults.projects && aiResults.projects.length > 0) {
      for (const p of aiResults.projects) {
        await tx.resumeProject.create({
          data: {
            resumeId: resume.id,
            title: p.title,
            description: p.description,
            technologies: p.technologies || [],
            link: p.link || null
          }
        });
      }
    }

    if (aiResults.experience && aiResults.experience.length > 0) {
      for (const e of aiResults.experience) {
        await tx.resumeExperience.create({
          data: {
            resumeId: resume.id,
            role: e.role,
            company: e.company,
            duration: e.duration,
            description: e.description
          }
        });
      }
    }

    if (aiResults.certifications && aiResults.certifications.length > 0) {
      for (const c of aiResults.certifications) {
        await tx.resumeCertification.create({
          data: {
            resumeId: resume.id,
            name: c.name,
            issuer: c.issuer
          }
        });
      }
    }

    return resume;
  });

  // Recalculate job readiness in background service
  await calculateReadiness(userId);

  return await getLatestResume(userId);
};

export const getLatestResume = async (userId) => {
  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      analysis: true,
      skills: true,
      projects: true,
      experiences: true,
      certifications: true
    }
  });

  if (!resume) {
    return {
      technicalSkills: [],
      projects: [],
      experience: [],
      certifications: [],
      strengths: [],
      weaknesses: [],
      feedback: []
    };
  }

  return {
    id: resume.id,
    fileName: resume.fileName,
    fileUrl: resume.fileUrl,
    technicalSkills: resume.skills.map((s) => ({ name: s.name, level: s.level })),
    projects: resume.projects.map((p) => ({
      title: p.title,
      description: p.description,
      technologies: p.technologies,
      link: p.link
    })),
    experience: resume.experiences.map((e) => ({
      role: e.role,
      company: e.company,
      duration: e.duration,
      description: e.description
    })),
    certifications: resume.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer
    })),
    strengths: resume.analysis?.strengths || [],
    weaknesses: resume.analysis?.weaknesses || [],
    feedback: resume.analysis?.feedback || []
  };
};

export const analyzeResumeAIOnly = async (userId) => {
  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  if (!resume || !resume.extractedText) {
    const error = new Error('No uploaded resume found to analyze');
    error.statusCode = 404;
    throw error;
  }

  return await uploadAndProcessResume(userId, {
    originalname: resume.fileName,
    mimetype: resume.fileType,
    path: resume.fileUrl.replace('/uploads/', 'uploads/'),
    filename: resume.fileUrl.replace('/uploads/', '')
  });
};
