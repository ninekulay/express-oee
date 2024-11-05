// logModel.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    method: { type: String, required: true },
    url: { type: String, required: true },
    path: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    responseTime: { type: Number, required: true }, // in milliseconds
    clientIp: { type: String, required: true }, // client's IP address
});

const LogModel = mongoose.model('Log', logSchema, 'api_logs');

module.exports = LogModel;
