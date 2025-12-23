import type { FastifyInstance } from 'fastify';
import { Container } from '../container/Container.js';
import { authRoutes } from '../routes/auth.routes.js';
import { usersRoutes } from '../routes/users.routes.js';
import { suscriberRoute } from '../routes/suscriber.route.js';
import { friendRoute } from '../routes/friend.routes.js';
import { matchRoutes } from '../routes/match.routes.js';
import { tournamentRoutes } from '../routes/tournament.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {

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
}
