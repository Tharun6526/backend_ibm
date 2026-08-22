import request from 'supertest';
import app from '../src/app.js';

describe('AI Career Copilot API Integration Tests', () => {
  let userToken = '';
  let userId = '';

  const testUser = {
    name: 'Test Student',
    email: `teststudent_${Date.now()}@example.com`,
    password: 'password123'
  };

  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register - should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toEqual(testUser.email.toLowerCase());

      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('POST /api/auth/register - should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login - should authenticate valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('POST /api/auth/login - should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Endpoints - Security Checks', () => {
    it('GET /api/profile - should block unauthenticated request', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.statusCode).toEqual(401);
    });

    it('GET /api/profile - should block invalid token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid_token_xyz');
      expect(res.statusCode).toEqual(401);
    });

    it('GET /api/profile - should succeed with valid token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('userId');
    });
  });

  describe('Profile Endpoints', () => {
    it('PUT /api/profile - should update user profile', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          college: 'Stanford University',
          degree: 'B.S.',
          branch: 'Computer Science',
          graduationYear: 2026,
          careerGoal: 'Software Developer',
          experienceLevel: 'INTERMEDIATE',
          hoursPerDay: 4,
          targetMonths: 6
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.careerGoal).toEqual('Software Developer');
      expect(res.body.hoursPerDay).toEqual(4);
    });
  });

  describe('Dashboard Endpoint', () => {
    it('GET /api/dashboard - should return aggregated dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('careerMatch');
      expect(res.body).toHaveProperty('readinessScore');
      expect(res.body).toHaveProperty('skillScore');
      expect(res.body).toHaveProperty('recommendedCareer');
      expect(res.body).toHaveProperty('topSkillGaps');
      expect(res.body).toHaveProperty('todayTasks');
    });
  });

  describe('Career & Skill Endpoints', () => {
    it('GET /api/careers - should return career list', async () => {
      const res = await request(app)
        .get('/api/careers')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/careers/recommend - should generate recommendations', async () => {
      const res = await request(app)
        .post('/api/careers/recommend')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('career');
        expect(res.body[0]).toHaveProperty('matchPercentage');
      }
    });

    it('GET /api/skills/gaps - should return skill gap analysis', async () => {
      const res = await request(app)
        .get('/api/skills/gaps')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Roadmap Endpoints', () => {
    it('GET /api/roadmap - should fetch or generate roadmap', async () => {
      const res = await request(app)
        .get('/api/roadmap')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('tasks');
      expect(Array.isArray(res.body.tasks)).toBe(true);
    });
  });

  describe('Course Endpoints', () => {
    it('GET /api/courses - should list available courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/courses/recommended - should return recommended courses', async () => {
      const res = await request(app)
        .get('/api/courses/recommended')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Job Readiness Endpoints', () => {
    it('GET /api/readiness - should return readiness score breakdown', async () => {
      const res = await request(app)
        .get('/api/readiness')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('overallScore');
      expect(res.body).toHaveProperty('breakdown');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('improvements');
    });
  });

  describe('Mock Interview Endpoints', () => {
    let interviewId = '';
    let questionId = '';

    it('POST /api/interviews/start - should initiate interview session', async () => {
      const res = await request(app)
        .post('/api/interviews/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'TECHNICAL', difficulty: 'MEDIUM' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('interviewId');
      expect(res.body).toHaveProperty('question');

      interviewId = res.body.interviewId;
      questionId = res.body.question.id;
    });

    it('POST /api/interviews/:id/answer - should submit answer and get evaluation', async () => {
      const res = await request(app)
        .post(`/api/interviews/${interviewId}/answer`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          questionId,
          answerText: 'Node.js relies on an event loop with non-blocking V8 execution and libuv thread pool.'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('evaluation');
      expect(res.body.evaluation).toHaveProperty('overallScore');
    });

    it('GET /api/interviews/history - should retrieve interview history', async () => {
      const res = await request(app)
        .get('/api/interviews/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
