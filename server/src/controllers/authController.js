const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/userModel');

function validateCredentials(email, password) {
  if (!email || typeof email !== 'string') {
    const error = new Error('Email is required');
    error.status = 400;
    throw error;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.status = 400;
    throw error;
  }
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: config.tokenExpiry }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    validateCredentials(email, password);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = userModel.createUser(email.trim().toLowerCase(), passwordHash);
    const token = createToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    validateCredentials(email, password);

    const user = userModel.findByEmail(email.trim().toLowerCase());
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const token = createToken(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    return next(error);
  }
};
