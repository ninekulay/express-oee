const express = require('express');
const router = express.Router();
const machineStatusLogsController = require('../controllers/machineStatusLogsController');

const basicAuth = require('./auth');

router.get('/get-logs-by-machine/:machine_name/:line_name/:location/:time_from/:time_to', basicAuth, machineStatusLogsController.getStatusLogsFromMachine);

module.exports = router;