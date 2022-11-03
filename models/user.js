const { DataTypes } = require('sequelize');

const Attributes = {
  displayName: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  image: DataTypes.STRING,
};

module.exports = (sequelize) => {
  const User = sequelize.define('User', Attributes, {
    timestamps: false,
  });

  User.associate = (models) => {
    User.hasMany(models.BlogPost, {
      foreignKey: 'userId',
      as: 'blogposts',
    });
  };

  return User;
};
