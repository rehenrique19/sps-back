const UserService = require('../../src/services/UserService');
const mockDatabase = require('../../src/database/mockDatabase');

jest.mock('../../src/config/logger');

// Constantes para testes (não são credenciais reais)
const TEST_CREDENTIALS = {
  adminEmail: 'admin@spsgroup.com.br',
  adminPassword: '1234',
  userPassword: '123456'
};

describe('UserService', () => {
  beforeEach(() => {
    // Reset database para cada teste
    mockDatabase.users = [];
    mockDatabase.nextId = 1;
    mockDatabase.initializeAdmin();
  });

  describe('createUser', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: TEST_CREDENTIALS.userPassword
      };

      const user = await UserService.createUser(userData);
      
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
    });

    it('deve lançar erro para email duplicado', async () => {
      const userData = {
        name: 'Admin',
        email: TEST_CREDENTIALS.adminEmail,
        type: 'admin',
        password: TEST_CREDENTIALS.adminPassword
      };

      await expect(UserService.createUser(userData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('updateUser', () => {
    it('deve atualizar usuário existente', async () => {
      const updatedUser = await UserService.updateUser(1, { name: 'Updated Admin' });
      
      expect(updatedUser).toBeTruthy();
      expect(updatedUser.name).toBe('Updated Admin');
    });

    it('deve retornar null para usuário inexistente', async () => {
      const result = await UserService.updateUser(999, { name: 'Test' });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('deve remover usuário existente', async () => {
      // Criar um usuário regular primeiro
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: TEST_CREDENTIALS.userPassword
      };
      const createdUser = await UserService.createUser(userData);
      
      // Deletar o usuário criado
      const result = await UserService.deleteUser(createdUser.id);
      
      expect(result).toBe(true);
    });

    it('deve retornar false para usuário inexistente', async () => {
      const result = await UserService.deleteUser(999);
      
      expect(result).toBe(false);
    });

    it('deve impedir exclusão de super admin', async () => {
      await expect(UserService.deleteUser(1)).rejects.toThrow('Super administradores não podem ser excluídos');
    });
  });
});