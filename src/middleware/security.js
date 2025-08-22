const logger = require('../config/logger');

// Rate limiting simples em memória
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 100; // máximo de requests por IP

/**
 * Middleware de segurança básico
 * Implementa rate limiting e logging de segurança
 */
const securityMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Rate limiting
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const clientData = requestCounts.get(clientIP);
    
    if (now > clientData.resetTime) {
      // Reset contador
      requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      clientData.count++;
      
      if (clientData.count > MAX_REQUESTS) {
        logger.warn('Rate limit excedido', { 
          ip: clientIP, 
          count: clientData.count,
          url: encodeURIComponent(req.url)
        });
        return res.status(429).json({ 
          error: 'Muitas requisições. Tente novamente em 15 minutos.' 
        });
      }
    }
  }

  // Log de requisições sensíveis
  if (req.method !== 'GET' || req.path.includes('auth')) {
    logger.info('Requisição de segurança', {
      ip: clientIP,
      method: req.method,
      url: encodeURIComponent(req.url),
      userAgent: req.get('User-Agent')
    });
  }

  next();
};

module.exports = securityMiddleware;