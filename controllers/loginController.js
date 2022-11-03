const express = require('express');
const rescue = require('express-rescue');
const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv/config');

const router = express.Router();

const schema = Joi.object({
  email: Joi.string().email().empty().required()
  .messages({
    'any.required': '400|"email" is required',
    'string.email': '400|"email" must be a valid email',
    'string.empty': '400|"email" is not allowed to be empty',
  }),
  password: Joi.string().empty().required().messages({
    'any.required': '400|"password" is required',
    'string.base': '400|"password" must be a string',
    'string.min': '400|"password" length must be 6 characters long',
    'string.empty': '400|"password" is not allowed to be empty',
  }),
});

const validateBody = (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      const [code, message] = error.details[0].message.split('|');
      return res.status(code).json({ message });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const validateExistenceByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findAll({ where: { email } });
    if (!user.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid fields',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const createJWT = (email, password) => {
  const secret = process.env.JWT_SECRET;
  const jwtConfig = {
    expiresIn: '7d',
    algorithm: 'HS256',
  };

  const token = jwt.sign({ data: { email, password } }, secret, jwtConfig);

  return { token };
};

router.post(
  '/',
  validateBody,
  validateExistenceByEmail,
  rescue(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = createJWT(email, password);

      res.status(StatusCodes.OK).json(token);
    } catch (error) {
      next(error);
    }
  }),
);

module.exports = router;
