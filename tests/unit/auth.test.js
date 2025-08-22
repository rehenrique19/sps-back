const authMiddleware = require('../../src/middleware/auth');
const AuthService = require('../../src/services/AuthService');

jest.mock('../../src/services/AuthService');
jest.mock('../../src/config/logger');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('deve retornar erro quando não há token', () => {
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar erro quando token é inválido', () => {
    req.headers.authorization = 'Bearer invalid-token';
    AuthService.verifyToken.mockReturnValue(null);
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve permitir acesso com token válido', () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    req.headers.authorization = 'Bearer valid-token';
    AuthService.verifyToken.mockReturnValue(mockUser);
    
    authMiddleware(req, res, next);
    
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve tratar erro na verificação do token', () => {
    req.headers.authorization = 'Bearer error-token';
    AuthService.verifyToken.mockImplementation(() => {
      throw new Error('Token error');
    });
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve extrair token do header Authorization', () => {
    req.headers.authorization = 'Bearer test-token-123';
    AuthService.verifyToken.mockReturnValue({ id: 1 });
    
    authMiddleware(req, res, next);
    
    expect(AuthService.verifyToken).toHaveBeenCalledWith('test-token-123');
  });
});