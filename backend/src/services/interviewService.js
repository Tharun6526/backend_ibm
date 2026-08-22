import prisma from '../config/database.js';
import { aiService } from '../ai/aiService.js';
import { calculateReadiness } from './readinessService.js';

export const startInterview = async (userId, { type, difficulty }) => {
  const interviewType = type || 'TECHNICAL';
  const interviewDiff = difficulty || 'MEDIUM';

  const firstQ = await aiService.generateInterviewQuestion({
    type: interviewType,
    difficulty: interviewDiff,
    questionNumber: 0
  });

  const interview = await prisma.$transaction(async (tx) => {
    const session = await tx.interview.create({
      data: {
        userId,
        type: interviewType,
        difficulty: interviewDiff,
        status: 'IN_PROGRESS'
      }
    });

    const question = await tx.interviewQuestion.create({
      data: {
        interviewId: session.id,
        questionText: firstQ.questionText,
        category: firstQ.category || 'General',
        orderIndex: 0
      }
    });

    return { session, question };
  });

  return {
    interviewId: interview.session.id,
    type: interview.session.type,
    difficulty: interview.session.difficulty,
    question: {
      id: interview.question.id,
      text: interview.question.questionText,
      category: interview.question.category,
      orderIndex: interview.question.orderIndex
    }
  };
};

export const submitAnswer = async (interviewId, userId, { questionId, answerText }) => {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId },
    include: { questions: true }
  });

  if (!interview) {
    const error = new Error('Interview session not found');
    error.statusCode = 404;
    throw error;
  }

  const question = await prisma.interviewQuestion.findFirst({
    where: { id: questionId, interviewId }
  });

  if (!question) {
    const error = new Error('Question not found in this interview session');
    error.statusCode = 404;
    throw error;
  }

  const savedAnswer = await prisma.interviewAnswer.create({
    data: {
      interviewId,
      questionId,
      answerText
    }
  });

  // Automatically trigger AI evaluation
  const evaluationResult = await evaluateAnswer(interviewId, userId, { answerId: savedAnswer.id });

  // Generate next question if needed
  const currentCount = interview.questions.length;
  let nextQuestion = null;

  if (currentCount < 3) {
    const qData = await aiService.generateInterviewQuestion({
      type: interview.type,
      difficulty: interview.difficulty,
      questionNumber: currentCount
    });

    const createdQ = await prisma.interviewQuestion.create({
      data: {
        interviewId,
        questionText: qData.questionText,
        category: qData.category || 'General',
        orderIndex: currentCount
      }
    });

    nextQuestion = {
      id: createdQ.id,
      text: createdQ.questionText,
      category: createdQ.category,
      orderIndex: createdQ.orderIndex
    };
  } else {
    // Mark interview complete
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'COMPLETED' }
    });
    // Update Job Readiness score
    await calculateReadiness(userId);
  }

  return {
    answerId: savedAnswer.id,
    evaluation: evaluationResult,
    nextQuestion,
    interviewCompleted: currentCount >= 3
  };
};

export const evaluateAnswer = async (interviewId, userId, { answerId }) => {
  const answerRecord = await prisma.interviewAnswer.findFirst({
    where: { id: answerId, interviewId },
    include: {
      question: true,
      interview: true
    }
  });

  if (!answerRecord || answerRecord.interview.userId !== userId) {
    const error = new Error('Interview answer record not found');
    error.statusCode = 404;
    throw error;
  }

  const aiEval = await aiService.evaluateInterviewAnswer({
    questionText: answerRecord.question.questionText,
    answerText: answerRecord.answerText,
    type: answerRecord.interview.type,
    difficulty: answerRecord.interview.difficulty
  });

  const evaluationRecord = await prisma.interviewEvaluation.upsert({
    where: { answerId },
    update: {
      correctness: aiEval.correctness,
      communication: aiEval.communication,
      technicalDepth: aiEval.technicalDepth,
      overallScore: aiEval.overallScore,
      feedback: aiEval.feedback
    },
    create: {
      interviewId,
      answerId,
      correctness: aiEval.correctness,
      communication: aiEval.communication,
      technicalDepth: aiEval.technicalDepth,
      overallScore: aiEval.overallScore,
      feedback: aiEval.feedback
    }
  });

  return {
    correctness: evaluationRecord.correctness,
    communication: evaluationRecord.communication,
    technicalDepth: evaluationRecord.technicalDepth,
    overallScore: evaluationRecord.overallScore,
    feedback: evaluationRecord.feedback
  };
};

export const getInterviewHistory = async (userId) => {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      evaluations: true,
      questions: true
    }
  });

  return interviews.map((i) => {
    let avgScore = 0;
    if (i.evaluations.length > 0) {
      avgScore = Math.round(i.evaluations.reduce((acc, e) => acc + e.overallScore, 0) / i.evaluations.length);
    }

    return {
      id: i.id,
      type: i.type,
      difficulty: i.difficulty,
      status: i.status,
      questionCount: i.questions.length,
      averageScore: avgScore,
      createdAt: i.createdAt
    };
  });
};

export const getInterviewById = async (id, userId) => {
  const interview = await prisma.interview.findFirst({
    where: { id, userId },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: {
          answers: {
            include: {
              evaluation: true
            }
          }
        }
      },
      evaluations: true
    }
  });

  if (!interview) {
    const error = new Error('Interview session not found');
    error.statusCode = 404;
    throw error;
  }

  let avgScore = 0;
  if (interview.evaluations.length > 0) {
    avgScore = Math.round(interview.evaluations.reduce((acc, e) => acc + e.overallScore, 0) / interview.evaluations.length);
  }

  return {
    id: interview.id,
    type: interview.type,
    difficulty: interview.difficulty,
    status: interview.status,
    averageScore: avgScore,
    createdAt: interview.createdAt,
    questions: interview.questions.map((q) => {
      const ans = q.answers[0];
      return {
        id: q.id,
        text: q.questionText,
        category: q.category,
        answer: ans ? ans.answerText : null,
        evaluation: ans?.evaluation
          ? {
              correctness: ans.evaluation.correctness,
              communication: ans.evaluation.communication,
              technicalDepth: ans.evaluation.technicalDepth,
              overallScore: ans.evaluation.overallScore,
              feedback: ans.evaluation.feedback
            }
          : null
      };
    })
  };
};
