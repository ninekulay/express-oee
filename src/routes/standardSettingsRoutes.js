const express = require('express');
const router = express.Router();
const standardSettingsController = require('../controllers/standardSettingsController');
const advanceAuth = require('./advanceAuth');
const basicAuth = require('./auth');

router.post('/get-data-by-user', advanceAuth, standardSettingsController.getStandardSettingFromEmail);
router.post('/update-by-datatype-line_name', advanceAuth, standardSettingsController.updateStandardDataByDataTypeAndLineName);

module.exports = router;