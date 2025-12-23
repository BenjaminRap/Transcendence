import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import multipartPlugin from './plugins/multipart.js';
import staticPlugin from './plugins/static.js';
import { registerRoutes } from './plugins/registerRoutes.js';
import "reflect-metadata";
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import { MatchMaker } from './pong/MatchMaker';
import { SocketData } from './pong/SocketData';
import fs from 'fs';
import path from 'path';
import HavokPhysics from "@babylonjs/havok";
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { Container } from './container/Container.js';
import { SocketEventController } from './controllers/SocketEventController.js';

export type DefaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

const fastify = Fastify({
	logger: true
});

async function	init() : Promise<void>
{
	loadHavokPhysics();
}

const	io = new Server(fastify.server);

async function	loadHavokPhysics()
{
	const wasmPath = path.resolve('./node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
	const wasmBinary = fs.readFileSync(wasmPath).buffer; // ArrayBuffer
	globalThis.HK = await HavokPhysics({
		wasmBinary: wasmBinary
	});
}

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

const container = Container.getInstance(fastify.prisma);

await registerRoutes(fastify);

async function start(): Promise<void> {
    try {
        const port = Number(process.env.PORT) || 8181;
        const host = process.env.HOST || '0.0.0.0';

        await init();
		SocketEventController.initInstance(io);
        await fastify.listen({ port: port, host: host });
        // fastify.log.info(`Server listening at ${ host }:${ port }`);

    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
