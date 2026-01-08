import { MatchMaker } from "../pong/MatchMaker.js";
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { SocketData } from '../pong/SocketData';
import { Container } from "../container/Container.js";
import { TokenManager } from "../utils/TokenManager.js";


export type DefaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

export class SocketEventController {
	constructor (
		private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
	) {
		this.matchMaker = new MatchMaker(io);
		this.initSocket();
	}
	private static connectedUsers: Map<number, number> = new Map();
	private static socketInstance: SocketEventController;
	private matchMaker: MatchMaker;

	// ----------------------------------------------------------------------------- //
	static initInstance( io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ): void
	{
		if (!SocketEventController.socketInstance) {
			SocketEventController.socketInstance = new SocketEventController (io);
		}
	}

    // ==================================== PRIVATE ==================================== //
	
	// Auth middleware for socket.io new connections
	// ----------------------------------------------------------------------------- //
	private initMiddleware()
	{
		this.io.use(async (socket, next) => {
			const token = socket.handshake.auth.token;
			
			if (!token)
				return next(new Error("Authentication error: Token missing"));

			try {
				const tokenManager: TokenManager = Container.getInstance().getService('TokenManager');
				const decoded = await tokenManager.verify(token, false);

				(socket.data as any).userId = decoded.userId;
				
				next();
			} catch (err) {
				next(new Error("Authentication error: Invalid token"));
			}
		});
	}

	// ----------------------------------------------------------------------------- //
	private initSocket()
	{
		this.initMiddleware();
		this.io.on('connection', (socket : DefaultSocket) => {
			this.handleConnection(socket);

			socket.on("join-matchmaking", () => {
				this.handleMatchMakingRequest(socket);
			});

            socket.on("get-online-users", (callback) => {
				this.handleGetStatus(socket, callback);
            });

			socket.once("disconnect", () => {
				this.handleDisconnect(socket);
			});
		});
	}
	
	// ----------------------------------------------------------------------------- //
	private handleConnection(socket: DefaultSocket)
	{
		console.log("user connected !");
		
		const userId = (socket.data as any).userId;

		socket.data = new SocketData(socket, userId);
		socket.join('user-' + userId);

		const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
		const newCount = currentCount + 1;

		SocketEventController.connectedUsers.set(userId, newCount);

		// notifie everyone only if it's the first connection of the user
		if (newCount === 1) {
			this.io.emit('user-status-change', { userId: userId, status: 'online' });
		}
	}

	// ----------------------------------------------------------------------------- //
	private handleGetStatus(socket: DefaultSocket, callback: (onlineUsers: number[]) => void)
	{
		if (typeof callback === 'function') {
			callback(Array.from(SocketEventController.connectedUsers.keys()) );
		}
	}

	// ----------------------------------------------------------------------------- //
	private handleMatchMakingRequest(socket: DefaultSocket)
	{
		console.log("try-join-matchmaking");
		this.matchMaker.addUserToMatchMaking(socket);
	}	

	// ----------------------------------------------------------------------------- //
	private handleDisconnect(socket: DefaultSocket)
	{
		console.log("disconnected !");
		
		// clean MatchMaking
		this.matchMaker.removeUserFromMatchMaking(socket);

		const userId = socket.data.getUserId();
		
		socket.data.disconnect();

		if (userId) {
			const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
			const newCount = currentCount - 1;
			
			if (newCount <= 0) {
				// remove user from map and notify everyone
				SocketEventController.connectedUsers.delete(userId);
				this.io.emit('user-status-change', { userId: userId, status: 'offline' });
			}
			else {
				// update count
				SocketEventController.connectedUsers.set(userId, newCount);
			}
		}
	}

	// ----------------------------------------------------------------------------- //
	static sendToUser(userId: number, event: string, data: any): void
	{
		if (SocketEventController.socketInstance) {
			SocketEventController.socketInstance.io.to('user-' + userId).emit(event as any, data);
		}
	}
}
