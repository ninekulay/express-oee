const express = require('express');
const router = express.Router();
const machineStatusController = require('../controllers/machineStatusController');
const advanceAuth = require('./advanceAuth');
const basicAuth = require('./auth');

router.get('/get-machine_status/:machine_name/:line_name/:location', advanceAuth, machineStatusController.getDataFromMachine);
router.get('/get-machine-in-line/:line_name/:location', advanceAuth, machineStatusController.getAllMachineByLine);
router.post('/update-friendly-machine-name', advanceAuth, machineStatusController.changeFriendlyMachineName);

module.exports = router;