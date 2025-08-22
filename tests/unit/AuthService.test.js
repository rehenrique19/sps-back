const AuthService = require('../../src/services/AuthService');
const mockDatabase = require('../../src/database/mockDatabase');

jest.mock('../../src/config/logger');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar token para credenciais válidas', async () => {
      const result = await AuthService.login('admin@spsgroup.com.br', '1234');
      
      expect(result).toBeTruthy();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('admin@spsgroup.com.br');
    });

    it('deve retornar null para email inválido', async () => {
      const result = await AuthService.login('invalid@email.com', '1234');
      
      expect(result).toBeNull();
    });

    it('deve retornar null para senha inválida', async () => {
      const result = await AuthService.login('admin@spsgroup.com.br', 'wrong');
      
      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('deve verificar token válido', async () => {
      const loginResult = await AuthService.login('admin@spsgroup.com.br', '1234');
      const decoded = AuthService.verifyToken(loginResult.token);
      
      expect(decoded).toBeTruthy();
      expect(decoded.email).toBe('admin@spsgroup.com.br');
    });

    it('deve retornar null para token inválido', () => {
      const result = AuthService.verifyToken('invalid-token');
      
      expect(result).toBeNull();
    });
  });
});