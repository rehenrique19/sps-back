const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configuração de armazenamento seguro para uploads
 * Previne path traversal e garante nomes de arquivo seguros
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Caminho fixo e seguro para uploads com proteção path traversal
    const baseUploadPath = path.resolve('uploads/avatars/');
    
    // Criar diretório se não existir
    if (!fs.existsSync(baseUploadPath)) {
      fs.mkdirSync(baseUploadPath, { recursive: true });
    }
    
    cb(null, baseUploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único e seguro com proteção path traversal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitizar extensão do arquivo original e remover caracteres perigosos
    const sanitizedExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (!allowedExts.includes(sanitizedExt)) {
      return cb(new Error('Extensão de arquivo não permitida'), false);
    }
    
    const filename = 'avatar-' + uniqueSuffix + sanitizedExt;
    const baseUploadPath = path.resolve('uploads/avatars/');
    const fullPath = path.resolve(baseUploadPath, filename);
    
    // Verificar se o caminho final está dentro do diretório permitido
    if (!fullPath.startsWith(baseUploadPath)) {
      return cb(new Error('Caminho de arquivo inválido'), false);
    }
    
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = upload;