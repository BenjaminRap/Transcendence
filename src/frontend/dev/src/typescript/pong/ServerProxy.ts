import type { GameInfos, GameInit, GameStartInfos, KeysUpdate, Profile, TournamentCreationSettings, TournamentDescription, TournamentId } from "@shared/ZodMessageType";
import { FrontendSocketHandler } from "./FrontendSocketHandler";
import type { int, Observable, Observer } from "@babylonjs/core";
import { PongError } from "@shared/pongError/PongError";
import type { TournamentEventAndJoinedGame } from "./FrontendEventsManager";
import type { CancellablePromise } from "./CancellablePromise";

type SocketState = "not-connected" | "connected" | "in-matchmaking" | "in-game" | "tournament-creator" | "tournament-player" | "tournament-creator-player" | "in-tournament" | "waiting";

type tournamentData = {
	isCreator: boolean,
	id: string
}

export class	ServerProxy
{
	private _state : SocketState;
	private _playerIndex : int = 0;
	private _currentPromise : CancellablePromise<any> | null = null;
	private _tournamentData : tournamentData | null = null;
	private _disconnectedObserver : Observer<void>;

	constructor(
		private _frontendSocketHandler : FrontendSocketHandler,
	) {
		this._state = "connected";
		this._frontendSocketHandler.onGameMessage().add((gameInfos : GameInfos) => {
			if (gameInfos.type === "room-closed" && this._state === "in-game")
				this._state = "connected";
		});
		this._disconnectedObserver = this._frontendSocketHandler.onDisconnect().add(() => {
			this._state = "not-connected";
			this.replaceCurrentPromise(null);
		});
		this._frontendSocketHandler.onTournamentMessage().add((tournamentEvent : TournamentEventAndJoinedGame) => {
			const	removeFromTournament = ["banned", "kicked", "tournament-canceled"].includes(tournamentEvent.type);
			const	tournamentEnd = ["win", "lose"].includes(tournamentEvent.type);

			if ((removeFromTournament && this._state === "tournament-player")
				|| (tournamentEnd && this._state === "in-tournament"))
			{
				this._state = "connected";
				this._tournamentData = null;
			}
			else if (this._state === "tournament-player" && tournamentEvent.type === "tournament-start")
				this._state = "in-tournament";
		});
		this._frontendSocketHandler.onJoinGame().add(gameInit => {
			this._playerIndex = gameInit.playerIndex;
			if (this._state !== "in-tournament")
				return ;
			this._frontendSocketHandler.onTournamentMessage().notifyObservers({
				type: "joined-game",
				gameInit: gameInit
			});
		});
	}

	public async joinGame() : Promise<[GameInit]>
	{
		this.verifyState("connected");
		this._state = "in-matchmaking";
		const	joinMatchmakingCancellable = this._frontendSocketHandler.sendEventWithAck("join-matchmaking");
		const	joinGameCancellable = this._frontendSocketHandler.waitForEvent("joined-game");

		joinMatchmakingCancellable.promise
			.catch(() => {
				joinGameCancellable.cancel();
			});
		joinGameCancellable.promise
			.then(() => {
				this._state = "in-game";
			})
			.catch(() => {
				this._state = "connected";
			});


		this.replaceCurrentPromise(joinGameCancellable);
		return joinGameCancellable.promise;
	}

	public leave() : void
	{
		if (this._state === "in-matchmaking")
			this._frontendSocketHandler.sendEventWithNoResponse("leave-matchmaking");
		if (this._state === "in-game")
			this._frontendSocketHandler.sendEventWithNoResponse("forfeit");
		else if (this._state === "in-tournament" || this._state === "tournament-player")
		{
			this._tournamentData = null;
			this._frontendSocketHandler.sendEventWithNoResponse("leave-tournament");
		}
		else if (this._state === "tournament-creator" || this._state === "tournament-creator-player")
			this._frontendSocketHandler.sendEventWithNoResponse("cancel-tournament");
		this.replaceCurrentPromise(null);
		this._state = "connected";
	}

	public onGameReady() : Promise<[GameStartInfos]>
	{
		this.verifyState("in-game", "in-tournament");
		const	cancellable = this._frontendSocketHandler.waitForEvent("ready");

		this.replaceCurrentPromise(cancellable);
		return cancellable.promise;
	}

	public setReady() : void
	{
		this.verifyState("in-game", "in-tournament");
		this._frontendSocketHandler.sendEventWithNoResponse("ready");
	}

	public leaveTournament() : void
	{
		this.verifyState("tournament-player", "tournament-creator-player", "in-tournament");
		if (this._state === "tournament-player" || this._state === "in-tournament")
		{
			this._tournamentData = null;
			this._state = "connected";
		}
		else
			this._state = "tournament-creator";
		this._frontendSocketHandler.sendEventWithNoResponse("leave-tournament");
	}

	public forfeit() : void
	{
		this.verifyState("in-game", "in-tournament");
		this._frontendSocketHandler.sendEventWithNoResponse("forfeit")
	}

	public leaveMatchmaking() : void
	{
		this.verifyState("in-matchmaking");
		this._frontendSocketHandler.sendEventWithNoResponse("leave-matchmaking")
		this._state = "connected";
		this.replaceCurrentPromise(null);
	}

