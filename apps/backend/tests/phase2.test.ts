import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { getRedisClient } from '../src/config/redis.js';

describe('Phase 2: Auth, RBAC, Settings & Audit API', () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect().catch(() => {});
    const redis = getRedisClient();
    try {
      redis.disconnect();
    } catch {}
  });

  describe('Authentication Security', () => {
    it('POST /api/v1/auth/login should reject empty body with 400 validation error', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/v1/auth/login should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notanemail', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me should return 401 UNAUTHORIZED without Bearer token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/refresh should return 401 when no refresh token cookie is provided', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_REFRESH_TOKEN');
    });
  });

  describe('Server-Side Protected Endpoints (Never Trust Frontend Rule)', () => {
    it('GET /api/v1/roles should require authentication', async () => {
      const res = await request(app).get('/api/v1/roles');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/settings/company should require authentication', async () => {
      const res = await request(app).get('/api/v1/settings/company');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/settings/branches should require authentication', async () => {
      const res = await request(app).get('/api/v1/settings/branches');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/audit-logs should require authentication', async () => {
      const res = await request(app).get('/api/v1/audit-logs');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
