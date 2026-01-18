import type { TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ServerMessage";
import type { DefaultSocket, ServerType } from "..";
import { error, success, type Result } from "@shared/utils";
import type { SocketData } from "./SocketData";

export class	ServerTournament
{
	private	_disposed = false;
	private _players = new Map<string, DefaultSocket>();
	private _bannedPlayers = new Set<string>();
	private _tournamentId : TournamentId;
	private _started = false;

	constructor(
		private _onTournamentDispose : () => void,
		private readonly _settings : TournamentCreationSettings,
		private _io : ServerType,
		private _creator : DefaultSocket
	)
	{
		this._tournamentId = crypto.randomUUID();
		this._creator.once("start-tournament", (ack : (success : Result<null>) => void) => {
			const	result = this.start();

			ack(result);
		});
		this._creator.once("cancel-tournament", () => this.dispose());
		this._creator.on("ban-participant", (name : string) => this.banParticipant(name));
		this._creator.on("kick-participant", (name : string) => this.kickParticipant(name));
		this._creator.join(this._tournamentId);
	}

	private	banParticipant(name : string)
	{
		const	socket = this._players.get(name);

		if (socket == this._creator)
			return ;
		this._bannedPlayers.add(name);
		if (!socket)
			return ;
		this._players.delete(name);
		socket.emit("tournament-event", {type: "banned"});
		socket.leave(this._tournamentId);
		this._io.to(this._tournamentId).emit("tournament-event", {
			type: "remove-participant",
			name: name
		});
		socket.removeAllListeners("leave-tournament");
		socket.data.leaveTournament();
		console.log(`${name} has been banned from the ${this._settings.name} tournament !`);
	}

	private	kickParticipant(name : string)
	{
		const	socket = this._players.get(name);
		if (!socket || socket === this._creator)
			return ;
		this._players.delete(name);
		socket.emit("tournament-event", {type: "kicked"});
		socket.leave(this._tournamentId);
		this._io.to(this._tournamentId).emit("tournament-event", {
			type: "remove-participant",
			name: name
		});
		socket.removeAllListeners("leave-tournament");
		socket.data.leaveTournament();
		console.log(`${name} has been kicked from the ${this._settings.name} tournament !`);
	}

	private	removeCreatorEvents()
	{
		this._creator.removeAllListeners("start-tournament");
		this._creator.removeAllListeners("cancel-tournament");
		this._creator.removeAllListeners("ban-participant");
		this._creator.removeAllListeners("kick-participant");
	}

	private start() : Result<null>
	{
		if (this._players.size < 2)
			return error("Not enough players !");
		this.removeCreatorEvents();
		this._started = true;
		console.log(`${this._settings.name} tournament started !`);
		return success(null);
	}

	public dispose()
	{
		if (this._disposed)
			return ;
		console.log(`${this._settings.name} tournamend end`);
		this._disposed = true;
		this._players.forEach((player) => {
			if (this._started === false)
				player.emit("tournament-event", { type: "tournament-canceled" });
			player.removeAllListeners("leave-tournament");
			player.leave(this._tournamentId);
			player.data.leaveTournament();
		});
		this._creator.leave(this._tournamentId);
		this.removeCreatorEvents();
		this._onTournamentDispose();
	}

	public getDescription() : TournamentDescription
	{
		return {
			name: this._settings.name,
			currentPlayerCount: this._players.size,
			maxPlayerCount: this._settings.maxPlayerCount,
			id: this._tournamentId
		}
	}

	public getDescriptionIfAvailable(askingSocketData: SocketData) : TournamentDescription | null
	{
		const	isTournamentPrivate = !this._settings.isPublic;
		const	isTournamentFull = this._players.size === this._settings.maxPlayerCount;
		const	isInvalidGuest = !askingSocketData.isConnected() && !this._settings.acceptGuests;
		const	isBanned = this._bannedPlayers.has(askingSocketData.getProfile().name);

		if (isTournamentPrivate || isTournamentFull || isInvalidGuest || isBanned)
			return null;
		return this.getDescription();
	}

	public addParticipant(socket : DefaultSocket) : Result<undefined>
	{
		if (this._started)
			return error("The tournament has already started !");
		if (this._players.size === this._settings.maxPlayerCount)
			return error("The tournament is already full !");
		if (!socket.data.isConnected() && !this._settings.acceptGuests)
			return error("The tournament doesn't accept guests, you must log to your account !");
		const	profile = socket.data.getProfile();

		if (this._bannedPlayers.has(profile.name))
			return error("You have been banned from this tournament !");

		this._players.set(profile.name, socket);
		this._io.to(this._tournamentId).emit("tournament-event", {
            type: "add-participant",
			name: profile.name,
			isCreator: profile === this._creator.data.getProfile()
        });
		socket.join(this._tournamentId);
		socket.data.joinTournament(this);
		socket.once("leave-tournament", () => {
			socket.data.leaveTournament();
			console.log(`${socket.data.getProfile().name} leaved tournament ${this._settings.name}`);
			if (this._started)
			{
				console.log("leave matchamking that has started");
				socket.leave(this._tournamentId);
			}
			else
			{
				this._io.to(this._tournamentId).emit("tournament-event", {
					type: "remove-participant",
					name: profile.name
				});
				this._players.delete(profile.name);
				if (socket !== this._creator)
					socket.leave(this._tournamentId);
			}
		});
		return success(undefined);
	}

	public getParticipantsNames() : string[]
	{
		return Array.from(this._players.keys());
	}

	public onSocketDisconnect(socket : DefaultSocket)
	{
		socket.data.leaveTournament();
		if (!this._started)
		{
			if (socket === this._creator)
				this.dispose();
			else
			{
				const	name = socket.data.getProfile().name;

				this._io.to(this._tournamentId).emit("tournament-event", {
					type: "remove-participant",
					name: name
				});
				this._players.delete(name);
			}
		}
	}
}
