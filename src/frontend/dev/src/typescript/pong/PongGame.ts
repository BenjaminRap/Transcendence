import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";

import HavokPhysics from "@babylonjs/havok";
import { type ClientInput, FrontendSceneData, type FrontendSceneProperties } from "./FrontendSceneData";
import { Color4, type int } from "@babylonjs/core";
import { type FrontendGameType, type SceneName, type FrontendGameSceneName } from "@shared/SceneData";
import { Settings } from "./Settings";
import { ServerProxy } from "./ServerProxy";
import type { LocalTournament } from "./LocalTournament";
import { frontendSocketHandler } from "../index";
import { ErrorGUI } from "./gui/ErrorGUI";
import { initMenu } from "./gui/IGUI";
import { CloseGUI } from "./gui/CloseGUI";
import { PongError } from "@shared/pongError/PongError";
import type { GameInfos, GameInit, Profile, TournamentEvent } from "@shared/ZodMessageType";

import { PongUtils } from '../terminal'
import { LoadingGUI } from "./gui/LoadingGUI";
import type { BotDifficulty } from "./BotDifficulty";
import { WriteOnTerminal } from "../terminalUtils/writeOnTerminal";

import.meta.glob("./attachedScripts/*.ts", { eager: true});
import.meta.glob("@shared/attachedScripts/*", { eager: true});

export type TournamentType<T extends FrontendGameType> =
	T extends "Local" ? LocalTournament :
	undefined

export class PongGame extends HTMLElement {
	private _canvas! : HTMLCanvasElement;
	private _engine? : Engine;
	private _scene : Scene | undefined;
	private _settings : Settings;
	private _errorGUI : ErrorGUI;
	private _loadingGUI : LoadingGUI;
	private _serverProxy : ServerProxy;
	private _assetsManager : AssetsManager | null = null;

	public constructor() {
		super();
		this._serverProxy = new ServerProxy(frontendSocketHandler);
		this.classList.add("block", "overflow-hidden", "container-inline", "aspect-video");
		this._settings = new Settings();
		this._canvas = document.createElement("canvas");
		this._canvas.classList.add("size-full");
		this._canvas.addEventListener("webglcontextlost", () => {
			this.onError(new PongError("We lost the webgl context !", "quitPong"));
		});
		this._errorGUI = initMenu(new ErrorGUI(), {
			close: () => this._errorGUI.classList.add("hidden")
		}, this);
		this._loadingGUI = new LoadingGUI();
		this.appendChild(this._loadingGUI);
		initMenu(new CloseGUI(), {
			close: () => this.quit()
		}, this, false);

		this.append(this._canvas);
		this._serverProxy.getObservable("tournament-event").add(([tournamentEvent]) => this.onTournamentMessage(tournamentEvent));
		this._serverProxy.getObservable("game-infos").add(([gameEvent]) => this.onGameMessage(gameEvent));
		this._serverProxy.getObservable("disconnect").add(() => this.onDisconnect());
		this.loadGame();
		window.addEventListener("popstate", this.onPopState);
	}

