const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(
  config.production.database,
  config.production.username,
  config.production.password,
  {
    host: config.production.host,
    dialect: config.production.dialect
  }
);

const db = {
  sequelize,
  Sequelize,
  // Add your models here
};

// Example model
db.UserManagement = require('./usermanagement')(sequelize, Sequelize);

module.exports = db;
