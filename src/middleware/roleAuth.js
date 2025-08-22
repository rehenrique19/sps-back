const logger = require('../config/logger');

/**
 * Middleware para verificar permissões baseadas em roles
 */
const roleAuth = {
  // Apenas admins e super admins podem acessar
  adminOnly: (req, res, next) => {
    if (req.user.type !== 'admin' && req.user.type !== 'super_admin') {
      logger.warn('Acesso negado - apenas admin', { userId: req.user.id, type: req.user.type });
      return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
    }
    next();
  },

  // Todos os usuários autenticados podem visualizar
  authenticated: (req, res, next) => {
    // Se chegou até aqui, já passou pela autenticação JWT
    next();
  },

  // Admins e super admins podem tudo, usuários apenas seus próprios dados
  adminOrOwner: (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;

    // Admin ou super admin pode acessar qualquer usuário
    if (userType === 'admin' || userType === 'super_admin') {
      return next();
    }

    // Usuário comum só pode acessar seus próprios dados
    if (parseInt(id) !== userId) {
      logger.warn('Acesso negado - usuário tentando acessar dados de outro', { 
        userId: encodeURIComponent(String(userId)), 
        targetId: encodeURIComponent(String(id)) 
      });
      return res.status(403).json({ error: 'Acesso negado - você só pode acessar seus próprios dados' });
    }

    next();
  }
};

module.exports = roleAuth;