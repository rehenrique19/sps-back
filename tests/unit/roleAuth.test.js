const roleAuth = require('../../src/middleware/roleAuth');

jest.mock('../../src/config/logger');

describe('Role Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null,
      ip: '127.0.0.1',
      url: '/test',
      method: 'GET'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('adminOnly', () => {
    it('deve permitir acesso para admin', () => {
      req.user = { id: 1, type: 'admin' };
      
      roleAuth.adminOnly(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve permitir acesso para super_admin', () => {
      req.user = { id: 1, type: 'super_admin' };
      
      roleAuth.adminOnly(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve bloquear acesso para usuário comum', () => {
      req.user = { id: 1, type: 'user' };
      
      roleAuth.adminOnly(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('adminOrOwner', () => {
    it('deve permitir admin acessar qualquer usuário', () => {
      req.user = { id: 1, type: 'admin' };
      req.params = { id: '2' };
      
      roleAuth.adminOrOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('deve permitir usuário acessar próprios dados', () => {
      req.user = { id: 1, type: 'user' };
      req.params = { id: '1' };
      
      roleAuth.adminOrOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('deve bloquear usuário acessar dados de outro', () => {
      req.user = { id: 1, type: 'user' };
      req.params = { id: '2' };
      
      roleAuth.adminOrOwner(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authenticated', () => {
    it('deve permitir qualquer usuário autenticado', () => {
      req.user = { id: 1, type: 'user' };
      
      roleAuth.authenticated(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});