const express = require('express');
const {
	listNotifications,
	markNotificationsRead
} = require('../controllers/notifications.controller');

const router = express.Router();

router.get('/', listNotifications);
router.post('/read', markNotificationsRead);

module.exports = router;