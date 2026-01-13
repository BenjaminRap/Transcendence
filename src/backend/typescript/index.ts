import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import multipartPlugin from './plugins/multipart.js';
import staticPlugin from './plugins/static.js';
import { registerRoutes } from './plugins/registerRoutes.js';
import "reflect-metadata";
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import HavokPhysics from "@babylonjs/havok";
import { Container } from './container/Container.js';
import { SocketEventController } from './controllers/SocketEventController.js';

const fastify = Fastify({
	logger: true
});

async function	init() : Promise<void>
{
	await loadHavokPhysics();
}

async function	loadHavokPhysics()
{
	const wasmPath = path.resolve('./node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
	const wasmBinary = fs.readFileSync(wasmPath).buffer; // ArrayBuffer
	globalThis.HK = await HavokPhysics({
		wasmBinary: wasmBinary
	});
}

const	io = new Server(fastify.server, {
	cors: {
		origin: true,		// accept requests from any origin
		credentials: true,	// allow cookies to be sent
	}
});

dotenv.config();

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

// Initialize the DI container with the Prisma client
try {
	Container.getInstance(fastify.prisma);
} catch (error) {
	fastify.log.error(`Could not initialize the DI container: ${error}`);
	process.exit(1);
}

await registerRoutes(fastify);

async function start(): Promise<void> {
    try {
        const port = Number(process.env.PORT) || 8181;
        const host = process.env.HOST || '0.0.0.0';

        await init();
        console.log("SOCKET:");
		SocketEventController.initInstance(io);
        await fastify.listen({ port: port, host: host });
        // fastify.log.info(`Server listening at ${ host }:${ port }`);

    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
