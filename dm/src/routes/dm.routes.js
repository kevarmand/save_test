const express = require('express');
const {createMessage} = require('../controllers/dm.controller');


const router = express.Router();

router.post('/', createMessage);

module.exports = router;
