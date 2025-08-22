const errorHandler = require('../../src/middleware/errorHandler');

jest.mock('../../src/config/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
      url: '/test',
      method: 'GET'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('deve tratar erro de validação', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
  });

  it('deve tratar erro JWT', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });

  it('deve tratar erro de arquivo muito grande', () => {
    const error = new Error('File too large');
    error.code = 'LIMIT_FILE_SIZE';
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Arquivo muito grande. Tamanho máximo: 2MB' 
    });
  });

  it('deve tratar erro de muitos arquivos', () => {
    const error = new Error('Too many files');
    error.code = 'LIMIT_FILE_COUNT';
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Muitos arquivos enviados' 
    });
  });

  it('deve tratar erro de campo inesperado', () => {
    const error = new Error('Unexpected field');
    error.code = 'LIMIT_UNEXPECTED_FILE';
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Campo de arquivo inesperado' 
    });
  });

  it('deve tratar erro de tipo de arquivo', () => {
    const error = new Error('Apenas imagens são permitidas');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Apenas arquivos de imagem são permitidos' 
    });
  });

  it('deve tratar erro genérico', () => {
    const error = new Error('Generic error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Erro interno do servidor' 
    });
  });
});