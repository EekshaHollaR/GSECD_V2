const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Crisis Detection Routes', () => {
  let token;
  beforeAll(async () => {
    // Register & login a test user, obtain JWT token
    await request(app)
      .post('/api/auth/register')
      .send({ name:'Test', email:'test@test.com', password:'password123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email:'test@test.com', password:'password123' });
    token = res.body.data.token;
  });

  it('GET /api/crisis-detection/global should return array', async () => {
    const res = await request(app)
      .get('/api/crisis-detection/global')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/crisis-detection/country/USA should return object', async () => {
    const res = await request(app)
      .get('/api/crisis-detection/country/USA')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('overallRisk');
  });
});
