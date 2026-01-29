import { MatchMaker } from "../pong/MatchMaker.js";
import { type DefaultEventsMap, Server, Socket } from 'socket.io';
import { SocketData, type SocketState } from '../pong/SocketData';
import { Container } from "../container/Container.js";
import { TokenManager } from "../utils/TokenManager.js";
import type { FriendService } from "../services/FriendService.js";
import type { ServerType } from "../index.js";
import { getPublicTournamentsDescriptions, TournamentMaker } from "../pong/TournamentMaker.js";
import { type FriendProfile, type Profile, type TournamentCreationSettings, type TournamentDescription, type TournamentId } from "@shared/ZodMessageType.js";
import { error, success, type Result } from "@shared/utils.js";
import { areParametersValid, type ClientMessage, type ClientToServerEvents } from "@shared/ClientMessageHelpers.js";
import type { ServerMessage, ServerToClientEvents } from "@shared/ServerMessageHelpers.js";

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
	private static connectedUsers = new Map<number, Set<SocketData>>();
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
	static sendToUser<T extends ServerMessage>(userId: number, event: T, ...data: Parameters<ServerToClientEvents[T]>): void
	{
        if (!userId) {
            // console.log(`Cannot send event "${event}" to invalid user ID: ${userId}`);
            return;
        }

        try {
            if (SocketEventController.socketInstance) {
                SocketEventController.socketInstance.io.to('user-' + Number(userId)).emit(event, ...data);
            }
        } catch (error) {
            console.warn(`\nFailed to emit event "${event}" to user ${userId} :`, error);
        }			
	}

    // send message to all users watching a specific profile
    // ----------------------------------------------------------------------------- //
    static sendToProfileWatchers<T extends ServerMessage>(userId: number, event: T, ...data: Parameters<ServerToClientEvents[T]>): void
    {
        if (!userId) return;

        try {
            if (SocketEventController.socketInstance) {
                // console.log(`Emitting event "${event}" to watchers of profile ${userId} with data: `, data);
                SocketEventController.socketInstance.io.to('watching-' + Number(userId)).emit(event, ...data);
            }
        } catch (error) {
            console.warn(`\nFailed to emit event "${event}" to watchers of profile ${userId} :`, error);
        }
    }

    // send message to all friends of a specific user
    // ----------------------------------------------------------------------------- //
    static async sendToFriends<T extends ServerMessage>(userId: number, event: T, ...data: Parameters<ServerToClientEvents[T]>): Promise<void>
    {
        if (!userId) {
            return;
        }

        try {
            if (SocketEventController.socketInstance)
            {
                await SocketEventController.socketInstance.friendService.getFriendsIds(userId)
                    .then((friendsIds: number[]) => {
                        friendsIds.forEach((friendId) => {
                            // console.log(`Emitting event "${event}" to friend ${friendId}`); 
                            SocketEventController.sendToUser(friendId, event, ...data);
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
    static notifyProfileChange<T extends "profile-update" | "account-deleted">(id: number | null, event: T, ...data: Parameters<ServerToClientEvents[T]>): void
    {
        if (!id || id < 0) return;
        SocketEventController.sendToUser(id, event, ...data);
        SocketEventController.sendToFriends(id, event, ...data);
        SocketEventController.sendToProfileWatchers(id, event, ...data);
    }

    // check if a user is online
    // ----------------------------------------------------------------------------- //
    static isUserOnline(userId: number): boolean {
        if (!userId || userId < 0) return false;
        return SocketEventController.connectedUsers.has(userId);
    }

	static disconnectSocketToUser(socket : DefaultSocket) {
		const	userId = socket.data.getUserId();

		if (!userId)
			return ;
		socket.data.disconnectOrLogout();
		const	userSocketDatas = SocketEventController.connectedUsers.get(userId);

		if (!userSocketDatas)
			return ;
		userSocketDatas.delete(socket.data);
		if (userSocketDatas.size === 0)
		{
			SocketEventController.connectedUsers.delete(userId);
            SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'offline' });
            SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'offline' });
		}
        socket.leave('user-' + userId);
        console.log(`User ${userId} logged out and leaved his own socket room !`);
	}

	static connectSocketToUser(socket : DefaultSocket, user : FriendProfile) {
		socket.data.authenticate(user.id, user.username, user.avatar)
		let	userSocketDatas = SocketEventController.connectedUsers.get(user.id);

		if (!userSocketDatas)
		{
			userSocketDatas = new Set<SocketData>();
			SocketEventController.connectedUsers.set(user.id, userSocketDatas);
            SocketEventController.sendToProfileWatchers(user.id, 'user-status-change', { userId: user.id, status: 'online' });
            SocketEventController.sendToFriends(user.id, 'user-status-change', { userId: user.id, status: 'online' });
		}
		userSocketDatas.add(socket.data);
        socket.join('user-' + user.id);
        console.log(`User ${user.id} authenticated and joined his own socket room !`);
	}

	static getUserState(data : SocketData) : SocketState {
		const	userId = data.getUserId();

		if (!userId)
			return data.getState();
		const	user = SocketEventController.connectedUsers.get(userId);
		if (!user)
			return data.getState();
		for (const socketData of user)
		{
			const	state = socketData.getState();

			if (state !== "unactive")
				return state;
		}
		return "unactive";
	}

    // ==================================== PRIVATE ==================================== //
	
	// ----------------------------------------------------------------------------- //
	private async initSocket()
	{
		this.io.on('connection', (socket : DefaultSocket) => {
			this.handleConnection(socket);

            SocketEventController.on(socket, "authenticate", (data: { token: string }, ack: (result: Result<null>) => void) => {
                this.handleAuthenticate(socket, data.token, ack);
            });

			SocketEventController.on(socket, "get-tournaments", (ack : (descriptions : Result<TournamentDescription[]>) => void) => {
				this.handleGetTournaments(socket, ack);
			});

			SocketEventController.on(socket, "join-tournament", (tournamentId : TournamentId, ack: (participants : Result<Profile[]>) => void) => {
				this.handleJoinTournament(socket, tournamentId, ack);
			});

			SocketEventController.on(socket, "create-tournament", (settings : TournamentCreationSettings, ack : (tournamentId : Result<string>) => void) => {
				this.handleCreateTournament(socket, settings, ack);
			});

			SocketEventController.on(socket, "join-matchmaking", (ack: (data: Result<null>) => void) => {
				this.handleMatchMakingRequest(socket, ack);
			});

            SocketEventController.on(socket, "get-online-users", (callback) => {
				this.handleGetStatus(callback);
            });

            SocketEventController.on(socket, "watch-profile", (profileId: number[]) => {
                this.addProfileToWatch(socket, profileId);
            });

            SocketEventController.on(socket, "unwatch-profile", (profileId: number[]) => {
                this.removeProfileToWatch(socket, profileId);
            });

            SocketEventController.on(socket, "logout", () => {
                this.handleLogout(socket);
            });

			socket.once("disconnect", () => {
				this.handleDisconnect(socket);
			});
		});
	}

	private static runCallbackIfValid<T extends ClientMessage>(socket : DefaultSocket, event : T, callback : ClientToServerEvents[T], args : any[])
	{
		if (areParametersValid(event, args))
			callback(...args);
		else
		{
			socket.emit("force-disconnect", "client error");
			socket.disconnect();
			console.log(`Client ${socket.data.getProfile().shownName} sent wrong data in event : ${event}`);
		}
	}

	public static on<T extends ClientMessage>(socket : DefaultSocket, event : T, callback : ClientToServerEvents[T])
	{
		socket.on(event as any, (...args : any[]) => {
			SocketEventController.runCallbackIfValid(socket, event, callback, args);
		});
	}

	public static once<T extends ClientMessage>(socket : DefaultSocket, event : T, callback : ClientToServerEvents[T])
	{
		socket.once(event as any, (...args : any[]) => {
			SocketEventController.runCallbackIfValid(socket, event, callback, args);
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
        let userId: number;

        try {
            const decoded = await this.tokenManager.verify(token, false);
            userId = Number(decoded.userId);

            const user = await this.friendService.getById(userId);
            if (!user) {
                ack(error("User not found"));
                return;
            }
			SocketEventController.connectSocketToUser(socket, user);
        } catch (err) {
            ack(error("Invalid token"));
            return;
        }
        ack(success(null));
    }

	// ----------------------------------------------------------------------------- //
	private handleGetTournaments(socket : DefaultSocket, ack : (descriptions : Result<TournamentDescription[]>) => void)
	{
		const descriptions = getPublicTournamentsDescriptions(socket);

		ack(descriptions);
	}

    // ----------------------------------------------------------------------------- //
	private	handleCreateTournament(socket : DefaultSocket, settings : TournamentCreationSettings, ack : (tournamentId : Result<string>) => void)
	{
		const	tournament = this.tournamentMaker.createTournament(settings, socket);

		if (!tournament.success)
		{
			ack(tournament);
			return ;
		}
		const	description = tournament.value.getDescription();

		ack(success(description.id));
	}

    // ----------------------------------------------------------------------------- //	
	private	handleJoinTournament(socket : DefaultSocket, tournamentId : TournamentId, ack: (participants : Result<Profile[]>) => void)
	{
			const	tournament = this.tournamentMaker.joinTournament(tournamentId, socket);

			if (!tournament.success)
			{
				ack(tournament);
				return ;
			}
			ack(success(tournament.value.getParticipants()));
	}

	// ----------------------------------------------------------------------------- //
	private handleGetStatus(callback: (onlineUsers: number[]) => void)
	{
		callback(Array.from(SocketEventController.connectedUsers.keys()));
	}

	// ----------------------------------------------------------------------------- //
	private async handleMatchMakingRequest(socket: DefaultSocket, ack: (data: Result<null>) => void)
	{
		console.log("try-join-matchmaking");

		ack(this.matchMaker.addUserToMatchMaking(socket));
	}	

	// ----------------------------------------------------------------------------- //
    private addProfileToWatch(socket: DefaultSocket, profileId: number[]): void
    {
        try {
            const ids = Array.isArray(profileId) ? profileId : [profileId];
            // console.log("Adding to watch profiles:", ids);
            for (const id of ids) {
                socket.join('watching-' + Number(id));
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
            // console.log("Removing from watch profiles:", ids);
            for (const id of ids) {
                socket.leave('watching-' + Number(id));
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
		SocketEventController.disconnectSocketToUser(socket);
		socket.data.disconnectOrLogout();
		console.log(`Socket disconnected !`);
	}

	// ----------------------------------------------------------------------------- //
    private handleLogout(socket: DefaultSocket)
    {
        socket.rooms.forEach((room) => {
           room !== `${socket.id}` ? socket.leave(room) : null;
        });
		SocketEventController.disconnectSocketToUser(socket);
    }
}
