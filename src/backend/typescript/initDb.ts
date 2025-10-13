import { FastifyInstance } from 'fastify';

function cleanExit(fastify: FastifyInstance, err: unknown) {
	fastify.log.error(err);
	process.exit(1);
};

async function initUserTable(fastify: FastifyInstance): Promise<void>
{
    try {
		await fastify.db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username VARCHAR(128) NOT NULL,
				email VARCHAR(256) UNIQUE NOT NULL,
				password VARCHAR(256) NOT NULL,
				avatar TEXT NOT NULL,
				created_at DATETIME DEFAULT current_timestamp,
				updated_at DATETIME DEFAULT NULL,
				online BOOLEAN DEFAULT TRUE
			);
		`);
	}
	catch (err) {
		cleanExit(fastify, err);
	}
};

export async function initDb(fastify: FastifyInstance): Promise<void> {
    await fastify.ready();
	await initUserTable(fastify);
}
