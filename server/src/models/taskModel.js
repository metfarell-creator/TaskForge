const store = require('../data/store');

const taskModel = {
  createTask(data) {
    return store.createTask(data);
  },

  getTasksForUser(userId) {
    return store.getTasksForUser(userId);
  },

  updateTask(taskId, userId, updates) {
    return store.updateTask(taskId, userId, updates);
  },

  deleteTask(taskId, userId) {
    return store.deleteTask(taskId, userId);
  }
};

module.exports = taskModel;
