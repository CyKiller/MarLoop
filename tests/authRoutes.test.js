const request = require('supertest');
const app = require('../server');

describe('Authentication Routes', () => {
  test('Register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'password' });
    expect(response.statusCode).toBe(302); // Assuming redirect on success
    console.log('Register a new user test passed with status code:', response.statusCode);
  });

  test('Login an existing user', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password' });
    expect(response.statusCode).toBe(302); // Assuming redirect on success
    console.log('Login an existing user test passed with status code:', response.statusCode);
  });

  test('Fail login with wrong credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'wronguser', password: 'wrongpassword' });
    expect(response.statusCode).not.toBe(302); // Assuming failure does not redirect to dashboard
    console.log('Fail login with wrong credentials test passed with status code:', response.statusCode);
  });

  test('Logout an authenticated user', async () => {
    // Assuming a user is already logged in for this test to be meaningful
    const response = await request(app)
      .get('/auth/logout');
    expect(response.statusCode).toBe(302); // Assuming redirect on success
    console.log('Logout an authenticated user test passed with status code:', response.statusCode);
  });
});