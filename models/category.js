const { DataTypes } = require('sequelize');

const Attributes = {
  name: DataTypes.STRING,
};

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', Attributes, {
    timestamps: false,
  });

  // Category.associate = (models) => {
  //   Category.belongsToMany(models.BlogPost, {
  //     through: models.PostCategory,
  //     as: 'categoryId',
  //   });
  // };

  return Category;
};
