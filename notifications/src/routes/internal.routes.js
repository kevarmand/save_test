const express = require('express');
const {
	createCommentEvent
} = require('../controllers/internal.controller');

const router = express.Router();

router.post('/events/comment', createCommentEvent);

module.exports = router;