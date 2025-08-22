const request = require('supertest');
const express = require('express');
const cors = require('cors');
const routes = require('../../src/routes');
const corsErrorHandler = require('../../src/middleware/corsHandler');
const logger = require('../../src/config/logger');

// Mock do logger
jest.mock('../../src/config/logger', () => ({
  warn: jest.fn()
}));

const app = express();

// Configuração CORS igual ao servidor principal
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);
app.use(corsErrorHandler);

describe('CORS Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir acesso de origin autorizado', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('deve bloquear acesso de origin não autorizado', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://malicious-site.com');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Acesso negado - Origin não autorizado');
    expect(logger.warn).toHaveBeenCalledWith('Acesso CORS bloqueado', expect.any(Object));
  });

  it('deve permitir requisições sem origin (Postman, mobile)', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
  });

  it('deve incluir headers CORS corretos', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

    expect(response.status).toBe(204); // OPTIONS retorna 204
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});