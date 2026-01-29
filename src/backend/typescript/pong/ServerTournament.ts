import type { Profile, TournamentCreationSettings, TournamentDescription, TournamentId, Username } from "@shared/ZodMessageType";
import type { ServerType } from "..";
import { error, getEndDataOnInvalidMatch, success, type Result } from "@shared/utils";
import { Tournament } from "@shared/Tournament";
import type { Match } from "@shared/Match";
import { Room } from "./Room";
import { SocketEventController, type DefaultSocket } from "../controllers/SocketEventController";
import { CommonSchema } from "@shared/common.schema";
import { Container } from "../container/Container";
import type { TournamentController } from "../controllers/TournamentController";
import type { Ranking } from "../types/tournament.types";

export class	ServerTournament extends Tournament<DefaultSocket>
{
	private static readonly _readyTimeoutMs = 60000;

	private	_state : "creation" | "waiting-ready" | "started" | "disposed" = "creation";
	private _players = new Map<string, DefaultSocket>();
	private _bannedPlayers = new Set<string | number>();
	private _tournamentId : TournamentId;
	private _rooms = new Set<Room>();
	private _socketReadyCount = 0;
	private _tournamentController = Container.getInstance().getService<TournamentController>("TournamentController");
    private _databaseId?: number;
	private _ranks = new Array<Ranking>;

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
		this._creator.data.joinTournament(this);
	}

	private	banParticipant(name : string)
	{
		if (this._state !== "creation")
			return ;
		const	socket = this._players.get(name);

		if (!socket || socket === this._creator)
			return ;
		const	userId = socket.data.getUserId();

		if (userId !== undefined)
			this._bannedPlayers.add(userId);
		else
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
		if (!this._players.has(this._creator.data.getGuestName()))
			this._creator.data.leaveTournament();
		this._state = "waiting-ready";
		console.log(`${this._settings.name} tournament started !`);
		this._io.to(this._tournamentId).emit("tournament-event", {type:"tournament-start"});
		this.delay(() => {
			this.onReadyTimeout();
		}, ServerTournament._readyTimeoutMs);
		this._players.forEach(socket => {
			socket.removeAllListeners("set-alias");
			socket.data.ready = false;
			SocketEventController.once(socket, "ready", () => {
				socket.data.ready = true;
				this._socketReadyCount++;
				this.startMatchesIfReady();
			});
		});
		return success(null);
	}

	private onReadyTimeout()
	{
		this._players.forEach(socket => {
			if (!socket.data.ready)
				this.removePlayerFromTournament(socket);
		});
	}

	private async startMatchesIfReady()
	{
		if (this._socketReadyCount !== this._players.size)
			return ;
		this.clearDelay();
		if (this._players.size === 0)
			this.dispose();
		else if (this._players.size === 1)
		{
			const	winner = this._players.values().next().value;

			this.onTournamentEnd(winner);
		}
		else
		{
			const result = await this._tournamentController.createTournament({
				title: this._settings.name,
				creatorId: this._creator.data.getUserId(),
				creatorGuestName: this._creator.data.getGuestName(),
				participants: [...this._players.values()].map(socket => {
					return {
						userId: socket.data.getUserId(),
						guestName: socket.data.getGuestName(),
						alias: socket.data.getProfile().shownName
					}
				})
			});
			if (!result.success)
			{
				this.dispose();
				return ;
			}
			this._databaseId = result.value;
			this.setParticipants([...this._players.values()]);
			this.createMatches();
			this._state = "started";
			return ;
		}
	}

	public dispose()
	{
		if (this._state === "disposed")
			return ;
		super.dispose();
		console.log(`${this._settings.name} tournamend end`);
		if (this._state === "creation")
		{
			this._io.to(this._tournamentId).emit("tournament-event", { type: "tournament-canceled" })
			this._creator.data.leaveTournament();
			this.removeCreatorEvents();
		}
		this._state = "disposed";
		this._players.forEach((player) => {
			this.removePlayerFromTournament(player);
		});
		this._onTournamentDispose();
	}
	
	private	canJoinTournament(socket : DefaultSocket)
	{
		const	userState = SocketEventController.getUserState(socket.data);
		const	isCreator = socket === this._creator;
		const	isCreatorPlayer = isCreator && this._players.has(this._creator.data.getGuestName());

		if (isCreatorPlayer || (!isCreator && userState !== "unactive"))
			return error("The user is already in a game, tournament or matchmaking");
		if (this._state !== "creation")
			return error("The tournament has already started !");
		if (this._players.size === this._settings.maxPlayerCount)
			return error("The tournament is already full !");
		if (socket.data.getUserId() === undefined && !this._settings.acceptGuests)
			return error("The tournament doesn't accept guests, you must log to your account !");
		const	userId = socket.data.getUserId();

		if (this._bannedPlayers.has(socket.data.getGuestName()) || (userId && this._bannedPlayers.has(userId)))
			return error("You have been banned from this tournament !");
		return success(undefined);
	}

	public addParticipant(socket : DefaultSocket) : Result<undefined>
	{
		const	canJoinTournament = this.canJoinTournament(socket);

		if (!canJoinTournament.success)
			return canJoinTournament;
		socket.data.setAlias(null);
		const	profile = socket.data.getProfile();

		this._players.set(profile.guestName, socket);
		this._io.to(this._tournamentId).to(this._creator.id).emit("tournament-event", {
            type: "add-participant",
			profile: profile,
			isCreator: profile.guestName === this._creator.data.getGuestName()
        });
		socket.join(this._tournamentId);
		socket.data.joinTournament(this);
		SocketEventController.once(socket, "leave-tournament", () => this.removePlayerFromTournament(socket));
		SocketEventController.on(socket, "set-alias", (alias, ack) => this.changeAlias(socket, alias, ack));
		return success(undefined);
	}

	private	changeAlias(socket : DefaultSocket, alias : Username, ack: (result: Result<null>) => void)
	{
		const	parsed = CommonSchema.alias.safeParse(alias);

		if (!parsed.success)
			ack(error(parsed.error.issues[0].message));
		else if (this._players.values().find(socket => socket.data.getAlias() === alias))
			ack(error("Alias already taken !"));
		else {
			this._io.to(this._tournamentId).to(this._creator.id).except(socket.id).emit("tournament-event", {
					type: "change-alias",
					guestName: socket.data.getGuestName(),
					newAlias: parsed.data
			});
			socket.data.setAlias(alias);
			ack(success(null));
		}
	}

	private	removePlayerFromTournament(socket : DefaultSocket)
	{
		const	guestName = socket.data.getGuestName();
		const	isCreator = socket === this._creator;

		this._players.delete(guestName);
		socket.removeAllListeners("leave-tournament");
		socket.removeAllListeners("ready");
		socket.removeAllListeners("set-alias");
		socket.leave(this._tournamentId);
		if (this._state === "creation")
		{
			this._io.to(this._tournamentId).to(this._creator.id).emit("tournament-event", {
				type: "remove-participant",
				guestName: guestName
			});
		}
		else if (this._state === "waiting-ready")
		{
			if (socket.data.ready)
				this._socketReadyCount--;
			else
				this.startMatchesIfReady();
		}
		else if (this._state === "started")
			this.onNewMatches();
		if (!(this._state === "creation" && isCreator))
			socket.data.leaveTournament();
	}

	protected override onParticipantLose(loser : DefaultSocket, isQualifications : boolean, roundMatchCount : number)
	{
		this._ranks.push({alias: loser.data.getProfile().shownName, rank: 1});
		loser.emit("tournament-event", {type: "lose", isQualifications, roundParticipantsCount: roundMatchCount})
		this.removePlayerFromTournament(loser);
	}

    protected override onQualificationsEnd(qualified: DefaultSocket[]): void
	{
		this._io.to(this._tournamentId).emit("tournament-event", {
			type: "tournament-gui-create",
			qualified: qualified.map(socket => socket.data.getProfile())
		});
    }

    protected override onTournamentEnd(winner? : DefaultSocket): void
	{
		if (winner)
			this._ranks.push({alias: winner.data.getProfile().shownName, rank: 1});
		this._tournamentController.closeTournament(this._databaseId!, this._ranks);
		winner?.emit("tournament-event", {type: "win"})
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
			const	left = match.left;
			const	right = match.right;
			const	isLeftValid = !!left && this._players.has(left.profile.data.getGuestName());
			const	isRightValid = !!right && this._players.has(right.profile.data.getGuestName());

			if (match.winner !== undefined)
				return ;
			if (!isLeftValid || !isRightValid)
			{
				const	endData = getEndDataOnInvalidMatch(isLeftValid, isRightValid);

				match.setWinner(endData);
				this.onMatchEnd(match);
				return ;
			}
			if (match.winner !== undefined
				|| left.profile.data.getState() !== "tournament-waiting"
				|| right.profile.data.getState() !== "tournament-waiting")
				return ;
			const	room = new Room(this._io, endData => {
				this._rooms.delete(room);
				match.setWinner(endData);
				this._tournamentController.updateTournament(this._databaseId!, {
					leftId: left.profile.data.getUserId(),
					leftGuestName: left.profile.data.getGuestName(),
					rightId: right.profile.data.getUserId(),
					rightGuestName: right.profile.data.getGuestName(),
					winnerIndicator: endData.winner,
					scoreLeft: endData.scoreLeft,
					scoreRight: endData.scoreRight,
					duration: endData.duration
				});
				this.onNewMatches();
				this.onMatchEnd(match);
			}, left.profile, right.profile);
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

	public getParticipants() : Profile[]
	{
		return [...this._players.values()].map(socket => socket.data.getProfile());
	}

	public onSocketQuit(socket : DefaultSocket)
	{
		if (socket === this._creator && this._state === "creation")
			this.dispose();
		else
			this.removePlayerFromTournament(socket);
	}
}
