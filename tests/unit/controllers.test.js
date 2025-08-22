const UserController = require('../../src/controllers/UserController');
const AuthController = require('../../src/controllers/AuthController');

jest.mock('../../src/services/UserService');
jest.mock('../../src/services/AuthService');
jest.mock('../../src/config/logger');

describe('Controllers Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      file: null,
      user: { id: 1, type: 'admin' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('UserController', () => {
    it('deve listar usuários', async () => {
      const UserService = require('../../src/services/UserService');
      UserService.getAllUsers = jest.fn().mockResolvedValue([]);

      await UserController.getUsers(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('deve criar usuário', async () => {
      req.body = { name: 'Test', email: 'test@test.com', type: 'user', password: '123' };
      
      const UserService = require('../../src/services/UserService');
      UserService.createUser = jest.fn().mockResolvedValue({ id: 1, ...req.body });

      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve tratar erro na criação', async () => {
      req.body = {};
      
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve atualizar usuário', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated' };
      
      const UserService = require('../../src/services/UserService');
      UserService.updateUser = jest.fn().mockResolvedValue({ id: 1, name: 'Updated' });

      await UserController.updateUser(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('deve deletar usuário', async () => {
      req.params.id = '1';
      
      const UserService = require('../../src/services/UserService');
      UserService.deleteUser = jest.fn().mockResolvedValue(true);

      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe('AuthController', () => {
    it('deve fazer login com sucesso', async () => {
      req.body = { email: 'admin@test.com', password: '1234' };
      
      const AuthService = require('../../src/services/AuthService');
      AuthService.login = jest.fn().mockResolvedValue({
        user: { id: 1, email: 'admin@test.com' },
        token: 'jwt-token'
      });

      await AuthController.login(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('deve tratar dados inválidos', async () => {
      req.body = {}; // Dados vazios
      
      await AuthController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});