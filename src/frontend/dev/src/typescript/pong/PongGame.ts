import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";

import HavokPhysics from "@babylonjs/havok";
import { type ClientInput, FrontendSceneData } from "./FrontendSceneData";
import { Color4 } from "@babylonjs/core";
import { type FrontendGameType, getSceneData } from "@shared/SceneData";
import { Settings } from "./Settings";
import { ServerProxy } from "./ServerProxy";
import type { GameInfos } from "@shared/ServerMessage";
import type { LocalTournament } from "./LocalTournament";
import { frontendSocketHandler } from "../index";
import { ErrorGUI } from "./gui/ErrorGUI";
import { initMenu } from "./gui/IGUI";
import { CloseGUI } from "./gui/CloseGUI";

import.meta.glob("./attachedScripts/*.ts", { eager: true});
import.meta.glob("@shared/attachedScripts/*", { eager: true});

export type SceneFileName = "Magic.gltf" | "Basic.gltf" | "Terminal.gltf";

export class PongGame extends HTMLElement {
	private _canvas! : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene : Scene | undefined;
	private _settings : Settings;
	private _errorGUI! : ErrorGUI;
	private _closeGUI! : CloseGUI;
	private _serverProxy : ServerProxy;

    public constructor() {
		super();
		this._serverProxy = new ServerProxy(frontendSocketHandler);
		this.classList.add("block", "overflow-hidden", "container-inline", "aspect-video");
		this._settings = new Settings();
	}

	public async connectedCallback() : Promise<void> {
		this._canvas = document.createElement("canvas");
		this._canvas.classList.add("size-full");
		this._errorGUI = initMenu(new ErrorGUI(), {
			close: () => this._errorGUI.classList.add("hidden")
		}, this);
		this._closeGUI = initMenu(new CloseGUI(), {
			close: () => this.remove()
		}, this);
		this._closeGUI.classList.remove("hidden");

		this.append(this._canvas);
		try {
			this._engine = this.createEngine();
			globalThis.HK = await HavokPhysics();
			await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
			this._scene = await this.getNewScene("Menu.gltf", "Menu", []);
			this._engine.runRenderLoop(this.renderScene.bind(this));
		} catch (error) {
			console.error(`Could not initialize the scene : ${error}`)
		}
    }

