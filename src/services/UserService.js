const databaseFactory = require('../database');
const logger = require('../config/logger');

class UserService {
  /**
   * Busca todos os usuários
   * @returns {Array} Lista de usuários
   */
  async getAllUsers() {
    logger.info('Listando todos os usuários');
    const database = databaseFactory.getDatabase();
    return await database.getAllUsers();
  }

  /**
   * Busca usuário por ID
   * @param {string} id - ID do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  async getUserById(id) {
    const database = databaseFactory.getDatabase();
    return await database.findUserById(id);
  }

  /**
   * Cria novo usuário
   * Valida se email já existe antes de criar
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado
   */
  async createUser(userData) {
    const database = databaseFactory.getDatabase();
    const existingUser = await database.findUserByEmail(userData.email);
    if (existingUser) {
      logger.warn('Tentativa de criar usuário com email duplicado', { email: encodeURIComponent(userData.email) });
      throw new Error('Email já cadastrado');
    }

    const user = await database.createUser(userData);
    logger.info('Usuário criado com sucesso', { userId: user.id, email: encodeURIComponent(user.email) });
    return user;
  }

  /**
   * Atualiza dados do usuário
   * Valida email duplicado se estiver sendo alterado
   * @param {string} id - ID do usuário
   * @param {Object} userData - Novos dados
   * @returns {Object|null} Usuário atualizado ou null
   */
  async updateUser(id, userData) {
    const database = databaseFactory.getDatabase();
    if (userData.email) {
      const existingUser = await database.findUserByEmail(userData.email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        logger.warn('Tentativa de atualizar com email duplicado', { userId: id, email: encodeURIComponent(userData.email) });
        throw new Error('Email já cadastrado');
      }
    }

    const user = await database.updateUser(id, userData);
    if (user) {
      logger.info('Usuário atualizado com sucesso', { userId: id });
    }
    return user;
  }

  /**
   * Remove usuário
   * @param {string} id - ID do usuário
   * @returns {boolean} True se removido com sucesso
   */
  async deleteUser(id) {
    const database = databaseFactory.getDatabase();
    
    // Verificar se é super admin
    const user = await database.findUserById(id);
    if (user && user.type === 'super_admin') {
      logger.warn('Tentativa de excluir super admin', { userId: id });
      throw new Error('Super administradores não podem ser excluídos');
    }
    
    const deleted = await database.deleteUser(id);
    if (deleted) {
      logger.info('Usuário removido com sucesso', { userId: id });
    }
    return deleted;
  }
}

module.exports = new UserService();