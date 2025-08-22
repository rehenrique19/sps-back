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

describe('Users Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Fazer login para obter token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@spsgroup.com.br',
        password: '1234'
      });
    
    authToken = loginResponse.body.token;
  });

  beforeEach(() => {
    // Reset database
    mockDatabase.users = [];
    mockDatabase.nextId = 1;
    mockDatabase.initializeAdmin();
  });

  describe('GET /users', () => {
    it('deve listar usuários com token válido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('deve retornar erro sem token', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token não fornecido');
    });
  });

  describe('POST /users', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: '123456'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(userData.email);
    });

    it('deve retornar erro para email duplicado', async () => {
      const userData = {
        name: 'Admin',
        email: 'admin@spsgroup.com.br',
        type: 'admin',
        password: '1234'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email já cadastrado');
    });
  });

  describe('PUT /users/:id', () => {
    it('deve atualizar usuário existente', async () => {
      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Admin' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Admin');
    });

    it('deve retornar erro para usuário inexistente', async () => {
      const response = await request(app)
        .put('/users/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve remover usuário existente', async () => {
      // Primeiro criar um usuário regular
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: '123456'
      };

      const createResponse = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      const userId = createResponse.body.id;

      // Agora deletar o usuário criado
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('deve retornar erro para usuário inexistente', async () => {
      const response = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});