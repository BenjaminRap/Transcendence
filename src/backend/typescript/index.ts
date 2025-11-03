// import Fastify from 'fastify';
// import cors from '@fastify/cors';
// import { fpSqlitePlugin } from 'fastify-sqlite-typed';
// import { authRoutes } from './routes/auth.js';
// import { usersRoutes } from './routes/users.js';
// import { persoRoutes } from './routes/persoUser.js';
// import { friendship } from './routes/friends.js'
// import prismaPlugin from './plugins/prisma.js'


// const fastify = Fastify({
//     logger: true
// });

// // Plugin SQLite
// fastify.register(fpSqlitePlugin, {
//     dbFilename: "./databases/main.db",
// });

// fastify.register(prismaPlugin)

// // CORS pour permettre les requêtes depuis le frontend
// fastify.register(cors, {
//     origin: true,
//     credentials: true
// });

// // Route de base
// fastify.get('/', (_request, reply) => {
//     reply.send({ hello: 'world' });
// });

// // routes functions

// // route to authenticate users ( /register, /login, /refresh )
// fastify.register(authRoutes, { prefix: '/auth' });

// // route to get others users public profiles ( /:id, /:username )
// fastify.register(usersRoutes, { prefix: '/users' });

// // route to get personnal profile ( /me, /update )
// fastify.register(persoRoutes, { prefix: '/perso' });

// fastify.register(friendship, { prefix: '/friends'});

// async function start(): Promise<void> {
//     try {
//         await fastify.listen({ port: 8181, host: '0.0.0.0' });
//         fastify.log.info(`Server listening at address 0.0.0.0:8181`);
//     } catch (error) {
//         fastify.log.error(`Could not launch the server, error : ${error}`);
//         process.exit(1);
//     }
// }

// start();



// ---------------------------------------------------------------------------- //

import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { Container } from './container/container.js';
import { authRoutes } from './routes/auth.routes.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
    origin: true,
    credentials: true,
});

fastify.register(fpSqlitePlugin, {
    dbFilename: "./databases/main.db",
});

fastify.register(prismaPlugin);


// Initialisation du container après le démarrage
fastify.addHook('onReady', async () => {
    const container = Container.getInstance();
    container.initialize(fastify.prisma);

    // Enregistrement des routes avec injection de dépendances
    fastify.register((instance, opts, done) => {
        authRoutes(
            instance,
            container.getService('authController'),
            container.getService('authMiddleware')
        );
        done();
    }, { prefix: '/auth' });
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