	public keyUpdate(key : "up" | "down", event : "keyUp" | "keyDown") : void
	{
		const	keysUpdate : KeysUpdate =  {};

		if (key === "up")
			keysUpdate.up = { event : event };
		else
			keysUpdate.down = { event : event };
		this._frontendSocketHandler.sendEventWithNoResponse("input-infos", keysUpdate);
	}

	public onGameMessage() : Observable<GameInfos>
	{
		return this._frontendSocketHandler.onGameMessage();
	}

	public onTournamentMessage() : Observable<TournamentEventAndJoinedGame>
	{
		return this._frontendSocketHandler.onTournamentMessage();
	}

	public getPlayerIndex() : int
	{
		return this._playerIndex;
	}

	public getOpponentIndex() : int
	{
		return (this._playerIndex === 0) ? 1 : 0;
	}

	public createTournament(settings : TournamentCreationSettings) : Promise<TournamentId>
	{
		this.verifyState("connected");
		const cancellable =  this._frontendSocketHandler.sendEventWithAck("create-tournament", settings);

		this._state = "waiting";
		cancellable.promise
			.then(tournamentId => {
				this._tournamentData = {
					isCreator: true,
					id: tournamentId
				};
				this._state = "tournament-creator";
			})
			.catch(() => {
				this._state = "connected";
			});
		this.replaceCurrentPromise(cancellable);

		return cancellable.promise;
	}

	public joinTournament(tournamentId : TournamentId) : Promise<Profile[]>
	{
		this.verifyState("connected");
		const	cancellable = this._frontendSocketHandler.sendEventWithAck("join-tournament", tournamentId);

		this._state = "waiting";
		cancellable.promise
			.then(() => {
				this._tournamentData = {
					isCreator: false,
					id: tournamentId
				};
				this._state = "tournament-player";
			})
			.catch(() => {
				this._state = "connected";
			})
		this.replaceCurrentPromise(cancellable);
		return cancellable.promise;
	}

	public joinTournamentAsCreator()
	{
		this.verifyState("tournament-creator");
		this._state = "waiting";

		const	cancellable = this._frontendSocketHandler.sendEventWithAck("join-tournament", this._tournamentData!.id);

		cancellable.promise
			.then(() => {
				this._state = "tournament-creator-player";
			})
			.catch(() => {
				this._state = "tournament-creator";
			});
		this.replaceCurrentPromise(cancellable);
		return cancellable.promise;
	}

	public cancelTournament() : void
	{
		this.verifyState("tournament-creator", "tournament-creator-player");
		this.replaceCurrentPromise(null);
		this._state = "connected";
		this._tournamentData = null;
		this._frontendSocketHandler.sendEventWithNoResponse("cancel-tournament");
	}

	public startTournament() : Promise<null>
	{
		this.verifyState("tournament-creator", "tournament-creator-player");
		const	previousState = this._state;
		const	cancellable =  this._frontendSocketHandler.sendEventWithAck("start-tournament");

		this.replaceCurrentPromise(cancellable);
		this._state = "waiting";

		cancellable.promise
			.then(() => {
				if (previousState === "tournament-creator")
				{
					this._state = "connected";
					this._tournamentData = null;
				}
				else
					this._state = "in-tournament";
			})
			.catch(() => {
				this._state = previousState;
			});
		return cancellable.promise;
	}

	public async getTournaments() : Promise<TournamentDescription[]>
	{
		this.verifyState("connected");
		const cancellable = this._frontendSocketHandler.sendEventWithAck("get-tournaments");

		cancellable.promise
			.catch(() => {})
			.finally(() => {
				this._state = "connected";
			});
		this.replaceCurrentPromise(cancellable);

		return cancellable.promise;
	}

	public banPlayerFromTournament(name : string)
	{
		this._frontendSocketHandler.sendEventWithNoResponse("ban-participant", name);
	}

	public kickPlayerFromTournament(name : string)
	{
		this._frontendSocketHandler.sendEventWithNoResponse("kick-participant", name);
	}

	public setAlias(newAlias : string)
	{
		this.verifyState("tournament-creator-player", "tournament-player");
		const previousState = this._state;
		const cancellable = this._frontendSocketHandler.sendEventWithAck("set-alias", newAlias);

		this._state = "waiting";
		cancellable.promise
			.catch(() => {})
			.finally(() => {
				this._state = previousState;
			});
		this.replaceCurrentPromise(cancellable);

		return cancellable.promise;
	}

	public getTournamentData()
	{
		return this._tournamentData;
	}

	public getGuestName()
	{
		return this._frontendSocketHandler.guestName;
	}

	private verifyState(...allowedStates : SocketState[]) : void
	{
		if (!allowedStates.includes(this._state))
			throw new PongError(`A FrontendSocketHandler method called with an invalid state, current state : ${this._state}, allowed : ${allowedStates}`, "show");
	}

	private	replaceCurrentPromise(newPromise : CancellablePromise<any> | null) : void
	{
		this._currentPromise?.cancel();
		this._currentPromise = newPromise;
	}

	public dispose()
	{
		this._frontendSocketHandler.onGameMessage().clear();
		this._frontendSocketHandler.onTournamentMessage().clear();
		this._frontendSocketHandler.onJoinGame().clear();
		this._frontendSocketHandler.onDisconnect().remove(this._disconnectedObserver);
		this.leave();
	}
}
