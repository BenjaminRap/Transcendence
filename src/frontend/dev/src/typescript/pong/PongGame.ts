import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneManager } from "@babylonjs-toolkit/next"
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HavokPlugin } from "@babylonjs/core/Physics";

import HavokPhysics from "@babylonjs/havok";
import { type ClientInput, FrontendSceneData } from "./FrontendSceneData";
import { Color4, type int } from "@babylonjs/core";
import { type FrontendGameType, getSceneData } from "@shared/SceneData";
import { Settings } from "./Settings";
import { ServerProxy } from "./ServerProxy";
import type { LocalTournament } from "./LocalTournament";
import { frontendSocketHandler } from "../index";
import { ErrorGUI } from "./gui/ErrorGUI";
import { initMenu } from "./gui/IGUI";
import { CloseGUI } from "./gui/CloseGUI";
import type { FrontendTournament } from "./FrontendTournament";
import { PongError } from "@shared/pongError/PongError";
import type { Profile } from "@shared/Profile";

import.meta.glob("./attachedScripts/*.ts", { eager: true});
import.meta.glob("@shared/attachedScripts/*", { eager: true});

export type SceneFileName = "Magic.gltf" | "Basic.gltf" | "Terminal.gltf";
export type TournamentType<T extends FrontendGameType> =
	T extends "Local" ? LocalTournament :
	T extends "Online" ? FrontendTournament :
	undefined

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
			close: () => this.quit()
		}, this);
		this._closeGUI.classList.remove("hidden");

		this.append(this._canvas);
		try {
			this._engine = this.createEngine();
			globalThis.HK = await HavokPhysics();
			await SceneManager.InitializeRuntime(this._engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
			this._scene = await this.getNewScene("Menu.gltf", "Menu");
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
		tournament? : TournamentType<T>) : Promise<void>
	{
		this.disposeScene();
		this._scene = await this.getNewScene(newSceneName, gameType, tournament);
	}

	private	isInMenu()
	{
		if (this._scene === undefined)
			return false;
		const	sceneData = getFrontendSceneData(this._scene);
		
		return sceneData.gameType === "Menu";
	}

	public async goToMenuScene()
	{
		if (this.isInMenu())
			return ;
		this._serverProxy.leaveScene();
		if (!this._scene || getSceneData(this._scene).gameType !== "Menu")
			await this.changeScene("Menu.gltf", "Menu");
	}

	public async startBotGame(sceneName : SceneFileName)
	{
		if (this.isInMenu())
			await this.changeScene(sceneName, "Bot");
		const	sceneData = getFrontendSceneData(this._scene!);

		await sceneData.readyPromise.promise;
		this.setInputs(sceneData, 0);
		sceneData.events.getObservable("game-start").notifyObservers();
	}

	public async startLocalGame(sceneName : SceneFileName, tournament? : LocalTournament)
	{
		if (this.isInMenu())
			await this.changeScene(sceneName, "Local", tournament);
		const	sceneData = getFrontendSceneData(this._scene!);

		await sceneData.readyPromise.promise;
		this.setInputs(sceneData, 0, 1);
		if (tournament)
			tournament.start(sceneData.events);
		else
			sceneData.events.getObservable("game-start").notifyObservers();
	}

	public async startOnlineGame(sceneName : SceneFileName = "Terminal.gltf") : Promise<void>
	{
		const	gameInit = await this._serverProxy.joinGame();

		if (this.isInMenu())
			await this.changeScene(sceneName, "Multiplayer");
		const	sceneData = getFrontendSceneData(this._scene!);

		await sceneData.readyPromise.promise;
		this.setInputs(sceneData, gameInit.playerIndex);
		this._serverProxy.setReady();
		const	participants = gameInit.participants as [Profile, Profile];
		sceneData.events.getObservable("set-participants").notifyObservers(participants);
		await this._serverProxy.onGameReady();
		sceneData.events.getObservable("game-start").notifyObservers();
	}

	private setInputs(sceneData : FrontendSceneData, ...inputIndexes : int[])
	{
		const	inputs = this._settings._playerInputs.filter((value : ClientInput) => inputIndexes.includes(value.index));

		sceneData.events.getObservable("input-change").notifyObservers(inputs);
	}

	public showError(errorText : string)
	{
		this._errorGUI.setErrorText(errorText);
		this._errorGUI.classList.remove("invinsible");
	}

	private	async getNewScene<T extends FrontendGameType>(
		sceneName : string,
		gameType : T,
		tournament? : TournamentType<T>) : Promise<Scene>
	{
		const	scene = new Scene(this._engine);

		if (!scene.metadata)
			scene.metadata = {};
		globalThis.HKP = new HavokPlugin(false);
		scene.metadata.sceneData = new FrontendSceneData(globalThis.HKP, this, gameType, this._serverProxy, tournament);
		const	cam = new FreeCamera("camera1", Vector3.Zero(), scene);
		const	assetsManager = new AssetsManager(scene);

		if (!scene.enablePhysics(Vector3.Zero(), globalThis.HKP))
			throw new PongError("The physics engine hasn't been initialized !", "quitPong");

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
		this._serverProxy.dispose();
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

	public quit()
	{
		this.remove();
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
