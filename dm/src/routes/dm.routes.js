const express = require('express');
const {
	createMessageLegacy,
	createMessageByUser,
	listMessagesByUser,
	markConversationReadByUser,
	listConversations
} = require('../controllers/dm.controller');

const router = express.Router();

router.post('/', createMessageLegacy);
router.get('/conversations', listConversations);
router.post('/users/:otherUserId/messages', createMessageByUser);
router.get('/users/:otherUserId/messages', listMessagesByUser);
router.post('/users/:otherUserId/read', markConversationReadByUser);

module.exports = router;