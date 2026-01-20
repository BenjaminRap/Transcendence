import { MatchMaker } from "../pong/MatchMaker.js";
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { SocketData } from '../pong/SocketData';
import { Container } from "../container/Container.js";
import { TokenManager } from "../utils/TokenManager.js";
import type { FriendService } from "../services/FriendService.js";
import type { ServerType } from "../index.js";
import { getPublicTournamentsDescriptions, TournamentMaker } from "../pong/TournamentMaker.js";
import { zodTournamentCreationSettings, type TournamentDescription, type TournamentId } from "@shared/ServerMessage.js";
import { error, success, type Result } from "@shared/utils.js";

export type DefaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

export class SocketEventController {
	constructor (
		private io: ServerType,
	) {
		this.matchMaker = new MatchMaker(io);
		this.sockets = new Set<DefaultSocket>();
		this.tournamentMaker = new TournamentMaker(io);
		this.initSocket();
	}
	private static connectedUsers: Map<number, number> = new Map();
	private static socketInstance: SocketEventController;
	private matchMaker: MatchMaker;
	private sockets : Set<DefaultSocket>;
	private tournamentMaker : TournamentMaker;
    
    // =================================== STATIC ==================================== //
	
    // ----------------------------------------------------------------------------- //
	static initInstance( io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): void
	{
		if (!SocketEventController.socketInstance) {
			SocketEventController.socketInstance = new SocketEventController (io);
		}
	}

    // send message to a specific user
    // ----------------------------------------------------------------------------- //
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

    // send message to all users watching a specific profile
    // ----------------------------------------------------------------------------- //
    static sendToProfileWatchers(userId: number, event: string, data: any): void
    {
        SocketEventController.socketInstance.io.to('watching-' + userId).emit(event as any, data);
    }

    // send message to all friends of a specific user
    // ----------------------------------------------------------------------------- //
    static sendToFriends(userId: number, event: string, data: any): void
    {
        try {
            if (SocketEventController.socketInstance)
            {
                const friendService: FriendService = Container.getInstance().getService('FriendService');
    
                friendService.getFriendsIds(userId).then((friendsIds: number[]) => {
                    friendsIds.forEach((friendId) => {
                        SocketEventController.sendToUser(friendId, event, data);
                    });
                }).catch((error) => {
                    console.warn(`Error retrieving friends of user ${userId} :`, error);
                });
            }            
        } catch (error) {
            console.warn(`Error sending socket event to friends of user ${userId} :`, error);
        }
    }

    // notify profile change to user, friends and watchers
    // ----------------------------------------------------------------------------- //
    static notifyProfileChange(id: number, event: string, data: any): void
    {
        SocketEventController.sendToUser(id, event, data);
        SocketEventController.sendToFriends(id, event, data);
        SocketEventController.sendToProfileWatchers(id, event, data);
    }

    // check if a user is online
    // ----------------------------------------------------------------------------- //
    static isUserOnline(userId: number): boolean {
        return SocketEventController.connectedUsers.has(userId);
    }

    // ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //
	private async initSocket()
	{
		this.io.on('connection', (socket : DefaultSocket) => {
			this.handleConnection(socket);

            socket.once("authenticate", (data: { token: string }, ack: (result: Result<null>) => void) => {
                this.handleAuthenticate(socket, data.token, ack);
            });

			socket.on("get-tournaments", (ack : (descriptions : TournamentDescription[]) => void) => {
				this.handleGetTournaments(socket, ack);
			});

			socket.on("join-tournament", (tournamentId : TournamentId, ack: (participants : Result<string[]>) => void) => {
				this.handleJoinTournament(socket, tournamentId, ack);
			});

			socket.on("create-tournament", (data : any, ack : (tournamentId : Result<string>) => void) => {
				this.handleCreateTournament(socket, data, ack);
			});

			socket.on("join-matchmaking", () => {
				this.handleMatchMakingRequest(socket);
			});

            socket.on("get-online-users", (callback) => {
				this.handleGetStatus(socket, callback);
            });

            socket.on("watch-profile", (profileId: number[]) => {
                this.addProfileToWatch(socket, profileId);
            });

            socket.on("unwatch-profile", (profileId: number[]) => {
                this.removeProfileToWatch(socket, profileId);
            });

			socket.once("disconnect", () => {
				this.handleDisconnect(socket);
			});
		});
	}

