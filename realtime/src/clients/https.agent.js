const https = require('https');
const {buildClientTlsOptions} = require('../config/tls');

const agent = new https.Agent(buildClientTlsOptions());

module.exports = agent;