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
        try {
            if (SocketEventController.socketInstance) {
                SocketEventController.socketInstance.io.to('user-' + userId).emit(event, data);
            }
        }
        catch (error) {
            console.warn(`Error sending socket event to user ${userId} :`, error);
        }
    }
    // send message to all users watching a specific profile
    // ----------------------------------------------------------------------------- //
    static sendToProfileWatchers(userId, event, data) {
        SocketEventController.socketInstance.io.to('watching-' + userId).emit(event, data);
    }
    // send message to all friends of a specific user
    // ----------------------------------------------------------------------------- //
    static sendToFriends(userId, event, data) {
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
    // Auth middleware for socket.io new connections
    // ----------------------------------------------------------------------------- //
    async initMiddleware() {
        this.io.use(async (socket, next) => {
            const token = socket.handshake.auth.token;
            // guest user
            if (!token) {
                socket.data.userId = -1;
                return next();
            }
            try {
                const tokenManager = Container.getInstance().getService('TokenManager');
                const decoded = await tokenManager.verify(token, false);
                socket.data.userId = decoded.userId;
                next();
            }
            catch (err) {
                socket.data.userId = -1;
                socket.data.authError = true;
                return next();
            }
        });
    }
    // ----------------------------------------------------------------------------- //
    async initSocket() {
        this.initMiddleware();
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
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
                this.handleGetStatus(socket, callback);
            });
            socket.on("watch-profile", (profileId) => {
                this.addProfileToWatch(socket, profileId);
            });
            socket.on("unwatch-profile", (profileId) => {
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
        const userId = socket.data.userId;
        socket.data = new SocketData(socket, userId);
        if (userId == -1) {
            if (socket.data.authError)
                console.log("Socket connection with invalid token !\nConnected as Guest.");
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
    handleGetTournaments(socket, ack) {
        const descriptions = getPublicTournamentsDescriptions(socket);
        ack(descriptions);
    }
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
        const userId = socket.data.userId;
        // decompte ne nb de connexion du user (plusieurs onglets...)
        if (userId != -1) {
            const currentCount = SocketEventController.connectedUsers.get(userId) || 0;
            const newCount = currentCount - 1;
            console.log(`User ${userId} disconnected !`);
            if (newCount <= 0) {
                SocketEventController.connectedUsers.delete(userId);
                this.io.emit('user-status-change', { userId: userId, status: 'offline' });
            }
            else {
                SocketEventController.connectedUsers.set(userId, newCount);
            }
        }
    }
}
