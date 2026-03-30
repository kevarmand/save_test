const {PrismaClient} = require('@prisma/client');
const {PrismaPg} = require('@prisma/adapter-pg');
const {Pool} = require('pg');
const env = require('../config/env');
const {buildDbTlsOptions} = require('../config/tls');

const pool = new Pool({
	connectionString: env.db.url,
	ssl: buildDbTlsOptions()
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

module.exports = prisma;