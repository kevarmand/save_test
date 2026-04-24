const {
	validateCreateCommentEvent
} = require('../validation/internal.validation');
const notificationsService = require('../services/notifications.service');

function buildCreateCommentEventCommand(req) {
	return {
		action: req.body.action,
		commentId: req.body.commentId,
		postId: req.body.postId,
		postOwnerId: req.body.postOwnerId,
		actorUserId: req.body.actorUserId
	};
}

async function createCommentEvent(req, res, next) {
	let command;

	try {
		command = validateCreateCommentEvent(
			buildCreateCommentEventCommand(req)
		);
		await notificationsService.createCommentNotification(command);
		return res.status(202).json({
			status: 'accepted'
		});
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	createCommentEvent
};