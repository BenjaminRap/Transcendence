import Fastify from 'fastify'
import { fpSqlitePlugin } from 'fastify-sqlite-typed';

const fastify = Fastify({
	logger: true
})

fastify.register(fpSqlitePlugin, {
	dbFilename: "../database.db",
});

fastify.get('/', (_request, reply) => {
	reply.send({ hello: 'world' });
})

async function	init() : Promise<void>
{
	await fastify.ready();
	await fastify.db.all(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL
		);
	`);
}

async function	start() : Promise<void>
{
	try
	{
		await init();
		await fastify.listen({ port: 8181, host: '0.0.0.0' });
		fastify.log.info(`Server listening at address 0.0.0.0:8181`)
	}
	catch (error)
	{
		fastify.log.error(`Could not launch the server, error : ${error}`);	
	}
}

start();
