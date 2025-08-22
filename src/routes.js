const { Router } = require("express");
const authController = require('./controllers/AuthController');
const userController = require('./controllers/UserController');
const authMiddleware = require('./middleware/auth');
const roleAuth = require('./middleware/roleAuth');
const upload = require('./middleware/upload');

const routes = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verifica se a API está rodando
 *     responses:
 *       200:
 *         description: API funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 */
routes.get('/', (req, res) => {
  res.json({ message: 'SPS Test API está rodando!', version: '1.0.0' });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: API saudável
 */
routes.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
routes.post('/auth/login', authController.login);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca usuário por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
routes.get('/users/:id', roleAuth.authenticated, userController.getUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autorizado
 */
routes.get('/users', roleAuth.authenticated, userController.getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria novo usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - type
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               type:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Dados inválidos
 */
routes.post('/users', roleAuth.adminOnly, upload.single('avatar'), userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               type:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
routes.put('/users/:id', roleAuth.adminOrOwner, upload.single('avatar'), userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuário removido
 *       404:
 *         description: Usuário não encontrado
 */
routes.delete('/users/:id', roleAuth.adminOnly, userController.deleteUser);

module.exports = routes;
