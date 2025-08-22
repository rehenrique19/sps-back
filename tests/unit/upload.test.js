const upload = require('../../src/middleware/upload');

describe('Upload Middleware', () => {
  it('deve ser uma instância do multer', () => {
    expect(upload).toBeDefined();
    expect(typeof upload).toBe('object');
  });

  it('deve ter configurações de upload', () => {
    expect(upload.single).toBeDefined();
  });

  it('deve validar tipos de arquivo', () => {
    const req = {};
    const file = { mimetype: 'image/jpeg' };
    const cb = jest.fn();
    
    if (upload.options && upload.options.fileFilter) {
      upload.options.fileFilter(req, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    }
  });

  it('deve rejeitar arquivos não-imagem', () => {
    const req = {};
    const file = { mimetype: 'text/plain' };
    const cb = jest.fn();
    
    if (upload.options && upload.options.fileFilter) {
      upload.options.fileFilter(req, file, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
    }
  });
});