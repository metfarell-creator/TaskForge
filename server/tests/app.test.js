const request = require('supertest');
const app = require('../src/app');
const store = require('../src/data/store');
const config = require('../src/config');

// Ensure tests use deterministic secret
config.jwtSecret = 'test-secret';
config.tokenExpiry = '1h';

function registerAndLogin(server, overrides = {}) {
  const credentials = {
    email: 'user@example.com',
    password: 'securePass123',
    ...overrides
  };

  return request(server)
    .post('/api/auth/register')
    .send(credentials)
    .then((registerResponse) => ({ registerResponse, credentials }));
}

describe('TaskForge API', () => {
  beforeEach(() => {
    store.reset();
  });

  it('registers a user and prevents duplicate registration', async () => {
    const first = await registerAndLogin(app);
    expect(first.registerResponse.statusCode).toBe(201);
    expect(first.registerResponse.body.token).toBeDefined();

    const duplicate = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'securePass123' });

    expect(duplicate.statusCode).toBe(409);
    expect(duplicate.body.error).toMatch(/already exists/i);
  });

  it('logs in an existing user and rejects invalid credentials', async () => {
    await registerAndLogin(app);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'securePass123' });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();

    const invalid = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrong-pass' });

    expect(invalid.statusCode).toBe(401);
  });

  it('performs CRUD operations on tasks for authenticated users', async () => {
    const { registerResponse } = await registerAndLogin(app);
    const token = registerResponse.body.token;

    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First Task', description: 'Example task' });

    expect(create.statusCode).toBe(201);
    expect(create.body.title).toBe('First Task');

    const list = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(list.statusCode).toBe(200);
    expect(list.body).toHaveLength(1);

    const taskId = create.body.id;

    const update = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true, title: 'Updated Task' });

    expect(update.statusCode).toBe(200);
    expect(update.body.completed).toBe(true);
    expect(update.body.title).toBe('Updated Task');

    const remove = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(remove.statusCode).toBe(204);

    const afterDelete = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(afterDelete.body).toHaveLength(0);
  });

  it('isolates tasks between different users', async () => {
    const first = await registerAndLogin(app, { email: 'first@example.com' });
    const second = await registerAndLogin(app, { email: 'second@example.com' });

    const tokenOne = first.registerResponse.body.token;
    const tokenTwo = second.registerResponse.body.token;

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({ title: 'Only mine' });

    const otherList = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenTwo}`);

    expect(otherList.body).toHaveLength(0);

    const updateForbidden = await request(app)
      .put('/api/tasks/1')
      .set('Authorization', `Bearer ${tokenTwo}`)
      .send({ title: 'Should fail' });

    expect(updateForbidden.statusCode).toBe(404);
  });

  it('rejects missing or invalid tokens', async () => {
    const unauthenticated = await request(app).get('/api/tasks');
    expect(unauthenticated.statusCode).toBe(401);

    const invalid = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalid');
    expect(invalid.statusCode).toBe(401);
  });
});
