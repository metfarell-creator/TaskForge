const taskModel = require('../models/taskModel');

function validateTaskPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Task payload is required');
    error.status = 400;
    throw error;
  }

  const { title } = payload;
  if (!title || typeof title !== 'string' || !title.trim()) {
    const error = new Error('Task title is required');
    error.status = 400;
    throw error;
  }
}

exports.createTask = (req, res, next) => {
  try {
    validateTaskPayload(req.body);

    const task = taskModel.createTask({
      title: req.body.title.trim(),
      description: req.body.description || '',
      completed: Boolean(req.body.completed),
      userId: req.user.id
    });

    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

exports.getTasks = (req, res, next) => {
  try {
    const tasks = taskModel.getTasksForUser(req.user.id);
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

exports.updateTask = (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      const err = new Error('Invalid task identifier');
      err.status = 400;
      throw err;
    }

    const updates = {};
    if ('title' in req.body) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
        const err = new Error('Task title is required');
        err.status = 400;
        throw err;
      }
      updates.title = req.body.title.trim();
    }

    if ('description' in req.body) {
      updates.description = typeof req.body.description === 'string' ? req.body.description : '';
    }

    if ('completed' in req.body) {
      updates.completed = Boolean(req.body.completed);
    }

    const task = taskModel.updateTask(taskId, req.user.id, updates);
    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

exports.deleteTask = (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      const err = new Error('Invalid task identifier');
      err.status = 400;
      throw err;
    }

    taskModel.deleteTask(taskId, req.user.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
