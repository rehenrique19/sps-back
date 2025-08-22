const globalAuth = require('../../src/middleware/globalAuth');
const security = require('../../src/middleware/security');
const errorHandler = require('../../src/middleware/errorHandler');
const corsHandler = require('../../src/middleware/corsHandler');

jest.mock('../../src/config/logger');

describe('Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
      path: '/test',
      url: '/test',
      method: 'GET',
      headers: {},
      get: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('globalAuth middleware', () => {
    it('deve permitir rotas públicas', () => {
      req.path = '/health';
      globalAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('deve bloquear sem token', () => {
      req.path = '/users';
      globalAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve bloquear com token inválido', () => {
      req.path = '/users';
      req.headers.authorization = 'Bearer invalid-token';
      
      globalAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('security middleware', () => {
    it('deve permitir primeira requisição', () => {
      security(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('deve logar requisições sensíveis', () => {
      req.method = 'POST';
      req.path = '/auth/login';
      security(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('errorHandler middleware', () => {
    it('deve tratar erro de validação', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      errorHandler(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve tratar erro JWT', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      
      errorHandler(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve tratar erro de upload', () => {
      const error = new Error('File too large');
      error.code = 'LIMIT_FILE_SIZE';
      
      errorHandler(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('corsHandler middleware', () => {
    it('deve chamar next para erros não-CORS', () => {
      const error = new Error('Other error');
      
      corsHandler(error, req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});