const authService = require('../services/AuthService');
const logger = require('../config/logger');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona dados do usuário na requisição
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    logger.warn('Tentativa de acesso sem token', { ip: req.ip, url: encodeURIComponent(req.url) });
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = authService.verifyToken(token);
    if (!decoded) {
      logger.warn('Token inválido usado', { ip: req.ip, url: encodeURIComponent(req.url) });
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erro ao verificar token', { error: error.message });
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;