	private renderScene() : void
	{
		try {
			if (this._scene)
				this._scene.render();
			// console.log(this._scene?.getEngine().getFps());
		} catch (error) {
			console.error(`Could not render the scene : ${error}`)
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

	private async changeScene<T extends FrontendGameType>(
		newSceneName : string,
		gameType : T,
		clientInputs : readonly ClientInput[],
		tournament : T extends "Local" ? LocalTournament | undefined : undefined) : Promise<void>
	{
		this.disposeScene();
		this._scene = await this.getNewScene(newSceneName, gameType, clientInputs, tournament);
	}

	public async goToMenuScene()
	{
		frontendSocketHandler.leaveScene();
		if (!this._scene || getSceneData(this._scene).gameType !== "Menu")
			await this.changeScene("Menu.gltf", "Menu", [], undefined);
	}

	public startBotGame(sceneName : SceneFileName)
	{
		this.startBotGameAsync(sceneName);
	}

	private async startBotGameAsync(sceneName : SceneFileName)
	{
		const	inputs = [this._settings._playerInputs[0]];
		await this.changeScene(sceneName, "Bot", inputs, undefined);
		const	sceneData = getFrontendSceneData(this._scene!);

		await sceneData.readyPromise.promise;
		sceneData.events.getObservable("game-start").notifyObservers();
	}

	public startLocalGame(sceneName : SceneFileName, tournament? : LocalTournament)
	{
		this.startLocalGameAsync(sceneName, tournament);
	}

	private async startLocalGameAsync(sceneName : SceneFileName, tournament? : LocalTournament)
	{
		await this.changeScene(sceneName, "Local", this._settings._playerInputs, tournament);
		const	sceneData = getFrontendSceneData(this._scene!);

		await sceneData.readyPromise.promise;
		if (tournament)
			tournament.start(sceneData.events);
		else
			sceneData.events.getObservable("game-start").notifyObservers();
	}

	public startOnlineGame(sceneName : SceneFileName)
	{
		this.startOnlineGameAsync(sceneName);
	}

	private async startOnlineGameAsync(sceneName : SceneFileName) : Promise<void>
	{
		try {
			await frontendSocketHandler.joinGame();
			const	playerIndex = frontendSocketHandler.getplayerIndex();
			const	inputs = this._settings._playerInputs.filter((value : ClientInput) => value.index === playerIndex);

			await this.changeScene(sceneName, "Multiplayer", inputs, undefined);
			const	sceneData = getFrontendSceneData(this._scene!);

			await sceneData.readyPromise.promise;
			frontendSocketHandler.setReady();
			await frontendSocketHandler.onGameReady();
			sceneData.events.getObservable("game-start").notifyObservers();
			frontendSocketHandler.onServerMessage().add((gameInfos : GameInfos | "server-error" | "forfeit" | "room-closed") => {
				if (gameInfos === "server-error")
				{
					console.log("Server Error !");
					this.goToMenuScene();
				}
			});
		} catch (error) {
			if (error === "canceled")
				return ;
			console.error(error);
			this.goToMenuScene();
		}
	}

	public	async restartOnlineGameAsync() : Promise<void>
	{
		if (!this._scene)
			throw new Error("restartOnlineGameAsync called without a scene !");
		try {
			await frontendSocketHandler.joinGame();

			const	playerIndex = frontendSocketHandler.getplayerIndex();
			const	inputs = this._settings._playerInputs.filter((value : ClientInput) => value.index === playerIndex);
			const	sceneData = getFrontendSceneData(this._scene);

			sceneData.inputs = inputs;
			sceneData.events.getObservable("input-change").notifyObservers();
			sceneData.serverProxy?.sendServerMessage("ready");
			await frontendSocketHandler.onGameReady();
			sceneData.events.getObservable("game-start").notifyObservers();
		} catch (error) {
			if (error === "canceled")
				return ;
			console.error(error);
			this.goToMenuScene();
		}
	}

	public	cancelMatchmaking()
	{
		frontendSocketHandler.leaveMatchmaking();
	}

	private	async getNewScene(
		sceneName : string,
		gameType : FrontendGameType,
		clientInputs : readonly ClientInput[],
		tournament? : LocalTournament) : Promise<Scene>
	{
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		globalThis.HKP = new HavokPlugin(false);
		scene.metadata.sceneData = new FrontendSceneData(globalThis.HKP, this, gameType, clientInputs, this._serverProxy, tournament);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		const	assetsManager = new AssetsManager(scene);

		if (!scene.enablePhysics(Vector3.Zero(), globalThis.HKP))
			throw new Error("The physics engine hasn't been initialized !");

		assetsManager.addMeshTask("scene", null, "/scenes/", sceneName)

		await SceneManager.LoadRuntimeAssets(assetsManager, [ sceneName ], () => {
			cam.dispose(); // removing the unecessary camera
			this.onSceneLoaded(scene);
			globalThis.HKP = undefined;
			scene.clearColor = new Color4(0, 0, 0, 1);
		});

		return scene;
	}

	private onSceneLoaded(scene : Scene) : void {
		SceneManager.HideLoadingScreen(this._engine);
		SceneManager.FocusRenderCanvas(scene);
		scene.activeCameras = scene.cameras;
		// scene.activeCameras[0].attachControl();
	}

	private disposeScene()
	{
		if (this._scene === undefined)
			return ;
		const	sceneData = getFrontendSceneData(this._scene);

		sceneData.dispose();
		this._scene.dispose();
		this._scene = undefined;
	}

	public disconnectedCallback() : void {
		frontendSocketHandler.leaveScene();
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this.disposeScene();
		this._engine.dispose();
	}

	public focusOnCanvas()
	{
		this._canvas.focus();
	}
}

export function	getFrontendSceneData(scene : Scene) : FrontendSceneData
{
	if (!scene.metadata)
		throw new Error("Scene metadata is undefined !");

	const	sceneData = scene.metadata.sceneData;
	if (!(sceneData instanceof FrontendSceneData))
		throw new Error("Scene is not of the type FrontendSceneData !");
	return sceneData;
}

customElements.define("pong-game", PongGame);
