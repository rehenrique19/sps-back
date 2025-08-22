# SPS Test Backend API

API RESTful robusta para gerenciamento de usuários com arquitetura de segurança em camadas e proteção JWT completa.

## 🚀 Inicialização Rápida

### Pré-requisitos
- **Node.js 22.18.0** (recomendado)
- npm ou yarn
- Porta 3001 disponível

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start
# ou com nodemon
npm run dev

# Executar testes
npm test
npm run test:coverage
npm run test:watch
```

**API disponível em**: `http://localhost:3001`  
**Documentação Swagger**: `http://localhost:3001/api-docs`

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios
```
sps-back/
├── src/
│   ├── config/              # Configurações (Logger, Swagger)
│   │   ├── logger.js        # Sistema de logs estruturados
│   │   └── swagger.js       # Documentação OpenAPI
│   ├── controllers/         # Controladores da API
│   │   ├── AuthController.js    # Autenticação e JWT
│   │   └── UserController.js    # CRUD de usuários
│   ├── database/            # Camada de persistência
│   │   ├── index.js         # Factory de banco de dados
│   │   ├── mockDatabase.js  # Banco em memória
│   │   └── redisDatabase.js # Implementação Redis
│   ├── middleware/          # Middlewares de segurança
│   │   ├── globalAuth.js    # Proteção JWT global
│   │   ├── security.js      # Rate limiting e logs
│   │   ├── corsHandler.js   # Tratamento de erros CORS
│   │   ├── errorHandler.js  # Handler global de erros
│   │   ├── upload.js        # Upload seguro de arquivos
│   │   ├── auth.js          # Middleware JWT específico
│   │   └── roleAuth.js      # Autorização por roles
│   ├── models/              # Modelos de dados
│   │   └── User.js          # Modelo de usuário
│   ├── services/            # Lógica de negócio
│   │   ├── AuthService.js   # Serviços de autenticação
│   │   └── UserService.js   # Serviços de usuário
│   ├── index.js             # Ponto de entrada da aplicação
│   └── routes.js            # Definição de rotas
├── tests/                   # Suíte de testes
│   ├── unit/                # Testes unitários
│   ├── integration/         # Testes de integração
│   └── e2e/                 # Testes end-to-end
├── uploads/                 # Arquivos de upload
│   └── avatars/             # Avatares de usuários
└── package.json
```

### Stack de Middleware (Ordem de Execução)
```
Request → CORS → Security → GlobalAuth → Routes → ErrorHandler → Response
```

## 🔐 Arquitetura de Segurança

### 1. Proteção JWT Global
```javascript
// Middleware que protege TODAS as rotas exceto públicas
const publicRoutes = ['/', '/health', '/auth/login', '/api-docs'];
```

**Características:**
- Verificação automática de JWT em todas as rotas protegidas
- Token obrigatório no header: `Authorization: Bearer <token>`
- Expiração configurável (padrão: 24h)
- Logs de tentativas não autorizadas
- Decodificação e injeção do usuário no request

### 2. Rate Limiting Inteligente
```javascript
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 100; // por IP
```

**Proteções:**
- Limite de 100 requests por IP a cada 15 minutos
- Contador em memória por IP
- Reset automático da janela de tempo
- Logs de IPs que excedem o limite
- Bloqueio temporário com mensagem clara

### 3. CORS Restritivo
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

**Características:**
- Apenas origins autorizadas
- Suporte a credenciais
- Métodos HTTP específicos
- Headers controlados
- Logs de tentativas CORS negadas

