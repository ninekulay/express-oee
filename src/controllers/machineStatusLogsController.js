const { pool, testConnection } = require('../db-settings'); // Adjust the path as per your project structure
const isValidInput = require('./validateController');
const currentTimeFormatted = require('./validateController');
const mongoose = require('mongoose');
const { connectRedis } = require('../redisClient');

const machineStatusLogsSchema = new mongoose.Schema({
    machine_name: { type: String, required: true }, // String field
    line_name: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, required: true },
    created_at: { type: Date, default: Date.now }, // Automatically set current date
    updated_at: { type: Date, default: Date.now } // Automatically set current date
}, {
    versionKey: false, // Disables __v field
    toJSON: { versionKey: false }, // Ensures __v is not included in JSON output
    toObject: { versionKey: false } // Ensures __v is not included in plain object output
}); // Ensure this is correctly placed

const getStatusLogsFromMachine = async (req, res) => {
    try {
        const redisClient = await connectRedis(); // Connect to Redis
      // Dynamically retrieve or define the Mongoose model
      const MachineStatusLogsModel = mongoose.models.machine_status_logs || 
        mongoose.model('machine_status_logs', machineStatusLogsSchema);
  
      // Extract query parameters
      const { machine_name: machineName, line_name: lineName, location, time_from: startDate, time_to: endDate } = req.params;
  
      // Validate input parameters
      if (![machineName, lineName, location, startDate, endDate].every(isValidInput)) {
        return res.status(400).json({ message: 'Invalid Parameter' });
      }
  
      // Define a cache key based on query parameters
      const cacheKey = `machineStatusLogs:${machineName}:${lineName}:${location}:${startDate}:${endDate}`;
      
      // Check cache for existing data
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
  
      // Query MongoDB if cache miss
      const rows = await MachineStatusLogsModel.find({
        machine_name: machineName,
        line_name: lineName,
        location: location,
        created_at: { $gte: new Date(startDate), $lt: new Date(endDate) }
      });
  
      // If no documents are found
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Not Found', message: 'Data not found' });
      }
  
      // Format documents with a timestamp for consistent display
      const formattedDocuments = rows.map(doc => {
        const { created_at, ...rest } = doc.toObject();
        const formattedDate = new Date(created_at).toISOString().slice(0, 19).replace('T', ' ');
        return { ...rest, created_at: formattedDate };
      });
  
      // Cache the formatted data for subsequent requests
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(formattedDocuments)); // Cache for 1 hour
  
      // Send formatted data to client
      return res.status(200).json(formattedDocuments);
    } catch (error) {
      console.error('Error in getStatusLogsFromMachine:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  };
  


module.exports = {
    getStatusLogsFromMachine
}