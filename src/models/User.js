class User {
  constructor(id, name, email, type, password, avatar = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.type = type;
    this.password = password;
    this.avatar = avatar;
  }
}

module.exports = User;