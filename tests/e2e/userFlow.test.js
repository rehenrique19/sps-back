const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const mockDatabase = require('../../src/database/mockDatabase');
const globalAuthMiddleware = require('../../src/middleware/globalAuth');
const errorHandler = require('../../src/middleware/errorHandler');

// Criar app completo com todos os middlewares
const app = express();
app.use(express.json());
app.use(globalAuthMiddleware);
app.use(routes);
app.use(errorHandler);

describe('E2E: Complete User Flow', () => {
  beforeEach(() => {
    // Reset database
    mockDatabase.users = [];
    mockDatabase.nextId = 1;
    mockDatabase.initializeAdmin();
  });

  it('deve executar fluxo completo: login -> criar -> listar -> atualizar -> deletar', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: process.env.TEST_ADMIN_EMAIL || 'admin@spsgroup.com.br',
        password: process.env.TEST_ADMIN_PASSWORD || '1234'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;

    // 2. Criar usuário
    const userData = {
      name: 'E2E Test User',
      email: 'e2e@test.com',
      type: 'user',
      password: '123456'
    };

    const createResponse = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(userData);

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.id;

    // 3. Listar usuários
    const listResponse = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.length).toBe(2); // admin + novo usuário

    // 4. Atualizar usuário
    const updateResponse = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated E2E User' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Updated E2E User');

    // 5. Deletar usuário
    const deleteResponse = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(204);

    // 6. Verificar se foi deletado
    const finalListResponse = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(finalListResponse.status).toBe(200);
    expect(finalListResponse.body.length).toBe(1); // apenas admin
  });

  it('deve bloquear acesso sem autenticação', async () => {
    const endpoints = [
      { method: 'get', path: '/users' },
      { method: 'post', path: '/users' },
      { method: 'put', path: '/users/1' },
      { method: 'delete', path: '/users/1' }
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.path);
      expect(response.status).toBe(401);
    }
  });

  it('deve validar dados obrigatórios na criação', async () => {
    // Login primeiro
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: process.env.TEST_ADMIN_EMAIL || 'admin@spsgroup.com.br',
        password: process.env.TEST_ADMIN_PASSWORD || '1234'
      });

    const token = loginResponse.body.token;

    // Tentar criar usuário sem dados obrigatórios
    const incompleteData = {
      name: 'Test User'
      // faltando email, type, password
    };

    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(incompleteData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todos os campos são obrigatórios');
  });
});