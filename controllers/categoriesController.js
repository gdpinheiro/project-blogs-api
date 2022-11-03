const express = require('express');
const rescue = require('express-rescue');
const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');
const { Category } = require('../models');
const validateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '400|"name" is required',
    'string.base': '400|"name" must be a string',
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

const validateExistenceByName = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findOne({ where: { name } });
    if (category) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'Category already registered',
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
      const category = await Category.findAll();

      res.status(StatusCodes.OK).json(category);
    } catch (error) {
      next(error);
    }
  }),
);

router.post(
  '/',
  validateBody,
  validateExistenceByName,
  validateJWT,
  rescue(async (req, res, next) => {
    try {
      const {
        body: { name },
      } = req;

      const newCategory = await Category.create({
        name,
      });

      res.status(StatusCodes.CREATED).json(newCategory);
    } catch (error) {
      next(error);
    }
  }),
);

module.exports = router;
