import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";

import HavokPhysics from "@babylonjs/havok";
import { ClientInput, FrontendSceneData } from "./FrontendSceneData";
import { Color4 } from "@babylonjs/core";
import { FrontendGameType, getSceneData } from "@shared/SceneData";
import { MultiplayerHandler } from "./MultiplayerHandler";
import { Settings } from "./Settings";
import { ServerProxy } from "./ServerProxy";
import { GameInfos } from "@shared/ServerMessage";

import.meta.glob("./attachedScripts/*.ts", { eager: true});
import.meta.glob("@shared/attachedScripts/*", { eager: true});

export class PongGame extends HTMLElement {
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene : Scene | undefined;
	private _multiplayerHandler : MultiplayerHandler;
	private _settings : Settings;

    public constructor() {
		super();
		this.classList.add("relative", "block");
		this._canvas = document.createElement("canvas");
		this._canvas.className = "w-full aspect-video relative"
		this._settings = new Settings();
		this._multiplayerHandler = new MultiplayerHandler();
		this.appendChild(this._canvas);
	}

	public async connectedCallback() : Promise<void> {
		try {
			this._engine = this.createEngine();
			globalThis.HK = await HavokPhysics();
			await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
			this._scene = await this.getNewScene("Menu.gltf", "Menu", []);
			this._engine.runRenderLoop(this.renderScene.bind(this));
			this.addEventListener("click", () => { this._canvas.focus() });
		} catch (error) {
			console.error(`Could not initialize the scene : ${error}`)
		}
    }

	private renderScene() : void
	{
		try {
			if (this._scene)
				this._scene.render();
		} catch (error) {
			console.error(`Could not render the scene : ${error}`)
		}
	}

	private createEngine() : Engine
	{
        return new Engine(this._canvas, true, {
			stencil: true,
			antialias: true,
			audioEngine: true,
			adaptToDeviceRatio: true,
			disableWebGL2Support: false,
			useHighPrecisionFloats: true,
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: false,
			deterministicLockstep: true,
			lockstepMaxSteps: 4
		});
	}

	private async changeScene(newSceneName : string, gameType : FrontendGameType, clientInputs : readonly ClientInput[], serverCommunicationHandler? : ServerProxy) : Promise<void>
	{
		if (this._scene)
			this._scene.dispose();
		this._scene = await this.getNewScene(newSceneName, gameType, clientInputs, serverCommunicationHandler);
	}

	public quit() : void
	{
		this.remove();
	}

	public async goToMenuScene()
	{
		this._multiplayerHandler.disconnect();
		if (!this._scene || getSceneData(this._scene).gameType !== "Menu")
			await this.changeScene("Menu.gltf", "Menu", []);
	}

	public startLocalGame(sceneName : "Basic.gltf" | "Magic.gltf")
	{
		this.startLocalGameAsync(sceneName);
	}

	private async startLocalGameAsync(sceneName : "Basic.gltf" | "Magic.gltf")
	{
		this._multiplayerHandler.disconnect();
		await this.changeScene(sceneName, "Local", this._settings._playerInputs);
		const	sceneData = getFrontendSceneData(this._scene!);

		await sceneData.readyPromise.promise;
		sceneData.events.getObservable("game-start").notifyObservers();
	}

	public startOnlineGame(sceneName : "Basic.gltf" | "Magic.gltf")
	{
		this.startOnlineGameAsync(sceneName);
	}

	private async startOnlineGameAsync(sceneName : "Basic.gltf" | "Magic.gltf") : Promise<void>
	{
		try {
			await this._multiplayerHandler.connect();
			await this._multiplayerHandler.joinGame();
			const	playerIndex = this._multiplayerHandler.getplayerIndex()!;
			const	inputs = this._settings._playerInputs.filter((value : ClientInput) => value.index === playerIndex);
			const	serverProxy = new ServerProxy(this._multiplayerHandler);

			await this.changeScene(sceneName, "Multiplayer", inputs, serverProxy);
			const	sceneData = getFrontendSceneData(this._scene!);

			await sceneData.readyPromise.promise;
			this._multiplayerHandler.setReady();
			await this._multiplayerHandler.onGameReady();
			sceneData.events.getObservable("game-start").notifyObservers();
			this._multiplayerHandler.onServerMessage()!.add((gameInfos : GameInfos | "room-closed" | "server-error" | "forfeit") => {
				if (gameInfos === "server-error")
				{
					console.log("Server Error !");
					this.goToMenuScene();
				}
			});
		} catch (error) {
			if (error !== "io client disconnect") // meaning we disconnected ourselves
				console.error(error);
			this.goToMenuScene();
		}
	}

	public	async restartOnlineGameAsync() : Promise<void>
	{
		if (!this._scene)
			throw new Error("restartOnlineGameAsync called without a scene !");
		try {
			await this._multiplayerHandler.connect();
			await this._multiplayerHandler.joinGame();

			const	playerIndex = this._multiplayerHandler.getplayerIndex()!;
			const	inputs = this._settings._playerInputs.filter((value : ClientInput) => value.index === playerIndex);
			const	sceneData = getFrontendSceneData(this._scene);

			sceneData.inputs = inputs;
			sceneData.events.getObservable("input-change").notifyObservers();
			sceneData.serverProxy?.sendServerMessage("ready");
			await this._multiplayerHandler.onGameReady();
			sceneData.events.getObservable("game-start").notifyObservers();
		} catch (error) {
			if (error !== "io client disconnect") // meaning we disconnected ourselves
				console.error(error);
			this.goToMenuScene();
		}
	}

	public	cancelMatchmaking()
	{
		this._multiplayerHandler.disconnect();
	}

	private	async getNewScene(sceneName : string, gameType : FrontendGameType, clientInputs : readonly ClientInput[], serverCommunicationHandler? : ServerProxy) : Promise<Scene>
	{
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		globalThis.HKP = new HavokPlugin(false);
		scene.metadata.sceneData = new FrontendSceneData(globalThis.HKP, this, gameType, clientInputs, serverCommunicationHandler);
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
	}

	public disconnectedCallback() : void {
		this._multiplayerHandler.disconnect();
		if (globalThis.HKP)
			delete globalThis.HKP;
		if (globalThis.HKP)
			delete globalThis.HKP;
		this._engine.dispose();
		this._scene?.dispose();
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
