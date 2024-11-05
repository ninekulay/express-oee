const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const db = require('./db-settings');
const cron = require('./cronJobs')
const { mongoose, connectMongoDB } = require('./mongo-settings');
const { mqttClient, topicHandlers } = require('./mqtt-settings');
const { exec } = require('child_process');
const { connectRedis } = require('./redisClient'); 
const LogModel = require('./apiLogs');

// Initialize Express application
const app = express();
dotenv.config();

const port = process.env.PORT || 3000; // Define the port number
// Configure bodyParser middleware
app.use(bodyParser.json());

// Configure CORS
const allowedOrigins = ['http://localhost:8080', process.env.SERVICE_BASE_URL];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to log requests
app.use(async (req, res, next) => {
  const start = Date.now(); // Start time for response time calculation
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Get client IP

  // Capture the original send method
  const originalSend = res.send.bind(res);
  res.send = function (body) {
      const responseTime = Date.now() - start; // Calculate response time
      const baseUrl = req.originalUrl.split('/').slice(0, 4).join('/');
      const logEntry = new LogModel({
          method: req.method,
          url: req.originalUrl,
          path:  baseUrl,
          responseTime: responseTime,
          clientIp: clientIp,
      });
      logEntry.save().catch(err => console.error('Error saving log:', err)); // Save log entry to MongoDB
      return originalSend(body); // Send the original response
  };

  next();
});

// Routes
const apiLogsRoutes = require('./routes/apiLogsRoutes');
const machineStatusRoutes = require('./routes/machineStatusRoutes');
const machineStatusLogsRoutes = require('./routes/machineStatusLogsRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/machine_status', machineStatusRoutes);
app.use('/api/machine_status_logs', machineStatusLogsRoutes);
app.use('/api/api-logs', apiLogsRoutes);
app.use('/api/user-managements', authRoutes);
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.status(403).send('Forbidden');
});

// Endpoint to get system information
const getSystemInfo = () => {
  return new Promise((resolve, reject) => {
    let results = {};
    const commands = {
      cpu: 'top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1}\'',
      ram: 'free -h | awk \'/^Mem/{print $3, $2}\'',
      disk: 'df -h / | awk \'NR==2 {print $3, $4}\'',
    };

    // Create an array of promises for each command
    const commandPromises = Object.keys(commands).map((key) => {
      return new Promise((innerResolve, innerReject) => {
        exec(commands[key], (error, stdout, stderr) => {
          if (error) {
            innerReject(`Error: ${stderr}`);
          } else {
            results[key] = stdout.trim(); // Store result
            innerResolve();
          }
        });
      });
    });

    // Wait for all promises to resolve
    Promise.all(commandPromises)
      .then(() => {
        resolve(results); // Resolve with results when all inner promises complete
      })
      .catch((error) => {
        reject(error); // Reject if any command fails
      });
  });
};

// Initialize Sequelize with production configuration
const sequelize = new Sequelize(config.production.database, config.production.username, config.production.password, {
  host: config.production.host,
  dialect: 'mysql'
});

// // Synchronize Sequelize models and start the server
// db.sequelize.sync()
//   .then(() => {
//     console.log('Database synchronized');
//     app.listen(port, () => {
//       console.log(`Server is running on port ${port} at ${new Date().toString()}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Error synchronizing the database:', error.message);
//     console.error(error);
//     process.exit(1);
//   });

// Example usage of mqttClient
mqttClient.on('connect', () => {
    console.log('MQTT Client is connected and ready to use.');
});
const startServer = async () => {
  try {
    // Connect to MongoDB
    const mongoConnection = await connectMongoDB();
    
    if (!mongoConnection) {
      console.error('Error connecting to MongoDB');
      process.exit(1);
    }
    console.log('Connected to MongoDB');
    // Sync Sequelize models
    await db.sequelize.sync();
    console.log('Database synchronized');

    // Connect to Redis
    await connectRedis(); // Ensure Redis is connected here
    console.log('Redis client initialized.');

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    const systemInfo = await getSystemInfo();
    console.log('System information:', systemInfo);
  } catch (error) {
    console.error('Error initializing application:', error.message);
    console.error(error);
    process.exit(1);
  }
};

startServer();