import { error, success } from "../../../shared/utils.js";
import { Tournament } from "../../../shared/Tournament.js";
import { Room } from "./Room.js";
export class ServerTournament extends Tournament {
    constructor(_onTournamentDispose, _settings, _io, _creator) {
        super();
        this._onTournamentDispose = _onTournamentDispose;
        this._settings = _settings;
        this._io = _io;
        this._creator = _creator;
        this._disposed = false;
        this._players = new Map();
        this._bannedPlayers = new Set();
        this._started = false;
        this._rooms = new Set();
        this._tournamentId = crypto.randomUUID();
        this._creator.once("start-tournament", (ack) => {
            const result = this.start();
            ack(result);
        });
        this._creator.once("cancel-tournament", () => this.dispose());
        this._creator.on("ban-participant", (name) => this.banParticipant(name));
        this._creator.on("kick-participant", (name) => this.kickParticipant(name));
        this._creator.join(this._tournamentId);
    }
    banParticipant(name) {
        if (this._started)
            return;
        const socket = this._players.get(name);
        if (!socket || socket === this._creator)
            return;
        this._bannedPlayers.add(name);
        socket.emit("tournament-event", { type: "banned" });
        this.removePlayerFromTournament(socket);
        console.log(`${name} has been banned from the ${this._settings.name} tournament !`);
    }
    kickParticipant(name) {
        if (this._started)
            return;
        const socket = this._players.get(name);
        if (!socket || socket === this._creator)
            return;
        socket.emit("tournament-event", { type: "kicked" });
        this.removePlayerFromTournament(socket);
        console.log(`${name} has been kicked from the ${this._settings.name} tournament !`);
    }
    removeCreatorEvents() {
        this._creator.removeAllListeners("start-tournament");
        this._creator.removeAllListeners("cancel-tournament");
        this._creator.removeAllListeners("ban-participant");
        this._creator.removeAllListeners("kick-participant");
    }
    start() {
        if (this._players.size < 2)
            return error("Not enough players !");
        this.removeCreatorEvents();
        if (!this._players.has(this._creator.data.getProfile().name))
            this._creator.leave(this._tournamentId);
        this._started = true;
        console.log(`${this._settings.name} tournament started !`);
        this._io.to(this._tournamentId).emit("tournament-event", { type: "tournament-start" });
        this.setParticipants([...this._players.values()]);
        this.createMatches();
        return success(null);
    }
    dispose() {
        if (this._disposed)
            return;
        console.log(`${this._settings.name} tournamend end`);
        this._disposed = true;
        if (!this._started)
            this._io.to(this._tournamentId).emit("tournament-event", { type: "tournament-canceled" });
        this._players.forEach((player) => {
            player.removeAllListeners("leave-tournament");
            player.leave(this._tournamentId);
            player.data.leaveTournament();
        });
        this._creator.leave(this._tournamentId);
        this._creator.data.leaveTournament();
        this.removeCreatorEvents();
        this._onTournamentDispose();
    }
    canJoinTournament(socket) {
        if (this._started)
            return error("The tournament has already started !");
        if (this._players.size === this._settings.maxPlayerCount)
            return error("The tournament is already full !");
        if (!socket.data.isConnected() && !this._settings.acceptGuests)
            return error("The tournament doesn't accept guests, you must log to your account !");
        const profile = socket.data.getProfile();
        if (this._bannedPlayers.has(profile.name))
            return error("You have been banned from this tournament !");
        return success(undefined);
    }
    addParticipant(socket) {
        const canJoinTournament = this.canJoinTournament(socket);
        if (!canJoinTournament.success)
            return canJoinTournament;
        const profile = socket.data.getProfile();
        this._players.set(profile.name, socket);
        this._io.to(this._tournamentId).emit("tournament-event", {
            type: "add-participant",
            name: profile.name,
            isCreator: profile === this._creator.data.getProfile()
        });
        socket.join(this._tournamentId);
        socket.data.joinTournament(this);
        socket.once("leave-tournament", () => this.removePlayerFromTournament(socket));
        return success(undefined);
    }
    removePlayerFromTournament(socket) {
        const profile = socket.data.getProfile();
        const isCreator = socket === this._creator;
        this._players.delete(profile.name);
        socket.removeAllListeners("leave-tournament");
        if (!this._started) {
            this._io.to(this._tournamentId).emit("tournament-event", {
                type: "remove-participant",
                name: profile.name
            });
        }
        if (this._started || !isCreator) {
            socket.data.leaveTournament();
            socket.leave(this._tournamentId);
        }
    }
    onParticipantLose(loser) {
        loser.emit("tournament-event", { type: "lose" });
    }
    onQualificationsEnd(qualified) {
        this._io.to(this._tournamentId).emit("tournament-event", {
            type: "tournament-gui-create",
            qualified: qualified.map(socket => socket.data.getProfile())
        });
    }
    onTournamentEnd(winner) {
        winner.emit("tournament-event", { type: "win", winner: winner.data.getProfile() });
        this.dispose();
    }
    onTournamentShow() {
        this._io.to(this._tournamentId).emit("tournament-event", {
            type: "show-tournament"
        });
    }
    onNewMatches() {
        this._currentMatches.forEach(match => {
            const left = match.left?.profile;
            const right = match.right?.profile;
            if (match.winner !== undefined
                || left?.data.getState() !== "tournament-waiting"
                || right?.data.getState() !== "tournament-waiting")
                return;
            const room = new Room(this._io, endData => {
                this._rooms.delete(room);
                match.setWinner(endData);
                this.onNewMatches();
                this.onMatchEnd(match);
            }, left, right);
            this._rooms.add(room);
        });
    }
    setRoundWinners(round, matches) {
        this._io.to(this._tournamentId).emit("tournament-event", {
            type: "tournament-gui-set-winners",
            round: round,
            matches: matches.map(match => ({
                winner: match.winner ? {
                    profile: match.winner.profile.data.getProfile(),
                    score: match.winner.score
                } : undefined,
                winnerSide: match.winnerSide
            }))
        });
    }
    getDescription() {
        return {
            name: this._settings.name,
            currentPlayerCount: this._players.size,
            maxPlayerCount: this._settings.maxPlayerCount,
            id: this._tournamentId
        };
    }
    getDescriptionIfAvailable(socket) {
        if (!this._settings.isPublic || !this.canJoinTournament(socket).success)
            return null;
        return this.getDescription();
    }
    getParticipantsNames() {
        return Array.from(this._players.keys());
    }
    onSocketDisconnect(socket) {
        if (socket === this._creator && !this._started)
            this.dispose();
        else
            this.removePlayerFromTournament(socket);
    }
}
