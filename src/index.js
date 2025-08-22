require('dotenv').config();
const express = require("express");
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require("./routes");
const cors = require("cors");
const errorHandler = require('./middleware/errorHandler');
const corsErrorHandler = require('./middleware/corsHandler');
const globalAuthMiddleware = require('./middleware/globalAuth');
const securityMiddleware = require('./middleware/security');
const logger = require('./config/logger');
const databaseFactory = require('./database');

const app = express();

// Middlewares
// Configuração CORS restritiva - apenas frontend autorizado
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.CORS_ORIGIN || 'http://localhost:3000'
    ];
    
    // Permitir requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('Tentativa de acesso CORS negada', { origin: encodeURIComponent(origin || 'unknown') });
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-requested-with'],
  optionsSuccessStatus: 200
};

// Servir arquivos estáticos ANTES do CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de segurança
app.use(securityMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de proteção global
app.use(globalAuthMiddleware);

// Rotas
app.use(routes);

// Handler de erros CORS
app.use(corsErrorHandler);

// Handler global de erros
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    await databaseFactory.initialize();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();
