const express = require('express');
const router = express.Router();
const machineStatusController = require('../controllers/machineStatusController');

const basicAuth = require('./auth');

router.get('/get-machine_status/:machine_name/:line_name/:location', basicAuth, machineStatusController.getDataFromMachine);

module.exports = router;