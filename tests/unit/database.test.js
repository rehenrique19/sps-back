const mockDatabase = require('../../src/database/mockDatabase');
const databaseFactory = require('../../src/database');

describe('Database Tests', () => {
  beforeEach(() => {
    mockDatabase.users = [];
    mockDatabase.nextId = 1;
    mockDatabase.initializeAdmin();
  });

  describe('mockDatabase', () => {
    it('deve inicializar com admin', () => {
      expect(mockDatabase.users).toHaveLength(1);
      expect(mockDatabase.users[0].email).toBe('admin@spsgroup.com.br');
    });

    it('deve criar usuário', async () => {
      const userData = { name: 'Test', email: 'test@test.com', type: 'user', password: '123' };
      const user = await mockDatabase.createUser(userData);
      
      expect(user.id).toBe(2);
      expect(user.email).toBe(userData.email);
      expect(mockDatabase.users).toHaveLength(2);
    });

    it('deve buscar usuário por ID', async () => {
      const user = await mockDatabase.findUserById(1);
      expect(user.email).toBe('admin@spsgroup.com.br');
    });

    it('deve buscar usuário por email', async () => {
      const user = await mockDatabase.findUserByEmail('admin@spsgroup.com.br');
      expect(user.id).toBe(1);
    });

    it('deve atualizar usuário', async () => {
      const updated = await mockDatabase.updateUser(1, { name: 'Updated Admin' });
      expect(updated.name).toBe('Updated Admin');
    });

    it('deve deletar usuário', async () => {
      const userData = { name: 'Test', email: 'test@test.com', type: 'user', password: '123' };
      const user = await mockDatabase.createUser(userData);
      
      const deleted = await mockDatabase.deleteUser(user.id);
      expect(deleted).toBe(true);
      expect(mockDatabase.users).toHaveLength(1);
    });

    it('deve retornar false ao deletar usuário inexistente', async () => {
      const deleted = await mockDatabase.deleteUser(999);
      expect(deleted).toBe(false);
    });

    it('deve listar todos os usuários', async () => {
      const users = await mockDatabase.getAllUsers();
      expect(users).toHaveLength(1);
    });
  });

  describe('databaseFactory', () => {
    it('deve retornar mock database', () => {
      const db = databaseFactory.getDatabase();
      expect(db).toBe(mockDatabase);
    });

    it('deve inicializar database', async () => {
      await databaseFactory.initialize();
      expect(databaseFactory.getDatabase()).toBeTruthy();
    });
  });
});