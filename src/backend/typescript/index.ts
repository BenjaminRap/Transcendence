import Fastify from 'fastify'
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { initDb } from './initDb.js';

const fastify = Fastify({
	logger: true
})

fastify.register(fpSqlitePlugin, {
	dbFilename: "./databases/main.db",
});

fastify.get('/', (_request, reply) => {
	reply.send({ hello: 'world' });
})

async function	start() : Promise<void>
{
	try
	{
		await initDb(fastify);
		await fastify.listen({ port: 8181, host: '0.0.0.0' });
		fastify.log.info(`Server listening at address 0.0.0.0:8181`)
	}
	catch (error)
	{
		fastify.log.error(`Could not launch the server, error : ${error}`);	
	}
}

start();
