import type { GameInfos, GameInit, KeysUpdate, TournamentCreationSettings, TournamentDescription, TournamentEvent, TournamentId } from "@shared/ServerMessage";
import { FrontendSocketHandler } from "./FrontendSocketHandler";
import type { Deferred, int, Observable, Observer } from "@babylonjs/core";
import { PongError } from "@shared/pongError/PongError";
import type { TournamentEventAndJoinedGame } from "./FrontendEventsManager";

type SocketState = "not-connected" | "connected" | "in-matchmaking" | "in-game" | "tournament-creator" | "tournament-player" | "tournament-creator-player" | "in-tournament";

type tournamentData = {
	isCreator: boolean,
	id: string
}

export class	ServerProxy
{
	private _state : SocketState;
	private _playerIndex : int = 0;
	private _currentPromise : Deferred<any> | null = null;
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
			this._currentPromise?.reject(new PongError("canceled", "ignore"));
		});
		this._frontendSocketHandler.onTournamentMessage().add((tournamentEvent : TournamentEventAndJoinedGame) => {
			const	removeFromTournament = ["banned", "kicked", "tournament-canceled"].includes(tournamentEvent.type);
			const	tournamentEnd = ["win", "lose"].includes(tournamentEvent.type);

			if ((removeFromTournament && this._state === "tournament-player")
				|| (tournamentEnd && this._state === "in-tournament"))
				this._state = "connected";
			else if ((this._state === "tournament-player" || this._state === "tournament-creator-player")
				&& tournamentEvent.type === "tournament-start")
				this._state = "in-tournament";
		});
		this._frontendSocketHandler.onJoinGame().add(gameInit => {
			if (this._state !== "in-tournament")
				return ;
			this._frontendSocketHandler.onTournamentMessage().notifyObservers({
				type: "joined-game",
				gameInit: gameInit
			});
		});
	}

	public async joinGame() : Promise<GameInit>
	{
		this.verifyState("connected");
		const	deferred = this._frontendSocketHandler.joinGame();

		this.replaceCurrentPromise(deferred);
		this._state = "in-matchmaking";
		deferred.promise.then((gameInit : GameInit) => {
			this._state = "in-game";
			this._playerIndex = gameInit.playerIndex;
		}).catch(() => {
			this._state = "connected";
		});
		return deferred.promise;
	}

	public leaveScene() : void
	{
		this.verifyState("connected", "in-game", "in-tournament");
		if (this._state === "in-game")
			this._frontendSocketHandler.sendEventWithNoResponse("forfeit");
		else if (this._state === "in-tournament")
			this._frontendSocketHandler.sendEventWithNoResponse("leave-tournament");
		this._currentPromise?.reject(new PongError("canceled", "ignore"));
		this._state = "connected";
	}

	public onGameReady() : Promise<void>
	{
		this.verifyState("in-game", "in-tournament");
		const	deferred = this._frontendSocketHandler.onGameReady();

		this.replaceCurrentPromise(deferred);
		return deferred.promise;
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
		this._currentPromise?.reject(new PongError("canceled", "ignore"));
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
		const deferred =  this._frontendSocketHandler.createTournament(settings);

		deferred.promise
			.then(tournamentId => {
				this._tournamentData = {
					isCreator: true,
					id: tournamentId
				}
			})
			.catch(() => {
				this._state = "connected";
			});
		this.replaceCurrentPromise(deferred);
		this._state = "tournament-creator";

		return deferred.promise;
	}

	public joinTournament(tournamentId : TournamentId) : Promise<string[]>
	{
		this.verifyState("connected");
		this._state = "tournament-player";
		const	deferred = this._frontendSocketHandler.joinTournament(tournamentId);

		deferred.promise
			.then(() => {
				this._tournamentData = {
					isCreator: false,
					id: tournamentId
				}
			})
			.catch(() => {
				this._state = "connected";
			})
		this.replaceCurrentPromise(deferred);
		return deferred.promise;
	}

	public joinTournamentAsCreator()
	{
		this.verifyState("tournament-creator");
		this._state = "tournament-creator-player";

		const	deferred = this._frontendSocketHandler.joinTournament(this._tournamentData!.id);

		deferred.promise
			.catch(() => {
				this._state = "tournament-creator";
			});
		this.replaceCurrentPromise(deferred);
		return deferred.promise;
	}

	public cancelTournament() : void
	{
		this.verifyState("tournament-creator", "tournament-creator-player");
		this._currentPromise?.reject(new PongError("canceled", "ignore"));
		this._state = "connected";
		this._tournamentData = null;
		this._frontendSocketHandler.sendEventWithNoResponse("cancel-tournament");
	}

	public startTournament() : Promise<void>
	{
		this.verifyState("tournament-creator", "tournament-creator-player");
		const	previousState = this._state;
		const	deferred =  this._frontendSocketHandler.startTournament();

		this.replaceCurrentPromise(deferred);
		this._state = "in-tournament";

		deferred.promise.catch(() => {
			this._state = previousState;
		});
		return deferred.promise;
	}

	public async getTournaments() : Promise<TournamentDescription[]>
	{
		this.verifyState("connected");
		const deferred = this._frontendSocketHandler.getTournaments();

		this.replaceCurrentPromise(deferred);

		return deferred.promise;
	}

	public banPlayerFromTournament(name : string)
	{
		this._frontendSocketHandler.sendEventWithNoResponse("ban-participant", name);
	}

	public kickPlayerFromTournament(name : string)
	{
		this._frontendSocketHandler.sendEventWithNoResponse("kick-participant", name);
	}

	public getTournamentData()
	{
		return this._tournamentData;
	}

	private verifyState(...allowedStates : SocketState[]) : void
	{
		if (!allowedStates.includes(this._state))
			throw new PongError(`A FrontendSocketHandler method called with an invalid state, current state : ${this._state}, allowed : ${allowedStates}`, "show");
	}

	private	replaceCurrentPromise(newPromise : Deferred<any>) : void
	{
		this._currentPromise?.reject(new PongError("canceled", "ignore"));
		this._currentPromise = newPromise;
	}

	public dispose()
	{
		this._frontendSocketHandler.onGameMessage().clear();
		this._frontendSocketHandler.onTournamentMessage().clear();
		this._frontendSocketHandler.onJoinGame().clear();
		this._frontendSocketHandler.onDisconnect().remove(this._disconnectedObserver);
	}
}
