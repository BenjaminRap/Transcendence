import type { TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ServerMessage";
import type { DefaultSocket, ServerType } from "..";
import { error, success, type Result } from "@shared/utils";

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
		this._creator.once("ban-participant", (name : string) => this.banParticipant(name));
		this._creator.once("kick-participant", (name : string) => this.kickParticipant(name));
		this._creator.once("cancel-tournament", () => this.dispose());
		this._creator.join(this._tournamentId);
	}

	private	banParticipant(name : string)
	{
		this._bannedPlayers.add(name);
		const	socket = this._players.get(name);
		if (!socket)
			return ;
		this._players.delete(name);
		socket.emit("tournament-event", {type: "banned"});
		socket.leave(this._tournamentId);
	}

	private	kickParticipant(name : string)
	{
		const	socket = this._players.get(name);
		if (!socket)
			return ;
		this._players.delete(name);
		socket.emit("tournament-event", {type: "kicked"});
		socket.leave(this._tournamentId);
	}

	private start() : Result<null>
	{
		if (this._players.size < 2)
			return error("Not enough players !");
		this._creator.removeAllListeners("cancel-tournament");
		this._creator.removeAllListeners("ban-participant");
		this._creator.removeAllListeners("kick-participant");
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
		if (this._started === false)
		{
			this._players.forEach((player) => {
				player.emit("tournament-event", { type: "tournament-canceled" });
				player.removeAllListeners("leave-tournament");
				player.leave(this._tournamentId);
			});
			this._creator.removeAllListeners("start-tournament");
			this._creator.removeAllListeners("cancel-tournament");
			this._creator.removeAllListeners("ban-participant");
			this._creator.removeAllListeners("kick-participant");
		}
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

	public getDescriptionIfAvailable() : TournamentDescription | null
	{
		if (!this._settings.isPublic
			|| this._players.size === this._settings.maxPlayerCount)
			return null;
		return this.getDescription();
	}

	public addParticipant(socket : DefaultSocket) : Result<undefined>
	{
		if (this._started)
			return error("The tournament has already started !");
		if (this._players.size === this._settings.maxPlayerCount)
			return error("The tournament is already full !");
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
		socket.once("leave-tournament", () => {
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
				socket.leave(this._tournamentId);
			}
		});
		return success(undefined);
	}

	public getParticipantsNames() : string[]
	{
		return Array.from(this._players.keys());
	}
}
