const mockDatabase = require('./mockDatabase');
const redisDatabase = require('./redisDatabase');
const logger = require('../config/logger');

/**
 * Factory para seleção do banco de dados
 * Usa Redis se USE_REDIS=true, senão usa mock em memória
 */
class DatabaseFactory {
  constructor() {
    this.database = null;
    this.useRedis = process.env.USE_REDIS === 'true';
  }

  async initialize() {
    if (this.useRedis) {
      try {
        await redisDatabase.connect();
        this.database = redisDatabase;
        logger.info('Usando Redis como banco de dados');
      } catch (error) {
        logger.warn('Falha ao conectar Redis, usando mock database', { error: encodeURIComponent(error.message) });
        this.database = mockDatabase;
      }
    } else {
      this.database = mockDatabase;
      logger.info('Usando mock database em memória');
    }
  }

  getDatabase() {
    if (!this.database) {
      throw new Error('Database não inicializado. Chame initialize() primeiro.');
    }
    return this.database;
  }
}

module.exports = new DatabaseFactory();