import Fastify from 'fastify';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { MatchMaker } from './MatchMaker';
import { SocketData } from './SocketData';
import fs from 'fs';
import HavokPhysics from "@babylonjs/havok";

export type DefaultSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

const fastify = Fastify({
	logger: true
});

fastify.register(fpSqlitePlugin, {
	dbFilename: "./databases/main.db",
});

const	scenesDir = path.join(process.cwd(), "dev", "scenes");

fastify.register(fastifyStatic, {
	root : scenesDir,
	prefix: "/scenes/"
});

fastify.get('/', (_request, reply) => {
	reply.send({ hello: 'world' });
})

async function	init() : Promise<void>
{
	await fastify.ready();
	await fastify.db.all(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL
		);
	`);
	loadHavokPhysics();
}
const	io = new Server(fastify.server);

async function	start() : Promise<void>
{
	try
	{
		await init();
		await fastify.listen({ port: 8181, host: '0.0.0.0' });

		const	matchMaker = new MatchMaker();
		io.on('connection', (socket) => {
			console.log("user connected !");
			socket.data = new SocketData();
			socket.on("join-matchmaking", () => matchMaker.addUserToMatchMaking(socket));
			socket.on("disconnect", () => matchMaker.removeUserToMatchMaking(socket));
			socket.on("leave-matchmaking", () => matchMaker.removeUserToMatchMaking(socket));
		});
	}
	catch (error)
	{
		fastify.log.error(`Could not launch the server, error : ${error}`);	
	}
}

async function	loadHavokPhysics()
{
	const wasmPath = path.resolve('./node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
	const wasmBinary = fs.readFileSync(wasmPath).buffer; // ArrayBuffer
	globalThis.HK = await HavokPhysics({
		wasmBinary: wasmBinary
	});
}


start();
