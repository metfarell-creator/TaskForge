const store = require('../data/store');

const userModel = {
  createUser(email, passwordHash) {
    return store.createUser({ email, passwordHash });
  },

  findByEmail(email) {
    return store.findUserByEmail(email);
  },

  findById(id) {
    return store.findUserById(id);
  }
};

module.exports = userModel;
