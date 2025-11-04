import Fastify from 'fastify';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { ServerPongGame } from './ServerPongGame';
import fastifyStatic from '@fastify/static';
import path from 'path';

const fastify = Fastify({
	logger: true
})

fastify.register(fpSqlitePlugin, {
	dbFilename: "./databases/main.db",
});

const	scenesDir = path.join(process.cwd(), "dev", "scenes");

fastify.register(fastifyStatic, {
	root : scenesDir,
	prefix: "/scenes/"
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
		const	gameInstance = new ServerPongGame();

		fastify.addHook("onClose", (_instance, done) => {
			if (gameInstance)
				gameInstance.dispose();
			done();
		});
		await init();
		await fastify.listen({ port: 8181, host: '0.0.0.0' });
	}
	catch (error)
	{
		fastify.log.error(`Could not launch the server, error : ${error}`);	
	}
}


start();
