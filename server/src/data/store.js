class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [];
    this.tasks = [];
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
  }

  createUser({ email, passwordHash }) {
    if (this.users.some((user) => user.email === email)) {
      const error = new Error('User with this email already exists');
      error.status = 409;
      throw error;
    }

    const user = {
      id: this.userIdCounter++,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    this.users.push(user);
    return { ...user };
  }

  findUserByEmail(email) {
    return this.users.find((user) => user.email === email) || null;
  }

  findUserById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  createTask({ title, description = '', completed = false, userId }) {
    const user = this.findUserById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const task = {
      id: this.taskIdCounter++,
      title,
      description,
      completed: Boolean(completed),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(task);
    return { ...task };
  }

  getTasksForUser(userId) {
    return this.tasks.filter((task) => task.userId === userId).map((task) => ({ ...task }));
  }

  findTaskById(taskId) {
    return this.tasks.find((task) => task.id === taskId) || null;
  }

  updateTask(taskId, userId, updates) {
    const task = this.findTaskById(taskId);
    if (!task || task.userId !== userId) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    const allowed = ['title', 'description', 'completed'];
    for (const key of allowed) {
      if (key in updates) {
        if (key === 'completed') {
          task[key] = Boolean(updates[key]);
        } else if (updates[key] !== undefined) {
          task[key] = updates[key];
        }
      }
    }

    task.updatedAt = new Date().toISOString();
    return { ...task };
  }

  deleteTask(taskId, userId) {
    const index = this.tasks.findIndex((task) => task.id === taskId && task.userId === userId);
    if (index === -1) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    const [removed] = this.tasks.splice(index, 1);
    return { ...removed };
  }
}

module.exports = new DataStore();
