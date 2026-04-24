const express = require('express');
const {
	listNotifications,
	markNotificationsRead,
	deleteNotifications
} = require('../controllers/notifications.controller');

const router = express.Router();

router.get('/', listNotifications);
router.post('/read', markNotificationsRead);
router.post('/delete', deleteNotifications);

module.exports = router;