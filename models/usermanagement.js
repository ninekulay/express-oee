'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserManagement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserManagement.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    location: DataTypes.STRING,
    role: DataTypes.STRING,
    login_type: DataTypes.STRING,
    last_login: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserManagement',
    tableName: 'user_managements',
    timestamps: true,
  });
  return UserManagement;
};