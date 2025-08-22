const redis = require('redis');
const User = require('../models/User');
const logger = require('../config/logger');

class RedisDatabase {
  constructor() {
    this.client = null;
    this.nextId = 1;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({ url: process.env.REDIS_URL });
      await this.client.connect();
      this.isConnected = true;
      await this.initializeAdmin();
      logger.info('Redis conectado com sucesso');
    } catch (error) {
      logger.error('Erro ao conectar Redis:', error);
      throw error;
    }
  }

  async initializeAdmin() {
    const adminExists = await this.client.hExists('users', '1');
    if (!adminExists) {
      const admin = new User(1, 'admin', 'admin@spsgroup.com.br', 'admin', '1234');
      await this.client.hSet('users', '1', JSON.stringify(admin));
      await this.client.set('nextId', '2');
    }
  }

  async findUserByEmail(email) {
    try {
      const users = await this.client.hGetAll('users');
      for (const userData of Object.values(users)) {
        try {
          const user = JSON.parse(userData);
          if (user.email === email) return user;
        } catch (parseError) {
          logger.warn('Erro ao parsear dados do usuário no Redis', { error: encodeURIComponent(parseError.message) });
          continue;
        }
      }
      return null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por email no Redis', { error: encodeURIComponent(error.message) });
      throw error;
    }
  }

  async findUserById(id) {
    try {
      const userData = await this.client.hGet('users', id.toString());
      if (!userData) return null;
      
      try {
        return JSON.parse(userData);
      } catch (parseError) {
        logger.warn('Erro ao parsear dados do usuário no Redis', { userId: encodeURIComponent(String(id)), error: encodeURIComponent(parseError.message) });
        return null;
      }
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID no Redis', { userId: encodeURIComponent(String(id)), error: encodeURIComponent(error.message) });
      throw error;
    }
  }

  async getAllUsers() {
    const users = await this.client.hGetAll('users');
    return Object.values(users).map(userData => JSON.parse(userData));
  }

  async createUser(userData) {
    try {
      // Validar email único
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      const nextId = await this.client.get('nextId') || '1';
      const user = new User(parseInt(nextId), userData.name, userData.email, userData.type, userData.password);
      
      await this.client.hSet('users', nextId, JSON.stringify(user));
      await this.client.set('nextId', (parseInt(nextId) + 1).toString());
      
      return user;
    } catch (error) {
      logger.error('Erro ao criar usuário no Redis', { error: encodeURIComponent(error.message) });
      throw error;
    }
  }

  async updateUser(id, userData) {
    const existingUser = await this.findUserById(id);
    if (!existingUser) return null;
    
    const updatedUser = { ...existingUser, ...userData };
    await this.client.hSet('users', id.toString(), JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  async deleteUser(id) {
    try {
      const deleted = await this.client.hDel('users', id.toString());
      return deleted > 0;
    } catch (error) {
      logger.error('Erro ao deletar usuário no Redis', { userId: encodeURIComponent(String(id)), error: encodeURIComponent(error.message) });
      throw error;
    }
  }
}

module.exports = new RedisDatabase();