### 4. Upload Seguro
- **Tipos permitidos**: Apenas imagens (image/*)
- **Tamanho máximo**: 2MB
- **Validação**: Tipo MIME e extensão
- **Armazenamento**: Diretório isolado com nomes únicos
- **Path traversal protection**: Validação de caminhos

### 5. Sistema de Logs Estruturados
```javascript
logger.info('Evento de segurança', {
  ip: req.ip,
  method: req.method,
  url: encodeURIComponent(req.url), // Sanitização contra log injection
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

## 🔑 Autenticação e Autorização

### Usuários Pré-cadastrados
```javascript
// Super Admin
{
  email: "admin@spsgroup.com.br",
  password: "1234",
  type: "super_admin"
}

// Usuário Regular
{
  email: "user@spsgroup.com.br", 
  password: "1234",
  type: "user"
}
```

### Níveis de Acesso
1. **super_admin**: Acesso total, pode criar outros super admins
2. **admin**: Gerencia usuários, não pode criar super admins
3. **user**: Acesso limitado, pode editar apenas próprio perfil

### Fluxo de Autenticação
1. **Login**: `POST /auth/login` com email/password
2. **Token JWT**: Retornado no response com dados do usuário
3. **Uso**: Header `Authorization: Bearer <token>` em todas as requests
4. **Renovação**: Re-login quando token expira

## 📋 Endpoints da API

### 🌍 Rotas Públicas (Sem Autenticação)
```http
GET    /                    # Status básico da API
GET    /health              # Health check detalhado
POST   /auth/login          # Autenticação e geração de JWT
GET    /api-docs            # Documentação Swagger UI
GET    /api-docs/*          # Assets do Swagger
```

### 🔐 Rotas Protegidas (Requer JWT)
```http
GET    /users               # Listar todos os usuários
POST   /users               # Criar novo usuário
GET    /users/:id           # Obter usuário específico
PUT    /users/:id           # Atualizar usuário
DELETE /users/:id           # Remover usuário
POST   /users/:id/avatar    # Upload de avatar
```

### 📤 Upload de Arquivos
```http
POST   /users               # Com FormData (multipart/form-data)
PUT    /users/:id           # Com FormData (multipart/form-data)

# Campos do FormData:
# - name: string
# - email: string  
# - type: string
# - password: string (opcional em PUT)
# - avatar: File (opcional)
```

## 🧪 Testes e Qualidade

### Suíte de Testes Completa

#### Comandos de Teste
```bash
# Executar todos os testes (80 testes em 14 suites)
npm test

# Testes com relatório de cobertura detalhado
npm run test:coverage

# Testes em modo watch (re-executa ao salvar arquivos)
npm run test:watch
```

#### Estrutura dos Testes
```
tests/
├── unit/                    # Testes unitários (isolados)
│   ├── AuthService.test.js     # Serviços de autenticação
│   ├── UserService.test.js     # Serviços de usuário
│   ├── controllers.test.js     # Controladores
│   ├── middleware.test.js      # Middlewares
│   ├── database.test.js        # Banco de dados
│   └── upload.test.js          # Upload de arquivos
├── integration/             # Testes de integração
│   ├── auth.test.js            # Autenticação completa
│   ├── users.test.js           # CRUD de usuários
│   ├── cors.test.js            # Proteção CORS
│   └── redis.test.js           # Integração Redis
└── e2e/                     # Testes end-to-end
    └── userFlow.test.js        # Fluxo completo de usuário
```

#### Resultados dos Testes
✅ **Status**: Todos os testes passando  
✅ **Test Suites**: 14/14 passed  
✅ **Tests**: 80/80 passed  
⚠️ **Coverage**: 69.53% (abaixo da meta de 80%)

### Cobertura de Testes Atual
- **Statements**: 69.53% (meta: 80%)
- **Branches**: 72.26% (meta: 80%)
- **Functions**: 71.69% (meta: 80%)
- **Lines**: 69.78% (meta: 80%)
- **Test Suites**: 14 passed, 14 total
- **Tests**: 80 passed, 80 total

### Tipos de Teste
1. **Unit Tests**: Lógica de negócio isolada
2. **Integration Tests**: Endpoints e middlewares
3. **E2E Tests**: Fluxos completos da aplicação
4. **Security Tests**: Validação de proteções

## 📊 Monitoramento e Observabilidade

### Health Check Endpoint
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": "45.2 MB",
    "total": "128 MB"
  }
}
```

### Sistema de Logs
- **Níveis**: error, warn, info, debug
- **Formato**: JSON estruturado
- **Contexto**: IP, método, URL, user-agent, timestamp
- **Sanitização**: URLs encodadas para prevenir log injection
- **Rotação**: Configurável por tamanho/tempo

### Eventos Monitorados
- Tentativas de login (sucesso/falha)
- Acessos sem token
- Tokens inválidos/expirados
- Rate limiting ativado
- Uploads rejeitados
- Erros de validação
- Tentativas CORS negadas

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```bash
# Servidor
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_TYPE=memory  # ou redis
REDIS_URL=redis://localhost:6379

# Upload
MAX_FILE_SIZE=2097152  # 2MB em bytes
UPLOAD_DIR=uploads/avatars

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutos em ms
RATE_LIMIT_MAX=100        # requests por IP

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Configuração de Produção
```bash
# Variáveis críticas para produção
NODE_ENV=production
JWT_SECRET=<strong-random-secret-256-bits>
FRONTEND_URL=https://your-domain.com
DATABASE_TYPE=redis
REDIS_URL=redis://your-redis-server:6379
LOG_LEVEL=warn
```

## 🚀 Deploy e Produção

### Docker Support
```dockerfile
# Dockerfile incluído
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Build e execução
docker build -t sps-backend .
docker run -p 3001:3001 --env-file .env sps-backend
```

### Checklist de Produção
- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET forte e único
- [ ] HTTPS configurado
- [ ] Rate limiting ajustado
- [ ] Logs centralizados
- [ ] Monitoramento ativo
- [ ] Backup de dados
- [ ] Certificados SSL válidos

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm start          # Servidor de produção
npm run dev        # Desenvolvimento com nodemon
npm test           # Executar testes
npm run test:watch # Testes em modo watch
npm run lint       # Verificar código
npm run format     # Formatar código
```

### Padrões de Código
- **Clean Code**: Funções pequenas, nomes descritivos
- **SOLID**: Princípios de design aplicados
- **Error Handling**: Try/catch consistente
- **Async/Await**: Preferido sobre Promises
- **JSDoc**: Documentação inline

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Porta 3001 ocupada
```bash
# Verificar processo
lsof -i :3001
# ou alterar PORT no .env
PORT=3002
```

#### 2. Token inválido/expirado
```bash
# Fazer novo login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spsgroup.com.br","password":"1234"}'
```

#### 3. CORS Error
```bash
# Verificar FRONTEND_URL no .env
FRONTEND_URL=http://localhost:3000
```

#### 4. Upload falha
- Verificar tamanho máximo (2MB)
- Verificar tipo de arquivo (apenas imagens)
- Verificar permissões do diretório uploads/

### Logs de Debug
```bash
# Ativar logs detalhados
NODE_ENV=development LOG_LEVEL=debug npm start
```

## 📚 Documentação Adicional

- **Swagger UI**: `http://localhost:3001/api-docs`
- **Postman Collection**: `docs/postman-collection.json`
- **API Specification**: `docs/openapi.yaml`
- **Security Guide**: `../SECURITY.md`

## 🤝 Contribuição

1. Fork do repositório
2. Criar branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Executar testes (`npm test`)
4. Commit das mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
5. Push para branch (`git push origin feature/nova-funcionalidade`)
6. Abrir Pull Request

### Padrões de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

**Desenvolvido com ❤️ para o desafio SPS Group**  
**Última atualização**: Janeiro 2025