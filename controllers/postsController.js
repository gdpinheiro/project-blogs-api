const express = require('express');
const rescue = require('express-rescue');
const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');
const { BlogPost, Category, PostCategory, User } = require('../models');
const validateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': '400|"title" is required',
    'string.base': '400|"title" must be a string',
  }),
  content: Joi.string().required().messages({
    'any.required': '400|"content" is required',
    'string.base': '400|"content" must be a string',
  }),
  categoryIds: Joi.array().required().messages({
    'any.required': '400|"categoryIds" is required',
    'string.base': '400|"categoryIds" must be a string',
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

const validateCategoryId = async (req, res, next) => {
  try {
    const { categoryIds } = req.body;

    categoryIds.forEach(async (categoryId) => {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: '"categoryIds" not found',
        });
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

const getUserData = async (userId) => {
  const user = await User.findByPk(userId);
  return user;
};

const getPostCategories = async (postId) => {
  const postCategories = await PostCategory.findAll({
    where: {
      postId,
    },
  });

  const category = await Category.findAll({
    where: {
      id: postCategories.map(({ categoryId }) => categoryId),
    },
  });

  return category;
};

const getPostHandler = async (blogPosts) => {
  const bpMap = await Promise.all(
    blogPosts.map(async (blogPost) => {
      const user = await getUserData(blogPost.userId);
      const categories = await getPostCategories(blogPost.id);
      console.log(categories);
      return { ...blogPost.dataValues, user, categories };
    }),
  );
  return bpMap;
};

router.get(
  '/',
  validateJWT,
  rescue(async (_req, res, next) => {
    try {
      const blogPosts = await BlogPost.findAll();

      const result = await getPostHandler(blogPosts);

      res.status(StatusCodes.OK).json(result);
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

      const blogPost = await BlogPost.findByPk(id);

      if (!blogPost) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'Post does not exist',
        });
      }

      const [result] = await getPostHandler([blogPost]);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }),
);

router.post(
  '/',
  validateJWT,
  validateBody,
  validateCategoryId,
  rescue(async (req, res, next) => {
    try {
      const {
        body: { title, content, categoryIds },
        userId,
      } = req;

      const newPost = await BlogPost.create({
        title,
        content,
        userId,
        categoryIds,
      });

      res.status(StatusCodes.CREATED).json(newPost);
    } catch (error) {
      next(error);
    }
  }),
);

module.exports = router;
