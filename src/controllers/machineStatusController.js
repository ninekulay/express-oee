const { pool, testConnection } = require('../db-settings'); // Adjust the path as per your project structure
const isValidInput = require('./validateController');
const currentTimeFormatted = require('./validateController');

const getDataFromMachine = async (req, res) => {
    const machineName = req.params.machine_name;
    const lineName = req.params.line_name;
    const location = req.params.location;

    if (!isValidInput(machineName) || !isValidInput(lineName) || !isValidInput(location)) {
        return res.status(400).json({ message: 'Invalid Parameter' });
    }

    try {
        const sql = 'SELECT * FROM machine_statuses WHERE machine_name = ? AND line_name = ? AND location = ? limit 1000';
        const [rows] = await pool.query(sql, [machineName, lineName, location]);
  
      if (rows.length === 0) {
        res.status(404).json({ error: 'Not Found', message: 'Data not found' });
      } else {
        res.status(200).json(rows);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
  

module.exports = {
    getDataFromMachine
}