import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { authRoutes } from './routes/auth.js';
import { usersRoutes } from './routes/users.js';
import prismaPlugin from './plugins/prisma.js'


const fastify = Fastify({
    logger: true
});

// Plugin SQLite
fastify.register(fpSqlitePlugin, {
    dbFilename: "./databases/main.db",
});

fastify.register(prismaPlugin)

// CORS pour permettre les requêtes depuis le frontend
fastify.register(cors, {
    origin: true,
    credentials: true
});

// Route de base
fastify.get('/', (_request, reply) => {
    reply.send({ hello: 'world' });
});

// Enregistrer les routes
fastify.register(authRoutes, { prefix: '/auth' });

fastify.register(usersRoutes, { prefix: '/users' });

async function start(): Promise<void> {
    try {
        await fastify.listen({ port: 8181, host: '0.0.0.0' });
        fastify.log.info(`Server listening at address 0.0.0.0:8181`);
    } catch (error) {
        fastify.log.error(`Could not launch the server, error : ${error}`);
        process.exit(1);
    }
}

start();
