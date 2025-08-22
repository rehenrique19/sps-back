const authService = require('../services/AuthService');
const logger = require('../config/logger');

/**
 * MIDDLEWARE DE PROTEÇÃO GLOBAL
 * 
 * Este middleware implementa uma camada de segurança que protege automaticamente
 * todas as rotas da API, exceto as rotas públicas explicitamente definidas.
 * 
 * Funcionalidades:
 * - Verificação automática de JWT em todas as rotas protegidas
 * - Lista de rotas públicas configurável (login, health check, docs)
 * - Logging de tentativas de acesso não autorizadas
 * - Sanitização de URLs nos logs para prevenir log injection
 * - Decodificação e validação de tokens JWT
 * - Injeção do usuário autenticado no objeto request
 * 
 * Segurança:
 * - Previne acesso não autorizado a recursos protegidos
 * - Log estruturado para monitoramento de segurança
 * - Tratamento seguro de erros sem vazar informações sensíveis
 */
const globalAuthMiddleware = (req, res, next) => {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/health',
    '/auth/login',
    '/api-docs'
  ];

  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/api-docs') {
      return req.path.startsWith('/api-docs');
    }
    return req.path === route;
  });

  if (isPublicRoute) {
    return next();
  }

  // Para todas as outras rotas, exige autenticação
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    logger.warn('Tentativa de acesso sem token', { 
      ip: req.ip, 
      url: encodeURIComponent(req.url),
      method: req.method 
    });
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = authService.verifyToken(token);
    if (!decoded) {
      logger.warn('Token inválido usado', { 
        ip: req.ip, 
        url: encodeURIComponent(req.url),
        method: req.method 
      });
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erro ao verificar token', { error: error.message });
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = globalAuthMiddleware;