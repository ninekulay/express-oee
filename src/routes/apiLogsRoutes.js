const express = require('express');
const router = express.Router();
const basicAuth = require('./auth');
const LogModel = require('../apiLogs');

const apiLogs = async (req, res) => {
    const logs = await LogModel.find().sort({ timestamp: -1 }); // Retrieve logs sorted by timestamp
    res.json(logs);
};

router.get('/get-logs', basicAuth, apiLogs);

module.exports = router;