const express = require('express');
const pushController = require('../controllers/push.controller');

const router = express.Router();

router.post('/push', pushController.push);

module.exports = router;