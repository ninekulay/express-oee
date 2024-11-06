const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');

const basicAuth = require('./auth');

router.post('/login', basicAuth, userManagementController.login);
// router.post('/register', basicAuth, userManagementController.register);

module.exports = router;