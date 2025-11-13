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


// fastify.addHook('onReady', async () => {
// });
// Instanciation and intialiasation of the dependency injection container
fastify.after(async (err) => {
    if (err)
        throw err;

    const container = Container.getInstance();
    container.initialize(fastify.prisma);
    
    // auth /register /login - /refresh
    fastify.register((instance, opts, done) => {
        authRoutes(
            instance,
            Container.getInstance().getService('AuthController'),
            Container.getInstance().getService('AuthMiddleware')
        );
        done();
    }, { prefix: '/auth' });
    
    // users /search/:id - /search/username
    fastify.register((instance, opts, done) => {
        usersRoutes(
            instance,
            Container.getInstance().getService('UsersController'),
            Container.getInstance().getService('AuthMiddleware')
        );
        done();
    }, { prefix: '/users' });
    
    // suscriber /profile - /update
    fastify.register((instance, opts, done) => {
        suscriberRoute(
            instance,
            Container.getInstance().getService('SuscriberController'),
            Container.getInstance().getService('AuthMiddleware')
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
            Container.getInstance().getService('FriendController'),
            Container.getInstance().getService('AuthMiddleware')
        );
        done();
    }, { prefix: '/friend' });
});

async function start(): Promise<void> {
    try {
        const port = Number(process.env.PORT) || 8181;
        const host = process.env.HOST || '0.0.0.0';

        await fastify.listen({ port: port, host: host });
        fastify.log.info(`Server listening at ${ host }:${ port }`);
    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
