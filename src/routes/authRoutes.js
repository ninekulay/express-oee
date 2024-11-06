const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const userManagementController = require('../controllers/userManagementController');

// const authenticateToken = require('../controllers/authMiddleware')
const basicAuth = require('./auth');
// const advanceAuth = require('./advanceAuth');

// Route for login and token generation
router.post('/login', basicAuth, authenticationController.login);
router.get('/verify-token', authenticationController.verifyToken);
router.post('/regenerate-token', basicAuth, authenticationController.regenerateTokenExpire);
router.post('/register', basicAuth, userManagementController.register);

// router.get('/test-auth', advanceAuth, authenticationController.verifyToken);

// // Route for token validation
// router.post('/validate-token', authenticateToken, (req, res) => {
//     res.sendStatus(200); // Token is valid
// });

module.exports = router;
