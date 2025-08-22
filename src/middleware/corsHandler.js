const logger = require('../config/logger');

/**
 * Middleware personalizado para tratamento de erros CORS
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Não permitido pelo CORS') {
    logger.warn('Acesso CORS bloqueado', { 
      origin: encodeURIComponent(req.headers.origin || 'unknown'),
      ip: req.ip,
      userAgent: encodeURIComponent(req.headers['user-agent'] || 'unknown')
    });
    
    return res.status(403).json({ 
      error: 'Acesso negado - Origin não autorizado',
      message: 'Esta API só aceita requisições do frontend autorizado'
    });
  }
  next(err);
};

module.exports = corsErrorHandler;