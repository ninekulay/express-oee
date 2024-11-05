// db.js

const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config'); // Ensure this path is correct

const { DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } = process.env;

// Initialize Sequelize with production configuration
const sequelize = new Sequelize(config.production.database, config.production.username, config.production.password, {
  host: config.production.host,
  dialect: 'mysql',
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0,  // Minimum number of connections in the pool
    acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
    idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being released
  }
});

// Create a pool using mysql2 with promise support
const pool = mysql.createPool({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected!');
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}

// // Define and sync your Sequelize models
// const DefectLogModel = require('../models/defectLogs'); // Adjust the path as per your project structure
// const DefectLog = DefectLogModel(sequelize, DataTypes);

// Export sequelize instance, pool, and models
module.exports = {
  sequelize,
  pool,
  // DefectLog,
  testConnection // Optional: Export testConnection for checking the database connection
};