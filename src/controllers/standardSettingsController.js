const { pool, testConnection } = require('../db-settings'); // Adjust the path as per your project structure
const isValidInput = require('./validateController');
const currentTimeFormatted = require('./validateController');
const { getMachineRelated } = require('./relationMachineUsersController');
const { getUserIdFromEmail } = require('./userManagementController');
const { getAllMachineByArrayId } = require('./machineStatusController');

const getStandardSettingFromEmail = async (req, res) => {
    const { email } = req.body;
    for (const key in req.body) {
        if (!isValidInput(req.body[key])) {
          return res.status(400).json({ message: 'Invalid Parameter' });
        }
    }

    const userId = await getUserIdFromEmail({ "email": email });
    if (userId === null) {
      return res.status(404).json({ message: 'User not found' });
    }

    const machineRelated = await getMachineRelated({ "userId": userId });
    if (machineRelated.message.toLowerCase() !== "ok") {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const machineDetails = await getAllMachineByArrayId(machineRelated.data.map((item) => item.machine_id));
    if (machineDetails === null) {
      return res.status(404).json({ message: 'Machine detail not found' });
    }
    
    let lineName = [];
    let location = [];
    machineDetails.forEach((item) => {
      lineName.push(item.line_name);
      location.push(item.location);
    });

    try {
      const sql = `
        SELECT * FROM standard_settings
        WHERE line_name IN (?) 
        AND location IN (?) 
        LIMIT 1000
      `;
    
      // Execute the query, passing the arrays as parameters
      const [rows] = await pool.query(sql, [lineName, location]);
  
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


const updateStandardDataByDataTypeAndLineName = async (req, res) => {
  const { data_type, line_name, location, setting_data } = req.body;

  if (!isValidInput(data_type) || !isValidInput(line_name) || !isValidInput(location) || !isValidInput(setting_data)) {
      return res.status(400).json({ message: 'Invalid Parameter' });
  }
  try {
    const sql = 'UPDATE standard_settings SET setting_data = ? WHERE data_type = ? AND line_name = ? AND location = ?';
    const [rows] = await pool.query(sql, [setting_data, data_type, line_name, location]);
    res.status(200).json({ message: 'Standard Data updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const getAllDetailByArray = async (params) => {
  return new Promise(async (resolve) => {
    try {

      for (const key in params) {
        if (!isValidInput(params[key])) {
          resolve({ message: 'Invalid Parameter' });
        }
      }

      let whereDataType = '';
      if (params.data_type) {
        whereDataType = `AND data_type IN (${params.data_type.join(',')})`;
      }
      const sql = `SELECT * FROM standard_settings WHERE line_name IN (${params.line_name.join(',')}) AND location IN (${params.location.join(',')}) ${whereDataType} limit 1000`;
      const [rows] = await pool.query(sql);
      if (rows.length === 0) {
        resolve({ error: 'Not Found', message: 'Data not found' });
      }
      resolve({ message: 'OK', data: rows });
    } catch (error) {
      console.error(error);
      resolve({ error: 'Internal Server Error', message: error.message });
    }
  });
};
  

module.exports = {
  getStandardSettingFromEmail,
  updateStandardDataByDataTypeAndLineName
}