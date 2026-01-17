import type { TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ServerMessage";
import type { DefaultSocket } from "..";
import type { DefaultEventsMap, Server } from "socket.io";
import { error, success, type Result } from "@shared/utils";

export class	ServerTournament
{
	private	_disposed = false;
	private _players = new Set<DefaultSocket>();
	private _tournamentId : TournamentId;
	private _started = false;

	constructor(
		private _onTournamentDispose : () => void,
		private readonly _settings : TournamentCreationSettings,
		private _io : Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
		private _creator : DefaultSocket
	)
	{
		this._tournamentId = crypto.randomUUID();
		this._creator.once("start-tournament", (ack : (success : Result<null>) => void) => {
			const	result = this.start();

			ack(result);
		});
		this._creator.once("cancel-tournament", () => this.dispose());
		this._creator.join(this._tournamentId);
	}

	private start() : Result<null>
	{
		if (this._players.size < 2)
			return error("Not enough players !");
		this._creator.removeAllListeners("cancel-tournament");
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
				player.emit("tournament-canceled");
				player.removeAllListeners("leave-tournament");
				player.leave(this._tournamentId);
			});
			this._creator.removeAllListeners("start-tournament");
			this._creator.removeAllListeners("cancel-tournament");
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

		this._players.add(socket);
		this._io.to(this._tournamentId).emit("add-participant", profile);
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
				this._io.to(this._tournamentId).emit("remove-participant", profile);
				this._players.delete(socket);
				socket.leave(this._tournamentId);
			}
		});
		return success(undefined);
	}

	public getParticipantsProfiles()
	{
		return [...this._players].map((value) => value.data.getProfile());
	}
}
