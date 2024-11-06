const { pool, testConnection } = require('../db-settings'); // Adjust the path as per your project structure
const isValidInput = require('./validateController');
const currentTimeFormatted = require('./validateController');

const getMachineRelated = async (params) => {
    return new Promise(async (resolve) => {
        const userId = params.userId;

        if (!isValidInput(userId)) {
            resolve({ message: 'Invalid Parameter' });
        }
    
        try {
            const sql = 'SELECT * FROM relation_machine_users WHERE user_id = ?';
            const [rows] = await pool.query(sql, [userId]);
      
          if (rows.length === 0) {
            resolve({ error: 'Not Found', message: 'Data not found' });
          } else {
            resolve({ message: 'OK', data: rows });
          }
        } catch (error) {
          console.error(error);
          resolve({ error: 'Internal Server Error', message: error.message });
        }
    });
};

module.exports = { 
    getMachineRelated
 }