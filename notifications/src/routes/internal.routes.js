const express = require('express');
const {
	createDmMessageNotification,
	markDmConversationRead
} = require('../controllers/internal.controller');

const router = express.Router();

router.post('/dm/message-created', createDmMessageNotification);
router.post('/dm/read', markDmConversationRead);

module.exports = router;