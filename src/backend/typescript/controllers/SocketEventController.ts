import { MatchMaker } from "../pong/MatchMaker.js";
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { SocketData } from '../pong/SocketData';
import { Container } from "../container/Container.js";
import { TokenManager } from "../utils/TokenManager.js";
import type { FriendService } from "../services/FriendService.js";

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
	static initInstance( io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): void
	{
		if (!SocketEventController.socketInstance) {
			SocketEventController.socketInstance = new SocketEventController (io);
		}
	}

    // ==================================== PRIVATE ==================================== //
	
	// Auth middleware for socket.io new connections
	// ----------------------------------------------------------------------------- //
	private async initMiddleware()
	{
		this.io.use(async (socket, next) => {
			const token = socket.handshake.auth.token;

			// guest user
			if (!token) {
				(socket.data as any).userId = -1;
				return next();
			}

			try {
				const tokenManager: TokenManager = Container.getInstance().getService('TokenManager');
				const decoded = await tokenManager.verify(token, false);

				(socket.data as any).userId = decoded.userId;
				
				next();
			} catch (err) {
				(socket.data as any).userId = -1;
				(socket.data as any).authError = true;
				return next();
			}
		});
	}

	// ----------------------------------------------------------------------------- //
	private async initSocket()
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
	/**
	 * 
	 * la connection a la socket ne veut pas dire que l'utilisateur est authentifié
	 * il peut jouer en tant que guest au jeu
	 * mais aucun event lie au changement de profil ne sera emise
	 * donc la connection a la socket en tant qu'invite et en tant qu'utilisateur authentifié doit etre differencie
	 * 
	 * 
	 */
	private async handleConnection(socket: DefaultSocket)
	{
		
		const userId = (socket.data as any).userId;

		socket.data = new SocketData(socket, userId);

		if (userId == -1) {
			if ( (socket.data as any).authError )
				console.log("Socket connection with invalid token !");
			else
				console.log("Guest connected !");
			return;
		}
		console.log(`User ${userId} connected !`);

		// join a room specific to the user for private events
		socket.join('user-' + userId);

		// system to count multiple connections from the same user
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
		// clean MatchMaking
		this.matchMaker.removeUserFromMatchMaking(socket);

		// clean socket data
		socket.data.disconnect();
		
		const userId = socket.data.getUserId();

		if (userId != -1) {
			const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
			const newCount = currentCount - 1;
			
			if (newCount <= 0) {
				// remove user from map and notify everyone
				SocketEventController.connectedUsers.delete(userId);
				this.io.emit('user-status-change', { userId: userId, status: 'offline' });

                // leave user room
                socket.leave('user-' + userId);
			}
			else {
				// update count
				SocketEventController.connectedUsers.set(userId, newCount);
			}
		}
	}

    // ----------------------------------------------------------------------------- //
    // cette fonction n'emet qu'a la room user-{userId}, donc a tous les processus front connectes de cet utilisateur
	static sendToUser(userId: number, event: string, data: any): void
	{
		try {
			if (SocketEventController.socketInstance) {
				SocketEventController.socketInstance.io.to('user-' + userId).emit(event as any, data);
			}			
		} catch (error) {
			console.warn(`Error sending socket event to user ${userId} :`, error);
		}
	}

    // ----------------------------------------------------------------------------- //
    static sendToProfileWatchers(userId: number, event: string, data: any): void
    {
        try {
            if (SocketEventController.socketInstance) {
                const socketInstance = SocketEventController.socketInstance;
                const sockets = socketInstance.io.sockets.sockets;

                sockets.forEach((socket) => {
                    if (socket.data.isWatchingProfile(userId)) {
                        socket.emit(event as any, data);
                    }
                });
            }            
        } catch (error) {
            console.warn(`Error sending socket event to profile watchers of user ${userId} :`, error);
        }
    }
}
