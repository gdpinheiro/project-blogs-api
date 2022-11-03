const { DataTypes } = require('sequelize');

const Attributes = {
  title: DataTypes.STRING,
  content: DataTypes.STRING,
  userId: DataTypes.INTEGER,
  published: DataTypes.DATE,
  updated: DataTypes.DATE,
};

module.exports = (sequelize) => {
  const BlogPost = sequelize.define('BlogPost', Attributes, {
    timestamps: true,
    createdAt: 'published',
    updatedAt: 'updated',
  });

  BlogPost.associate = (models) => {
    BlogPost.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'users',
    });
    // BlogPost.belongsToMany(models.Category, {
    //   through: models.PostCategory,
    //   as: 'postId',
    // });
  };

  return BlogPost;
};
