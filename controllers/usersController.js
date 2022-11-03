const express = require('express');
const rescue = require('express-rescue');
const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');
const { User } = require('../models');
const validateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

const schema = Joi.object({
  displayName: Joi.string().min(8).required().messages({
    'any.required': '400|"displayName" is required',
    'string.base': '400|"displayName" must be a string',
    'string.min': '400|"displayName" length must be at least 8 characters long',
  }),
  email: Joi.string().email().required().messages({
    'any.required': '400|"email" is required',
    'string.email': '400|"email" must be a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': '400|"password" is required',
    'string.base': '400|"password" must be a string',
    'string.min': '400|"password" length must be 6 characters long',
  }),
  image: Joi.string().uri().messages({
    'string.uri': '400|"image" must be a valid uri',
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

const validateExistenceByDisplayName = async (req, res, next) => {
  try {
    const { displayName } = req.body;
    const user = await User.findOne({ where: { displayName } });
    if (user) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'User already registered',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get(
  '/',
  validateJWT,
  rescue(async (_req, res, next) => {
    try {
      const users = await User.findAll();

      res.status(StatusCodes.OK).json(users);
    } catch (error) {
      next(error);
    }
  }),
);

router.get(
  '/:id',
  validateJWT,
  rescue(async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'User does not exist',
        });
      }

      res.status(StatusCodes.OK).json(user);
    } catch (error) {
      next(error);
    }
  }),
);

router.post(
  '/',
  validateBody,
  validateExistenceByDisplayName,
  rescue(async (req, res, next) => {
    try {
      const {
        body: { displayName, email, password, image },
        token,
      } = req;

      await User.create({
        displayName,
        email,
        password,
        image,
      });

      res.status(StatusCodes.CREATED).json({ token });
    } catch (error) {
      next(error);
    }
  }),
);

module.exports = router;
