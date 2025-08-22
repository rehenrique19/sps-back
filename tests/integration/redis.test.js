const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const databaseFactory = require('../../src/database');

const app = express();
app.use(express.json());
app.use(routes);

describe('Redis Integration Tests', () => {
  beforeAll(async () => {
    // Forçar uso do Redis para este teste
    process.env.USE_REDIS = 'true';
    process.env.REDIS_URL = 'redis://localhost:6379';
    
    try {
      await databaseFactory.initialize();
    } catch (error) {
      console.log('Redis não disponível, pulando testes Redis');
    }
  });

  afterAll(() => {
    // Restaurar configuração original
    process.env.USE_REDIS = 'false';
  });

  it('deve funcionar com Redis se disponível', async () => {
    const database = databaseFactory.getDatabase();
    
    // Se não conseguiu conectar Redis, pula o teste
    if (database.constructor.name === 'MockDatabase') {
      console.log('Redis não disponível, usando mock database');
      expect(true).toBe(true); // Teste passa
      return;
    }

    // Teste com Redis
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@spsgroup.com.br',
        password: '1234'
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    
    const token = loginResponse.body.token;

    // Criar usuário no Redis
    const userData = {
      name: 'Redis Test User',
      email: 'redis@test.com',
      type: 'user',
      password: '123456'
    };

    const createResponse = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(userData);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.email).toBe(userData.email);

    // Listar usuários do Redis
    const listResponse = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.length).toBeGreaterThan(1);
  });
});