import type { FastifyInstance } from 'fastify';
import { Container } from '../container/Container.js';
import { authRoutes } from '../routes/auth.routes.js';
import { usersRoutes } from '../routes/users.routes.js';
import { suscriberRoute } from '../routes/suscriber.route.js';
import { friendRoute } from '../routes/friend.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {

	// auth :
    //  POST: /register - POST: /login - POST: /logout - GET: /refresh - GET: /callback
	await fastify.register((instance, opts, done) => {
		authRoutes(
			instance,
			Container.getInstance().getService('AuthController'),
			Container.getInstance().getService('AuthMiddleware')
		);
		done();
	}, { prefix: '/auth' });

	// users :
    //  GET: /search/id/:id - GET: /search/username/:username
	await fastify.register((instance, opts, done) => {
		usersRoutes(
			instance,
			Container.getInstance().getService('UsersController'),
			Container.getInstance().getService('AuthMiddleware')
		);
		done();
	}, { prefix: '/users' });

	// suscriber :
    //  GET: /profile - PUT: /update/password - PUT: /update/username - PUT: /update/avatar - DELETE: /delete/avatar - DELETE: /delete/account
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

    // friend :
    // POST: /request/:id - PUT: /accept/:id - PUT: /delete/:id - GET: /search/myfriends - GET: /search/pendinglist
	await fastify.register((instance, opts, done) => {
		friendRoute(
			instance,
			Container.getInstance().getService('FriendController'),
			Container.getInstance().getService('AuthMiddleware')
		);
		done();
	}, { prefix: '/friend' });

    // match :
    // GET: /history
	// await fastify.register((instance, opts, done) => {
	// 	matchRoutes(
	// 		instance,
	// 		Container.getInstance().getService('MatchController'),
    //         {
	// 			auth: Container.getInstance().getService('AuthMiddleware'),
	// 		}
	// 	);
	// 	done();
	// }, { prefix: '/match' });

}
