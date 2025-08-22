const databaseFactory = require('../src/database');

// Mock do logger para evitar logs durante os testes
jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Configurar variáveis de ambiente para testes
process.env.JWT_SECRET = 'test_secret_key';
process.env.USE_REDIS = 'false';

// Inicializar banco antes de todos os testes
beforeAll(async () => {
  await databaseFactory.initialize();
});