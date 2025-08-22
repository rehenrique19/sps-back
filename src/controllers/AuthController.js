const authService = require('../services/AuthService');

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await authService.login(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json(result);
  }
}

module.exports = new AuthController();