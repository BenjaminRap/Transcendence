import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import multipartPlugin from './plugins/multipart.js';
import staticPlugin from './plugins/static.js';
import { registerRoutes } from './plugins/registerServices.js';
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

// Instanciation and intialiasation of the dependency injection container
const container = Container.getInstance(fastify.prisma);
container.registerService('SocketIO', () => io);

// registration of all routes
await registerRoutes(fastify);

async function start(): Promise<void> {
    try {
        const port = Number(process.env.PORT) || 8181;
        const host = process.env.HOST || '0.0.0.0';
        const matchMaker = new MatchMaker(io);

        await init();
		io.on('connection', (socket : DefaultSocket) => {
			console.log("user connected !");
			socket.data = new SocketData(socket);
			socket.on("join-matchmaking", () => {
				console.log("try-join-matchmaking");
				matchMaker.addUserToMatchMaking(socket);
			});
			socket.once("disconnect", () => {
				console.log("disconnected !");
				matchMaker.removeUserFromMatchMaking(socket);
				socket.data.disconnect();
			});
		});
        await fastify.listen({ port: port, host: host });
        // fastify.log.info(`Server listening at ${ host }:${ port }`);

    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
