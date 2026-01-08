import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import multipartPlugin from './plugins/multipart.js';
import staticPlugin from './plugins/static.js';
import dotenv from 'dotenv';
import { Container } from './container/Container.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import { suscriberRoute } from './routes/suscriber.route.js';
import { friendRoute } from './routes/friend.routes.js';
import { matchRoutes } from './routes/match.routes.js';
import "reflect-metadata";
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import path from 'path';
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import { MatchMaker } from './pong/MatchMaker';
import { SocketData } from './pong/SocketData';
import fs from 'fs';
import HavokPhysics from "@babylonjs/havok";
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { getPublicTournamentsDescriptions, TournamentMaker } from './pong/TournamentMaker';
import { zodTournamentCreationSettings, type TournamentDescription, type TournamentId } from '@shared/ServerMessage.js';
import { error, success, type Result } from '@shared/utils.js';
import type { Profile } from '@shared/Profile.js';

export type DefaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;
export type DefaultServer = Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

const fastify = Fastify({
	logger: true
});

async function	init() : Promise<void>
{
	loadHavokPhysics();
}
const	io = new Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>(fastify.server);

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
		Container.getInstance().getService('AuthMiddleware')
	);
	done();
}, { prefix: '/match' });

const	sockets = new Set<DefaultSocket>();
const	matchMaker = new MatchMaker(io);
const	tournamentMaker = new TournamentMaker(io);

async function start(): Promise<void> {
    try {
        const port = Number(process.env.PORT) || 8181;
        const host = process.env.HOST || '0.0.0.0';

        await init();
		io.on('connection', (socket : DefaultSocket) => {
			sockets.add(socket);
			console.log("user connected !");
			socket.data = new SocketData(socket);
			socket.on("join-matchmaking", () => {
				matchMaker.addUserToMatchMaking(socket);
			});
			socket.once("disconnect", () => {
				sockets.delete(socket);
				console.log("disconnect");
				matchMaker.removeUserFromMatchMaking(socket);
				socket.data.disconnect();
			});
			socket.on("get-tournaments", (ack : (descriptions : TournamentDescription[]) => void) => {
				const	descriptions = getPublicTournamentsDescriptions();

				ack(descriptions);
			});
			socket.on("join-tournament", (tournamentId : TournamentId, ack: (participants : Result<Profile[]>) => void) => {
				const	tournament = tournamentMaker.joinTournament(tournamentId, socket);

				if (!tournament.success)
				{
					ack(tournament);
					return ;
				}
				ack(success(tournament.value.getParticipantsProfiles()));
			})
			socket.on("create-tournament", (data : any, ack : (tournamentId : Result<string>) => void) => {
				const	parsed = zodTournamentCreationSettings.safeParse(data);

				if (!parsed.success)
				{
					ack(error("Invalid Data !"));
					return ;
				}
				const	tournament = tournamentMaker.createTournament(parsed.data, socket);

				if (!tournament.success)
				{
					ack(tournament);
					return ;
				}
				ack(success(tournament.value.getDescription().id));
			})
		});
        await fastify.listen({ port: port, host: host });
    } catch (error) {
        fastify.log.error(`Could not launch the server: ${error}`);
        process.exit(1);
    }
}

start();