	private async loadGame() : Promise<void> {
		try {
			this._engine = this.createEngine();
			globalThis.HK = await HavokPhysics();
			await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: false });
			this._scene = await this.getNewScene({sceneName: "Menu.gltf", gameType: "Menu"});
			this.addEventListener("resize", () => this._engine?.resize)
			this._engine.runRenderLoop(this.renderScene.bind(this));
		} catch (error) {
			WriteOnTerminal.displayOnTerminal(`Could not initialize the scene : ${error}`, false)
			this.quit();
		}
    }

	private renderScene() : void
	{
		try {
			if (this._scene)
				this._scene.render();
		} catch (error) {
			this.onError(error);
		}
	}

	private createEngine() : Engine
	{
		const	engine = new Engine(this._canvas, true, {
			stencil: true,
			antialias: true,
			audioEngine: false,
			adaptToDeviceRatio: true,
			disableWebGL2Support: false,
			useHighPrecisionFloats: true,
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: false,
			deterministicLockstep: true,
			lockstepMaxSteps: 4
		});

		// engine.renderEvenInBackground = false;
		return engine;
	}

	private async changeScene(properties : FrontendSceneProperties) : Promise<FrontendSceneData>
	{
		if (this.isInScene("Menu.gltf"))
			history.pushState(null, "", "/pong/game/");
		this.disposeScene();
		this._scene = await this.getNewScene(properties);

		const	sceneData = getFrontendSceneData(this._scene);

		await sceneData.readyPromise.promise;

		return sceneData;
	}

	private	isInScene(sceneName : SceneName)
	{
		if (this._scene === undefined)
			return false;
		const	sceneData = getFrontendSceneData(this._scene);
		
		return sceneData.sceneName === sceneName;
	}

	public async goToMenuScene()
	{
		if (this.isInScene("Menu.gltf"))
			return ;
		history.pushState(null, "", "/pong");
		this._serverProxy.leave();
		await this.changeScene({sceneName: "Menu.gltf", gameType: "Menu"});
	}

	public async startBotGame(sceneName : FrontendGameSceneName, difficulty : keyof BotDifficulty)
	{
		const	sceneData = await this.changeScene({sceneName, gameType: "Bot", difficulty});

		this.setInputs(sceneData, 0);
		sceneData.events.getObservable("game-start").notifyObservers();
	}

	public async startLocalGame(sceneName : FrontendGameSceneName, tournament? : LocalTournament)
	{
		const	sceneData = await this.changeScene({sceneName, gameType: "Local", tournament});

		this.setInputs(sceneData, 0, 1);
		if (tournament)
			tournament.setEventsAndStart(sceneData.events);
		else
			sceneData.events.getObservable("game-start").notifyObservers();
	}

	public async searchOnlineGame(sceneName? : FrontendGameSceneName) : Promise<void>
	{
		const	[gameInit] = await this._serverProxy.joinGame();

		if (sceneName)
			await this.changeScene({sceneName, gameType: "Multiplayer"});
		await this.startOnlineGame(gameInit);
	}

	public async startOnlineTournament(sceneName : FrontendGameSceneName)
	{
		await this.changeScene({sceneName, gameType: "Multiplayer"});

		this._serverProxy.setReady();
	}

	public async startOnlineGame(gameInit : GameInit) : Promise<void>
	{
		const	sceneData = getFrontendSceneData(this._scene!);

		this.setInputs(sceneData, gameInit.playerIndex);
		this._serverProxy.setReady();
		const	participants = gameInit.participants as [Profile, Profile];
		sceneData.events.getObservable("set-participants").notifyObservers(participants);
		const	[gameStartInfos] = await this._serverProxy.onGameReady();
		sceneData.events.getObservable("game-start").notifyObservers(gameStartInfos);
	}

	private onTournamentMessage(tournamentEvent : TournamentEvent)
	{
		if (!this._scene)
			return ;
		getFrontendSceneData(this._scene).events.getObservable("tournament-event").notifyObservers(tournamentEvent);
	}

	private onGameMessage(gameInfos : GameInfos)
	{
		if (!this._scene)
			return ;
		getFrontendSceneData(this._scene).events.getObservable("game-infos").notifyObservers(gameInfos);
	}

	private	onDisconnect()
	{
		if (!this._scene)
			return ;
		const	sceneData = getFrontendSceneData(this._scene);

		if (sceneData.gameType === "Multiplayer")
		{
			this.changeScene({gameType: "Menu", sceneName: "Menu.gltf"}).catch(() => {});
			this.onError(new PongError("The server disconnected !", "show"));
		}
	}

	private setInputs(sceneData : FrontendSceneData, ...inputIndexes : int[])
	{
		const	inputs = this._settings._playerInputs.filter((value : ClientInput) => inputIndexes.includes(value.index));

		sceneData.events.getObservable("input-change").notifyObservers(inputs);
	}

	private	showError(errorText : string)
	{
		this._errorGUI.setErrorText(errorText);
		this._errorGUI.classList.remove("hidden");
	}

	public onError(error : any)
	{
		let		severity = (error instanceof PongError) ? error.getSeverity() : "quitPong";
		const	message = (error instanceof Error) ? error.message : error;

		if (severity === "quitScene" && this.isInScene("Menu.gltf"))
			severity = "quitPong";
		switch (severity)
		{
			case "ignore":
				break;
			case "show":
				this.showError(message);
				break;
			case "quitScene":
				this.showError(message);
				this.goToMenuScene();
				break;
			case "quitPong":
				WriteOnTerminal.displayOnTerminal(message, false)
				this.quit();
				break;
		}
	}

	private	async getNewScene(properties : FrontendSceneProperties) : Promise<Scene>
	{
		this._loadingGUI.displayLoadingUI();
		const	scene = new Scene(this._engine!);

		if (!scene.metadata)
			scene.metadata = {};
		globalThis.HKP = new HavokPlugin(false);
		scene.metadata.sceneData = new FrontendSceneData(globalThis.HKP, properties, this, this._serverProxy);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		this._assetsManager = new AssetsManager(scene);
		this._assetsManager.useDefaultLoadingScreen = false;

		if (!scene.enablePhysics(Vector3.Zero(), globalThis.HKP))
			throw new PongError("The physics engine hasn't been initialized !", "quitPong");

		this._assetsManager.addMeshTask("scene", null, "/scenes/", properties.sceneName)

		SceneManager.OnSceneReadyObservable.add(() => {
			SceneManager.OnSceneReadyObservable.clear();
			scene.clearColor = new Color4(0, 0, 0, 1);
			cam.dispose(); // removing the unecessary camera
			scene.activeCameras = scene.cameras;
			globalThis.HKP = undefined;
			this._loadingGUI.hideLoadingUI();
		});
		await this._assetsManager.loadAsync();
		this._assetsManager = null;

		return scene;
	}

	private disposeScene()
	{
		SceneManager.OnSceneReadyObservable.clear();
		this._assetsManager?.reset();
		this._assetsManager = null;
		if (this._scene === undefined)
			return ;
		const	sceneData = getFrontendSceneData(this._scene);

		sceneData.dispose();
		this._scene.dispose();
		this._scene = undefined;
	}

	public dispose()
	{
		this._engine?.stopRenderLoop();
		window.addEventListener("popstate", this.onPopState);
		this._serverProxy.leave();
		this._serverProxy.dispose();
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this.disposeScene();
		this._engine?.dispose();
	}

	public setButtonEnable(enabled : boolean)
	{
		const	buttons = this.querySelectorAll("button")

		buttons.forEach(button => {
			button.disabled = !enabled;
		})
	}

	public focusOnCanvas()
	{
		this._canvas.focus();
	}

	public quit()
	{
		this.dispose();
		PongUtils.removePongDiv(true);
	}

	private onPopState = () => {
		this.goToMenuScene();
	}
}

export function	getFrontendSceneData(scene : Scene) : FrontendSceneData
{
	if (!scene.metadata)
		throw new PongError("Scene metadata is undefined !", "quitPong");

	const	sceneData = scene.metadata.sceneData;
	if (!(sceneData instanceof FrontendSceneData))
		throw new PongError("Scene is not of the type FrontendSceneData !", "quitPong");
	return sceneData;
}

customElements.define("pong-game", PongGame);
