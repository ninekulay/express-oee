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

const changeFriendlyMachineName = async (req, res) => {
  const { friendly_machine_name, id } = req.body;

  for (const key in req.body) {
    if (!isValidInput(req.body[key])) {
      return res.status(400).json({ message: 'Invalid Parameter' });
    }
  }

  try {
    const sql = 'UPDATE machine_statuses SET friendly_machine_name = ? WHERE id = ?';
    const [rows] = await pool.query(sql, [friendly_machine_name, id]);
    res.status(200).json({ message: 'Machine name updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const getAllMachineByArrayId = async (arrayId) => {
  return new Promise(async (resolve) => {
    if (!Array.isArray(arrayId) || arrayId.length === 0) {
      resolve(null);
    }
    const sql = `SELECT * FROM machine_statuses WHERE id IN (?)`;
    const [results] = await pool.query(sql, [arrayId]);
    if (results.length === 0) {
      resolve(null);
    }
    resolve(results);
  });
}

const getAllMachineByLine = async (req, res) => {
  try {
    const lineName = req.params.line_name;
    const location = req.params.location;
    const sql = `SELECT * FROM machine_statuses WHERE line_name = ? AND location = ?`;
    const [rows] = await pool.query(sql, [lineName, location]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Data not found' });
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

module.exports = {
    getDataFromMachine,
    getAllMachineByArrayId,
    getAllMachineByLine,
    changeFriendlyMachineName
}