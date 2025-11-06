import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';

import { Container } from './container/Container.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import { suscriberRoute } from './routes/suscriber.route.js';
import { friendRoute } from './routes/friend.routes.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
    origin: true,
    credentials: true,
});

fastify.register(fpSqlitePlugin, {
    dbFilename: "./databases/main.db",
});

fastify.register(prismaPlugin);


fastify.addHook('onReady', async () => {
    // Instanciation and intialiasation of the dependency injection container
    const container = Container.getInstance();
    container.initialize(fastify.prisma);

    // auth /register /login - /refresh
    fastify.register((instance, opts, done) => {
        authRoutes(
            instance,
            container.getService('AuthController'),
            container.getService('AuthMiddleware')
        );
        done();
    }, { prefix: '/auth' });

    // users /search/:id - /search/username
    fastify.register((instance, opts, done) => {
        usersRoutes(
            instance,
            container.getService('UsersController'),
            container.getService('AuthMiddleware')
        );
        done();
    }, { prefix: '/users' });

    // suscriber /profile - /update
    fastify.register((instance, opts, done) => {
        suscriberRoute(
            instance,
            container.getService('SuscriberController'),
            container.getService('AuthMiddleware')
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
    fastify.register((instance, opts, done) => {
        friendRoute(
            instance,
            container.getService('FriendController'),
            container.getService('Authmiddleware')
        );
        done();
    }, { prefix: '/friend' });
});

async function start(): Promise<void> {
    try {
        await fastify.listen({ port: 8181, host: '0.0.0.0' });
        fastify.log.info('Server listening at 0.0.0.0:8181');
    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