	// ----------------------------------------------------------------------------- //
	private async handleConnection(socket: DefaultSocket)
	{
		this.sockets.add(socket);

		socket.data = new SocketData(socket, -1);

		console.log(`Guest connected !`);
	}

	// ----------------------------------------------------------------------------- //
    private async handleAuthenticate(socket: DefaultSocket, token: string, ack: (result: Result<null>) => void) : Promise<void>
    {
        // guest user
        if (!token) {
            socket.data.userId = -1;
            ack(error("No token provided"));
            return;
        }

        let userId: number;

        try {
            const tokenManager: TokenManager = Container.getInstance().getService('TokenManager');
            const decoded = await tokenManager.verify(token, false);
            userId = decoded.userId;
            socket.data.userId = userId;
        } catch (err) {
            ack(error("Invalid token"));
            return;
        }

        // system to count multiple connections from the same user
        const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
        const newCount = currentCount + 1;

        SocketEventController.connectedUsers.set(userId, newCount);

        // notifie everyone only if it's the first connection of the user
        if (newCount === 1) {
            SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'online' });
            SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'online' });
        }
        
        console.log(`User ${userId} authenticated !`);
        ack(success(null));
    }

	// ----------------------------------------------------------------------------- //
	private handleGetTournaments(socket : DefaultSocket, ack : (descriptions : TournamentDescription[]) => void)
	{
		const descriptions = getPublicTournamentsDescriptions(socket);

		ack(descriptions);
	}

    // ----------------------------------------------------------------------------- //
	private	handleCreateTournament(socket : DefaultSocket, data : any, ack : (tournamentId : Result<string>) => void)
	{
		const	parsed = zodTournamentCreationSettings.safeParse(data);

		if (!parsed.success)
		{
			ack(error("Invalid Data !"));
			return ;
		}
		const	tournament = this.tournamentMaker.createTournament(parsed.data, socket);

		if (!tournament.success)
		{
			ack(tournament);
			return ;
		}
		const	description = tournament.value.getDescription();

		console.log(`tournament created : ${description.name}`);
		ack(success(description.id));
	}

    // ----------------------------------------------------------------------------- //	
	private	handleJoinTournament(socket : DefaultSocket, tournamentId : TournamentId, ack: (participants : Result<string[]>) => void)
	{
			const	tournament = this.tournamentMaker.joinTournament(tournamentId, socket);

			if (!tournament.success)
			{
				ack(tournament);
				return ;
			}
			console.log(`${socket.data.getProfile().name} joined the ${tournament.value.getDescription().name} tournament`);
			ack(success(tournament.value.getParticipantsNames()));
	}

	// ----------------------------------------------------------------------------- //
    // demander la liste des ids des users en ligne
    // renvoyer les ids des users connectes qui correspondent a des ids de la liste demandee
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
    private addProfileToWatch(socket: DefaultSocket, profileId: number[]): void
    {
        for (const id of profileId) {
            socket.join('watching-' + id);
        }
    }
    
    // ----------------------------------------------------------------------------- //
    private removeProfileToWatch(socket: DefaultSocket, profileId: number[]): void
    {
        for (const id of profileId) {
            socket.leave('watching-' + id);
        }
    }

	// ----------------------------------------------------------------------------- //
	private handleDisconnect(socket: DefaultSocket)
	{
		this.sockets.delete(socket);
		// clean MatchMaking
        // attention, le joueur peut ne jamais avoir demande a rejoindre le matchmaking
		this.matchMaker.removeUserFromMatchMaking(socket);

		// clean socket data
		socket.data.disconnect();
		
		const userId = socket.data.userId;
        if (userId == -1)
            console.log(`GUEST disconnected !`);
        else {
            // decompte ne nb de connexion du user (plusieurs onglets...)
			const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
			const newCount = currentCount - 1;
            console.log(`USER ${userId} disconnected !`);
			
			if (newCount <= 0) {
				SocketEventController.connectedUsers.delete(userId);
                SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'offline' });
                SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'offline' });
			}
			else {
				SocketEventController.connectedUsers.set(userId, newCount);
			}
		}
	}
}
