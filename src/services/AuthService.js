const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const databaseFactory = require('../database');
const logger = require('../config/logger');

class AuthService {
  /**
   * Autentica usuário e gera token JWT
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object|null} Token e dados do usuário ou null se inválido
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }
    
    const database = databaseFactory.getDatabase();
    const user = await database.findUserByEmail(email);
    
    if (!user) {
      logger.warn('Tentativa de login com email inexistente', { email: encodeURIComponent(email) });
      return null;
    }

    // Verifica senha (suporta tanto hash quanto texto plano para compatibilidade)
    let isValidPassword = false;
    if (user.password.startsWith('$2')) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Usar comparação time-safe para prevenir timing attacks
      const userPasswordBuffer = Buffer.from(user.password, 'utf8');
      const inputPasswordBuffer = Buffer.from(password, 'utf8');
      isValidPassword = userPasswordBuffer.length === inputPasswordBuffer.length &&
        crypto.timingSafeEqual(userPasswordBuffer, inputPasswordBuffer);
    }

    if (!isValidPassword) {
      logger.warn('Tentativa de login com senha inválida', { email: encodeURIComponent(email) });
      return null;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info('Login realizado com sucesso', { userId: user.id, email: encodeURIComponent(user.email) });
    return { token, user: { id: user.id, name: user.name, email: user.email, type: user.type, avatar: user.avatar } };
  }

  /**
   * Verifica validade do token JWT
   * @param {string} token - Token JWT
   * @returns {Object|null} Dados decodificados ou null se inválido
   */
  verifyToken(token) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não configurado');
      }
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.warn('Token inválido verificado', { error: error.message });
      return null;
    }
  }
}

module.exports = new AuthService();