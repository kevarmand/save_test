const pushService = require('../services/push.service');
const {validatePushRequest} = require('../validation/push.validation');

function push(req, res, next) {
	let command;
	let result;

	try {
		command = validatePushRequest(req.body);
		result = pushService.pushToUsers(command);
		return res.status(200).json(result);
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	push
};