const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
require('dotenv/config');

const secret = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token not found' });
    }
    const { data: { email, password } } = jwt.verify(token, secret);
    const user = await User.findOne({ where: { email, password } });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Expired or invalid token' });
    }
    req.token = token;
    req.userId = user.id;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Expired or invalid token' });
  }
};
