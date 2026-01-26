import { MatchMaker } from "../pong/MatchMaker.js";
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/MessageType';
import { SocketData, type SocketState } from '../pong/SocketData';
import { Container } from "../container/Container.js";
import { TokenManager } from "../utils/TokenManager.js";
import type { FriendService } from "../services/FriendService.js";
import type { ServerType } from "../index.js";
import { getPublicTournamentsDescriptions, TournamentMaker } from "../pong/TournamentMaker.js";
import { zodTournamentCreationSettings, type Profile, type TournamentDescription, type TournamentId } from "@shared/ServerMessage.js";
import { error, success, type Result } from "@shared/utils.js";

export type DefaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>;

export class SocketEventController {
	constructor (
		private io: ServerType,
        private friendService: FriendService,
        private tokenManager: TokenManager,
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
			SocketEventController.socketInstance = new SocketEventController (
                io,
                Container.getInstance().getService('FriendService'),
                Container.getInstance().getService('TokenManager')
            );
		}
	}

    // send message to a specific user
    // ----------------------------------------------------------------------------- //
	static sendToUser(userId: number, event: string, data: any): void
	{
        if (!userId) return;

        try {
            if (SocketEventController.socketInstance) {
                SocketEventController.socketInstance.io.to('user-' + Number(userId)).emit(event as any, data);
            }
        } catch (error) {
            console.warn(`\nFailed to emit event "${event}" to user ${userId} :`, error);
        }			
	}

    // send message to all users watching a specific profile
    // ----------------------------------------------------------------------------- //
    static sendToProfileWatchers(userId: number, event: string, data: any): void
    {
        if (!userId) return;

        try {
            if (SocketEventController.socketInstance) {
                SocketEventController.socketInstance.io.to('watching-' + userId).emit(event as any, data);
            }
        } catch (error) {
            console.warn(`\nFailed to emit event "${event}" to watchers of profile ${userId} :`, error);
        }
    }

    // send message to all friends of a specific user
    // ----------------------------------------------------------------------------- //
    static async sendToFriends(userId: number, event: string, data: any): Promise<void>
    {
        if (!userId) {
            console.log("sendToFriends called with invalid userId:", userId);
            return;
        }

        try {
            if (SocketEventController.socketInstance)
            {
                await SocketEventController.socketInstance.friendService.getFriendsIds(userId)
                    .then((friendsIds: number[]) => {
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
    static notifyProfileChange(id: number | null, event: string, data: any): void
    {
        if (!id || id < 0) return;
        SocketEventController.sendToUser(id, event, data);
        SocketEventController.sendToFriends(id, event, data);
        SocketEventController.sendToProfileWatchers(id, event, data);
    }

    // check if a user is online
    // ----------------------------------------------------------------------------- //
    static isUserOnline(userId: number): boolean {
        if (!userId || userId < 0) return false;
        return SocketEventController.connectedUsers.has(userId);
    }

	static async getUserState(io : ServerType, data : SocketData) : Promise<Result<SocketState>>{
		try {
			const	userId = data.getUserId();

			if (!userId)
				return success(data.getState());
			const	userSockets = await io.in('user-' + userId).fetchSockets();
			const	activeSocket = userSockets.find(socket => socket.data.getState() !== "unactive");

			return success(activeSocket?.data.getState() ?? "unactive");
		} catch (e) {
			return error("Could not fetch sockets");
		}
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

			socket.on("join-tournament", (tournamentId : TournamentId, ack: (participants : Result<Profile[]>) => void) => {
				this.handleJoinTournament(socket, tournamentId, ack);
			});

			socket.on("create-tournament", (data : any, ack : (tournamentId : Result<string>) => void) => {
				this.handleCreateTournament(socket, data, ack);
			});

			socket.on("join-matchmaking", (ack: (data: Result<null>) => void) => {
				this.handleMatchMakingRequest(socket, ack);
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

            socket.on("logout", () => {
                this.handleLogout(socket);
            });

			socket.once("disconnect", () => {
				this.handleDisconnect(socket);
			});
		});
	}

	// ----------------------------------------------------------------------------- //
	private async handleConnection(socket: DefaultSocket)
	{
        try {
            this.sockets.add(socket);
    
            socket.data = new SocketData(socket);
    
            socket.emit("init", socket.data.getGuestName());

            console.log(`Guest connected !`);            
        } catch (error) {
            console.error("Error during socket connection handling:", error);
        }
	}

	// ----------------------------------------------------------------------------- //
    private async handleAuthenticate(socket: DefaultSocket, token: string, ack: (result: Result<null>) => void) : Promise<void>
    {
        const authResult = await this.authenticateSocketData(socket, token);
        if (!authResult.success) {
            ack(error(authResult.error));
            return;
        }
        ack(success(null));

        const userId = Number(authResult.value);
        this.updateUserConnectionStatus(socket, userId);
    }

    // ----------------------------------------------------------------------------- //
    private async authenticateSocketData(socket: DefaultSocket, token: string): Promise<Result<number>> {
        try {
            const decoded = this.tokenManager.verify(token, false);
            if (!decoded) {
                return error("Invalid token");
            }

            const userId = Number(decoded.userId);
            
            // Partage les données de socket si l'utilisateur est déjà connecté sur un autre onglet
            const existingSockets = await this.io.in('user-' + userId).fetchSockets();
            if (existingSockets.length > 0) {
                socket.data = existingSockets[0].data;
            }

            const user = await this.friendService.getById(userId);
            if (!user) {
                return error("User not found");
            }

            socket.data.authenticate(userId, user.username, user.avatar);
            return success(userId);
        } catch (err) {
            return error("Invalid token");
        }
    }

    // ----------------------------------------------------------------------------- //
    private updateUserConnectionStatus(socket: DefaultSocket, userId: number): void {
        const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
        const newCount = currentCount + 1;
        SocketEventController.connectedUsers.set(userId, newCount);

        try {
            socket.join('user-' + userId);
            console.log(`User ${userId} authenticated and joined their socket room!`);
        } catch (error) {
            console.error(`Error while user ${userId} was joining their socket room:`, error);
        }

        // Notifie les observateurs et amis uniquement lors de la première connexion de l'utilisateur
        if (newCount === 1) {
            SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'online' });
            SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'online' });
        }
    }

	// ----------------------------------------------------------------------------- //
	private async handleGetTournaments(socket : DefaultSocket, ack : (descriptions : TournamentDescription[]) => void)
	{
		const descriptions = await getPublicTournamentsDescriptions(socket);

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
	private	async handleJoinTournament(socket : DefaultSocket, tournamentId : TournamentId, ack: (participants : Result<Profile[]>) => void)
	{
			const	tournament = await this.tournamentMaker.joinTournament(tournamentId, socket);

			if (!tournament.success)
			{
				ack(tournament);
				return ;
			}
			ack(success(tournament.value.getParticipants()));
	}

	// ----------------------------------------------------------------------------- //
	private handleGetStatus(socket: DefaultSocket, callback: (onlineUsers: number[]) => void)
	{
        callback(Array.from(SocketEventController.connectedUsers.keys()) );
	}

	// ----------------------------------------------------------------------------- //
	private async handleMatchMakingRequest(socket: DefaultSocket, ack: (data: Result<null>) => void)
	{
		console.log("try-join-matchmaking");

		const	result = await this.matchMaker.addUserToMatchMaking(socket);
		ack(result);
	}	

	// ----------------------------------------------------------------------------- //
    private addProfileToWatch(socket: DefaultSocket, profileId: number[]): void
    {
        try {
            const ids = Array.isArray(profileId) ? profileId : [profileId];
            for (const id of ids) {
                socket.join('watching-' + id);
            }            
        } catch (error) {
            console.error("Error while adding profile to watch:", error);
        }
    }
    
    // ----------------------------------------------------------------------------- //
    private removeProfileToWatch(socket: DefaultSocket, profileId: number[]): void
    {
        try {
            const ids = Array.isArray(profileId) ? profileId : [profileId];
            for (const id of ids) {
                socket.leave('watching-' + id);
            }            
        } catch (error) {
            console.error("Error while removing profile to watch:", error);
        }
    }

	// ----------------------------------------------------------------------------- //
	private handleDisconnect(socket: DefaultSocket)
	{
		this.sockets.delete(socket);

        this.matchMaker.removeUserFromMatchMaking(socket);

		const userId = Number(socket.data.getUserId());
        if (userId === -1)
            console.log(`Guest disconnected !`);
        else {
			const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
			const newCount = currentCount - 1;
            SocketEventController.connectedUsers.set(userId, newCount);

            if (newCount <= 0) {
                console.log(`User ${userId} disconnected !`);
				SocketEventController.connectedUsers.delete(userId);
                SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'offline' });
                SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'offline' });
			}
		}
		socket.data.disconnectOrLogout();
	}

	// ----------------------------------------------------------------------------- //
    private handleLogout(socket: DefaultSocket)
    {
        try {
            socket.rooms.forEach((room) => {
               room !== `${socket.id}` ? socket.leave(room) : null;
            });
            socket.data.disconnectOrLogout();
            const userId = socket.data.getUserId();
    
            if (!userId)
                return ;
            const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
            const newCount = currentCount - 1;
            SocketEventController.connectedUsers.set(userId, newCount);
    
            if (newCount <= 0) {
                console.log(`User ${userId} logged out !`);
                SocketEventController.connectedUsers.delete(userId);
                SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'offline' });
                SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'offline' });
            }            
        } catch (error) {
            console.error("Error while logging out user:", error);
        }
    }
}
