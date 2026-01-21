import { MatchMaker } from "../pong/MatchMaker.js";
import { Server, Socket } from 'socket.io';
import { SocketData } from '../pong/SocketData.js';
import { Container } from "../container/Container.js";
import { TokenManager } from "../utils/TokenManager.js";
import { getPublicTournamentsDescriptions, TournamentMaker } from "../pong/TournamentMaker.js";
import { zodTournamentCreationSettings } from "../../../shared/ServerMessage.js";
import { error, success } from "../../../shared/utils.js";
export class SocketEventController {
    constructor(io) {
        this.io = io;
        this.matchMaker = new MatchMaker(io);
        this.sockets = new Set();
        this.tournamentMaker = new TournamentMaker(io);
        this.initSocket();
    }
    static { this.connectedUsers = new Map(); }
    // =================================== STATIC ==================================== //
    // ----------------------------------------------------------------------------- //
    static initInstance(io) {
        if (!SocketEventController.socketInstance) {
            SocketEventController.socketInstance = new SocketEventController(io);
        }
    }
    // send message to a specific user
    // ----------------------------------------------------------------------------- //
    static sendToUser(userId, event, data) {
        console.log(`\nSending event ${event} to user ${userId}`);
        try {
            if (SocketEventController.socketInstance) {
                SocketEventController.socketInstance.io.to('user-' + Number(userId)).emit(event, data);
            }
        }
        catch (error) {
            console.warn(`Error sending socket event to user ${userId} :`, error);
        }
    }
    // send message to all users watching a specific profile
    // ----------------------------------------------------------------------------- //
    static sendToProfileWatchers(userId, event, data) {
        console.log(`\nSending event ${event} to watchers of profile ${userId}`);
        SocketEventController.socketInstance.io.to('watching-' + userId).emit(event, data);
    }
    // send message to all friends of a specific user
    // ----------------------------------------------------------------------------- //
    static sendToFriends(userId, event, data) {
        console.log(`\nSending event ${event} to friends of user ${userId}`);
        try {
            if (SocketEventController.socketInstance) {
                const friendService = Container.getInstance().getService('FriendService');
                friendService.getFriendsIds(userId).then((friendsIds) => {
                    friendsIds.forEach((friendId) => {
                        SocketEventController.sendToUser(friendId, event, data);
                    });
                }).catch((error) => {
                    console.warn(`Error retrieving friends of user ${userId} :`, error);
                });
            }
        }
        catch (error) {
            console.warn(`Error sending socket event to friends of user ${userId} :`, error);
        }
    }
    // notify profile change to user, friends and watchers
    // ----------------------------------------------------------------------------- //
    static notifyProfileChange(id, event, data) {
        SocketEventController.sendToUser(id, event, data);
        SocketEventController.sendToFriends(id, event, data);
        SocketEventController.sendToProfileWatchers(id, event, data);
    }
    // check if a user is online
    // ----------------------------------------------------------------------------- //
    static isUserOnline(userId) {
        return SocketEventController.connectedUsers.has(userId);
    }
    // ==================================== PRIVATE ==================================== //
    // ----------------------------------------------------------------------------- //
    async initSocket() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
            socket.once("authenticate", (data, ack) => {
                this.handleAuthenticate(socket, data.token, ack);
            });
            socket.on("get-tournaments", (ack) => {
                this.handleGetTournaments(socket, ack);
            });
            socket.on("join-tournament", (tournamentId, ack) => {
                this.handleJoinTournament(socket, tournamentId, ack);
            });
            socket.on("create-tournament", (data, ack) => {
                this.handleCreateTournament(socket, data, ack);
            });
            socket.on("join-matchmaking", () => {
                this.handleMatchMakingRequest(socket);
            });
            socket.on("get-online-users", (callback) => {
                console.log(`${socket.data.userId} requested online users list`);
                this.handleGetStatus(socket, callback);
            });
            socket.on("watch-profile", (profileId) => {
                console.log(`${socket.data.userId} is watching profiles: `, profileId);
                this.addProfileToWatch(socket, profileId);
            });
            socket.on("unwatch-profile", (profileId) => {
                console.log(`${socket.data.userId} stopped watching profiles: `, profileId);
                this.removeProfileToWatch(socket, profileId);
            });
            socket.once("disconnect", () => {
                this.handleDisconnect(socket);
            });
        });
    }
    // ----------------------------------------------------------------------------- //
    async handleConnection(socket) {
        this.sockets.add(socket);
        socket.data = new SocketData(socket, -1);
        console.log(`Guest connected !`);
    }
    // ----------------------------------------------------------------------------- //
    async handleAuthenticate(socket, token, ack) {
        // guest user
        if (!token) {
            socket.data.userId = -1;
            ack(error("No token provided"));
            return;
        }
        let userId;
        try {
            const tokenManager = Container.getInstance().getService('TokenManager');
            const decoded = await tokenManager.verify(token, false);
            userId = Number(decoded.userId);
            socket.data.userId = userId;
        }
        catch (err) {
            ack(error("Invalid token"));
            return;
        }
        ack(success(null));
        // system to count multiple connections from the same user
        const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
        const newCount = currentCount + 1;
        console.log(`User ${userId} connected, total connections: ${newCount}\n`);
        SocketEventController.connectedUsers.set(userId, newCount);
        socket.join('user-' + userId);
        console.log(`User ${userId} authenticated and joined his own socket room !`);
        // notifie watchers and friends only if it's the first connection of the user
        if (newCount === 1) {
            SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'online' });
            SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'online' });
        }
        console.log("user connected actually : ", SocketEventController.connectedUsers);
    }
    // ----------------------------------------------------------------------------- //
    handleGetTournaments(socket, ack) {
        const descriptions = getPublicTournamentsDescriptions(socket);
        ack(descriptions);
    }
    // ----------------------------------------------------------------------------- //
    handleCreateTournament(socket, data, ack) {
        const parsed = zodTournamentCreationSettings.safeParse(data);
        if (!parsed.success) {
            ack(error("Invalid Data !"));
            return;
        }
        const tournament = this.tournamentMaker.createTournament(parsed.data, socket);
        if (!tournament.success) {
            ack(tournament);
            return;
        }
        const description = tournament.value.getDescription();
        console.log(`tournament created : ${description.name}`);
        ack(success(description.id));
    }
    // ----------------------------------------------------------------------------- //	
    handleJoinTournament(socket, tournamentId, ack) {
        const tournament = this.tournamentMaker.joinTournament(tournamentId, socket);
        if (!tournament.success) {
            ack(tournament);
            return;
        }
        console.log(`${socket.data.getProfile().name} joined the ${tournament.value.getDescription().name} tournament`);
        ack(success(tournament.value.getParticipantsNames()));
    }
    // ----------------------------------------------------------------------------- //
    // demander la liste des ids des users en ligne
    // renvoyer les ids des users connectes qui correspondent a des ids de la liste demandee
    handleGetStatus(socket, callback) {
        if (typeof callback === 'function') {
            callback(Array.from(SocketEventController.connectedUsers.keys()));
        }
    }
    // ----------------------------------------------------------------------------- //
    handleMatchMakingRequest(socket) {
        console.log("try-join-matchmaking");
        this.matchMaker.addUserToMatchMaking(socket);
    }
    // ----------------------------------------------------------------------------- //
    addProfileToWatch(socket, profileId) {
        for (const id of profileId) {
            socket.join('watching-' + id);
        }
    }
    // ----------------------------------------------------------------------------- //
    removeProfileToWatch(socket, profileId) {
        for (const id of profileId) {
            socket.leave('watching-' + id);
        }
    }
    // ----------------------------------------------------------------------------- //
    handleDisconnect(socket) {
        this.sockets.delete(socket);
        // clean MatchMaking
        // attention, le joueur peut ne jamais avoir demande a rejoindre le matchmaking
        this.matchMaker.removeUserFromMatchMaking(socket);
        // clean socket data
        socket.data.disconnect();
        const userId = Number(socket.data.userId);
        if (userId === -1)
            console.log(`Guest disconnected !`);
        else {
            // decompte ne nb de connexion du user (plusieurs onglets...)
            const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
            console.log(`User ${userId} disconnected, remaining connections: ${currentCount - 1}`);
            const newCount = currentCount - 1;
            if (newCount <= 0) {
                console.log(`User ${userId} disconnected !`);
                SocketEventController.connectedUsers.delete(userId);
                SocketEventController.sendToProfileWatchers(userId, 'user-status-change', { userId: userId, status: 'offline' });
                SocketEventController.sendToFriends(userId, 'user-status-change', { userId: userId, status: 'offline' });
            }
            SocketEventController.connectedUsers.set(userId, newCount);
        }
    }
}
