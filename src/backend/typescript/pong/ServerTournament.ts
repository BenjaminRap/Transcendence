import type { TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ServerMessage";
import type { ServerType } from "..";
import { error, success, type Result } from "@shared/utils";
import { Tournament } from "@shared/Tournament";
import type { Match } from "@shared/Match";
import { Room } from "./Room";
import type { DefaultSocket } from "../controllers/SocketEventController";

export class	ServerTournament extends Tournament<DefaultSocket>
{
	private	_state : "creation" | "waiting-ready" | "started" | "disposed" = "creation";
	private _players = new Map<string, DefaultSocket>();
	private _bannedPlayers = new Set<string>();
	private _tournamentId : TournamentId;
	private _rooms = new Set<Room>();
	private _socketReadyCount = 0;

	constructor(
		private _onTournamentDispose : () => void,
		private readonly _settings : TournamentCreationSettings,
		private _io : ServerType,
		private _creator : DefaultSocket
	)
	{
		super();
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
		if (this._state !== "creation")
			return ;
		const	socket = this._players.get(name);

		if (!socket || socket === this._creator)
			return ;
		this._bannedPlayers.add(name);
		socket.emit("tournament-event", {type: "banned"});
		this.removePlayerFromTournament(socket);
		console.log(`${name} has been banned from the ${this._settings.name} tournament !`);
	}

	private	kickParticipant(name : string)
	{
		if (this._state !== "creation")
			return ;
		const	socket = this._players.get(name);
		if (!socket || socket === this._creator)
			return ;
		socket.emit("tournament-event", {type: "kicked"});
		this.removePlayerFromTournament(socket);
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
		if (!this._players.has(this._creator.data.getProfile().name))
			this._creator.leave(this._tournamentId);
		this._state = "waiting-ready";
		console.log(`${this._settings.name} tournament started !`);
		this._io.to(this._tournamentId).emit("tournament-event", {type:"tournament-start"});
		this._players.forEach(socket => {
			socket.data.ready = false;
			socket.once("ready", () => {
				socket.data.ready = true;
				this._socketReadyCount++;
				this.startMatchesIfReady();
			});
		});
		return success(null);
	}

	startMatchesIfReady()
	{
		if (this._socketReadyCount === this._players.size)
		{
			this.setParticipants([...this._players.values()]);
			this.createMatches();
			this._state = "started";
		}
	}

	public dispose()
	{
		if (this._state === "disposed")
			return ;
		super.dispose();
		console.log(`${this._settings.name} tournamend end`);
		if (this._state === "creation")
			this._io.to(this._tournamentId).emit("tournament-event", { type: "tournament-canceled" })
		this._state = "disposed";
		this._players.forEach((player) => {
			player.removeAllListeners("leave-tournament");
			player.removeAllListeners("ready");
			player.leave(this._tournamentId);
			player.data.leaveTournament();
		});
		this._creator.leave(this._tournamentId);
		this._creator.data.leaveTournament();
		this.removeCreatorEvents();
		this._onTournamentDispose();
	}
	
	private	canJoinTournament(socket : DefaultSocket)
	{
		if (this._state !== "creation")
			return error("The tournament has already started !");
		if (this._players.size === this._settings.maxPlayerCount)
			return error("The tournament is already full !");
		if (!socket.data.isConnected() && !this._settings.acceptGuests)
			return error("The tournament doesn't accept guests, you must log to your account !");
		const	profile = socket.data.getProfile();

		if (this._bannedPlayers.has(profile.name))
			return error("You have been banned from this tournament !");
		return success(undefined);
	}

	public addParticipant(socket : DefaultSocket) : Result<undefined>
	{
		const	canJoinTournament = this.canJoinTournament(socket);

		if (!canJoinTournament.success)
			return canJoinTournament;
		const	profile = socket.data.getProfile();

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

	private	removePlayerFromTournament(socket : DefaultSocket)
	{
		const	profile = socket.data.getProfile();
		const	isCreator = socket === this._creator;

		this._players.delete(profile.name);
		socket.removeAllListeners("leave-tournament");
		socket.removeAllListeners("ready");
		if (this._state === "creation")
		{
			this._io.to(this._tournamentId).emit("tournament-event", {
				type: "remove-participant",
				name: profile.name
			});
		}
		if (this._state !== "creation" || !isCreator)
		{
			socket.data.leaveTournament();
			socket.leave(this._tournamentId);
		}
		if (this._state === "waiting-ready")
		{
			this._socketReadyCount--;
			this.startMatchesIfReady();
		}
	}

	protected override onParticipantLose(loser : DefaultSocket, isQualifications : boolean, roundMatchCount : number)
	{
		loser.emit("tournament-event", {type: "lose", isQualifications, roundMatchCount})
	}

    protected override onQualificationsEnd(qualified: DefaultSocket[]): void
	{
		this._io.to(this._tournamentId).emit("tournament-event", {
			type: "tournament-gui-create",
			qualified: qualified.map(socket => socket.data.getProfile())
		});
    }

    protected override onTournamentEnd(winner: DefaultSocket): void
	{
		winner.emit("tournament-event", {type: "win", winner: winner.data.getProfile()})
		this.dispose();
    }

    protected override onTournamentShow(): void
	{
		this._io.to(this._tournamentId).emit("tournament-event", {
			type: "show-tournament"
		});
    }

    protected override onNewMatches(): void
	{
		this._currentMatches.forEach(match => {
			const	left = match.left?.profile;
			const	right = match.right?.profile;

			if (match.winner !== undefined
				|| left?.data.getState() !== "tournament-waiting"
				|| right?.data.getState() !== "tournament-waiting")
				return ;
			const	room = new Room(this._io, endData => {
				this._rooms.delete(room);
				match.setWinner(endData);
				this.onNewMatches();
				this.onMatchEnd(match);
			}, left, right);
			this._rooms.add(room);
		});
    }

    protected override setRoundWinners(round: number, matches: Match<DefaultSocket>[]): void
	{
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

	public getDescription() : TournamentDescription
	{
		return {
			name: this._settings.name,
			currentPlayerCount: this._players.size,
			maxPlayerCount: this._settings.maxPlayerCount,
			id: this._tournamentId
		}
	}

	public getDescriptionIfAvailable(socket : DefaultSocket) : TournamentDescription | null
	{
		if (!this._settings.isPublic || !this.canJoinTournament(socket).success)
			return null;
		return this.getDescription();
	}

	public getParticipantsNames() : string[]
	{
		return Array.from(this._players.keys());
	}

	public onSocketQuit(socket : DefaultSocket)
	{
		if (socket === this._creator && this._state === "creation")
			this.dispose();
		else
			this.removePlayerFromTournament(socket);
	}
}
