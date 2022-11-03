module.exports = (sequelize) => {
  const PostCategory = sequelize.define('PostCategory', {}, 
  { timestamps: false, tableName: 'PostsCategories' });
  PostCategory.removeAttribute('id');
  PostCategory.associate = (models) => { 
    models.BlogPost.belongsToMany(models.Category, 
      { as: 'postId', through: PostCategory, foreignKey: 'categoryId', otherKey: 'postId' });
    models.Category.belongsToMany(models.BlogPost, 
      { as: 'categoryId', through: PostCategory, foreignKey: 'postId', otherKey: 'categoryId' });
  };
  return PostCategory;
};
