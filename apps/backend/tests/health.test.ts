import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { getRedisClient } from '../src/config/redis.js';

describe('Backend Foundation & Health API', () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect().catch(() => {});
    const redis = getRedisClient();
    try {
      redis.disconnect();
    } catch {}
  });

  it('GET /api/v1 should return API status information', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.message).toContain('Modular Customizable ERP API v1');
  });

  it('GET /api/v1/health should respond with service diagnostics', async () => {
    const res = await request(app).get('/api/v1/health');
    // In dev without running DB container, it gracefully reports 503 or 200 with service status
    expect([200, 503]).toContain(res.status);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.services).toBeDefined();
    expect(res.body.data.services).toHaveProperty('database');
    expect(res.body.data.services).toHaveProperty('redis');
  });

  it('GET /api/v1/unknown-endpoint should return structured 404 response', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
