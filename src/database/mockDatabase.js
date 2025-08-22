const User = require('../models/User');

class MockDatabase {
  constructor() {
    this.users = [];
    this.nextId = 1;
    this.initializeAdmin();
  }

  initializeAdmin() {
    const admin = new User(
      this.nextId++,
      'Super Admin',
      'admin@spsgroup.com.br',
      'super_admin',
      '1234'
    );
    this.users.push(admin);
  }

  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findUserById(id) {
    return this.users.find(user => user.id === parseInt(id));
  }

  getAllUsers() {
    return this.users;
  }

  createUser(userData) {
    const user = new User(
      this.nextId++,
      userData.name,
      userData.email,
      userData.type,
      userData.password,
      userData.avatar
    );
    this.users.push(user);
    return user;
  }

  updateUser(id, userData) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  deleteUser(id) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }
}

module.exports = new MockDatabase();