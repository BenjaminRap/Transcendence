import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import multipartPlugin from './plugins/multipart.js';
import staticPlugin from './plugins/static.js';
import dotenv from 'dotenv';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { Container } from './container/Container.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import { suscriberRoute } from './routes/suscriber.route.js';
import { friendRoute } from './routes/friend.routes.js';
import { matchRoutes } from './routes/match.routes.js';
import { tournamentRoutes } from './routes/tournament.routes.js';

dotenv.config();

const fastify = await Fastify({ logger: true });

await fastify.register(cors, {
    origin: true,
    credentials: true,
});

await fastify.register(fpSqlitePlugin, {
    dbFilename: "./databases/main.db",
});

await fastify.register(prismaPlugin);

await fastify.register(multipartPlugin);

await fastify.register(staticPlugin);

// after registering other plugins


// Instanciation and intialiasation of the dependency injection container
const container = Container.getInstance(fastify.prisma);

// auth /register /login - /refresh
await fastify.register((instance, opts, done) => {
	authRoutes(
		instance,
		Container.getInstance().getService('AuthController'),
		Container.getInstance().getService('AuthMiddleware')
	);
	done();
}, { prefix: '/auth' });

// users /search/:id - /search/username
await fastify.register((instance, opts, done) => {
	usersRoutes(
		instance,
		Container.getInstance().getService('UsersController'),
		Container.getInstance().getService('AuthMiddleware')
	);
	done();
}, { prefix: '/users' });

// suscriber /profile - /update
await fastify.register((instance, opts, done) => {
	suscriberRoute(
		instance,
		Container.getInstance().getService('SuscriberController'),
		{
			auth: Container.getInstance().getService('AuthMiddleware'),
			header: Container.getInstance().getService('HeaderMiddleware')
		},
	);
	done();
}, { prefix: '/suscriber' });

/* friend/
	- request/:id
	- accept/:id
	- delete/:id
	- search/myfriends
	- search/pendinglist
*/
await fastify.register((instance, opts, done) => {
	friendRoute(
		instance,
		Container.getInstance().getService('FriendController'),
		Container.getInstance().getService('AuthMiddleware')
	);
	done();
}, { prefix: '/friend' });

await fastify.register((instance, opts, done) => {
	matchRoutes(
		instance,
		Container.getInstance().getService('MatchController'),
		{
			auth: Container.getInstance().getService('AuthMiddleware'),
			header: Container.getInstance().getService('HeaderMiddleware')
		}
	);
	done();
}, { prefix: '/match' });

await fastify.register((instance, opts, done) => {
	tournamentRoutes(
		instance,
		Container.getInstance().getService('TournamentController'),
		{
			auth: Container.getInstance().getService('AuthMiddleware'),
			header: Container.getInstance().getService('HeaderMiddleware')
		}
	);
	done();
}, { prefix: '/tournament' });

async function start(): Promise<void> {
    try {
        const port = Number(process.env.PORT) || 8181;
        const host = process.env.HOST || '0.0.0.0';

        await fastify.listen({ port: port, host: host });
        fastify.log.info(`Server listening at ${ host }:${ port } !`);
    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
