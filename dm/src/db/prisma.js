const fs = require('fs');
const {PrismaClient} = require('@prisma/client');
const {PrismaPg} = require('@prisma/adapter-pg');
const {Pool} = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
		rejectUnauthorized: true
	}
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

module.exports = prisma;