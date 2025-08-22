const userService = require('../services/UserService');

class UserController {
  async getUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, type, password } = req.body;
      const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

      if (!name || !email || !type || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const user = await userService.createUser({ name, email, type, password, avatar });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (req.file) {
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      }
      
      // Usuários comuns não podem alterar o próprio tipo
      if (req.user.type !== 'admin' && updateData.type) {
        delete updateData.type;
      }
      
      const user = await userService.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();