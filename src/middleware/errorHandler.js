const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Erros do Multer (upload de arquivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 2MB' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Muitos arquivos enviados' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de arquivo inesperado' });
  }
  if (err.message === 'Apenas imagens são permitidas') {
    return res.status(400).json({ error: 'Apenas arquivos de imagem são permitidos' });
  }

  // Erro genérico
  res.status(500).json({ error: 'Erro interno do servidor' });
};

module.exports = errorHandler;