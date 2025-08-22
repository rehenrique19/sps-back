const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');

const app = express();
app.use(express.json());
app.use(routes);

describe('Auth Integration Tests', () => {
  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: '1234'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('admin@spsgroup.com.br');
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: 'wrong'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    it('deve retornar erro para campos obrigatórios', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email e senha são obrigatórios');
    });
  });
});